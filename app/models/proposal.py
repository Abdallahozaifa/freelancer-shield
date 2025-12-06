"""
Proposal model for out-of-scope work proposals.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.enums import ProposalStatus
from app.models.base import BaseModel, GUID # Import the GUID type


class Proposal(BaseModel):
    """A proposal for out-of-scope work."""
    
    __tablename__ = "proposals"
    
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
    source_request_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("client_requests.id", ondelete="SET NULL"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    status: Mapped[ProposalStatus] = mapped_column(
        ENUM(
            ProposalStatus,
            name='proposalstatus',
            create_type=False,
            values_callable=lambda x: [e.value for e in x]
        ),
        default=ProposalStatus.DRAFT,
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    estimated_hours: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 1),
        nullable=True,
    )
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    responded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    # Relationships
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="proposals",
    )
    source_request: Mapped["ClientRequest | None"] = relationship(
        "ClientRequest",
        back_populates="proposal",
        foreign_keys=[source_request_id],
    )
    
    def __repr__(self) -> str:
        return f"<Proposal {self.title}>"


# Import here to avoid circular imports
from app.models.project import Project
from app.models.client_request import ClientRequest
