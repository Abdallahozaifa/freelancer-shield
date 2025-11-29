"""Billing schemas for API requests/responses."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum


class PlanType(str, Enum):
    """Available plan types."""
    FREE = "free"
    PRO = "pro"


class SubscriptionStatus(str, Enum):
    """Subscription status."""
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    INCOMPLETE = "incomplete"
    TRIALING = "trialing"
    UNPAID = "unpaid"


class SubscriptionResponse(BaseModel):
    """Current subscription details."""
    plan: PlanType
    status: SubscriptionStatus
    is_pro: bool
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    
    # Plan limits
    max_projects: int
    max_clients: int
    
    # Current usage (filled by endpoint)
    current_projects: int = 0
    current_clients: int = 0

    class Config:
        from_attributes = True


class CreateCheckoutRequest(BaseModel):
    """Request to create checkout session."""
    success_url: str
    cancel_url: str


class CreateCheckoutResponse(BaseModel):
    """Response with checkout URL."""
    checkout_url: str


class CreatePortalRequest(BaseModel):
    """Request to create customer portal session."""
    return_url: str


class CreatePortalResponse(BaseModel):
    """Response with portal URL."""
    portal_url: str


class PlanLimits(BaseModel):
    """Plan limits response."""
    plan: PlanType
    max_projects: int
    max_clients: int
    current_projects: int
    current_clients: int
    can_create_project: bool
    can_create_client: bool


class UpgradePrompt(BaseModel):
    """Upgrade prompt when limit is reached."""
    limit_type: str  # "projects" or "clients"
    current_count: int
    max_count: int
    message: str
