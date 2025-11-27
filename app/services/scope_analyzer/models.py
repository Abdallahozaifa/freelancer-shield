"""
Pydantic models for scope analysis input and output.

These are DTOs (Data Transfer Objects) used by the analyzer service.
They can be created from SQLAlchemy models using the provided class methods.
"""

from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, Literal

from pydantic import BaseModel, Field

if TYPE_CHECKING:
    from app.models import ClientRequest, Project, ScopeItem as DBScopeItem

# Classification type matching app.models.enums.ScopeClassification values
ScopeClassificationType = Literal[
    "in_scope",
    "out_of_scope",
    "clarification_needed",
    "revision",
]


class ScopeItemDTO(BaseModel):
    """A single item from the project scope (DTO for analysis)."""

    id: uuid.UUID | None = None
    title: str
    description: str | None = None
    order: int = 0

    @classmethod
    def from_db_model(cls, db_scope_item: "DBScopeItem") -> "ScopeItemDTO":
        """Create DTO from SQLAlchemy ScopeItem model."""
        return cls(
            id=db_scope_item.id,
            title=db_scope_item.title,
            description=db_scope_item.description,
            order=db_scope_item.order,
        )


class AnalysisRequest(BaseModel):
    """Input for scope analysis."""

    request_content: str
    scope_items: list[ScopeItemDTO]
    project_context: str | None = None

    @classmethod
    def from_client_request(
        cls,
        client_request: "ClientRequest",
        project: "Project | None" = None,
    ) -> "AnalysisRequest":
        """
        Create an AnalysisRequest from a ClientRequest and its Project.

        Args:
            client_request: SQLAlchemy ClientRequest model instance
            project: Optional Project model (uses client_request.project if not provided)

        Returns:
            AnalysisRequest ready for analysis
        """
        proj = project or client_request.project
        scope_items = [
            ScopeItemDTO.from_db_model(item)
            for item in proj.scope_items
        ]
        return cls(
            request_content=client_request.content,
            scope_items=scope_items,
            project_context=proj.description,
        )


class AnalysisResult(BaseModel):
    """Output from scope analysis."""

    classification: ScopeClassificationType
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    matched_scope_item_index: int | None = None
    matched_scope_item_id: uuid.UUID | None = None
    suggested_action: str
    scope_creep_indicators: list[str] = Field(default_factory=list)

    def to_client_request_update(self) -> dict:
        """
        Convert result to fields for updating a ClientRequest model.

        Returns:
            Dict with fields compatible with ClientRequest model
        """
        return {
            "classification": self.classification,
            "confidence": Decimal(str(round(self.confidence, 2))),
            "analysis_reasoning": self.reasoning,
            "suggested_action": self.suggested_action,
            "linked_scope_item_id": self.matched_scope_item_id,
        }
