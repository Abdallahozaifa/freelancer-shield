"""Client management endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.client import Client
from app.models.project import Project
from app.models.user import User
from app.schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientList,
)

router = APIRouter()


def _client_to_response(client: Client, project_count: int = 0) -> ClientResponse:
    """Convert a Client model to ClientResponse schema."""
    return ClientResponse(
        id=str(client.id),
        name=client.name,
        email=client.email,
        company=client.company,
        notes=client.notes,
        created_at=client.created_at,
        updated_at=client.updated_at,
        project_count=project_count,
    )


@router.get("", response_model=ClientList)
async def list_clients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> ClientList:
    """
    List all clients for the current user with project counts.
    
    Supports pagination with skip and limit parameters.
    """
    # Get clients with project counts using a subquery
    project_count_subquery = (
        select(Project.client_id, func.count(Project.id).label("project_count"))
        .where(Project.user_id == current_user.id)
        .group_by(Project.client_id)
        .subquery()
    )
    
    # Query clients with left join to get project counts
    query = (
        select(Client, func.coalesce(project_count_subquery.c.project_count, 0).label("project_count"))
        .outerjoin(project_count_subquery, Client.id == project_count_subquery.c.client_id)
        .where(Client.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Client.created_at.desc())
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Get total count
    count_query = select(func.count(Client.id)).where(Client.user_id == current_user.id)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    clients = [
        _client_to_response(row.Client, row.project_count)
        for row in rows
    ]
    
    return ClientList(clients=clients, total=total)


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_in: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientResponse:
    """Create a new client for the current user."""
    client = Client(
        user_id=current_user.id,
        name=client_in.name,
        email=client_in.email,
        company=client_in.company,
        notes=client_in.notes,
    )
    db.add(client)
    await db.commit()
    await db.refresh(client)
    
    return _client_to_response(client, project_count=0)


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientResponse:
    """
    Get a single client by ID.
    
    Returns 404 if client doesn't exist or belongs to another user.
    """
    try:
        client_uuid = uuid.UUID(client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    # Get client with project count
    project_count_subquery = (
        select(func.count(Project.id))
        .where(Project.client_id == client_uuid)
        .where(Project.user_id == current_user.id)
        .scalar_subquery()
    )
    
    query = (
        select(Client, project_count_subquery.label("project_count"))
        .where(Client.id == client_uuid)
        .where(Client.user_id == current_user.id)
    )
    
    result = await db.execute(query)
    row = result.first()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    return _client_to_response(row.Client, row.project_count or 0)


@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_in: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClientResponse:
    """
    Update a client by ID.
    
    Only updates fields that are explicitly provided.
    Returns 404 if client doesn't exist or belongs to another user.
    """
    try:
        client_uuid = uuid.UUID(client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    # Find the client
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
    
    # Update only provided fields
    update_data = client_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    await db.commit()
    await db.refresh(client)
    
    # Get project count
    project_count_query = (
        select(func.count(Project.id))
        .where(Project.client_id == client_uuid)
        .where(Project.user_id == current_user.id)
    )
    project_count_result = await db.execute(project_count_query)
    project_count = project_count_result.scalar() or 0
    
    return _client_to_response(client, project_count)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a client by ID.
    
    Returns 404 if client doesn't exist or belongs to another user.
    """
    try:
        client_uuid = uuid.UUID(client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
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
    
    await db.delete(client)
    await db.commit()