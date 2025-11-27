"""
ClientRequest model for tracking client communications and requests.
"""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel, GUID # Import the GUID type
from app.models.enums import RequestSource, RequestStatus, ScopeClassification


class ClientRequest(BaseModel):
    """A request or communication from a client."""
    
    __tablename__ = "client_requests"
    
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), 
        primary_key=True, 
        default=uuid.uuid4,
    )
    
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    linked_scope_item_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("scope_items.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    source: Mapped[RequestSource] = mapped_column(
        default=RequestSource.EMAIL,
        nullable=False,
    )
    status: Mapped[RequestStatus] = mapped_column(
        default=RequestStatus.NEW,
        nullable=False,
    )
    
    # Analysis results
    classification: Mapped[ScopeClassification] = mapped_column(
        default=ScopeClassification.PENDING,
        nullable=False,
    )
    confidence: Mapped[Decimal | None] = mapped_column(
        Numeric(3, 2),  # 0.00 to 1.00
        nullable=True,
    )
    analysis_reasoning: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    suggested_action: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Relationships
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="client_requests",
    )
    linked_scope_item: Mapped["ScopeItem | None"] = relationship(
        "ScopeItem",
        back_populates="linked_requests",
        foreign_keys=[linked_scope_item_id],
    )
    proposal: Mapped["Proposal | None"] = relationship(
        "Proposal",
        back_populates="source_request",
        uselist=False,
    )
    
    def __repr__(self) -> str:
        return f"<ClientRequest {self.title}>"


# Import here to avoid circular imports
from app.models.project import Project
from app.models.scope_item import ScopeItem
from app.models.proposal import Proposal
