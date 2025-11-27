"""Rule-based scope analyzer that works without external AI services."""

import re
import uuid

from .indicators import CLARIFICATION_PHRASES, REVISION_PHRASES, SCOPE_CREEP_PHRASES
from .models import AnalysisRequest, AnalysisResult, ScopeClassificationType


def _normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    return re.sub(r"\s+", " ", text.lower().strip())


def _tokenize(text: str) -> set[str]:
    """Extract words from text for comparison."""
    normalized = _normalize_text(text)
    words = re.findall(r"\b[a-z]+\b", normalized)
    return set(words)


def _find_phrases(text: str, phrases: list[str]) -> list[str]:
    """Find which phrases from the list appear in the text."""
    normalized = _normalize_text(text)
    return [phrase for phrase in phrases if phrase.lower() in normalized]


def _calculate_word_overlap(text1: str, text2: str) -> float:
    """Calculate Jaccard similarity between two texts."""
    words1 = _tokenize(text1)
    words2 = _tokenize(text2)

    if not words1 or not words2:
        return 0.0

    intersection = words1 & words2
    union = words1 | words2

    return len(intersection) / len(union) if union else 0.0


def _find_best_scope_match(
    request_content: str,
    scope_items: list,
) -> tuple[int | None, float, uuid.UUID | None]:
    """Find the best matching scope item for the request."""
    if not scope_items:
        return None, 0.0, None

    best_index = None
    best_score = 0.0
    best_id = None

    for i, item in enumerate(scope_items):
        scope_text = item.title
        if item.description:
            scope_text += " " + item.description

        score = _calculate_word_overlap(request_content, scope_text)

        if score > best_score:
            best_score = score
            best_index = i
            best_id = getattr(item, "id", None)

    return best_index, best_score, best_id


def _get_suggested_action(classification: ScopeClassificationType) -> str:
    """Get the suggested action based on classification."""
    actions = {
        "in_scope": "Proceed with the work as it falls within the agreed scope.",
        "out_of_scope": "Send a proposal or quote for this additional work before proceeding.",
        "clarification_needed": "Respond to the client's question to clarify the requirements.",
        "revision": "Discuss the revision with the client - minor changes may be included, major changes may require a change order.",
    }
    return actions[classification]


def analyze_with_rules(request: AnalysisRequest) -> AnalysisResult:
    """
    Analyze scope using rule-based matching.

    Logic:
    1. Check for clarification phrases -> CLARIFICATION_NEEDED
    2. Check for revision phrases + scope match -> REVISION
    3. Check for scope creep indicators -> likely OUT_OF_SCOPE
    4. Fuzzy match against scope items -> IN_SCOPE if good match
    5. Default to OUT_OF_SCOPE with low confidence
    """
    content = request.request_content

    # Detect indicator phrases
    clarification_indicators = _find_phrases(content, CLARIFICATION_PHRASES)
    revision_indicators = _find_phrases(content, REVISION_PHRASES)
    scope_creep_indicators = _find_phrases(content, SCOPE_CREEP_PHRASES)

    # Find best matching scope item
    matched_index, match_score, matched_id = _find_best_scope_match(
        content, request.scope_items
    )

    # Handle empty scope
    if not request.scope_items:
        return AnalysisResult(
            classification="out_of_scope",
            confidence=0.9,
            reasoning="No scope items defined - cannot determine if request is in scope.",
            matched_scope_item_index=None,
            matched_scope_item_id=None,
            suggested_action=_get_suggested_action("out_of_scope"),
            scope_creep_indicators=scope_creep_indicators,
        )

    # Step 1: Check for clarification
    if clarification_indicators:
        return AnalysisResult(
            classification="clarification_needed",
            confidence=0.85,
            reasoning=f"Client appears to be asking for clarification. Detected phrases: {', '.join(clarification_indicators)}",
            matched_scope_item_index=matched_index if match_score > 0.1 else None,
            matched_scope_item_id=matched_id if match_score > 0.1 else None,
            suggested_action=_get_suggested_action("clarification_needed"),
            scope_creep_indicators=scope_creep_indicators,
        )

    # Step 2: Check for revision with scope match
    if revision_indicators and match_score > 0.15:
        confidence = min(0.8, 0.5 + match_score)
        return AnalysisResult(
            classification="revision",
            confidence=confidence,
            reasoning=f"Client requesting changes to existing scope item. Detected revision phrases: {', '.join(revision_indicators)}. Matched scope item: '{request.scope_items[matched_index].title}'",
            matched_scope_item_index=matched_index,
            matched_scope_item_id=matched_id,
            suggested_action=_get_suggested_action("revision"),
            scope_creep_indicators=scope_creep_indicators,
        )

    # Step 3: Check for scope creep indicators
    if scope_creep_indicators:
        if match_score > 0.4:
            confidence = max(0.5, 0.7 - len(scope_creep_indicators) * 0.1)
            return AnalysisResult(
                classification="in_scope",
                confidence=confidence,
                reasoning=f"Request matches scope item '{request.scope_items[matched_index].title}' but contains scope creep language: {', '.join(scope_creep_indicators)}. Review carefully.",
                matched_scope_item_index=matched_index,
                matched_scope_item_id=matched_id,
                suggested_action=_get_suggested_action("in_scope"),
                scope_creep_indicators=scope_creep_indicators,
            )
        else:
            confidence = min(0.95, 0.7 + len(scope_creep_indicators) * 0.05)
            return AnalysisResult(
                classification="out_of_scope",
                confidence=confidence,
                reasoning=f"Request contains scope creep indicators: {', '.join(scope_creep_indicators)}. No strong match to existing scope items.",
                matched_scope_item_index=None,
                matched_scope_item_id=None,
                suggested_action=_get_suggested_action("out_of_scope"),
                scope_creep_indicators=scope_creep_indicators,
            )

    # Step 4: Fuzzy match against scope items
    if match_score > 0.3:
        confidence = min(0.95, 0.5 + match_score)
        return AnalysisResult(
            classification="in_scope",
            confidence=confidence,
            reasoning=f"Request matches scope item: '{request.scope_items[matched_index].title}' with {match_score:.0%} similarity.",
            matched_scope_item_index=matched_index,
            matched_scope_item_id=matched_id,
            suggested_action=_get_suggested_action("in_scope"),
            scope_creep_indicators=scope_creep_indicators,
        )
    elif match_score > 0.15:
        return AnalysisResult(
            classification="in_scope",
            confidence=0.5 + match_score,
            reasoning=f"Partial match to scope item: '{request.scope_items[matched_index].title}'. Consider clarifying with client.",
            matched_scope_item_index=matched_index,
            matched_scope_item_id=matched_id,
            suggested_action=_get_suggested_action("in_scope"),
            scope_creep_indicators=scope_creep_indicators,
        )

    # Step 5: Default to out of scope
    return AnalysisResult(
        classification="out_of_scope",
        confidence=0.6,
        reasoning="No significant match to any scope items. Request may be outside project scope.",
        matched_scope_item_index=None,
        matched_scope_item_id=None,
        suggested_action=_get_suggested_action("out_of_scope"),
        scope_creep_indicators=scope_creep_indicators,
    )
