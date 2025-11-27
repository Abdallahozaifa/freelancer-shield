"""Scope creep indicator phrases and patterns for rule-based analysis."""

# Phrases that often indicate scope creep - client trying to add extra work
SCOPE_CREEP_PHRASES: list[str] = [
    "also",
    "additionally",
    "one more thing",
    "quick addition",
    "while you're at it",
    "shouldn't take long",
    "real quick",
    "easy change",
    "small tweak",
    "just add",
    "can you also",
    "by the way",
    "oh and",
    "almost forgot",
    "one more request",
    "tiny favor",
    "simple addition",
    "minor update",
]

# Phrases indicating a revision to existing scope (not necessarily scope creep)
REVISION_PHRASES: list[str] = [
    "change",
    "update",
    "modify",
    "revise",
    "adjust",
    "tweak",
    "different",
    "instead",
    "actually",
    "on second thought",
]

# Phrases indicating the client needs clarification (questions, not requests)
CLARIFICATION_PHRASES: list[str] = [
    "what do you mean",
    "can you explain",
    "not sure about",
    "question about",
    "clarify",
    "confused",
    "understand",
]
