"""
Chat Handler

Orchestrates a single conversational turn:
  1. Classify the user's intent via Gemini (IntentClassification schema)
  2. Dispatch to the appropriate analysis pipeline in agent_controller
  3. Build a contextual prompt using chat/prompt_templates.py
  4. Call Gemini for the conversational response (ChatReply schema)
  5. Return {intent, response, data}

Public interface:
    handle_chat(message, person_a, person_b) -> dict
"""

from gemini_client import call_gemini
from agent_controller import (
    run_analysis,
    HYBRID_ANALYSIS,
    COMPATIBILITY_ANALYSIS,
    ROMANTIC_COMPATIBILITY,
    LOVE_STYLE_ANALYSIS,
    SEXTROLOGY_ANALYSIS,
    NUMEROLOGY_ANALYSIS,
    NUMEROLOGY_PAIR_ANALYSIS,
    COLOR_ANALYSIS,
    COLOR_PAIR_ANALYSIS,
)
from models.schemas import IntentClassification, ChatReply
from chat.prompt_templates import build_chat_prompt

# ---------------------------------------------------------------------------
# Intent constants
# ---------------------------------------------------------------------------

_VALID_INTENTS: frozenset[str] = frozenset({
    "personality_analysis",
    "compatibility_question",
    "relationship_advice",
    "flirting_guidance",
    "communication_help",
    "sextrology",
    "numerology_question",
    "color_question",
    "general_question",
    # Coaching intents
    "signal_reading",
    "first_date_coaching",
    "red_flags_green_flags",
    "getting_them_back",
    "attachment_style_coaching",
    "commitment_progression",
})

# Intents that require both profiles to be present for engine dispatch
_PAIR_INTENTS: frozenset[str] = frozenset({
    "compatibility_question",
    "relationship_advice",
    "communication_help",
})

# ---------------------------------------------------------------------------
# Step 1 — Intent classification
# ---------------------------------------------------------------------------

_CLASSIFY_PROMPT = """\
You are ZodicogAI's intent classifier.

Classify the following user message into exactly one of these intents:
  personality_analysis      — asking about a specific person's personality, traits, or behavior
  compatibility_question    — asking how compatible two people are
  relationship_advice       — asking for advice about a relationship
  flirting_guidance         — asking how to flirt with, attract, or connect romantically with someone
  communication_help        — asking how to communicate better or resolve conflict with someone
  sextrology                — asking about sexual compatibility, intimacy, sex positions, erotic dynamics, or bedroom chemistry between two people
  numerology_question       — asking about numerology, life path numbers, expression numbers, or numerology compatibility
  color_question            — asking about aura colors, color match, color harmony, or what color represents someone
  signal_reading            — asking whether someone is interested, into them, or sending signals; reading behavioral cues or mixed signals
  first_date_coaching       — asking about first date ideas, where to take someone, what to say, how to make a good first impression
  red_flags_green_flags     — asking about warning signs, red flags, toxic patterns, or genuine signs of interest and investment
  getting_them_back         — asking how to reconnect with or win back an ex or someone who pulled away
  attachment_style_coaching — asking about attachment styles (anxious, avoidant, secure), push-pull dynamics, or emotional unavailability
  commitment_progression    — asking how to move from casual to serious, get someone to commit, or progress the relationship
  general_question          — anything else (zodiac, MBTI info, general questions)

User message: "{message}"

Respond with a single valid JSON object:
{{"intent": "<one of the fifteen intents above>"}}"""


def _classify_intent(message: str) -> str:
    prompt = _CLASSIFY_PROMPT.format(message=message.replace('"', "'"))
    result = call_gemini(prompt, IntentClassification)
    intent = result.intent.strip().lower()
    return intent if intent in _VALID_INTENTS else "general_question"


# ---------------------------------------------------------------------------
# Step 2 — Engine dispatch
# ---------------------------------------------------------------------------

def _run_engines(intent: str, person_a: dict | None, person_b: dict | None) -> dict:
    """
    Run the most appropriate analysis pipeline for the given intent and
    available profiles. Returns the engine result dict, or {} on any failure
    or missing profiles (graceful degradation — Gemini still responds).
    """
    has_a    = person_a is not None
    has_pair = has_a and person_b is not None

    try:
        if intent == "personality_analysis" and has_a:
            return run_analysis(HYBRID_ANALYSIS, person_a)

        if intent in _PAIR_INTENTS and has_pair:
            analysis_type = (
                ROMANTIC_COMPATIBILITY
                if intent == "relationship_advice"
                else COMPATIBILITY_ANALYSIS
            )
            return run_analysis(analysis_type, person_a, person_b)

        if intent == "sextrology" and has_pair:
            return run_analysis(SEXTROLOGY_ANALYSIS, person_a, person_b)

        if intent == "flirting_guidance":
            if has_pair:
                return run_analysis(LOVE_STYLE_ANALYSIS, person_a, person_b)
            if has_a:
                return run_analysis(HYBRID_ANALYSIS, person_a)

        if intent == "numerology_question":
            if has_pair:
                return run_analysis(NUMEROLOGY_PAIR_ANALYSIS, person_a, person_b)
            if has_a:
                return run_analysis(NUMEROLOGY_ANALYSIS, person_a)

        if intent == "color_question":
            if has_pair:
                return run_analysis(COLOR_PAIR_ANALYSIS, person_a, person_b)
            if has_a:
                return run_analysis(COLOR_ANALYSIS, person_a)

        if intent in ("signal_reading", "first_date_coaching", "red_flags_green_flags"):
            if has_pair:
                return run_analysis(COMPATIBILITY_ANALYSIS, person_a, person_b)
            if has_a:
                return run_analysis(HYBRID_ANALYSIS, person_a)

        if intent in ("getting_them_back", "commitment_progression"):
            if has_pair:
                return run_analysis(ROMANTIC_COMPATIBILITY, person_a, person_b)
            if has_a:
                return run_analysis(HYBRID_ANALYSIS, person_a)

        if intent == "attachment_style_coaching":
            if has_pair:
                return run_analysis(COMPATIBILITY_ANALYSIS, person_a, person_b)
            if has_a:
                return run_analysis(HYBRID_ANALYSIS, person_a)

    except Exception:
        # Engine failure should never crash the chat endpoint
        pass

    return {}


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

_SEXTROLOGY_REFERENCES = (
    "\n\n### References\n"
    "- [sexinfo101 — Positions](https://sexinfo101.com/positions)\n"
    "- [Men's Health — 45 Positions](https://www.menshealth.com/sex-women/a19547362/45-sex-positions-guys-should-know/)\n"
    "- [Women's Health — Positions Guide](https://www.womenshealthmag.com/sex-and-love/g69472736/best-sex-positions-guide/)\n"
    "- [Best Sex Positions](https://bestsexpositions.com/)\n"
    "- [Wikipedia — Sex Position](https://en.wikipedia.org/wiki/Sex_position)\n"
    "- [Wikipedia — Category: Sex Positions](https://en.wikipedia.org/wiki/Category:Sex_positions)\n"
    "- [Wikimedia Commons — Sex Positions](https://commons.wikimedia.org/wiki/Category:Sex_positions)\n"
    "- [Simple Wikipedia — List of Sex Positions](https://simple.wikipedia.org/wiki/List_of_sex_positions)"
)

_BROAD_SEXTROLOGY_KEYWORDS = (
    "position", "positions", "everything", "full read", "full analysis",
    "all", "deep dive", "overview", "chemistry", "compatible", "compatibility",
    "kink", "kinks", "fantasy", "fantasies", "tell me", "what do you see",
    "what's our", "whats our",
)


def _is_broad_sextrology(message: str) -> bool:
    lower = message.lower()
    return any(kw in lower for kw in _BROAD_SEXTROLOGY_KEYWORDS)


def _fix_sextrology_response(text: str, broad: bool) -> str:
    """Strip any ### References block Gemini output (always mangled).
    Only inject reference links for broad deep-dive responses."""
    import re
    text = re.sub(r"\n?###\s*References.*$", "", text, flags=re.DOTALL | re.IGNORECASE).rstrip()
    if broad:
        text += _SEXTROLOGY_REFERENCES
    return text


def _build_history_block(history: list[dict]) -> str:
    """Format recent conversation turns into a context block for the prompt."""
    if not history:
        return ""
    lines = []
    for msg in history[-6:]:  # last 3 exchanges max
        role = "User" if msg.get("role") == "user" else "Zodicognac"
        lines.append(f"{role}: {msg.get('text', '').strip()}")
    return "\n\nRecent conversation:\n" + "\n".join(lines)


def handle_chat(
    message: str,
    person_a: dict | None = None,
    person_b: dict | None = None,
    history: list[dict] | None = None,
) -> dict:
    """
    Handle a single conversational turn.

    Args:
        message  : the user's message string.
        person_a : optional profile dict — {name, day, month, mbti}.
        person_b : optional second profile dict (same shape).

    Returns:
        {"intent": str, "response": str, "data": dict}
    """
    history_block = _build_history_block(history or [])
    intent = _classify_intent(message + (f" [context: {history_block}]" if history_block else ""))
    data   = _run_engines(intent, person_a, person_b)
    prompt = build_chat_prompt(intent, message, person_a, person_b, data, history_block)
    reply  = call_gemini(prompt, ChatReply)

    response_text = (
        _fix_sextrology_response(reply.response, _is_broad_sextrology(message))
        if intent == "sextrology"
        else reply.response
    )

    return {
        "intent":   intent,
        "response": response_text,
        "data":     data,
    }
