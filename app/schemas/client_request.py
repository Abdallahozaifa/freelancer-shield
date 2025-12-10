"""
Pydantic schemas for Client Request operations.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import RequestSource, RequestStatus, ScopeClassification


class ClientRequestCreate(BaseModel):
    """Schema for creating a new client request."""
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    source: RequestSource = RequestSource.EMAIL
    auto_analyze: bool = Field(
        default=True,
        description="Automatically run scope analysis on creation"
    )


class ClientRequestUpdate(BaseModel):
    """Schema for updating an existing client request."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = Field(default=None, min_length=1)
    source: Optional[RequestSource] = None
    status: Optional[RequestStatus] = None
    classification: Optional[ScopeClassification] = Field(
        default=None,
        description="Manually override the AI classification"
    )
    linked_scope_item_id: Optional[UUID] = Field(
        default=None,
        description="Manually link to a scope item"
    )


class ClientRequestResponse(BaseModel):
    """Schema for client request response."""
    id: UUID
    project_id: UUID
    linked_scope_item_id: Optional[UUID] = None
    linked_scope_item_title: Optional[str] = None
    title: str
    content: str
    source: RequestSource
    status: RequestStatus
    classification: Optional[ScopeClassification] = None
    confidence: Optional[Decimal] = None
    analysis_reasoning: Optional[str] = None
    suggested_action: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalyzeRequestResponse(BaseModel):
    """Response from manual analysis trigger."""
    classification: ScopeClassification
    confidence: float
    reasoning: str
    matched_scope_item_id: Optional[UUID] = None
    suggested_action: str
    scope_creep_indicators: list[str] = Field(default_factory=list)


class ClientRequestListResponse(BaseModel):
    """Response for listing client requests with pagination info."""
    items: list[ClientRequestResponse]
    total: int
    skip: int
    limit: int
