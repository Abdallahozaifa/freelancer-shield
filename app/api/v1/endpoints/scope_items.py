"""Scope Items API endpoints."""
from decimal import Decimal
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.scope_item import ScopeItem
from app.models.user import User
from app.schemas.scope_item import (
    ScopeItemCreate,
    ScopeItemReorder,
    ScopeItemResponse,
    ScopeItemUpdate,
    ScopeProgress,
)

router = APIRouter()


async def verify_project_access(
    project_id: str,
    db: AsyncSession,
    current_user: User,
) -> Project:
    """
    Verify the current user has access to the specified project.
    
    Args:
        project_id: The ID of the project to verify access for.
        db: Database session.
        current_user: The currently authenticated user.
        
    Returns:
        The Project object if access is verified.
        
    Raises:
        HTTPException: 404 if project not found or user doesn't have access.
    """
    try:
        uuid_project_id = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    result = await db.execute(
        select(Project).where(
            Project.id == uuid_project_id,
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


async def get_scope_item_or_404(
    item_id: str,
    project_id: str,
    db: AsyncSession,
) -> ScopeItem:
    """
    Get a scope item by ID or raise 404.
    
    Args:
        item_id: The ID of the scope item.
        project_id: The ID of the project the item belongs to.
        db: Database session.
        
    Returns:
        The ScopeItem object if found.
        
    Raises:
        HTTPException: 404 if scope item not found.
    """
    try:
        uuid_item_id = UUID(item_id)
        uuid_project_id = UUID(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scope item not found",
        )
    
    result = await db.execute(
        select(ScopeItem).where(
            ScopeItem.id == uuid_item_id,
            ScopeItem.project_id == uuid_project_id,
        )
    )
    scope_item = result.scalar_one_or_none()
    
    if not scope_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scope item not found",
        )
    
    return scope_item


@router.get(
    "/{project_id}/scope",
    response_model=list[ScopeItemResponse],
    summary="List scope items",
    description="Get all scope items for a project, ordered by their order field.",
)
async def list_scope_items(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ScopeItemResponse]:
    """List all scope items for a project, ordered by order field."""
    await verify_project_access(project_id, db, current_user)
    
    result = await db.execute(
        select(ScopeItem)
        .where(ScopeItem.project_id == UUID(project_id))
        .order_by(ScopeItem.order)
    )
    scope_items = result.scalars().all()
    
    return [
        ScopeItemResponse(
            id=str(item.id),
            project_id=str(item.project_id),
            title=item.title,
            description=item.description,
            order=item.order,
            is_completed=item.is_completed,
            estimated_hours=item.estimated_hours,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in scope_items
    ]


@router.post(
    "/{project_id}/scope",
    response_model=ScopeItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create scope item",
    description="Add a new scope item to a project. Order is auto-assigned.",
)
async def create_scope_item(
    project_id: str,
    scope_item_in: ScopeItemCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ScopeItemResponse:
    """Create a new scope item for a project."""
    await verify_project_access(project_id, db, current_user)
    
    # Get the max order for existing items
    result = await db.execute(
        select(func.coalesce(func.max(ScopeItem.order), -1)).where(
            ScopeItem.project_id == UUID(project_id)
        )
    )
    max_order = result.scalar()
    new_order = max_order + 1
    
    # Create the new scope item
    scope_item = ScopeItem(
        project_id=UUID(project_id),
        title=scope_item_in.title,
        description=scope_item_in.description,
        estimated_hours=scope_item_in.estimated_hours,
        order=new_order,
        is_completed=False,
    )
    
    db.add(scope_item)
    await db.commit()
    await db.refresh(scope_item)
    
    return ScopeItemResponse(
        id=str(scope_item.id),
        project_id=str(scope_item.project_id),
        title=scope_item.title,
        description=scope_item.description,
        order=scope_item.order,
        is_completed=scope_item.is_completed,
        estimated_hours=scope_item.estimated_hours,
        created_at=scope_item.created_at,
        updated_at=scope_item.updated_at,
    )


@router.get(
    "/{project_id}/scope/progress",
    response_model=ScopeProgress,
    summary="Get scope progress",
    description="Get completion statistics for project scope items.",
)
async def get_scope_progress(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ScopeProgress:
    """Get completion statistics for project scope items."""
    await verify_project_access(project_id, db, current_user)
    
    # Get all scope items for the project
    result = await db.execute(
        select(ScopeItem).where(ScopeItem.project_id == UUID(project_id))
    )
    scope_items = result.scalars().all()
    
    total_items = len(scope_items)
    completed_items = sum(1 for item in scope_items if item.is_completed)
    
    # Calculate completion percentage
    completion_percentage = 0.0
    if total_items > 0:
        completion_percentage = round((completed_items / total_items) * 100, 2)
    
    # Calculate hours
    total_estimated_hours = None
    completed_estimated_hours = None
    
    items_with_hours = [item for item in scope_items if item.estimated_hours is not None]
    completed_with_hours = [
        item for item in scope_items 
        if item.is_completed and item.estimated_hours is not None
    ]
    
    if items_with_hours:
        total_estimated_hours = sum(
            item.estimated_hours for item in items_with_hours
        )
    
    if completed_with_hours:
        completed_estimated_hours = sum(
            item.estimated_hours for item in completed_with_hours
        )
    elif items_with_hours:
        # If there are items with hours but none completed, set to 0
        completed_estimated_hours = Decimal("0")
    
    return ScopeProgress(
        total_items=total_items,
        completed_items=completed_items,
        completion_percentage=completion_percentage,
        total_estimated_hours=total_estimated_hours,
        completed_estimated_hours=completed_estimated_hours,
    )


@router.patch(
    "/{project_id}/scope/{item_id}",
    response_model=ScopeItemResponse,
    summary="Update scope item",
    description="Update a scope item's properties.",
)
async def update_scope_item(
    project_id: str,
    item_id: str,
    scope_item_update: ScopeItemUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ScopeItemResponse:
    """Update a scope item."""
    await verify_project_access(project_id, db, current_user)
    scope_item = await get_scope_item_or_404(item_id, project_id, db)
    
    # Update fields if provided
    update_data = scope_item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scope_item, field, value)
    
    await db.commit()
    await db.refresh(scope_item)
    
    return ScopeItemResponse(
        id=str(scope_item.id),
        project_id=str(scope_item.project_id),
        title=scope_item.title,
        description=scope_item.description,
        order=scope_item.order,
        is_completed=scope_item.is_completed,
        estimated_hours=scope_item.estimated_hours,
        created_at=scope_item.created_at,
        updated_at=scope_item.updated_at,
    )


@router.delete(
    "/{project_id}/scope/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete scope item",
    description="Delete a scope item from a project.",
)
async def delete_scope_item(
    project_id: str,
    item_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete a scope item."""
    await verify_project_access(project_id, db, current_user)
    scope_item = await get_scope_item_or_404(item_id, project_id, db)
    
    await db.delete(scope_item)
    await db.commit()


@router.post(
    "/{project_id}/scope/reorder",
    response_model=list[ScopeItemResponse],
    summary="Reorder scope items",
    description="Reorder scope items by providing a list of item IDs in the desired order.",
)
async def reorder_scope_items(
    project_id: str,
    reorder_data: ScopeItemReorder,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ScopeItemResponse]:
    """Reorder scope items by providing a list of item IDs in the desired order."""
    await verify_project_access(project_id, db, current_user)
    
    # Get all existing scope items for this project
    result = await db.execute(
        select(ScopeItem).where(ScopeItem.project_id == UUID(project_id))
    )
    existing_items = {str(item.id): item for item in result.scalars().all()}
    
    # Validate all provided IDs exist and belong to this project
    for item_id in reorder_data.item_ids:
        if item_id not in existing_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Scope item {item_id} not found in this project",
            )
    
    # Validate all existing items are included
    if set(reorder_data.item_ids) != set(existing_items.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reorder must include all scope items for the project",
        )
    
    # Update orders in a single transaction
    for new_order, item_id in enumerate(reorder_data.item_ids):
        existing_items[item_id].order = new_order
    
    await db.commit()
    
    # Refresh and return updated items in new order
    updated_items = []
    for item_id in reorder_data.item_ids:
        await db.refresh(existing_items[item_id])
        item = existing_items[item_id]
        updated_items.append(
            ScopeItemResponse(
                id=str(item.id),
                project_id=str(item.project_id),
                title=item.title,
                description=item.description,
                order=item.order,
                is_completed=item.is_completed,
                estimated_hours=item.estimated_hours,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
        )
    
    return updated_items
