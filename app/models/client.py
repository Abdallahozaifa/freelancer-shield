"""
Client model for managing freelancer's clients.
"""

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

import uuid
# Import the GUID type you created
from app.models.base import BaseModel, GUID


class Client(BaseModel):
    """A client that the freelancer works with."""
    
    __tablename__ = "clients"
    
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
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    company: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="clients",
    )
    projects: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="client",
        cascade="all, delete-orphan",
    )
    portal_access: Mapped["ClientPortalAccess | None"] = relationship(
        "ClientPortalAccess",
        back_populates="client",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Client {self.name}>"


# Import here to avoid circular imports
from app.models.user import User
from app.models.project import Project
from app.models.portal import ClientPortalAccess
