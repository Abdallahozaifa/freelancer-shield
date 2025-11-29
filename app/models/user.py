"""
User model for authentication and profile.
"""
import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, GUID # Assuming GUID is now in base.py


class User(BaseModel):
    """User account for freelancers."""
    
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), 
        primary_key=True, 
        default=uuid.uuid4, 
        # init is now implicitly True for SQLAlchemy's purposes unless defined otherwise in BaseModel
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    business_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )
    
    # Relationships
    clients: Mapped[list["Client"]] = relationship(
        "Client",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    projects: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    subscription: Mapped["Subscription | None"] = relationship(
        "Subscription",
        back_populates="user",
        uselist=False,
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"


# Import here to avoid circular imports
from app.models.client import Client
from app.models.project import Project
from app.models.subscription import Subscription
