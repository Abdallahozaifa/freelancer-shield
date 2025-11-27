"""
ScopeItem model for defining project scope.
"""

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel, GUID # Import the GUID type



class ScopeItem(BaseModel):
    """An individual item in a project's scope of work."""
    
    __tablename__ = "scope_items"
    
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
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    is_completed: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )
    estimated_hours: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 1),
        nullable=True,
    )
    
    # Relationships
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="scope_items",
    )
    linked_requests: Mapped[list["ClientRequest"]] = relationship(
        "ClientRequest",
        back_populates="linked_scope_item",
        foreign_keys="ClientRequest.linked_scope_item_id",
    )
    
    def __repr__(self) -> str:
        return f"<ScopeItem {self.title}>"


# Import here to avoid circular imports
from app.models.project import Project
from app.models.client_request import ClientRequest
