"""
Subscription service for checking user limits and feature access.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.models import Subscription, User, Project, Client
from app.models.subscription import PlanType, SubscriptionStatus
from app.models.enums import ProjectStatus


# Free plan limits
FREE_PROJECT_LIMIT = 3
FREE_CLIENT_LIMIT = 2


async def get_user_subscription(
    db: AsyncSession,
    user_id: UUID
) -> Subscription | None:
    """Get user's subscription record."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def is_user_pro(
    db: AsyncSession,
    user_id: UUID
) -> bool:
    """Check if user has an active Pro subscription."""
    subscription = await get_user_subscription(db, user_id)
    return (
        subscription is not None
        and subscription.status == SubscriptionStatus.ACTIVE
        and subscription.plan == PlanType.PRO
    )


async def can_create_project(
    db: AsyncSession,
    user_id: UUID
) -> bool:
    """Check if user can create a new project."""
    if await is_user_pro(db, user_id):
        return True
    
    # Count active projects for free users
    result = await db.execute(
        select(func.count(Project.id)).where(
            Project.user_id == user_id,
            Project.status == ProjectStatus.ACTIVE
        )
    )
    count = result.scalar_one()
    
    return count < FREE_PROJECT_LIMIT


async def can_create_client(
    db: AsyncSession,
    user_id: UUID
) -> bool:
    """Check if user can create a new client."""
    if await is_user_pro(db, user_id):
        return True
    
    # Count all clients for free users
    result = await db.execute(
        select(func.count(Client.id)).where(
            Client.user_id == user_id
        )
    )
    count = result.scalar_one()
    
    return count < FREE_CLIENT_LIMIT


async def check_feature_access(
    db: AsyncSession,
    user_id: UUID,
    feature: str
) -> bool:
    """
    Check if user has access to a Pro feature.
    
    Pro features:
    - smart_scope_detection
    - proposal_generator
    - advanced_analytics
    - priority_support
    """
    pro_features = [
        "smart_scope_detection",
        "proposal_generator",
        "advanced_analytics",
        "priority_support"
    ]
    
    if feature in pro_features:
        return await is_user_pro(db, user_id)
    
    return True  # Free features are always accessible


async def get_project_limit(db: AsyncSession, user_id: UUID) -> int | float:
    """Get the project limit for a user."""
    if await is_user_pro(db, user_id):
        return float('inf')  # Unlimited
    return FREE_PROJECT_LIMIT


async def get_client_limit(db: AsyncSession, user_id: UUID) -> int | float:
    """Get the client limit for a user."""
    if await is_user_pro(db, user_id):
        return float('inf')  # Unlimited
    return FREE_CLIENT_LIMIT

