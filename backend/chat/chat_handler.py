"""
Chat Handler

Orchestrates a single conversational turn:
1. Classify user intent
2. Run analysis engines
3. Build prompt
4. Call Gemini
5. Return response
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


# -----------------------------
# INTENTS
# -----------------------------

VALID_INTENTS = {
    "personality_analysis",
    "compatibility_question",
    "relationship_advice",
    "flirting_guidance",
    "communication_help",
    "sextrology",
    "numerology_question",
    "color_question",
    "general_question",
    "signal_reading",
    "first_date_coaching",
    "red_flags_green_flags",
    "getting_them_back",
    "attachment_style_coaching",
    "commitment_progression",
}

PAIR_INTENTS = {
    "compatibility_question",
    "relationship_advice",
    "communication_help",
}


# -----------------------------
# INTENT CLASSIFIER
# -----------------------------

CLASSIFY_PROMPT = """
Classify the following message into one intent:

personality_analysis
compatibility_question
relationship_advice
flirting_guidance
communication_help
sextrology
numerology_question
color_question
signal_reading
first_date_coaching
red_flags_green_flags
getting_them_back
attachment_style_coaching
commitment_progression
general_question

Message: "{message}"

Respond ONLY as JSON:
{{"intent": "<intent>"}}
"""


def classify_intent(message: str) -> str:

    prompt = CLASSIFY_PROMPT.format(message=message.replace('"', "'"))

    result = call_gemini(prompt, IntentClassification)

    intent = result.intent.strip().lower()

    if intent not in VALID_INTENTS:
        intent = "general_question"

    return intent


# -----------------------------
# ENGINE DISPATCH
# -----------------------------

def run_engines(intent, person_a, person_b):

    has_a = person_a is not None
    has_pair = person_a and person_b

    try:

        if intent == "personality_analysis" and has_a:
            return run_analysis(HYBRID_ANALYSIS, person_a)

        if intent in PAIR_INTENTS and has_pair:

            if intent == "relationship_advice":
                return run_analysis(ROMANTIC_COMPATIBILITY, person_a, person_b)

            return run_analysis(COMPATIBILITY_ANALYSIS, person_a, person_b)

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

        if intent in {
            "signal_reading",
            "first_date_coaching",
            "red_flags_green_flags",
        }:

            if has_pair:
                return run_analysis(COMPATIBILITY_ANALYSIS, person_a, person_b)

            if has_a:
                return run_analysis(HYBRID_ANALYSIS, person_a)

        if intent in {"getting_them_back", "commitment_progression"}:

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
        pass

    return {}


# -----------------------------
# CHAT ENTRYPOINT
# -----------------------------

def _format_history(history: list | None) -> str:
    """
    Convert the list of prior turns into a formatted block appended to the prompt.
    Each turn: {"role": "user"|"ai", "text": "..."}
    Keeps the last 20 turns (10 exchanges) to stay within token budget.
    """
    if not history:
        return ""
    turns = history[-20:]
    lines = ["\n\n--- Conversation so far ---"]
    for turn in turns:
        role = "You" if turn.get("role") == "user" else "Zodicognac"
        lines.append(f"{role}: {turn.get('text', '').strip()}")
    lines.append("--- End of history ---\n")
    return "\n".join(lines)


def handle_chat(message, person_a=None, person_b=None, history=None):

    intent = classify_intent(message)

    data = run_engines(intent, person_a, person_b)

    history_block = _format_history(history)

    prompt = build_chat_prompt(
        intent=intent,
        message=message,
        person_a=person_a,
        person_b=person_b,
        engine_data=data,
        history_block=history_block,
    )

    reply = call_gemini(prompt, ChatReply)

    return {
        "intent": intent,
        "response": reply.response,
        "data": data,
    }