"""
Unit tests for the Scope Analyzer module.

Tests cover:
- Rules-based analyzer (tests 1-10)
- AI analyzer with mocks (tests 11-13)
- Factory pattern (tests 14-15)
"""

import json
import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.scope_analyzer import (
    AnalysisRequest,
    AnalysisResult,
    ScopeItemDTO,
    analyze_scope,
    analyze_with_rules,
    analyze_with_ai,
    CLASSIFICATION_MAP,
)


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def basic_scope_items():
    """Basic scope items for testing."""
    return [
        ScopeItemDTO(
            id=uuid.uuid4(),
            title="Build login page",
            description="Create user authentication UI",
        ),
        ScopeItemDTO(
            id=uuid.uuid4(),
            title="Create user dashboard",
            description="Main dashboard after login",
        ),
    ]


@pytest.fixture
def single_scope_item():
    """Single scope item for focused tests."""
    return [ScopeItemDTO(id=uuid.uuid4(), title="Implement user authentication system")]


@pytest.fixture
def design_scope():
    """Scope for design-related tests."""
    return [
        ScopeItemDTO(
            id=uuid.uuid4(), title="Design logo", description="Company logo design"
        )
    ]


@pytest.fixture
def header_scope():
    """Scope for revision tests."""
    return [ScopeItemDTO(id=uuid.uuid4(), title="Create blue header design")]


@pytest.fixture
def ecommerce_scope():
    """Scope for e-commerce tests."""
    return [ScopeItemDTO(id=uuid.uuid4(), title="Build e-commerce checkout")]


@pytest.fixture
def api_scope():
    """Scope for multi-item tests."""
    return [
        ScopeItemDTO(
            id=uuid.uuid4(),
            title="Build API endpoints",
            description="REST API development",
        ),
        ScopeItemDTO(
            id=uuid.uuid4(), title="Write documentation", description="API docs"
        ),
    ]


# =============================================================================
# Rules Analyzer Tests (1-10)
# =============================================================================


class TestRulesAnalyzer:
    """Test cases for the rules-based analyzer."""

    def test_in_scope_exact_match(self, basic_scope_items):
        """Test 1: Exact match returns IN_SCOPE with high confidence."""
        request = AnalysisRequest(
            request_content="Working on the login page design",
            scope_items=basic_scope_items,
        )

        result = analyze_with_rules(request)

        assert result.classification == "in_scope"
        assert result.confidence >= 0.6
        assert result.matched_scope_item_index == 0
        assert result.matched_scope_item_id == basic_scope_items[0].id

    def test_in_scope_fuzzy_match(self, single_scope_item):
        """Test 2: Fuzzy match returns IN_SCOPE."""
        request = AnalysisRequest(
            request_content="Working on implementing the user authentication system now",
            scope_items=single_scope_item,
        )

        result = analyze_with_rules(request)

        assert result.classification == "in_scope"
        assert result.confidence >= 0.5

    def test_out_of_scope_no_match(self):
        """Test 3: No match with scope creep indicator."""
        request = AnalysisRequest(
            request_content="Can you also build a mobile app?",
            scope_items=[
                ScopeItemDTO(title="Build homepage"),
                ScopeItemDTO(title="Create contact form"),
            ],
        )

        result = analyze_with_rules(request)

        assert result.classification == "out_of_scope"
        assert result.confidence >= 0.7
        assert "also" in result.scope_creep_indicators

    def test_out_of_scope_with_indicators(self, design_scope):
        """Test 4: Multiple scope creep indicators detected."""
        request = AnalysisRequest(
            request_content="Quick addition - can you also create business cards? Shouldn't take long",
            scope_items=design_scope,
        )

        result = analyze_with_rules(request)

        assert result.classification == "out_of_scope"
        assert "quick addition" in result.scope_creep_indicators
        assert "also" in result.scope_creep_indicators
        assert "shouldn't take long" in result.scope_creep_indicators

    def test_clarification_needed(self, ecommerce_scope):
        """Test 5: Clarification question returns CLARIFICATION_NEEDED."""
        request = AnalysisRequest(
            request_content="Can you explain what payment gateways you'll support?",
            scope_items=ecommerce_scope,
        )

        result = analyze_with_rules(request)

        assert result.classification == "clarification_needed"

    def test_revision_request(self, header_scope):
        """Test 6: Revision request returns REVISION."""
        request = AnalysisRequest(
            request_content="Actually, can we change the blue header design to use red instead?",
            scope_items=header_scope,
        )

        result = analyze_with_rules(request)

        assert result.classification == "revision"
        assert result.matched_scope_item_index == 0

    def test_empty_scope(self):
        """Test 7: Empty scope returns OUT_OF_SCOPE."""
        request = AnalysisRequest(
            request_content="Build the homepage",
            scope_items=[],
        )

        result = analyze_with_rules(request)

        assert result.classification == "out_of_scope"
        assert "no scope" in result.reasoning.lower()

    def test_long_request_multiple_items(self, api_scope):
        """Test 8: Long request with scope creep indicators."""
        request = AnalysisRequest(
            request_content="I need the API done by Friday. Also, can you add a mobile app?",
            scope_items=api_scope,
        )

        result = analyze_with_rules(request)

        assert result.classification == "out_of_scope"
        assert "also" in result.scope_creep_indicators

    def test_suggested_action_for_out_of_scope(self, design_scope):
        """Test 9: OUT_OF_SCOPE suggests proposal/quote."""
        request = AnalysisRequest(
            request_content="Can you also build me a website?",
            scope_items=design_scope,
        )

        result = analyze_with_rules(request)

        assert result.classification == "out_of_scope"
        assert "proposal" in result.suggested_action.lower() or "quote" in result.suggested_action.lower()

    def test_confidence_ranges(self, basic_scope_items):
        """Test 10: Confidence is always between 0.0 and 1.0."""
        test_requests = [
            "Working on the login page",
            "Can you also build something else?",
            "What do you mean by authentication?",
            "Change it to red instead",
            "Random unrelated text here",
        ]

        for content in test_requests:
            request = AnalysisRequest(
                request_content=content,
                scope_items=basic_scope_items,
            )
            result = analyze_with_rules(request)
            assert 0.0 <= result.confidence <= 1.0


# =============================================================================
# AI Analyzer Tests (11-13)
# =============================================================================


class TestAIAnalyzer:
    """Test cases for the AI-powered analyzer."""

    @pytest.mark.asyncio
    async def test_ai_analyzer_success(self, basic_scope_items):
        """Test 11: Successful AI analysis."""
        mock_response = {
            "choices": [
                {
                    "message": {
                        "content": json.dumps(
                            {
                                "classification": "in_scope",
                                "confidence": 0.9,
                                "reasoning": "Matches login page scope.",
                                "matched_scope_item_index": 0,
                                "suggested_action": "Proceed.",
                                "scope_creep_indicators": [],
                            }
                        )
                    }
                }
            ]
        }

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            mock_http_response = MagicMock()
            mock_http_response.json.return_value = mock_response
            mock_http_response.raise_for_status = MagicMock()
            mock_client.post.return_value = mock_http_response

            request = AnalysisRequest(
                request_content="Working on the login page",
                scope_items=basic_scope_items,
            )

            result = await analyze_with_ai(request, api_key="test-key")

            assert result.classification == "in_scope"
            assert result.confidence == 0.9

    @pytest.mark.asyncio
    async def test_ai_analyzer_fallback_on_error(self, basic_scope_items):
        """Test 12: AI analyzer falls back to rules on error."""
        import httpx

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            mock_response = MagicMock()
            mock_response.status_code = 500
            mock_client.post.return_value = mock_response
            mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
                "Error", request=MagicMock(), response=mock_response
            )

            request = AnalysisRequest(
                request_content="Working on the login page",
                scope_items=basic_scope_items,
            )

            result = await analyze_with_ai(request, api_key="test-key")

            assert isinstance(result, AnalysisResult)

    @pytest.mark.asyncio
    async def test_ai_analyzer_invalid_response(self, basic_scope_items):
        """Test 13: AI analyzer handles malformed JSON."""
        mock_response = {
            "choices": [{"message": {"content": "This is not valid JSON!"}}]
        }

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            mock_http_response = MagicMock()
            mock_http_response.json.return_value = mock_response
            mock_http_response.raise_for_status = MagicMock()
            mock_client.post.return_value = mock_http_response

            request = AnalysisRequest(
                request_content="Working on the login page",
                scope_items=basic_scope_items,
            )

            result = await analyze_with_ai(request, api_key="test-key")

            assert isinstance(result, AnalysisResult)


# =============================================================================
# Factory Tests (14-15)
# =============================================================================


class TestAnalyzerFactory:
    """Test cases for the analyzer factory pattern."""

    @pytest.mark.asyncio
    async def test_uses_rules_when_no_api_key(self, basic_scope_items):
        """Test 14: Uses rules when no API key configured."""
        with patch("app.services.scope_analyzer.analyzer.settings") as mock_settings:
            mock_settings.OPENAI_API_KEY = ""
            mock_settings.USE_AI_ANALYZER = False

            request = AnalysisRequest(
                request_content="Working on the login page",
                scope_items=basic_scope_items,
            )

            result = await analyze_scope(request)

            assert isinstance(result, AnalysisResult)

    @pytest.mark.asyncio
    async def test_uses_ai_when_configured(self, basic_scope_items):
        """Test 15: Uses AI when configured."""
        mock_ai_result = AnalysisResult(
            classification="in_scope",
            confidence=0.95,
            reasoning="AI determined in scope.",
            matched_scope_item_index=0,
            matched_scope_item_id=None,
            suggested_action="Proceed.",
            scope_creep_indicators=[],
        )

        with patch("app.services.scope_analyzer.analyzer.settings") as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-key"
            mock_settings.USE_AI_ANALYZER = True
            mock_settings.OPENAI_MODEL = "gpt-4"

            with patch(
                "app.services.scope_analyzer.analyzer.analyze_with_ai",
                return_value=mock_ai_result,
            ) as mock_ai:
                request = AnalysisRequest(
                    request_content="Working on the login page",
                    scope_items=basic_scope_items,
                )

                result = await analyze_scope(request)

                mock_ai.assert_called_once()
                assert result.classification == "in_scope"


# =============================================================================
# Additional Tests
# =============================================================================


class TestClassificationMap:
    """Test the classification mapping."""

    def test_classification_map_completeness(self):
        """Ensure all classifications are mapped."""
        from app.models.enums import ScopeClassification

        expected = {"in_scope", "out_of_scope", "clarification_needed", "revision"}
        assert set(CLASSIFICATION_MAP.keys()) == expected

        # Each maps to a valid enum
        for key, value in CLASSIFICATION_MAP.items():
            assert isinstance(value, ScopeClassification)


class TestResultConversion:
    """Test result conversion methods."""

    def test_to_client_request_update(self):
        """Test converting result to DB update fields."""
        scope_id = uuid.uuid4()
        result = AnalysisResult(
            classification="out_of_scope",
            confidence=0.85,
            reasoning="Test reasoning",
            matched_scope_item_index=None,
            matched_scope_item_id=scope_id,
            suggested_action="Send proposal",
            scope_creep_indicators=["also"],
        )

        fields = result.to_client_request_update()

        assert fields["classification"] == "out_of_scope"
        assert fields["confidence"] == Decimal("0.85")
        assert fields["analysis_reasoning"] == "Test reasoning"
        assert fields["suggested_action"] == "Send proposal"
        assert fields["linked_scope_item_id"] == scope_id