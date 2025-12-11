"""Project schemas for request/response validation."""

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field

from app.models.enums import ProjectStatus


class ProjectCreate(BaseModel):
    """Schema for creating a new project."""

    client_id: str = Field(..., description="UUID of the client as string")
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    status: ProjectStatus = ProjectStatus.ACTIVE
    budget: Decimal | None = Field(default=None, ge=0)
    hourly_rate: Decimal | None = Field(default=None, ge=0)
    estimated_hours: Decimal | None = Field(default=None, ge=0)


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: ProjectStatus | None = None
    budget: Decimal | None = Field(default=None, ge=0)
    hourly_rate: Decimal | None = Field(default=None, ge=0)
    estimated_hours: Decimal | None = Field(default=None, ge=0)
    public_request_enabled: bool | None = None


class ProjectResponse(BaseModel):
    """Schema for project response."""

    id: str
    client_id: str
    client_name: str  # Joined from client
    name: str
    description: str | None
    status: ProjectStatus
    budget: Decimal | None
    hourly_rate: Decimal | None
    estimated_hours: Decimal | None
    created_at: datetime
    updated_at: datetime
    # Computed stats
    scope_item_count: int = 0
    completed_scope_count: int = 0
    out_of_scope_request_count: int = 0
    # Public request form
    public_request_token: str | None = None
    public_request_enabled: bool = False
    public_request_url: str | None = None

    class Config:
        from_attributes = True


class ProjectDetail(ProjectResponse):
    """Extended project with related data."""
    
    scope_items: list[dict[str, Any]] = []  # Will be ScopeItemResponse later
    recent_requests: list[dict[str, Any]] = []  # Will be ClientRequestResponse later


class ProjectList(BaseModel):
    """Schema for paginated project list response."""
    
    projects: list[ProjectResponse]
    total: int