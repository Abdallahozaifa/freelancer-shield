"""Portal schemas for request validation and response serialization."""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
import re

from app.models.enums import InvoiceStatus, FileCategory, MessageStatus


# ==================== Portal Settings ====================

class PortalSettingsCreate(BaseModel):
    """Schema for creating portal settings."""
    business_name: str | None = Field(default=None, max_length=255)
    logo_url: str | None = Field(default=None, max_length=500)
    primary_color: str = Field(default="#3B82F6", max_length=7)
    accent_color: str = Field(default="#10B981", max_length=7)
    portal_slug: str | None = Field(default=None, min_length=3, max_length=50)
    contact_email: EmailStr | None = None
    contact_phone: str | None = Field(default=None, max_length=50)
    welcome_message: str | None = None
    show_invoices: bool = True
    show_files: bool = True
    show_messages: bool = True
    show_contracts: bool = True

    @field_validator('portal_slug')
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', v):
            raise ValueError('Slug must be lowercase alphanumeric with hyphens, not starting/ending with hyphen')
        return v

    @field_validator('primary_color', 'accent_color')
    @classmethod
    def validate_color(cls, v: str) -> str:
        if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError('Color must be a valid hex color (e.g., #3B82F6)')
        return v.upper()


class PortalSettingsUpdate(BaseModel):
    """Schema for updating portal settings."""
    business_name: str | None = Field(default=None, max_length=255)
    logo_url: str | None = Field(default=None, max_length=500)
    primary_color: str | None = Field(default=None, max_length=7)
    accent_color: str | None = Field(default=None, max_length=7)
    portal_slug: str | None = Field(default=None, min_length=3, max_length=50)
    contact_email: EmailStr | None = None
    contact_phone: str | None = Field(default=None, max_length=50)
    welcome_message: str | None = None
    show_invoices: bool | None = None
    show_files: bool | None = None
    show_messages: bool | None = None
    show_contracts: bool | None = None

    @field_validator('portal_slug')
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', v):
            raise ValueError('Slug must be lowercase alphanumeric with hyphens')
        return v


class PortalSettingsResponse(BaseModel):
    """Schema for portal settings response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    business_name: str | None
    logo_url: str | None
    primary_color: str
    accent_color: str
    portal_slug: str | None
    contact_email: str | None
    contact_phone: str | None
    welcome_message: str | None
    show_invoices: bool
    show_files: bool
    show_messages: bool
    show_contracts: bool
    portal_url: str | None = None
    created_at: datetime
    updated_at: datetime


# ==================== Client Portal Access ====================

class ClientPortalInvite(BaseModel):
    """Schema for inviting a client to the portal."""
    client_id: str
    send_email: bool = True


class ClientPortalAccessResponse(BaseModel):
    """Schema for client portal access response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    client_name: str | None = None
    client_email: str | None = None
    is_active: bool
    last_accessed: datetime | None
    portal_link: str | None = None
    created_at: datetime


class PortalMagicLinkRequest(BaseModel):
    """Schema for requesting a magic link."""
    email: EmailStr


class PortalMagicLinkVerify(BaseModel):
    """Schema for verifying a magic link."""
    token: str


class PortalClientToken(BaseModel):
    """Schema for client portal token response."""
    access_token: str
    token_type: str = "bearer"
    client_id: str
    client_name: str
    freelancer_name: str


# ==================== Portal Invoices ====================

class PortalInvoiceCreate(BaseModel):
    """Schema for creating an invoice."""
    client_id: str
    project_id: str | None = None
    invoice_number: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    description: str | None = None
    amount: Decimal = Field(..., ge=0)
    tax_amount: Decimal = Field(default=Decimal("0"), ge=0)
    due_date: datetime | None = None
    payment_url: str | None = Field(default=None, max_length=500)


class PortalInvoiceUpdate(BaseModel):
    """Schema for updating an invoice."""
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    status: InvoiceStatus | None = None
    due_date: datetime | None = None
    payment_url: str | None = Field(default=None, max_length=500)


class PortalInvoiceResponse(BaseModel):
    """Schema for invoice response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    client_name: str | None = None
    project_id: str | None
    project_name: str | None = None
    invoice_number: str
    title: str
    description: str | None
    amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    status: InvoiceStatus
    issue_date: datetime
    due_date: datetime | None
    paid_date: datetime | None
    payment_url: str | None
    created_at: datetime
    updated_at: datetime


class PortalInvoiceList(BaseModel):
    """Schema for paginated invoice list."""
    invoices: list[PortalInvoiceResponse]
    total: int


# ==================== Portal Files ====================

class PortalFileCreate(BaseModel):
    """Schema for creating a file."""
    client_id: str
    project_id: str | None = None
    name: str = Field(..., max_length=255)
    file_url: str = Field(..., max_length=500)
    file_size: int | None = None
    file_type: str | None = Field(default=None, max_length=100)
    category: FileCategory = FileCategory.OTHER
    description: str | None = None
    is_visible: bool = True


class PortalFileUpdate(BaseModel):
    """Schema for updating a file."""
    name: str | None = Field(default=None, max_length=255)
    category: FileCategory | None = None
    description: str | None = None
    is_visible: bool | None = None


class PortalFileResponse(BaseModel):
    """Schema for file response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    client_name: str | None = None
    project_id: str | None
    project_name: str | None = None
    name: str
    file_url: str
    file_size: int | None
    file_type: str | None
    category: FileCategory
    description: str | None
    is_visible: bool
    created_at: datetime
    updated_at: datetime


class PortalFileList(BaseModel):
    """Schema for paginated file list."""
    files: list[PortalFileResponse]
    total: int


# ==================== Portal Messages ====================

class PortalMessageCreate(BaseModel):
    """Schema for creating a message."""
    client_id: str
    project_id: str | None = None
    subject: str | None = Field(default=None, max_length=255)
    content: str = Field(..., min_length=1)


class PortalMessageClientCreate(BaseModel):
    """Schema for client creating a message (from portal)."""
    project_id: str | None = None
    subject: str | None = Field(default=None, max_length=255)
    content: str = Field(..., min_length=1)


class PortalMessageResponse(BaseModel):
    """Schema for message response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    client_name: str | None = None
    project_id: str | None
    project_name: str | None = None
    subject: str | None
    content: str
    is_from_client: bool
    status: MessageStatus
    read_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PortalMessageList(BaseModel):
    """Schema for paginated message list."""
    messages: list[PortalMessageResponse]
    total: int
    unread_count: int = 0


# ==================== Portal Contracts ====================

class PortalContractCreate(BaseModel):
    """Schema for creating a contract."""
    client_id: str
    project_id: str | None = None
    title: str = Field(..., max_length=255)
    content: str = Field(..., min_length=1)
    file_url: str | None = Field(default=None, max_length=500)
    requires_signature: bool = True


class PortalContractUpdate(BaseModel):
    """Schema for updating a contract."""
    title: str | None = Field(default=None, max_length=255)
    content: str | None = None
    file_url: str | None = Field(default=None, max_length=500)
    requires_signature: bool | None = None


class PortalContractResponse(BaseModel):
    """Schema for contract response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    client_id: str
    client_name: str | None = None
    project_id: str | None
    project_name: str | None = None
    title: str
    content: str
    file_url: str | None
    requires_signature: bool
    signed_at: datetime | None
    is_signed: bool = False
    created_at: datetime
    updated_at: datetime


class PortalContractList(BaseModel):
    """Schema for paginated contract list."""
    contracts: list[PortalContractResponse]
    total: int


class ContractSignRequest(BaseModel):
    """Schema for signing a contract."""
    signature_data: str  # Base64 encoded signature image


# ==================== Client Portal Dashboard ====================

class PortalDashboardResponse(BaseModel):
    """Schema for client portal dashboard."""
    client_name: str
    freelancer_name: str
    freelancer_business_name: str | None
    welcome_message: str | None
    logo_url: str | None
    primary_color: str
    accent_color: str

    # Feature visibility
    show_invoices: bool
    show_files: bool
    show_messages: bool
    show_contracts: bool

    # Counts
    active_projects_count: int = 0
    pending_invoices_count: int = 0
    pending_invoices_total: Decimal = Decimal("0")
    unread_messages_count: int = 0
    unsigned_contracts_count: int = 0
    files_count: int = 0

    # Recent items
    recent_invoices: list[PortalInvoiceResponse] = []
    recent_messages: list[PortalMessageResponse] = []
    recent_files: list[PortalFileResponse] = []


class ClientProjectResponse(BaseModel):
    """Schema for project visible to client."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str | None
    status: str
    created_at: datetime
    updated_at: datetime
