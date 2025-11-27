"""Main entry point for scope analysis with factory pattern."""

from app.core.config import settings

from .ai_analyzer import analyze_with_ai
from .models import AnalysisRequest, AnalysisResult
from .rules_analyzer import analyze_with_rules


async def analyze_scope(request: AnalysisRequest) -> AnalysisResult:
    """
    Main entry point for scope analysis.

    Uses AI analyzer if configured, otherwise falls back to rules.
    """
    if settings.use_ai_analyzer and settings.openai_api_key:
        return await analyze_with_ai(
            request,
            settings.openai_api_key,
            model=getattr(settings, "openai_model", "gpt-4"),
        )
    return analyze_with_rules(request)


def analyze_scope_sync(request: AnalysisRequest) -> AnalysisResult:
    """
    Synchronous version that always uses rules-based analyzer.
    """
    return analyze_with_rules(request)