"""User profile schemas for Freelancer Project Shield."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    business_name: str | None = Field(default=None, max_length=255)


class UserProfile(BaseModel):
    """Full user profile response."""

    id: str
    email: str
    full_name: str
    business_name: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
