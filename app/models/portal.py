"""
Client Portal models for branded client communication.
"""

import uuid
import secrets
from datetime import datetime, timedelta

from sqlalchemy import Boolean, ForeignKey, String, Text, DateTime, Numeric, func
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel, GUID
from app.models.enums import InvoiceStatus, FileCategory, MessageStatus


class PortalSettings(BaseModel):
    """Freelancer's portal branding and settings."""

    __tablename__ = "portal_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Branding
    business_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    logo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    primary_color: Mapped[str] = mapped_column(
        String(7),
        default="#3B82F6",  # Blue
        nullable=False,
    )
    accent_color: Mapped[str] = mapped_column(
        String(7),
        default="#10B981",  # Green
        nullable=False,
    )

    # Portal subdomain (unique slug for portal URL)
    portal_slug: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        unique=True,
        index=True,
    )

    # Contact info shown on portal
    contact_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    contact_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # Welcome message shown to clients
    welcome_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Features toggle
    show_invoices: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    show_files: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    show_messages: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    show_contracts: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="portal_settings",
    )

    def __repr__(self) -> str:
        return f"<PortalSettings {self.business_name or self.user_id}>"


class ClientPortalAccess(BaseModel):
    """Client access tokens for portal login."""

    __tablename__ = "client_portal_access"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    client_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Access token for portal login (hashed)
    access_token: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    # Magic link token (temporary, for email login)
    magic_link_token: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        unique=True,
        index=True,
    )
    magic_link_expires: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    last_accessed: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    client: Mapped["Client"] = relationship(
        "Client",
        back_populates="portal_access",
    )

    @classmethod
    def generate_access_token(cls) -> str:
        """Generate a secure access token."""
        return secrets.token_urlsafe(32)

    @classmethod
    def generate_magic_link_token(cls) -> str:
        """Generate a magic link token."""
        return secrets.token_urlsafe(32)

    def __repr__(self) -> str:
        return f"<ClientPortalAccess {self.client_id}>"


class PortalInvoice(BaseModel):
    """Invoices shared with clients through portal."""

    __tablename__ = "portal_invoices"

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
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Invoice details
    invoice_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Amounts
    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    tax_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )
    total_amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    # Status
    status: Mapped[InvoiceStatus] = mapped_column(
        ENUM(
            InvoiceStatus,
            name='invoicestatus',
            create_type=False,
            values_callable=lambda x: [e.value for e in x]
        ),
        default=InvoiceStatus.DRAFT,
        nullable=False,
    )

    # Dates
    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    paid_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Payment link (Stripe or other)
    payment_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User")
    client: Mapped["Client"] = relationship("Client")
    project: Mapped["Project"] = relationship("Project")

    def __repr__(self) -> str:
        return f"<PortalInvoice {self.invoice_number}>"


class PortalFile(BaseModel):
    """Files shared with clients through portal."""

    __tablename__ = "portal_files"

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
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # File details
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    file_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    file_size: Mapped[int | None] = mapped_column(
        nullable=True,
    )
    file_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # Category
    category: Mapped[FileCategory] = mapped_column(
        ENUM(
            FileCategory,
            name='filecategory',
            create_type=False,
            values_callable=lambda x: [e.value for e in x]
        ),
        default=FileCategory.OTHER,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Visibility
    is_visible: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User")
    client: Mapped["Client"] = relationship("Client")
    project: Mapped["Project"] = relationship("Project")

    def __repr__(self) -> str:
        return f"<PortalFile {self.name}>"


class PortalMessage(BaseModel):
    """Messages between freelancer and client through portal."""

    __tablename__ = "portal_messages"

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
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Message content
    subject: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Sender info
    is_from_client: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Status
    status: Mapped[MessageStatus] = mapped_column(
        ENUM(
            MessageStatus,
            name='messagestatus',
            create_type=False,
            values_callable=lambda x: [e.value for e in x]
        ),
        default=MessageStatus.UNREAD,
        nullable=False,
    )

    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User")
    client: Mapped["Client"] = relationship("Client")
    project: Mapped["Project"] = relationship("Project")

    def __repr__(self) -> str:
        return f"<PortalMessage {self.id}>"


class PortalContract(BaseModel):
    """Contracts shared with clients through portal."""

    __tablename__ = "portal_contracts"

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
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Contract details
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # File attachment (PDF)
    file_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # Signature status
    requires_signature: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    signed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    signature_data: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    signer_ip: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User")
    client: Mapped["Client"] = relationship("Client")
    project: Mapped["Project"] = relationship("Project")

    def __repr__(self) -> str:
        return f"<PortalContract {self.title}>"


# Import here to avoid circular imports
from app.models.user import User
from app.models.client import Client
from app.models.project import Project
