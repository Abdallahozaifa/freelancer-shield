"""
Shared enums used across the application.
"""

from enum import Enum


class ProjectStatus(str, Enum):
    """Status of a project."""
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class RequestSource(str, Enum):
    """Source of a client request."""
    EMAIL = "email"
    CHAT = "chat"
    CALL = "call"
    MEETING = "meeting"
    OTHER = "other"


class ScopeClassification(str, Enum):
    """Classification of a client request relative to project scope."""
    IN_SCOPE = "in_scope"
    OUT_OF_SCOPE = "out_of_scope"
    CLARIFICATION_NEEDED = "clarification_needed"
    REVISION = "revision"
    PENDING = "pending"  # Not yet analyzed


class RequestStatus(str, Enum):
    """Status of a client request."""
    NEW = "new"
    ANALYZED = "analyzed"
    ADDRESSED = "addressed"
    PROPOSAL_SENT = "proposal_sent"
    DECLINED = "declined"


class ProposalStatus(str, Enum):
    """Status of a proposal for out-of-scope work."""
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
