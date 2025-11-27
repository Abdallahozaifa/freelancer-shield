"""Pydantic schemas for scope analyzer API endpoints."""

import uuid
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import RequestSource, RequestStatus, ScopeClassification


# =============================================================================
# Request Schemas
# =============================================================================


class AnalyzeRequestCreate(BaseModel):
    """Schema for creating and analyzing a new client request."""

    project_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    source: RequestSource = RequestSource.EMAIL


class AnalyzeExisting(BaseModel):
    """Schema for analyzing an existing client request."""

    request_id: uuid.UUID


class BulkAnalyzeRequest(BaseModel):
    """Schema for bulk analyzing all requests in a project."""

    project_id: uuid.UUID
    only_pending: bool = True


# =============================================================================
# Response Schemas
# =============================================================================


class ScopeItemResponse(BaseModel):
    """Schema for scope item in responses."""

    id: uuid.UUID
    title: str
    description: str | None = None
    order: int

    class Config:
        from_attributes = True


class AnalysisResultResponse(BaseModel):
    """Schema for analysis result response."""

    classification: ScopeClassification
    confidence: Decimal = Field(..., ge=0, le=1)
    reasoning: str
    suggested_action: str
    scope_creep_indicators: list[str]
    matched_scope_item: ScopeItemResponse | None = None


class ClientRequestResponse(BaseModel):
    """Schema for client request response."""

    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    content: str
    source: RequestSource
    status: RequestStatus
    classification: ScopeClassification
    confidence: Decimal | None = None
    analysis_reasoning: str | None = None
    suggested_action: str | None = None
    linked_scope_item: ScopeItemResponse | None = None

    class Config:
        from_attributes = True


class AnalyzeResponse(BaseModel):
    """Response schema for analyze endpoint."""

    client_request: ClientRequestResponse
    analysis: AnalysisResultResponse


class BulkAnalyzeResponse(BaseModel):
    """Response schema for bulk analyze endpoint."""

    analyzed_count: int
    results: list[AnalyzeResponse]
