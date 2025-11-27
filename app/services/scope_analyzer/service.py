"""
Client Request Analysis Service

Integrates the scope analyzer with your SQLAlchemy models,
handling database operations and enum conversions.
"""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from app.models.enums import RequestStatus, ScopeClassification

from .analyzer import analyze_scope, analyze_scope_sync
from .models import AnalysisRequest, AnalysisResult

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import Session

    from app.models import ClientRequest, Project


# Map string classifications to your ScopeClassification enum
CLASSIFICATION_MAP: dict[str, ScopeClassification] = {
    "in_scope": ScopeClassification.IN_SCOPE,
    "out_of_scope": ScopeClassification.OUT_OF_SCOPE,
    "clarification_needed": ScopeClassification.CLARIFICATION_NEEDED,
    "revision": ScopeClassification.REVISION,
}


def _apply_result_to_request(
    client_request: "ClientRequest",
    result: AnalysisResult,
) -> "ClientRequest":
    """Apply analysis result to a ClientRequest model."""
    client_request.classification = CLASSIFICATION_MAP[result.classification]
    client_request.confidence = Decimal(str(round(result.confidence, 2)))
    client_request.analysis_reasoning = result.reasoning
    client_request.suggested_action = result.suggested_action
    client_request.status = RequestStatus.ANALYZED

    if result.matched_scope_item_id:
        client_request.linked_scope_item_id = result.matched_scope_item_id

    return client_request


async def analyze_client_request(
    client_request: "ClientRequest",
    session: "AsyncSession | None" = None,
    commit: bool = False,
) -> AnalysisResult:
    """
    Analyze a client request and optionally update it in the database.

    Args:
        client_request: The ClientRequest model to analyze (must have project loaded)
        session: Optional async session for committing changes
        commit: Whether to commit the changes

    Returns:
        AnalysisResult with classification details

    Example:
        async with async_session() as session:
            request = await session.get(ClientRequest, request_id)
            result = await analyze_client_request(request, session, commit=True)
    """
    analysis_request = AnalysisRequest.from_client_request(client_request)
    result = await analyze_scope(analysis_request)
    _apply_result_to_request(client_request, result)

    if commit and session:
        await session.commit()
        await session.refresh(client_request)

    return result


def analyze_client_request_sync(
    client_request: "ClientRequest",
    session: "Session | None" = None,
    commit: bool = False,
) -> AnalysisResult:
    """
    Synchronously analyze a client request (rules-only, no AI).

    Args:
        client_request: The ClientRequest model to analyze
        session: Optional session for committing changes
        commit: Whether to commit the changes

    Returns:
        AnalysisResult with classification details
    """
    analysis_request = AnalysisRequest.from_client_request(client_request)
    result = analyze_scope_sync(analysis_request)
    _apply_result_to_request(client_request, result)

    if commit and session:
        session.commit()
        session.refresh(client_request)

    return result


async def bulk_analyze_project_requests(
    project: "Project",
    session: "AsyncSession",
    commit: bool = True,
    only_pending: bool = True,
) -> list[tuple["ClientRequest", AnalysisResult]]:
    """
    Analyze all client requests for a project.

    Args:
        project: Project with client_requests relationship loaded
        session: Async session for database operations
        commit: Whether to commit after all analyses
        only_pending: If True, only analyze PENDING requests

    Returns:
        List of (ClientRequest, AnalysisResult) tuples
    """
    results = []

    for request in project.client_requests:
        if only_pending and request.classification != ScopeClassification.PENDING:
            continue

        result = await analyze_client_request(request, commit=False)
        results.append((request, result))

    if commit:
        await session.commit()

    return results
