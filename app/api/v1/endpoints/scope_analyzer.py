"""
Scope Analyzer API Endpoints

Provides endpoints for analyzing client requests to detect scope creep.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models import ClientRequest, Project, User
from app.models.enums import RequestStatus, ScopeClassification
from app.schemas.scope_analyzer import (
    AnalyzeExisting,
    AnalyzeRequestCreate,
    AnalyzeResponse,
    AnalysisResultResponse,
    BulkAnalyzeRequest,
    BulkAnalyzeResponse,
    ClientRequestResponse,
    ScopeItemResponse,
)
from app.services.scope_analyzer import (
    AnalysisResult,
    analyze_client_request,
    bulk_analyze_project_requests,
)

router = APIRouter(prefix="/scope-analyzer", tags=["scope-analyzer"])


def _build_analysis_response(
    client_request: ClientRequest,
    result: AnalysisResult,
) -> AnalyzeResponse:
    """Build the API response from a ClientRequest and AnalysisResult."""
    matched_item = None
    if client_request.linked_scope_item:
        matched_item = ScopeItemResponse.model_validate(client_request.linked_scope_item)

    return AnalyzeResponse(
        client_request=ClientRequestResponse.model_validate(client_request),
        analysis=AnalysisResultResponse(
            classification=client_request.classification,
            confidence=client_request.confidence,
            reasoning=result.reasoning,
            suggested_action=result.suggested_action,
            scope_creep_indicators=result.scope_creep_indicators,
            matched_scope_item=matched_item,
        ),
    )


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and analyze a new client request",
    description="Creates a new client request and immediately analyzes it for scope creep.",
)
async def create_and_analyze_request(
    data: AnalyzeRequestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AnalyzeResponse:
    """Create a new client request and analyze it."""
    # Verify project exists and belongs to user
    project = await db.scalar(
        select(Project)
        .options(selectinload(Project.scope_items))
        .where(Project.id == data.project_id, Project.user_id == current_user.id)
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Create the client request
    client_request = ClientRequest(
        project_id=data.project_id,
        title=data.title,
        content=data.content,
        source=data.source,
        status=RequestStatus.NEW,
        classification=ScopeClassification.PENDING,
    )
    db.add(client_request)
    await db.flush()

    # Manually set the project for analysis (avoid another query)
    client_request.project = project

    # Analyze the request
    result = await analyze_client_request(client_request, db, commit=True)

    # Reload with relationships
    await db.refresh(client_request, ["linked_scope_item"])

    return _build_analysis_response(client_request, result)


@router.post(
    "/analyze/{request_id}",
    response_model=AnalyzeResponse,
    summary="Analyze an existing client request",
    description="Re-analyzes an existing client request for scope creep.",
)
async def analyze_existing_request(
    request_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AnalyzeResponse:
    """Analyze an existing client request."""
    # Get the request with project and scope items
    client_request = await db.scalar(
        select(ClientRequest)
        .options(
            selectinload(ClientRequest.project).selectinload(Project.scope_items),
            selectinload(ClientRequest.linked_scope_item),
        )
        .join(Project)
        .where(
            ClientRequest.id == request_id,
            Project.user_id == current_user.id,
        )
    )

    if not client_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client request not found",
        )

    # Analyze the request
    result = await analyze_client_request(client_request, db, commit=True)

    # Reload relationships
    await db.refresh(client_request, ["linked_scope_item"])

    return _build_analysis_response(client_request, result)


@router.post(
    "/analyze-project/{project_id}",
    response_model=BulkAnalyzeResponse,
    summary="Analyze all requests in a project",
    description="Bulk analyzes all pending client requests in a project.",
)
async def analyze_project_requests(
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    only_pending: bool = True,
) -> BulkAnalyzeResponse:
    """Analyze all client requests in a project."""
    # Get the project with all relationships
    project = await db.scalar(
        select(Project)
        .options(
            selectinload(Project.scope_items),
            selectinload(Project.client_requests).selectinload(
                ClientRequest.linked_scope_item
            ),
        )
        .where(Project.id == project_id, Project.user_id == current_user.id)
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Bulk analyze
    analyzed = await bulk_analyze_project_requests(
        project, db, commit=True, only_pending=only_pending
    )

    # Build responses
    results = [
        _build_analysis_response(client_request, result)
        for client_request, result in analyzed
    ]

    return BulkAnalyzeResponse(
        analyzed_count=len(results),
        results=results,
    )


@router.get(
    "/requests/{request_id}",
    response_model=ClientRequestResponse,
    summary="Get a client request with analysis",
    description="Retrieves a client request with its analysis results.",
)
async def get_client_request(
    request_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ClientRequestResponse:
    """Get a client request with its analysis results."""
    client_request = await db.scalar(
        select(ClientRequest)
        .options(selectinload(ClientRequest.linked_scope_item))
        .join(Project)
        .where(
            ClientRequest.id == request_id,
            Project.user_id == current_user.id,
        )
    )

    if not client_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client request not found",
        )

    return ClientRequestResponse.model_validate(client_request)
