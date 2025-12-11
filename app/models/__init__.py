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
    InvoiceStatus,
    FileCategory,
    MessageStatus,
)
from app.models.user import User
from app.models.client import Client
from app.models.project import Project
from app.models.scope_item import ScopeItem
from app.models.client_request import ClientRequest
from app.models.proposal import Proposal
from app.models.subscription import Subscription, PlanType, SubscriptionStatus
from app.models.portal import (
    PortalSettings,
    ClientPortalAccess,
    PortalInvoice,
    PortalFile,
    PortalMessage,
    PortalContract,
)

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
    "PlanType",
    "SubscriptionStatus",
    "InvoiceStatus",
    "FileCategory",
    "MessageStatus",
    # Models
    "User",
    "Client",
    "Project",
    "ScopeItem",
    "ClientRequest",
    "Proposal",
    "Subscription",
    # Portal Models
    "PortalSettings",
    "ClientPortalAccess",
    "PortalInvoice",
    "PortalFile",
    "PortalMessage",
    "PortalContract",
]