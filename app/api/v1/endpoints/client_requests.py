"""
Client Requests API endpoints.

Handles logging client communications and integrating with the scope analyzer.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.client_request import ClientRequest
from app.models.enums import RequestStatus, ScopeClassification
from app.models.project import Project
from app.models.scope_item import ScopeItem
from app.models.user import User
from app.schemas.client_request import (
    AnalyzeRequestResponse,
    ClientRequestCreate,
    ClientRequestListResponse,
    ClientRequestResponse,
    ClientRequestUpdate,
)
from app.services.scope_analyzer.service import analyze_client_request

router = APIRouter()


async def get_project_or_404(
    project_id: UUID,
    db: AsyncSession,
    current_user: User,
) -> Project:
    """Helper to fetch project and verify ownership."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


async def get_request_or_404(
    request_id: UUID,
    project_id: UUID,
    db: AsyncSession,
) -> ClientRequest:
    """Helper to fetch client request and verify it belongs to project."""
    result = await db.execute(
        select(ClientRequest).where(
            ClientRequest.id == request_id,
            ClientRequest.project_id == project_id,
        )
    )
    client_request = result.scalar_one_or_none()
    if not client_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client request not found",
        )
    return client_request


async def get_project_scope_items(
    project_id: UUID,
    db: AsyncSession,
) -> list[ScopeItem]:
    """Fetch all scope items for a project."""
    result = await db.execute(
        select(ScopeItem).where(ScopeItem.project_id == project_id)
    )
    return list(result.scalars().all())


async def load_request_with_project(
    request_id: UUID,
    project_id: UUID,
    db: AsyncSession,
) -> ClientRequest:
    """Load a client request with its project relationship for analysis."""
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(ClientRequest)
        .options(selectinload(ClientRequest.project).selectinload(Project.scope_items))
        .where(
            ClientRequest.id == request_id,
            ClientRequest.project_id == project_id,
        )
    )
    client_request = result.scalar_one_or_none()
    if not client_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client request not found",
        )
    return client_request


async def run_scope_analysis(
    client_request: ClientRequest,
    db: AsyncSession,
) -> AnalyzeRequestResponse:
    """
    Run scope analysis on a client request.
    
    Returns the analysis result and updates the client request in the database.
    """
    # Use the analyze_client_request function from your service
    analysis_result = await analyze_client_request(
        client_request=client_request,
        session=db,
        commit=True,
    )
    
    return AnalyzeRequestResponse(
        classification=client_request.classification,
        confidence=float(client_request.confidence) if client_request.confidence else 0.0,
        reasoning=client_request.analysis_reasoning or "",
        matched_scope_item_id=client_request.linked_scope_item_id,
        suggested_action=client_request.suggested_action or "",
        scope_creep_indicators=analysis_result.scope_creep_indicators or [],
    )


@router.get(
    "/{project_id}/requests",
    response_model=ClientRequestListResponse,
    summary="List client requests",
    description="List all client requests for a project with optional filtering",
)
async def list_client_requests(
    project_id: UUID,
    status: Optional[RequestStatus] = None,
    classification: Optional[ScopeClassification] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRequestListResponse:
    """
    List client requests for a project.
    
    Supports filtering by status and classification.
    """
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Build query
    query = select(ClientRequest).where(ClientRequest.project_id == project_id)
    count_query = select(func.count(ClientRequest.id)).where(
        ClientRequest.project_id == project_id
    )
    
    # Apply filters
    if status is not None:
        query = query.where(ClientRequest.status == status)
        count_query = count_query.where(ClientRequest.status == status)
    
    if classification is not None:
        query = query.where(ClientRequest.classification == classification)
        count_query = count_query.where(ClientRequest.classification == classification)
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(ClientRequest.created_at.desc()).offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    requests = list(result.scalars().all())
    
    return ClientRequestListResponse(
        items=[ClientRequestResponse.model_validate(r) for r in requests],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/{project_id}/requests",
    response_model=ClientRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create client request",
    description="Create a new client request with optional auto-analysis",
)
async def create_client_request_endpoint(
    project_id: UUID,
    request_data: ClientRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRequestResponse:
    """
    Create a new client request.
    
    If auto_analyze is True (default), the request will be automatically
    analyzed against the project's scope items.
    """
    # Verify project ownership
    project = await get_project_or_404(project_id, db, current_user)
    
    # Create the client request
    client_request = ClientRequest(
        project_id=project_id,
        title=request_data.title,
        content=request_data.content,
        source=request_data.source,
        status=RequestStatus.NEW,
        classification=ScopeClassification.PENDING,
    )
    
    db.add(client_request)
    await db.commit()
    await db.refresh(client_request)
    
    # Run auto-analysis if requested
    if request_data.auto_analyze:
        scope_items = await get_project_scope_items(project_id, db)
        
        if scope_items:
            # Load the request with project relationship for analysis
            client_request = await load_request_with_project(
                client_request.id, project_id, db
            )
            await run_scope_analysis(client_request, db)
        else:
            # No scope items - mark as out of scope with note
            client_request.classification = ScopeClassification.OUT_OF_SCOPE
            client_request.analysis_reasoning = (
                "No scope items defined for this project. "
                "Unable to determine if request is in scope."
            )
            client_request.suggested_action = (
                "Define project scope items before analyzing requests."
            )
            client_request.status = RequestStatus.ANALYZED
            await db.commit()
            await db.refresh(client_request)
    
    return ClientRequestResponse.model_validate(client_request)


@router.get(
    "/{project_id}/requests/{request_id}",
    response_model=ClientRequestResponse,
    summary="Get client request",
    description="Get a single client request by ID",
)
async def get_client_request_endpoint(
    project_id: UUID,
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRequestResponse:
    """Get a single client request."""
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Get the request
    client_request = await get_request_or_404(request_id, project_id, db)
    
    return ClientRequestResponse.model_validate(client_request)


@router.patch(
    "/{project_id}/requests/{request_id}",
    response_model=ClientRequestResponse,
    summary="Update client request",
    description="Update an existing client request",
)
async def update_client_request_endpoint(
    project_id: UUID,
    request_id: UUID,
    request_data: ClientRequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRequestResponse:
    """
    Update a client request.
    
    Allows updating title, content, source, status, and linked scope item.
    """
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Get the request
    client_request = await get_request_or_404(request_id, project_id, db)
    
    # Update fields that were provided
    update_data = request_data.model_dump(exclude_unset=True)
    
    # Validate linked_scope_item_id if provided
    if "linked_scope_item_id" in update_data and update_data["linked_scope_item_id"]:
        scope_item_result = await db.execute(
            select(ScopeItem).where(
                ScopeItem.id == update_data["linked_scope_item_id"],
                ScopeItem.project_id == project_id,
            )
        )
        if not scope_item_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scope item not found in this project",
            )
    
    for field, value in update_data.items():
        setattr(client_request, field, value)
    
    await db.commit()
    await db.refresh(client_request)
    
    return ClientRequestResponse.model_validate(client_request)


@router.post(
    "/{project_id}/requests/{request_id}/analyze",
    response_model=AnalyzeRequestResponse,
    summary="Analyze client request",
    description="Manually trigger scope analysis for a client request",
)
async def analyze_request_endpoint(
    project_id: UUID,
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyzeRequestResponse:
    """
    Manually trigger scope analysis for a client request.
    
    This is useful for requests created with auto_analyze=False
    or to re-analyze after scope items have been updated.
    """
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Get project scope items
    scope_items = await get_project_scope_items(project_id, db)
    
    if not scope_items:
        # Handle case with no scope items
        client_request = await get_request_or_404(request_id, project_id, db)
        client_request.classification = ScopeClassification.OUT_OF_SCOPE
        client_request.analysis_reasoning = (
            "No scope items defined for this project. "
            "Unable to determine if request is in scope."
        )
        client_request.suggested_action = (
            "Define project scope items before analyzing requests."
        )
        client_request.status = RequestStatus.ANALYZED
        client_request.confidence = 0.0
        await db.commit()
        await db.refresh(client_request)
        
        return AnalyzeRequestResponse(
            classification=ScopeClassification.OUT_OF_SCOPE,
            confidence=0.0,
            reasoning=client_request.analysis_reasoning,
            matched_scope_item_id=None,
            suggested_action=client_request.suggested_action,
            scope_creep_indicators=[],
        )
    
    # Load request with project relationship and run analysis
    client_request = await load_request_with_project(request_id, project_id, db)
    return await run_scope_analysis(client_request, db)