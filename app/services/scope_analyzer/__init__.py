"""
Scope Analyzer Module

AI-powered service that detects scope creep by analyzing client requests
against defined project scope items.

Usage with SQLAlchemy models:
    from app.services.scope_analyzer import analyze_client_request

    result = await analyze_client_request(client_request, session, commit=True)

Usage with pure functions:
    from app.services.scope_analyzer import analyze_scope, AnalysisRequest, ScopeItemDTO

    request = AnalysisRequest(
        request_content="Can you also build a mobile app?",
        scope_items=[ScopeItemDTO(title="Build website homepage")]
    )
    result = await analyze_scope(request)
"""

from .analyzer import analyze_scope, analyze_scope_sync
from .ai_analyzer import analyze_with_ai
from .indicators import CLARIFICATION_PHRASES, REVISION_PHRASES, SCOPE_CREEP_PHRASES
from .models import AnalysisRequest, AnalysisResult, ScopeItemDTO
from .rules_analyzer import analyze_with_rules
from .service import (
    CLASSIFICATION_MAP,
    analyze_client_request,
    analyze_client_request_sync,
    bulk_analyze_project_requests,
)

__all__ = [
    # Pure functions
    "analyze_scope",
    "analyze_scope_sync",
    "analyze_with_rules",
    "analyze_with_ai",
    # Service layer (SQLAlchemy integration)
    "analyze_client_request",
    "analyze_client_request_sync",
    "bulk_analyze_project_requests",
    "CLASSIFICATION_MAP",
    # DTOs
    "AnalysisRequest",
    "AnalysisResult",
    "ScopeItemDTO",
    # Indicators
    "SCOPE_CREEP_PHRASES",
    "REVISION_PHRASES",
    "CLARIFICATION_PHRASES",
]
