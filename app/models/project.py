"""
Project model for tracking freelance projects.
"""

import secrets
import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.enums import ProjectStatus
from app.models.base import BaseModel, GUID # Import the GUID type


def generate_public_token() -> str:
    """Generate a URL-safe token for public request forms."""
    return secrets.token_urlsafe(16)


class Project(BaseModel):
    """A freelance project with scope tracking."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[ProjectStatus] = mapped_column(
        ENUM(
            ProjectStatus,
            name='projectstatus',
            create_type=False,
            values_callable=lambda x: [e.value for e in x]
        ),
        default=ProjectStatus.ACTIVE,
        nullable=False,
    )
    budget: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    hourly_rate: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    estimated_hours: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 1),
        nullable=True,
    )

    # Public request form settings
    public_request_token: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
        unique=True,
        index=True,
    )
    public_request_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="projects",
    )
    client: Mapped["Client"] = relationship(
        "Client",
        back_populates="projects",
    )
    scope_items: Mapped[list["ScopeItem"]] = relationship(
        "ScopeItem",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ScopeItem.order",
    )
    client_requests: Mapped[list["ClientRequest"]] = relationship(
        "ClientRequest",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ClientRequest.created_at.desc()",
    )
    proposals: Mapped[list["Proposal"]] = relationship(
        "Proposal",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="Proposal.created_at.desc()",
    )
    
    def __repr__(self) -> str:
        return f"<Project {self.name}>"


# Import here to avoid circular imports
from app.models.user import User
from app.models.client import Client
from app.models.scope_item import ScopeItem
from app.models.client_request import ClientRequest
from app.models.proposal import Proposal
