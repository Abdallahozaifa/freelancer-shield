"""
Client Requests API endpoints.

Handles logging client communications.
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
    ClientRequestCreate,
    ClientRequestListResponse,
    ClientRequestResponse,
    ClientRequestUpdate,
)

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


@router.get(
    "/{project_id}/requests",
    response_model=ClientRequestListResponse,
    summary="List client requests",
    description="List all client requests for a project with optional filtering",
)
async def list_client_requests(
    project_id: UUID,
    status_filter: Optional[RequestStatus] = None,
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
    if status_filter is not None:
        query = query.where(ClientRequest.status == status_filter)
        count_query = count_query.where(ClientRequest.status == status_filter)
    
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
    description="Log a new client request for manual classification",
)
async def create_client_request_endpoint(
    project_id: UUID,
    request_data: ClientRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRequestResponse:
    """
    Create a new client request.
    
    Request is created as unclassified (pending) for user to manually classify.
    """
    # Verify project ownership
    project = await get_project_or_404(project_id, db, current_user)
    
    # Create the client request as unclassified
    client_request = ClientRequest(
        project_id=project_id,
        title=request_data.title,
        content=request_data.content,
        source=request_data.source,
        status=RequestStatus.NEW,  # Pending user review
        classification=None,  # Unclassified - user will set this
    )
    
    db.add(client_request)
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
    
    Allows updating title, content, source, status, classification, and linked scope item.
    """
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Get the request
    client_request = await get_request_or_404(request_id, project_id, db)
    
    # Update fields that were provided
    update_data = request_data.model_dump(exclude_unset=True)

    # Handle null classification - database doesn't allow NULL, so convert to PENDING
    if "classification" in update_data and update_data["classification"] is None:
        update_data["classification"] = ScopeClassification.PENDING

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


@router.delete(
    "/{project_id}/requests/{request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete client request",
    description="Delete a client request",
)
async def delete_client_request_endpoint(
    project_id: UUID,
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a client request."""
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Get the request
    client_request = await get_request_or_404(request_id, project_id, db)
    
    await db.delete(client_request)
    await db.commit()


@router.post(
    "/{project_id}/requests/{request_id}/classify",
    response_model=ClientRequestResponse,
    summary="Classify client request",
    description="Manually classify a client request as in-scope or out-of-scope",
)
async def classify_request_endpoint(
    project_id: UUID,
    request_id: UUID,
    classification: ScopeClassification,
    linked_scope_item_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientRequestResponse:
    """
    Manually classify a client request.
    
    Set classification to IN_SCOPE or OUT_OF_SCOPE.
    Optionally link to a scope item if in-scope.
    """
    # Verify project ownership
    await get_project_or_404(project_id, db, current_user)
    
    # Get the request
    client_request = await get_request_or_404(request_id, project_id, db)
    
    # Validate linked_scope_item_id if provided
    if linked_scope_item_id:
        scope_item_result = await db.execute(
            select(ScopeItem).where(
                ScopeItem.id == linked_scope_item_id,
                ScopeItem.project_id == project_id,
            )
        )
        scope_item = scope_item_result.scalar_one_or_none()
        if not scope_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scope item not found in this project",
            )
        client_request.linked_scope_item_id = linked_scope_item_id
        client_request.linked_scope_item_title = scope_item.title
    
    # Update classification
    client_request.classification = classification
    client_request.status = RequestStatus.ANALYZED
    
    await db.commit()
    await db.refresh(client_request)
    
    return ClientRequestResponse.model_validate(client_request)
