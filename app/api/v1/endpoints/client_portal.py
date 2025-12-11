"""
Client Portal public endpoints.
These are accessed by clients (not freelancers) to view their portal.
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Header, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.user import User
from app.models.client import Client
from app.models.project import Project
from app.models.portal import (
    PortalSettings,
    ClientPortalAccess,
    PortalInvoice,
    PortalFile,
    PortalMessage,
    PortalContract,
)
from app.models.enums import InvoiceStatus, MessageStatus, ProjectStatus
from app.schemas.portal import (
    PortalClientToken,
    PortalDashboardResponse,
    PortalInvoiceResponse,
    PortalInvoiceList,
    PortalFileResponse,
    PortalFileList,
    PortalMessageResponse,
    PortalMessageList,
    PortalMessageClientCreate,
    PortalContractResponse,
    PortalContractList,
    ContractSignRequest,
    ClientProjectResponse,
)

router = APIRouter()


async def get_portal_client(
    db: AsyncSession,
    access_token: str,
) -> tuple[Client, User, PortalSettings]:
    """Validate portal access token and return client, user, and settings."""
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Portal access token required",
        )

    # Hash the incoming token to compare against stored hash
    token_hash = ClientPortalAccess.hash_token(access_token)

    # Find access record using hashed token
    query = (
        select(ClientPortalAccess)
        .options(selectinload(ClientPortalAccess.client))
        .where(
            ClientPortalAccess.access_token == token_hash,
            ClientPortalAccess.is_active == True,
        )
    )
    result = await db.execute(query)
    access = result.scalar_one_or_none()

    if not access:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired portal access",
        )

    client = access.client

    # Get user (freelancer)
    user_query = select(User).where(User.id == client.user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portal not available",
        )

    # Get portal settings
    settings_query = select(PortalSettings).where(PortalSettings.user_id == user.id)
    settings_result = await db.execute(settings_query)
    settings = settings_result.scalar_one_or_none()

    if not settings:
        # Create default settings
        settings = PortalSettings(
            user_id=user.id,
            business_name=user.business_name or user.full_name,
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)

    # Update last accessed
    access.last_accessed = datetime.now(timezone.utc)
    await db.commit()

    return client, user, settings


async def get_portal_context(
    db: Annotated[AsyncSession, Depends(get_db)],
    x_portal_token: Annotated[str | None, Header()] = None,
) -> tuple[Client, User, PortalSettings]:
    """Dependency to get portal context from header token."""
    if not x_portal_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Portal-Token header required",
        )
    return await get_portal_client(db, x_portal_token)


# ==================== Portal Authentication ====================

@router.post("/auth/verify", response_model=PortalClientToken)
async def verify_portal_token(
    access_token: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PortalClientToken:
    """Verify a portal access token and return client info."""
    client, user, settings = await get_portal_client(db, access_token)

    return PortalClientToken(
        access_token=access_token,
        token_type="bearer",
        client_id=str(client.id),
        client_name=client.name,
        freelancer_name=settings.business_name or user.full_name,
    )


# ==================== Portal Dashboard ====================

@router.get("/dashboard", response_model=PortalDashboardResponse)
async def get_portal_dashboard(
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
) -> PortalDashboardResponse:
    """Get client portal dashboard with summary data."""
    client, user, settings = context

    # Count active projects
    projects_query = select(func.count(Project.id)).where(
        Project.client_id == client.id,
        Project.user_id == user.id,
        Project.status == ProjectStatus.ACTIVE,
    )
    projects_result = await db.execute(projects_query)
    active_projects_count = projects_result.scalar() or 0

    # Count pending invoices
    pending_invoices_query = select(
        func.count(PortalInvoice.id),
        func.coalesce(func.sum(PortalInvoice.total_amount), 0),
    ).where(
        PortalInvoice.client_id == client.id,
        PortalInvoice.user_id == user.id,
        PortalInvoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE]),
    )
    pending_result = await db.execute(pending_invoices_query)
    pending_row = pending_result.first()
    pending_invoices_count = pending_row[0] or 0
    pending_invoices_total = Decimal(str(pending_row[1] or 0))

    # Count unread messages (from freelancer)
    unread_query = select(func.count(PortalMessage.id)).where(
        PortalMessage.client_id == client.id,
        PortalMessage.user_id == user.id,
        PortalMessage.is_from_client == False,
        PortalMessage.status == MessageStatus.UNREAD,
    )
    unread_result = await db.execute(unread_query)
    unread_messages_count = unread_result.scalar() or 0

    # Count unsigned contracts
    unsigned_query = select(func.count(PortalContract.id)).where(
        PortalContract.client_id == client.id,
        PortalContract.user_id == user.id,
        PortalContract.requires_signature == True,
        PortalContract.signed_at == None,
    )
    unsigned_result = await db.execute(unsigned_query)
    unsigned_contracts_count = unsigned_result.scalar() or 0

    # Count files
    files_query = select(func.count(PortalFile.id)).where(
        PortalFile.client_id == client.id,
        PortalFile.user_id == user.id,
        PortalFile.is_visible == True,
    )
    files_result = await db.execute(files_query)
    files_count = files_result.scalar() or 0

    # Get recent invoices
    recent_invoices = []
    if settings.show_invoices:
        inv_query = (
            select(PortalInvoice)
            .where(
                PortalInvoice.client_id == client.id,
                PortalInvoice.user_id == user.id,
                PortalInvoice.status != InvoiceStatus.DRAFT,
            )
            .order_by(PortalInvoice.created_at.desc())
            .limit(5)
        )
        inv_result = await db.execute(inv_query)
        for inv in inv_result.scalars().all():
            recent_invoices.append(PortalInvoiceResponse(
                id=str(inv.id),
                client_id=str(inv.client_id),
                project_id=str(inv.project_id) if inv.project_id else None,
                invoice_number=inv.invoice_number,
                title=inv.title,
                description=inv.description,
                amount=Decimal(str(inv.amount)),
                tax_amount=Decimal(str(inv.tax_amount)),
                total_amount=Decimal(str(inv.total_amount)),
                status=inv.status,
                issue_date=inv.issue_date,
                due_date=inv.due_date,
                paid_date=inv.paid_date,
                payment_url=inv.payment_url,
                created_at=inv.created_at,
                updated_at=inv.updated_at,
            ))

    # Get recent messages
    recent_messages = []
    if settings.show_messages:
        msg_query = (
            select(PortalMessage)
            .where(
                PortalMessage.client_id == client.id,
                PortalMessage.user_id == user.id,
            )
            .order_by(PortalMessage.created_at.desc())
            .limit(5)
        )
        msg_result = await db.execute(msg_query)
        for msg in msg_result.scalars().all():
            recent_messages.append(PortalMessageResponse(
                id=str(msg.id),
                client_id=str(msg.client_id),
                project_id=str(msg.project_id) if msg.project_id else None,
                subject=msg.subject,
                content=msg.content,
                is_from_client=msg.is_from_client,
                status=msg.status,
                read_at=msg.read_at,
                created_at=msg.created_at,
                updated_at=msg.updated_at,
            ))

    # Get recent files
    recent_files = []
    if settings.show_files:
        file_query = (
            select(PortalFile)
            .where(
                PortalFile.client_id == client.id,
                PortalFile.user_id == user.id,
                PortalFile.is_visible == True,
            )
            .order_by(PortalFile.created_at.desc())
            .limit(5)
        )
        file_result = await db.execute(file_query)
        for f in file_result.scalars().all():
            recent_files.append(PortalFileResponse(
                id=str(f.id),
                client_id=str(f.client_id),
                project_id=str(f.project_id) if f.project_id else None,
                name=f.name,
                file_url=f.file_url,
                file_size=f.file_size,
                file_type=f.file_type,
                category=f.category,
                description=f.description,
                is_visible=f.is_visible,
                created_at=f.created_at,
                updated_at=f.updated_at,
            ))

    return PortalDashboardResponse(
        client_name=client.name,
        freelancer_name=user.full_name,
        freelancer_business_name=settings.business_name,
        welcome_message=settings.welcome_message,
        logo_url=settings.logo_url,
        primary_color=settings.primary_color,
        accent_color=settings.accent_color,
        show_invoices=settings.show_invoices,
        show_files=settings.show_files,
        show_messages=settings.show_messages,
        show_contracts=settings.show_contracts,
        active_projects_count=active_projects_count,
        pending_invoices_count=pending_invoices_count,
        pending_invoices_total=pending_invoices_total,
        unread_messages_count=unread_messages_count,
        unsigned_contracts_count=unsigned_contracts_count,
        files_count=files_count,
        recent_invoices=recent_invoices,
        recent_messages=recent_messages,
        recent_files=recent_files,
    )


# ==================== Projects ====================

@router.get("/projects", response_model=list[ClientProjectResponse])
async def list_client_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
) -> list[ClientProjectResponse]:
    """List all projects for this client."""
    client, user, settings = context

    query = (
        select(Project)
        .where(
            Project.client_id == client.id,
            Project.user_id == user.id,
        )
        .order_by(Project.created_at.desc())
    )
    result = await db.execute(query)
    projects = result.scalars().all()

    return [
        ClientProjectResponse(
            id=str(p.id),
            name=p.name,
            description=p.description,
            status=p.status.value,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in projects
    ]


# ==================== Invoices ====================

@router.get("/invoices", response_model=PortalInvoiceList)
async def list_client_invoices(
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PortalInvoiceList:
    """List all invoices for this client."""
    client, user, settings = context

    if not settings.show_invoices:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invoices are not enabled for this portal",
        )

    query = (
        select(PortalInvoice)
        .where(
            PortalInvoice.client_id == client.id,
            PortalInvoice.user_id == user.id,
            PortalInvoice.status != InvoiceStatus.DRAFT,
        )
        .order_by(PortalInvoice.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    invoices = result.scalars().all()

    count_query = select(func.count(PortalInvoice.id)).where(
        PortalInvoice.client_id == client.id,
        PortalInvoice.user_id == user.id,
        PortalInvoice.status != InvoiceStatus.DRAFT,
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return PortalInvoiceList(
        invoices=[
            PortalInvoiceResponse(
                id=str(inv.id),
                client_id=str(inv.client_id),
                project_id=str(inv.project_id) if inv.project_id else None,
                invoice_number=inv.invoice_number,
                title=inv.title,
                description=inv.description,
                amount=Decimal(str(inv.amount)),
                tax_amount=Decimal(str(inv.tax_amount)),
                total_amount=Decimal(str(inv.total_amount)),
                status=inv.status,
                issue_date=inv.issue_date,
                due_date=inv.due_date,
                paid_date=inv.paid_date,
                payment_url=inv.payment_url,
                created_at=inv.created_at,
                updated_at=inv.updated_at,
            )
            for inv in invoices
        ],
        total=total,
    )


@router.post("/invoices/{invoice_id}/view", response_model=PortalInvoiceResponse)
async def mark_invoice_viewed(
    invoice_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
) -> PortalInvoiceResponse:
    """Mark an invoice as viewed by the client."""
    client, user, settings = context

    try:
        invoice_uuid = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    query = select(PortalInvoice).where(
        PortalInvoice.id == invoice_uuid,
        PortalInvoice.client_id == client.id,
        PortalInvoice.user_id == user.id,
    )
    result = await db.execute(query)
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    # Update status to viewed if it was just sent
    if invoice.status == InvoiceStatus.SENT:
        invoice.status = InvoiceStatus.VIEWED
        await db.commit()
        await db.refresh(invoice)

    return PortalInvoiceResponse(
        id=str(invoice.id),
        client_id=str(invoice.client_id),
        project_id=str(invoice.project_id) if invoice.project_id else None,
        invoice_number=invoice.invoice_number,
        title=invoice.title,
        description=invoice.description,
        amount=Decimal(str(invoice.amount)),
        tax_amount=Decimal(str(invoice.tax_amount)),
        total_amount=Decimal(str(invoice.total_amount)),
        status=invoice.status,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        paid_date=invoice.paid_date,
        payment_url=invoice.payment_url,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
    )


# ==================== Files ====================

@router.get("/files", response_model=PortalFileList)
async def list_client_files(
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PortalFileList:
    """List all files for this client."""
    client, user, settings = context

    if not settings.show_files:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Files are not enabled for this portal",
        )

    query = (
        select(PortalFile)
        .where(
            PortalFile.client_id == client.id,
            PortalFile.user_id == user.id,
            PortalFile.is_visible == True,
        )
        .order_by(PortalFile.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    files = result.scalars().all()

    count_query = select(func.count(PortalFile.id)).where(
        PortalFile.client_id == client.id,
        PortalFile.user_id == user.id,
        PortalFile.is_visible == True,
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return PortalFileList(
        files=[
            PortalFileResponse(
                id=str(f.id),
                client_id=str(f.client_id),
                project_id=str(f.project_id) if f.project_id else None,
                name=f.name,
                file_url=f.file_url,
                file_size=f.file_size,
                file_type=f.file_type,
                category=f.category,
                description=f.description,
                is_visible=f.is_visible,
                created_at=f.created_at,
                updated_at=f.updated_at,
            )
            for f in files
        ],
        total=total,
    )


# ==================== Messages ====================

@router.get("/messages", response_model=PortalMessageList)
async def list_client_messages(
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> PortalMessageList:
    """List all messages for this client."""
    client, user, settings = context

    if not settings.show_messages:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Messages are not enabled for this portal",
        )

    query = (
        select(PortalMessage)
        .where(
            PortalMessage.client_id == client.id,
            PortalMessage.user_id == user.id,
        )
        .order_by(PortalMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    messages = result.scalars().all()

    count_query = select(func.count(PortalMessage.id)).where(
        PortalMessage.client_id == client.id,
        PortalMessage.user_id == user.id,
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Count unread from freelancer
    unread_query = select(func.count(PortalMessage.id)).where(
        PortalMessage.client_id == client.id,
        PortalMessage.user_id == user.id,
        PortalMessage.is_from_client == False,
        PortalMessage.status == MessageStatus.UNREAD,
    )
    unread_result = await db.execute(unread_query)
    unread_count = unread_result.scalar() or 0

    return PortalMessageList(
        messages=[
            PortalMessageResponse(
                id=str(msg.id),
                client_id=str(msg.client_id),
                project_id=str(msg.project_id) if msg.project_id else None,
                subject=msg.subject,
                content=msg.content,
                is_from_client=msg.is_from_client,
                status=msg.status,
                read_at=msg.read_at,
                created_at=msg.created_at,
                updated_at=msg.updated_at,
            )
            for msg in messages
        ],
        total=total,
        unread_count=unread_count,
    )


@router.post("/messages", response_model=PortalMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_client_message(
    message_in: PortalMessageClientCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
) -> PortalMessageResponse:
    """Send a message from the client to the freelancer."""
    client, user, settings = context

    if not settings.show_messages:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Messages are not enabled for this portal",
        )

    message = PortalMessage(
        user_id=user.id,
        client_id=client.id,
        project_id=uuid.UUID(message_in.project_id) if message_in.project_id else None,
        subject=message_in.subject,
        content=message_in.content,
        is_from_client=True,
        status=MessageStatus.UNREAD,
    )

    db.add(message)
    await db.commit()
    await db.refresh(message)

    return PortalMessageResponse(
        id=str(message.id),
        client_id=str(message.client_id),
        project_id=str(message.project_id) if message.project_id else None,
        subject=message.subject,
        content=message.content,
        is_from_client=message.is_from_client,
        status=message.status,
        read_at=message.read_at,
        created_at=message.created_at,
        updated_at=message.updated_at,
    )


@router.put("/messages/{message_id}/read", response_model=PortalMessageResponse)
async def mark_client_message_read(
    message_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
) -> PortalMessageResponse:
    """Mark a message as read by the client."""
    client, user, settings = context

    try:
        message_uuid = uuid.UUID(message_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    query = select(PortalMessage).where(
        PortalMessage.id == message_uuid,
        PortalMessage.client_id == client.id,
        PortalMessage.user_id == user.id,
        PortalMessage.is_from_client == False,  # Only mark freelancer messages as read
    )
    result = await db.execute(query)
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    message.status = MessageStatus.READ
    message.read_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(message)

    return PortalMessageResponse(
        id=str(message.id),
        client_id=str(message.client_id),
        project_id=str(message.project_id) if message.project_id else None,
        subject=message.subject,
        content=message.content,
        is_from_client=message.is_from_client,
        status=message.status,
        read_at=message.read_at,
        created_at=message.created_at,
        updated_at=message.updated_at,
    )


# ==================== Contracts ====================

@router.get("/contracts", response_model=PortalContractList)
async def list_client_contracts(
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PortalContractList:
    """List all contracts for this client."""
    client, user, settings = context

    if not settings.show_contracts:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Contracts are not enabled for this portal",
        )

    query = (
        select(PortalContract)
        .where(
            PortalContract.client_id == client.id,
            PortalContract.user_id == user.id,
        )
        .order_by(PortalContract.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    contracts = result.scalars().all()

    count_query = select(func.count(PortalContract.id)).where(
        PortalContract.client_id == client.id,
        PortalContract.user_id == user.id,
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    return PortalContractList(
        contracts=[
            PortalContractResponse(
                id=str(c.id),
                client_id=str(c.client_id),
                project_id=str(c.project_id) if c.project_id else None,
                title=c.title,
                content=c.content,
                file_url=c.file_url,
                requires_signature=c.requires_signature,
                signed_at=c.signed_at,
                is_signed=c.signed_at is not None,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in contracts
        ],
        total=total,
    )


@router.post("/contracts/{contract_id}/sign", response_model=PortalContractResponse)
async def sign_contract(
    contract_id: str,
    sign_data: ContractSignRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    context: Annotated[tuple[Client, User, PortalSettings], Depends(get_portal_context)],
) -> PortalContractResponse:
    """Sign a contract."""
    client, user, settings = context

    try:
        contract_uuid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    query = select(PortalContract).where(
        PortalContract.id == contract_uuid,
        PortalContract.client_id == client.id,
        PortalContract.user_id == user.id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    if contract.signed_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contract has already been signed",
        )

    # Record signature
    contract.signed_at = datetime.now(timezone.utc)
    contract.signature_data = sign_data.signature_data
    contract.signer_ip = request.client.host if request.client else None

    await db.commit()
    await db.refresh(contract)

    return PortalContractResponse(
        id=str(contract.id),
        client_id=str(contract.client_id),
        project_id=str(contract.project_id) if contract.project_id else None,
        title=contract.title,
        content=contract.content,
        file_url=contract.file_url,
        requires_signature=contract.requires_signature,
        signed_at=contract.signed_at,
        is_signed=True,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
    )
