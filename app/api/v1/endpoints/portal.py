"""
Portal management endpoints for freelancers.
Manage portal settings, client invitations, invoices, files, messages, and contracts.
"""
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
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
from app.models.enums import InvoiceStatus, MessageStatus
from app.schemas.portal import (
    PortalSettingsCreate,
    PortalSettingsUpdate,
    PortalSettingsResponse,
    ClientPortalInvite,
    ClientPortalAccessResponse,
    PortalInvoiceCreate,
    PortalInvoiceUpdate,
    PortalInvoiceResponse,
    PortalInvoiceList,
    PortalFileCreate,
    PortalFileUpdate,
    PortalFileResponse,
    PortalFileList,
    PortalMessageCreate,
    PortalMessageResponse,
    PortalMessageList,
    PortalContractCreate,
    PortalContractUpdate,
    PortalContractResponse,
    PortalContractList,
)

router = APIRouter()


# ==================== Portal Settings ====================

@router.get("/settings", response_model=PortalSettingsResponse)
async def get_portal_settings(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalSettingsResponse:
    """Get or create portal settings for the current user."""
    query = select(PortalSettings).where(PortalSettings.user_id == current_user.id)
    result = await db.execute(query)
    settings = result.scalar_one_or_none()

    if not settings:
        # Create default settings
        settings = PortalSettings(
            user_id=current_user.id,
            business_name=current_user.business_name or current_user.full_name,
            contact_email=current_user.email,
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)

    portal_url = None
    if settings.portal_slug:
        portal_url = f"/portal/{settings.portal_slug}"

    return PortalSettingsResponse(
        id=str(settings.id),
        business_name=settings.business_name,
        logo_url=settings.logo_url,
        primary_color=settings.primary_color,
        accent_color=settings.accent_color,
        portal_slug=settings.portal_slug,
        contact_email=settings.contact_email,
        contact_phone=settings.contact_phone,
        welcome_message=settings.welcome_message,
        show_invoices=settings.show_invoices,
        show_files=settings.show_files,
        show_messages=settings.show_messages,
        show_contracts=settings.show_contracts,
        portal_url=portal_url,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.put("/settings", response_model=PortalSettingsResponse)
async def update_portal_settings(
    settings_in: PortalSettingsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalSettingsResponse:
    """Update portal settings."""
    query = select(PortalSettings).where(PortalSettings.user_id == current_user.id)
    result = await db.execute(query)
    settings = result.scalar_one_or_none()

    if not settings:
        settings = PortalSettings(user_id=current_user.id)
        db.add(settings)

    # Check if slug is unique (if changed)
    if settings_in.portal_slug and settings_in.portal_slug != settings.portal_slug:
        slug_check = select(PortalSettings).where(
            PortalSettings.portal_slug == settings_in.portal_slug,
            PortalSettings.user_id != current_user.id,
        )
        slug_result = await db.execute(slug_check)
        if slug_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Portal slug already taken",
            )

    # Update fields
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    await db.commit()
    await db.refresh(settings)

    portal_url = None
    if settings.portal_slug:
        portal_url = f"/portal/{settings.portal_slug}"

    return PortalSettingsResponse(
        id=str(settings.id),
        business_name=settings.business_name,
        logo_url=settings.logo_url,
        primary_color=settings.primary_color,
        accent_color=settings.accent_color,
        portal_slug=settings.portal_slug,
        contact_email=settings.contact_email,
        contact_phone=settings.contact_phone,
        welcome_message=settings.welcome_message,
        show_invoices=settings.show_invoices,
        show_files=settings.show_files,
        show_messages=settings.show_messages,
        show_contracts=settings.show_contracts,
        portal_url=portal_url,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


# ==================== Client Portal Access ====================

@router.get("/clients", response_model=list[ClientPortalAccessResponse])
async def list_portal_clients(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ClientPortalAccessResponse]:
    """List all clients with their portal access status."""
    query = (
        select(Client, ClientPortalAccess)
        .outerjoin(ClientPortalAccess, Client.id == ClientPortalAccess.client_id)
        .where(Client.user_id == current_user.id)
        .order_by(Client.name)
    )
    result = await db.execute(query)
    rows = result.all()

    clients_response = []
    for row in rows:
        client = row.Client
        access = row.ClientPortalAccess

        clients_response.append(
            ClientPortalAccessResponse(
                id=str(access.id) if access else "",
                client_id=str(client.id),
                client_name=client.name,
                client_email=client.email,
                is_active=access.is_active if access else False,
                last_accessed=access.last_accessed if access else None,
                portal_link=None,  # Don't return link from list - users must regenerate to get a valid link (we only store hash)
                created_at=access.created_at if access else client.created_at,
            )
        )

    return clients_response


@router.post("/clients/{client_id}/invite", response_model=ClientPortalAccessResponse)
async def invite_client_to_portal(
    client_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ClientPortalAccessResponse:
    """Generate or regenerate portal access for a client."""
    try:
        client_uuid = uuid.UUID(client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    # Get client
    query = select(Client).where(
        Client.id == client_uuid,
        Client.user_id == current_user.id,
    )
    result = await db.execute(query)
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    # Check if access already exists
    access_query = select(ClientPortalAccess).where(
        ClientPortalAccess.client_id == client_uuid
    )
    access_result = await db.execute(access_query)
    access = access_result.scalar_one_or_none()

    # Generate raw token - we'll return this to user but store only the hash
    raw_token = ClientPortalAccess.generate_access_token()
    token_hash = ClientPortalAccess.hash_token(raw_token)

    if access:
        # Regenerate token - store hash only
        access.access_token = token_hash
        access.is_active = True
    else:
        # Create new access - store hash only
        access = ClientPortalAccess(
            client_id=client_uuid,
            access_token=token_hash,
            is_active=True,
        )
        db.add(access)

    await db.commit()
    await db.refresh(access)

    return ClientPortalAccessResponse(
        id=str(access.id),
        client_id=str(client.id),
        client_name=client.name,
        client_email=client.email,
        is_active=access.is_active,
        last_accessed=access.last_accessed,
        portal_link=f"/portal/c/{raw_token}",  # Return raw token to user
        created_at=access.created_at,
    )


@router.delete("/clients/{client_id}/access", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_client_portal_access(
    client_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Revoke portal access for a client."""
    try:
        client_uuid = uuid.UUID(client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    # Verify client ownership
    client_query = select(Client).where(
        Client.id == client_uuid,
        Client.user_id == current_user.id,
    )
    client_result = await db.execute(client_query)
    if not client_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    # Deactivate access
    access_query = select(ClientPortalAccess).where(
        ClientPortalAccess.client_id == client_uuid
    )
    access_result = await db.execute(access_query)
    access = access_result.scalar_one_or_none()

    if access:
        access.is_active = False
        await db.commit()


# ==================== Invoices ====================

def _invoice_to_response(invoice: PortalInvoice, client_name: str | None = None, project_name: str | None = None) -> PortalInvoiceResponse:
    return PortalInvoiceResponse(
        id=str(invoice.id),
        client_id=str(invoice.client_id),
        client_name=client_name,
        project_id=str(invoice.project_id) if invoice.project_id else None,
        project_name=project_name,
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


@router.get("/invoices", response_model=PortalInvoiceList)
async def list_invoices(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    client_id: str | None = None,
    status_filter: InvoiceStatus | None = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PortalInvoiceList:
    """List all invoices."""
    query = (
        select(PortalInvoice, Client.name.label("client_name"), Project.name.label("project_name"))
        .join(Client, PortalInvoice.client_id == Client.id)
        .outerjoin(Project, PortalInvoice.project_id == Project.id)
        .where(PortalInvoice.user_id == current_user.id)
    )

    if client_id:
        try:
            query = query.where(PortalInvoice.client_id == uuid.UUID(client_id))
        except ValueError:
            pass

    if status_filter:
        query = query.where(PortalInvoice.status == status_filter)

    query = query.order_by(PortalInvoice.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    # Get total
    count_query = select(func.count(PortalInvoice.id)).where(PortalInvoice.user_id == current_user.id)
    if client_id:
        try:
            count_query = count_query.where(PortalInvoice.client_id == uuid.UUID(client_id))
        except ValueError:
            pass
    if status_filter:
        count_query = count_query.where(PortalInvoice.status == status_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    invoices = [
        _invoice_to_response(row.PortalInvoice, row.client_name, row.project_name)
        for row in rows
    ]

    return PortalInvoiceList(invoices=invoices, total=total)


@router.post("/invoices", response_model=PortalInvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_in: PortalInvoiceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalInvoiceResponse:
    """Create a new invoice."""
    # Verify client ownership
    try:
        client_uuid = uuid.UUID(invoice_in.client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID",
        )

    client_query = select(Client).where(
        Client.id == client_uuid,
        Client.user_id == current_user.id,
    )
    client_result = await db.execute(client_query)
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    project_name = None
    if invoice_in.project_id:
        try:
            project_uuid = uuid.UUID(invoice_in.project_id)
            project_query = select(Project).where(
                Project.id == project_uuid,
                Project.user_id == current_user.id,
            )
            project_result = await db.execute(project_query)
            project = project_result.scalar_one_or_none()
            if project:
                project_name = project.name
        except ValueError:
            pass

    total_amount = invoice_in.amount + invoice_in.tax_amount

    invoice = PortalInvoice(
        user_id=current_user.id,
        client_id=client_uuid,
        project_id=uuid.UUID(invoice_in.project_id) if invoice_in.project_id else None,
        invoice_number=invoice_in.invoice_number,
        title=invoice_in.title,
        description=invoice_in.description,
        amount=float(invoice_in.amount),
        tax_amount=float(invoice_in.tax_amount),
        total_amount=float(total_amount),
        due_date=invoice_in.due_date,
        payment_url=invoice_in.payment_url,
    )

    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    return _invoice_to_response(invoice, client.name, project_name)


@router.get("/invoices/{invoice_id}", response_model=PortalInvoiceResponse)
async def get_invoice(
    invoice_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalInvoiceResponse:
    """Get a single invoice."""
    try:
        invoice_uuid = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    query = (
        select(PortalInvoice, Client.name.label("client_name"), Project.name.label("project_name"))
        .join(Client, PortalInvoice.client_id == Client.id)
        .outerjoin(Project, PortalInvoice.project_id == Project.id)
        .where(
            PortalInvoice.id == invoice_uuid,
            PortalInvoice.user_id == current_user.id,
        )
    )
    result = await db.execute(query)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    return _invoice_to_response(row.PortalInvoice, row.client_name, row.project_name)


@router.put("/invoices/{invoice_id}", response_model=PortalInvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice_in: PortalInvoiceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalInvoiceResponse:
    """Update an invoice."""
    try:
        invoice_uuid = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    query = select(PortalInvoice).where(
        PortalInvoice.id == invoice_uuid,
        PortalInvoice.user_id == current_user.id,
    )
    result = await db.execute(query)
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    update_data = invoice_in.model_dump(exclude_unset=True)

    # Recalculate total if amount or tax changed
    if 'amount' in update_data or 'tax_amount' in update_data:
        amount = update_data.get('amount', invoice.amount)
        tax = update_data.get('tax_amount', invoice.tax_amount)
        update_data['total_amount'] = float(amount) + float(tax)

    # Handle status changes
    if 'status' in update_data and update_data['status'] == InvoiceStatus.PAID:
        update_data['paid_date'] = datetime.now(timezone.utc)

    for field, value in update_data.items():
        if field in ('amount', 'tax_amount', 'total_amount'):
            value = float(value)
        setattr(invoice, field, value)

    await db.commit()
    await db.refresh(invoice)

    # Get client/project names
    client_query = select(Client.name).where(Client.id == invoice.client_id)
    client_result = await db.execute(client_query)
    client_name = client_result.scalar_one_or_none()

    project_name = None
    if invoice.project_id:
        project_query = select(Project.name).where(Project.id == invoice.project_id)
        project_result = await db.execute(project_query)
        project_name = project_result.scalar_one_or_none()

    return _invoice_to_response(invoice, client_name, project_name)


@router.delete("/invoices/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete an invoice."""
    try:
        invoice_uuid = uuid.UUID(invoice_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    query = select(PortalInvoice).where(
        PortalInvoice.id == invoice_uuid,
        PortalInvoice.user_id == current_user.id,
    )
    result = await db.execute(query)
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    await db.delete(invoice)
    await db.commit()


# ==================== Files ====================

def _file_to_response(file: PortalFile, client_name: str | None = None, project_name: str | None = None) -> PortalFileResponse:
    return PortalFileResponse(
        id=str(file.id),
        client_id=str(file.client_id),
        client_name=client_name,
        project_id=str(file.project_id) if file.project_id else None,
        project_name=project_name,
        name=file.name,
        file_url=file.file_url,
        file_size=file.file_size,
        file_type=file.file_type,
        category=file.category,
        description=file.description,
        is_visible=file.is_visible,
        created_at=file.created_at,
        updated_at=file.updated_at,
    )


@router.get("/files", response_model=PortalFileList)
async def list_files(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    client_id: str | None = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PortalFileList:
    """List all files."""
    query = (
        select(PortalFile, Client.name.label("client_name"), Project.name.label("project_name"))
        .join(Client, PortalFile.client_id == Client.id)
        .outerjoin(Project, PortalFile.project_id == Project.id)
        .where(PortalFile.user_id == current_user.id)
    )

    if client_id:
        try:
            query = query.where(PortalFile.client_id == uuid.UUID(client_id))
        except ValueError:
            pass

    query = query.order_by(PortalFile.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    count_query = select(func.count(PortalFile.id)).where(PortalFile.user_id == current_user.id)
    if client_id:
        try:
            count_query = count_query.where(PortalFile.client_id == uuid.UUID(client_id))
        except ValueError:
            pass
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    files = [
        _file_to_response(row.PortalFile, row.client_name, row.project_name)
        for row in rows
    ]

    return PortalFileList(files=files, total=total)


@router.post("/files", response_model=PortalFileResponse, status_code=status.HTTP_201_CREATED)
async def create_file(
    file_in: PortalFileCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalFileResponse:
    """Create a new file entry."""
    try:
        client_uuid = uuid.UUID(file_in.client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID",
        )

    client_query = select(Client).where(
        Client.id == client_uuid,
        Client.user_id == current_user.id,
    )
    client_result = await db.execute(client_query)
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    project_name = None
    if file_in.project_id:
        try:
            project_uuid = uuid.UUID(file_in.project_id)
            project_query = select(Project).where(
                Project.id == project_uuid,
                Project.user_id == current_user.id,
            )
            project_result = await db.execute(project_query)
            project = project_result.scalar_one_or_none()
            if project:
                project_name = project.name
        except ValueError:
            pass

    file = PortalFile(
        user_id=current_user.id,
        client_id=client_uuid,
        project_id=uuid.UUID(file_in.project_id) if file_in.project_id else None,
        name=file_in.name,
        file_url=file_in.file_url,
        file_size=file_in.file_size,
        file_type=file_in.file_type,
        category=file_in.category,
        description=file_in.description,
        is_visible=file_in.is_visible,
    )

    db.add(file)
    await db.commit()
    await db.refresh(file)

    return _file_to_response(file, client.name, project_name)


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete a file."""
    try:
        file_uuid = uuid.UUID(file_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    query = select(PortalFile).where(
        PortalFile.id == file_uuid,
        PortalFile.user_id == current_user.id,
    )
    result = await db.execute(query)
    file = result.scalar_one_or_none()

    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    await db.delete(file)
    await db.commit()


# ==================== Messages ====================

def _message_to_response(msg: PortalMessage, client_name: str | None = None, project_name: str | None = None) -> PortalMessageResponse:
    return PortalMessageResponse(
        id=str(msg.id),
        client_id=str(msg.client_id),
        client_name=client_name,
        project_id=str(msg.project_id) if msg.project_id else None,
        project_name=project_name,
        subject=msg.subject,
        content=msg.content,
        is_from_client=msg.is_from_client,
        status=msg.status,
        read_at=msg.read_at,
        created_at=msg.created_at,
        updated_at=msg.updated_at,
    )


@router.get("/messages", response_model=PortalMessageList)
async def list_messages(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    client_id: str | None = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> PortalMessageList:
    """List all messages."""
    query = (
        select(PortalMessage, Client.name.label("client_name"), Project.name.label("project_name"))
        .join(Client, PortalMessage.client_id == Client.id)
        .outerjoin(Project, PortalMessage.project_id == Project.id)
        .where(PortalMessage.user_id == current_user.id)
    )

    if client_id:
        try:
            query = query.where(PortalMessage.client_id == uuid.UUID(client_id))
        except ValueError:
            pass

    query = query.order_by(PortalMessage.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    # Get counts
    count_query = select(func.count(PortalMessage.id)).where(PortalMessage.user_id == current_user.id)
    unread_query = select(func.count(PortalMessage.id)).where(
        PortalMessage.user_id == current_user.id,
        PortalMessage.is_from_client == True,
        PortalMessage.status == MessageStatus.UNREAD,
    )

    if client_id:
        try:
            client_uuid = uuid.UUID(client_id)
            count_query = count_query.where(PortalMessage.client_id == client_uuid)
            unread_query = unread_query.where(PortalMessage.client_id == client_uuid)
        except ValueError:
            pass

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    unread_result = await db.execute(unread_query)
    unread_count = unread_result.scalar() or 0

    messages = [
        _message_to_response(row.PortalMessage, row.client_name, row.project_name)
        for row in rows
    ]

    return PortalMessageList(messages=messages, total=total, unread_count=unread_count)


@router.post("/messages", response_model=PortalMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_in: PortalMessageCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalMessageResponse:
    """Send a message to a client."""
    try:
        client_uuid = uuid.UUID(message_in.client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID",
        )

    client_query = select(Client).where(
        Client.id == client_uuid,
        Client.user_id == current_user.id,
    )
    client_result = await db.execute(client_query)
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    project_name = None
    if message_in.project_id:
        try:
            project_uuid = uuid.UUID(message_in.project_id)
            project_query = select(Project).where(
                Project.id == project_uuid,
                Project.user_id == current_user.id,
            )
            project_result = await db.execute(project_query)
            project = project_result.scalar_one_or_none()
            if project:
                project_name = project.name
        except ValueError:
            pass

    message = PortalMessage(
        user_id=current_user.id,
        client_id=client_uuid,
        project_id=uuid.UUID(message_in.project_id) if message_in.project_id else None,
        subject=message_in.subject,
        content=message_in.content,
        is_from_client=False,
        status=MessageStatus.UNREAD,
    )

    db.add(message)
    await db.commit()
    await db.refresh(message)

    return _message_to_response(message, client.name, project_name)


@router.put("/messages/{message_id}/read", response_model=PortalMessageResponse)
async def mark_message_read(
    message_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalMessageResponse:
    """Mark a message as read."""
    try:
        message_uuid = uuid.UUID(message_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    query = select(PortalMessage).where(
        PortalMessage.id == message_uuid,
        PortalMessage.user_id == current_user.id,
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

    # Get names
    client_query = select(Client.name).where(Client.id == message.client_id)
    client_result = await db.execute(client_query)
    client_name = client_result.scalar_one_or_none()

    project_name = None
    if message.project_id:
        project_query = select(Project.name).where(Project.id == message.project_id)
        project_result = await db.execute(project_query)
        project_name = project_result.scalar_one_or_none()

    return _message_to_response(message, client_name, project_name)


# ==================== Contracts ====================

def _contract_to_response(contract: PortalContract, client_name: str | None = None, project_name: str | None = None) -> PortalContractResponse:
    return PortalContractResponse(
        id=str(contract.id),
        client_id=str(contract.client_id),
        client_name=client_name,
        project_id=str(contract.project_id) if contract.project_id else None,
        project_name=project_name,
        title=contract.title,
        content=contract.content,
        file_url=contract.file_url,
        requires_signature=contract.requires_signature,
        signed_at=contract.signed_at,
        is_signed=contract.signed_at is not None,
        created_at=contract.created_at,
        updated_at=contract.updated_at,
    )


@router.get("/contracts", response_model=PortalContractList)
async def list_contracts(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    client_id: str | None = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> PortalContractList:
    """List all contracts."""
    query = (
        select(PortalContract, Client.name.label("client_name"), Project.name.label("project_name"))
        .join(Client, PortalContract.client_id == Client.id)
        .outerjoin(Project, PortalContract.project_id == Project.id)
        .where(PortalContract.user_id == current_user.id)
    )

    if client_id:
        try:
            query = query.where(PortalContract.client_id == uuid.UUID(client_id))
        except ValueError:
            pass

    query = query.order_by(PortalContract.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    count_query = select(func.count(PortalContract.id)).where(PortalContract.user_id == current_user.id)
    if client_id:
        try:
            count_query = count_query.where(PortalContract.client_id == uuid.UUID(client_id))
        except ValueError:
            pass
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    contracts = [
        _contract_to_response(row.PortalContract, row.client_name, row.project_name)
        for row in rows
    ]

    return PortalContractList(contracts=contracts, total=total)


@router.post("/contracts", response_model=PortalContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(
    contract_in: PortalContractCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PortalContractResponse:
    """Create a new contract."""
    try:
        client_uuid = uuid.UUID(contract_in.client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid client ID",
        )

    client_query = select(Client).where(
        Client.id == client_uuid,
        Client.user_id == current_user.id,
    )
    client_result = await db.execute(client_query)
    client = client_result.scalar_one_or_none()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    project_name = None
    if contract_in.project_id:
        try:
            project_uuid = uuid.UUID(contract_in.project_id)
            project_query = select(Project).where(
                Project.id == project_uuid,
                Project.user_id == current_user.id,
            )
            project_result = await db.execute(project_query)
            project = project_result.scalar_one_or_none()
            if project:
                project_name = project.name
        except ValueError:
            pass

    contract = PortalContract(
        user_id=current_user.id,
        client_id=client_uuid,
        project_id=uuid.UUID(contract_in.project_id) if contract_in.project_id else None,
        title=contract_in.title,
        content=contract_in.content,
        file_url=contract_in.file_url,
        requires_signature=contract_in.requires_signature,
    )

    db.add(contract)
    await db.commit()
    await db.refresh(contract)

    return _contract_to_response(contract, client.name, project_name)


@router.delete("/contracts/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contract(
    contract_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete a contract."""
    try:
        contract_uuid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    query = select(PortalContract).where(
        PortalContract.id == contract_uuid,
        PortalContract.user_id == current_user.id,
    )
    result = await db.execute(query)
    contract = result.scalar_one_or_none()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    await db.delete(contract)
    await db.commit()
