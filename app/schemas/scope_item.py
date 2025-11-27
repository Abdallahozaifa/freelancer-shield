"""Pydantic schemas for Scope Items."""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ScopeItemBase(BaseModel):
    """Base schema for scope items."""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    estimated_hours: Optional[Decimal] = Field(default=None, ge=0)

    @field_validator("estimated_hours", mode="before")
    @classmethod
    def validate_estimated_hours(cls, v):
        """Validate and round estimated hours to 1 decimal place."""
        if v is not None:
            return Decimal(str(v)).quantize(Decimal("0.1"))
        return v


class ScopeItemCreate(BaseModel):
    """Schema for creating a scope item."""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    estimated_hours: Optional[Decimal] = Field(default=None, ge=0)

    @field_validator("estimated_hours", mode="before")
    @classmethod
    def validate_estimated_hours(cls, v):
        """Validate and round estimated hours to 1 decimal place."""
        if v is not None:
            return Decimal(str(v)).quantize(Decimal("0.1"))
        return v


class ScopeItemUpdate(BaseModel):
    """Schema for updating a scope item."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    estimated_hours: Optional[Decimal] = Field(default=None, ge=0)

    @field_validator("estimated_hours", mode="before")
    @classmethod
    def validate_estimated_hours(cls, v):
        """Validate and round estimated hours to 1 decimal place."""
        if v is not None:
            return Decimal(str(v)).quantize(Decimal("0.1"))
        return v


class ScopeItemResponse(BaseModel):
    """Schema for scope item response."""
    id: str
    project_id: str
    title: str
    description: Optional[str]
    order: int
    is_completed: bool
    estimated_hours: Optional[Decimal]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScopeItemReorder(BaseModel):
    """Schema for reordering scope items."""
    item_ids: list[str]  # Ordered list of scope item IDs


class ScopeProgress(BaseModel):
    """Schema for scope completion progress."""
    total_items: int
    completed_items: int
    completion_percentage: float
    total_estimated_hours: Optional[Decimal]
    completed_estimated_hours: Optional[Decimal]
