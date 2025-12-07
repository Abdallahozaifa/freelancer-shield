"""
Authentication and billing dependencies for FastAPI.
"""

from typing import Annotated
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User
from app.models.subscription import Subscription, PlanType, SubscriptionStatus
from app.models.project import Project
from app.models.client import Client

security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get the current authenticated user from the JWT token."""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception
    
    result = await db.execute(
        select(User).where(User.id == user_uuid)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


# Type alias for dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]


# =============================================================================
# Authorization Helpers
# =============================================================================

def verify_ownership(resource, user_id: uuid.UUID, resource_name: str = "Resource") -> None:
    """
    Verify that a resource belongs to the specified user.
    
    Args:
        resource: The resource object to verify (must have user_id attribute)
        user_id: The user ID to verify against
        resource_name: Name of the resource type for error messages
        
    Raises:
        HTTPException: 404 if resource is None, 403 if ownership doesn't match
    """
    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found",
        )
    
    # Check if resource has user_id attribute
    if not hasattr(resource, 'user_id'):
        # For resources accessed through projects (ScopeItem, ClientRequest, Proposal)
        # we verify project ownership instead
        if hasattr(resource, 'project_id') and hasattr(resource, 'project'):
            if resource.project and resource.project.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Not authorized to access this {resource_name.lower()}",
                )
            return
    
    # Direct user_id check
    if resource.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to access this {resource_name.lower()}",
        )


# =============================================================================
# Billing / Subscription Dependencies
# =============================================================================

async def get_subscription(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Subscription:
    """Get or create user's subscription."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan=PlanType.FREE,
            status=SubscriptionStatus.ACTIVE,
        )
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)

    return subscription


async def check_project_limit(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Check if user can create a new project. Raises 403 if limit exceeded."""
    # Get subscription
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan=PlanType.FREE,
            status=SubscriptionStatus.ACTIVE,
        )
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)

    # Count projects
    count_result = await db.execute(
        select(func.count(Project.id)).where(Project.user_id == current_user.id)
    )
    current_count = count_result.scalar() or 0

    if current_count >= subscription.max_projects:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "plan_limit_exceeded",
                "limit_type": "projects",
                "current": current_count,
                "max": subscription.max_projects,
                "message": f"You've reached the limit of {subscription.max_projects} projects on the Free plan. Upgrade to Pro for unlimited projects.",
                "upgrade_url": "/settings/billing",
            }
        )


async def check_client_limit(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Check if user can create a new client. Raises 403 if limit exceeded."""
    # Get subscription
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan=PlanType.FREE,
            status=SubscriptionStatus.ACTIVE,
        )
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)

    # Count clients
    count_result = await db.execute(
        select(func.count(Client.id)).where(Client.user_id == current_user.id)
    )
    current_count = count_result.scalar() or 0

    if current_count >= subscription.max_clients:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "plan_limit_exceeded",
                "limit_type": "clients",
                "current": current_count,
                "max": subscription.max_clients,
                "message": f"You've reached the limit of {subscription.max_clients} clients on the Free plan. Upgrade to Pro for unlimited clients.",
                "upgrade_url": "/settings/billing",
            }
        )
