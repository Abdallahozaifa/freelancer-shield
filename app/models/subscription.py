"""Subscription model for Stripe billing."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum

from app.models.base import BaseModel


class PlanType(str, enum.Enum):
    """Subscription plan types."""
    FREE = "free"
    PRO = "pro"


class SubscriptionStatus(str, enum.Enum):
    """Subscription status from Stripe."""
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    INCOMPLETE = "incomplete"
    TRIALING = "trialing"
    UNPAID = "unpaid"


class Subscription(BaseModel):
    """User subscription model."""
    
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False
    )
    
    # Stripe identifiers
    stripe_customer_id: Mapped[str | None] = mapped_column(
        String(255), 
        unique=True, 
        nullable=True
    )
    stripe_subscription_id: Mapped[str | None] = mapped_column(
        String(255), 
        unique=True, 
        nullable=True
    )
    stripe_price_id: Mapped[str | None] = mapped_column(
        String(255), 
        nullable=True
    )
    
    # Plan info
    plan: Mapped[PlanType] = mapped_column(
        ENUM(PlanType, name='plantype', create_type=False),
        default=PlanType.FREE, 
        nullable=False
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        ENUM(SubscriptionStatus, name='subscriptionstatus', create_type=False),
        default=SubscriptionStatus.ACTIVE, 
        nullable=False
    )
    
    # Billing period
    current_period_start: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )
    current_period_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )
    cancel_at_period_end: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscription")

    @property
    def is_pro(self) -> bool:
        """Check if user has active Pro subscription."""
        return (
            self.plan == PlanType.PRO 
            and self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
        )

    @property
    def is_active(self) -> bool:
        """Check if subscription is active (any plan)."""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]

    # Plan limits
    @property
    def max_projects(self) -> int:
        """Maximum projects allowed for this plan."""
        return 999 if self.is_pro else 3

    @property
    def max_clients(self) -> int:
        """Maximum clients allowed for this plan."""
        return 999 if self.is_pro else 2

    def __repr__(self):
        return f"<Subscription {self.user_id} - {self.plan.value}>"


# Avoid circular import
from app.models.user import User
