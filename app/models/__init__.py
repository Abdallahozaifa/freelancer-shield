"""
SQLAlchemy models for Freelancer Project Shield.
"""

from app.models.base import Base, BaseModel
from app.models.enums import (
    ProjectStatus,
    ProposalStatus,
    RequestSource,
    RequestStatus,
    ScopeClassification,
)
from app.models.user import User
from app.models.client import Client
from app.models.project import Project
from app.models.scope_item import ScopeItem
from app.models.client_request import ClientRequest
from app.models.proposal import Proposal
from app.models.subscription import Subscription, PlanType, SubscriptionStatus  # ADD THIS

__all__ = [
    # Base
    "Base",
    "BaseModel",
    # Enums
    "ProjectStatus",
    "ProposalStatus",
    "RequestSource",
    "RequestStatus",
    "ScopeClassification",
    "PlanType",           # ADD THIS
    "SubscriptionStatus", # ADD THIS
    # Models
    "User",
    "Client",
    "Project",
    "ScopeItem",
    "ClientRequest",
    "Proposal",
    "Subscription",       # ADD THIS
]