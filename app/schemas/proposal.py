"""Pydantic schemas for Proposal module."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from app.models.enums import ProposalStatus


class ProposalCreate(BaseModel):
    """Schema for creating a proposal manually."""
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    amount: Decimal = Field(ge=0)
    estimated_hours: Optional[Decimal] = Field(default=None, ge=0)


class ProposalFromRequest(BaseModel):
    """Create proposal from a client request."""
    source_request_id: UUID
    amount: Decimal = Field(ge=0)
    estimated_hours: Optional[Decimal] = Field(default=None, ge=0)
    # Title and description are auto-generated from the request


class ProposalUpdate(BaseModel):
    """Schema for updating a proposal."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[ProposalStatus] = None
    amount: Optional[Decimal] = Field(default=None, ge=0)
    estimated_hours: Optional[Decimal] = Field(default=None, ge=0)


class ProposalResponse(BaseModel):
    """Schema for proposal response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    project_id: UUID
    source_request_id: Optional[UUID] = None
    title: str
    description: str
    status: ProposalStatus
    amount: Decimal
    estimated_hours: Optional[Decimal] = None
    sent_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    # Include source request info if linked
    source_request_title: Optional[str] = None


class ProposalStats(BaseModel):
    """Proposal statistics for a project."""
    total_proposals: int
    draft_count: int
    sent_count: int
    accepted_count: int
    declined_count: int
    expired_count: int
    total_amount_accepted: Decimal