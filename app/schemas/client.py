"""Client schemas for request validation and response serialization."""

from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class ClientCreate(BaseModel):
    """Schema for creating a new client."""
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    company: str | None = Field(default=None, max_length=255)
    notes: str | None = None


class ClientUpdate(BaseModel):
    """Schema for updating an existing client."""
    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    company: str | None = Field(default=None, max_length=255)
    notes: str | None = None


class ClientResponse(BaseModel):
    """Schema for client response with computed project count."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    email: str | None
    company: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    project_count: int = 0


class ClientList(BaseModel):
    """Schema for paginated list of clients."""
    clients: list[ClientResponse]
    total: int
