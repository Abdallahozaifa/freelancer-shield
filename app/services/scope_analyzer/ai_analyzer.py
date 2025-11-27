"""AI-powered scope analyzer using OpenAI GPT-4."""

import json
import logging
from typing import Any

import httpx

from .models import AnalysisRequest, AnalysisResult
from .rules_analyzer import analyze_with_rules

logger = logging.getLogger(__name__)

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

SYSTEM_PROMPT = """You are a scope creep detection assistant for freelancers. Analyze client requests and determine if they fall within the original project scope.

You will receive:
1. A list of scope items (the agreed-upon work)
2. A client request/message
3. Optional project context

Respond with a JSON object containing:
- classification: One of "in_scope", "out_of_scope", "clarification_needed", or "revision"
- confidence: A float from 0.0 to 1.0
- reasoning: A brief explanation
- matched_scope_item_index: The 0-based index of the matching scope item, or null
- suggested_action: What the freelancer should do
- scope_creep_indicators: Array of detected scope creep phrases

Classification guidelines:
- "in_scope": Request falls within agreed scope items
- "out_of_scope": Request asks for work not covered by scope
- "clarification_needed": Client is asking questions
- "revision": Client wants to change something in scope

Scope creep phrases: "also", "additionally", "one more thing", "quick addition", "while you're at it", "shouldn't take long", "real quick", "easy change", "small tweak", "just add", "can you also", "by the way", "oh and", "almost forgot"

Respond ONLY with valid JSON."""


def _build_user_prompt(request: AnalysisRequest) -> str:
    """Build the user prompt for the AI model."""
    scope_list = "\n".join(
        f"{i}. {item.title}" + (f" - {item.description}" if item.description else "")
        for i, item in enumerate(request.scope_items)
    )

    if not scope_list:
        scope_list = "(No scope items defined)"

    prompt = f"""## Project Scope Items:
{scope_list}

## Client Request:
{request.request_content}
"""

    if request.project_context:
        prompt += f"\n## Project Context:\n{request.project_context}\n"

    prompt += "\nAnalyze this request and provide your assessment as JSON."
    return prompt


def _parse_ai_response(response_text: str) -> dict[str, Any]:
    """Parse the AI response, handling markdown code blocks."""
    text = response_text.strip()

    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)

    return json.loads(text)


async def analyze_with_ai(
    request: AnalysisRequest,
    api_key: str,
    model: str = "gpt-4",
    timeout: float = 30.0,
) -> AnalysisResult:
    """
    Analyze scope using OpenAI GPT-4.

    Falls back to rules-based analysis on error.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(request)},
        ],
        "temperature": 0.3,
        "max_tokens": 1000,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                OPENAI_API_URL,
                headers=headers,
                json=payload,
            )
            response.raise_for_status()

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        parsed = _parse_ai_response(content)

        return AnalysisResult(
            classification=parsed["classification"],
            confidence=float(parsed["confidence"]),
            reasoning=parsed["reasoning"],
            matched_scope_item_index=parsed.get("matched_scope_item_index"),
            matched_scope_item_id=None,  # AI doesn't have access to IDs
            suggested_action=parsed["suggested_action"],
            scope_creep_indicators=parsed.get("scope_creep_indicators", []),
        )

    except httpx.HTTPStatusError as e:
        logger.error(f"OpenAI API error: {e.response.status_code}")
        return analyze_with_rules(request)

    except httpx.RequestError as e:
        logger.error(f"Request error calling OpenAI: {e}")
        return analyze_with_rules(request)

    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"Failed to parse AI response: {e}")
        return analyze_with_rules(request)

    except Exception as e:
        logger.error(f"Unexpected error in AI analysis: {e}")
        return analyze_with_rules(request)
