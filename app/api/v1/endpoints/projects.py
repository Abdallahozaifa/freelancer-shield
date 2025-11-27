"""Projects API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.client import Client
from app.models.enums import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectDetail,
    ProjectList,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter()


async def get_project_or_404(
    project_id: str,
    user: User,
    db: AsyncSession,
) -> Project:
    """Get a project by ID or raise 404 if not found or not owned by user."""
    try:
        uuid_id = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.client))
        .where(Project.id == uuid_id, Project.user_id == user.id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    return project


def project_to_response(project: Project, stats: dict | None = None) -> ProjectResponse:
    """Convert a Project model to ProjectResponse schema."""
    stats = stats or {}
    return ProjectResponse(
        id=str(project.id),
        client_id=str(project.client_id),
        client_name=project.client.name if project.client else "Unknown",
        name=project.name,
        description=project.description,
        status=project.status,
        budget=project.budget,
        hourly_rate=project.hourly_rate,
        estimated_hours=project.estimated_hours,
        created_at=project.created_at,
        updated_at=project.updated_at,
        scope_item_count=stats.get("scope_item_count", 0),
        completed_scope_count=stats.get("completed_scope_count", 0),
        out_of_scope_request_count=stats.get("out_of_scope_request_count", 0),
    )


@router.get("", response_model=ProjectList)
async def list_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    status_filter: Annotated[ProjectStatus | None, Query(alias="status")] = None,
    client_id: Annotated[str | None, Query()] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ProjectList:
    """
    List all projects for the current user.
    
    Supports filtering by status and client_id.
    """
    # Build base query
    query = (
        select(Project)
        .options(selectinload(Project.client))
        .where(Project.user_id == current_user.id)
    )
    
    # Apply filters
    if status_filter:
        query = query.where(Project.status == status_filter)
    
    if client_id:
        try:
            client_uuid = UUID(client_id)
            query = query.where(Project.client_id == client_uuid)
        except ValueError:
            # Invalid UUID, return empty results
            return ProjectList(projects=[], total=0)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(Project.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return ProjectList(
        projects=[project_to_response(p) for p in projects],
        total=total,
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectResponse:
    """
    Create a new project.
    
    The client_id must belong to the current user.
    """
    # Verify client exists and belongs to user
    try:
        client_uuid = UUID(project_in.client_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    result = await db.execute(
        select(Client).where(
            Client.id == client_uuid,
            Client.user_id == current_user.id,
        )
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )
    
    # Create project
    project = Project(
        user_id=current_user.id,
        client_id=client_uuid,
        name=project_in.name,
        description=project_in.description,
        status=project_in.status,
        budget=project_in.budget,
        hourly_rate=project_in.hourly_rate,
        estimated_hours=project_in.estimated_hours,
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Load client relationship for response
    project.client = client
    
    return project_to_response(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectResponse:
    """Get a specific project with stats."""
    project = await get_project_or_404(project_id, current_user, db)
    
    # TODO: Calculate actual stats when ScopeItem and ClientRequest models are available
    stats = {
        "scope_item_count": 0,
        "completed_scope_count": 0,
        "out_of_scope_request_count": 0,
    }
    
    return project_to_response(project, stats)


@router.get("/{project_id}/detail", response_model=ProjectDetail)
async def get_project_detail(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectDetail:
    """Get a project with scope items and recent requests."""
    project = await get_project_or_404(project_id, current_user, db)
    
    # TODO: Load scope_items and recent_requests when those models are available
    stats = {
        "scope_item_count": 0,
        "completed_scope_count": 0,
        "out_of_scope_request_count": 0,
    }
    
    response = project_to_response(project, stats)
    
    return ProjectDetail(
        **response.model_dump(),
        scope_items=[],
        recent_requests=[],
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectResponse:
    """Update a project."""
    project = await get_project_or_404(project_id, current_user, db)
    
    # Update only provided fields
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    await db.commit()
    await db.refresh(project)
    
    return project_to_response(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete a project."""
    project = await get_project_or_404(project_id, current_user, db)
    
    await db.delete(project)
    await db.commit()
