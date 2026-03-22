"""
Insight Engine — template-based viral hook generator.

Not a pipeline engine. Called as a post-processing step after deterministic
engines have run, injecting a viral hook card into the ctx before Gemini prose.

Public interface
----------------
  generate_hook(trait_vector, hook_type) -> dict
    hook_type: "archetype" | "pattern" | "attraction" | "recommendation"
    Returns: {hook, type, confidence, reasons, share_text}
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Hook templates — each template scores against trait_vector conditions.
# Conditions: a list of (field, operator, threshold) triples.
# Score = fraction of conditions that pass (0.0–1.0).
# ---------------------------------------------------------------------------

_ARCHETYPE_HOOKS: list[dict] = [
    {
        "type": "archetype",
        "hook": "You leave marks people don't recover from.",
        "share_text": "Apparently I leave marks people don't recover from. No notes.",
        "conditions": [("intensity", ">=", 8), ("dominance", ">=", 7)],
    },
    {
        "type": "archetype",
        "hook": "You are the person everyone regrets walking away from.",
        "share_text": "The regret machine, apparently. My zodiac said so.",
        "conditions": [("intensity", ">=", 7), ("expressiveness", ">=", 6)],
    },
    {
        "type": "archetype",
        "hook": "People find you magnetic and can't explain why.",
        "share_text": "Magnetic and inexplicable. The AI confirmed it.",
        "conditions": [("adaptability", ">=", 7), ("intensity", ">=", 6)],
    },
    {
        "type": "archetype",
        "hook": "You are deeply caring — and deeply misread because of it.",
        "share_text": "Deeply caring, chronically misread. The stars agree.",
        "conditions": [("expressiveness", ">=", 7), ("dominance", "<=", 5)],
    },
    {
        "type": "archetype",
        "hook": "You see straight through people — and most can't handle that.",
        "share_text": "I see through people and they can't handle it apparently.",
        "conditions": [("stability", ">=", 7), ("dominance", ">=", 6)],
    },
    {
        "type": "archetype",
        "hook": "You protect your inner world like your life depends on it.",
        "share_text": "Apparently I guard my inner world like a vault. Correct.",
        "conditions": [("intensity", ">=", 7), ("expressiveness", "<=", 5)],
    },
    {
        "type": "archetype",
        "hook": "You are the chaotic element that makes everything more interesting.",
        "share_text": "The chaotic element that makes everything interesting. Accurate.",
        "conditions": [("adaptability", ">=", 8), ("stability", "<=", 5)],
    },
    {
        "type": "archetype",
        "hook": "You are everyone's safe place — and no one is yours.",
        "share_text": "Everyone's safe place with no safe place of my own. An experience.",
        "conditions": [("expressiveness", ">=", 6), ("stability", ">=", 7), ("dominance", "<=", 5)],
    },
    {
        "type": "archetype",
        "hook": "You move through life like you know something others don't.",
        "share_text": "Moving through life like I know something you don't. I do.",
        "conditions": [("stability", ">=", 8), ("adaptability", "<=", 6)],
    },
    {
        "type": "archetype",
        "hook": "You perform stability — but you're the storm underneath.",
        "share_text": "Performing stability while being the storm underneath. Nailed it.",
        "conditions": [("stability", ">=", 7), ("intensity", ">=", 7), ("expressiveness", "<=", 5)],
    },
]

_PATTERN_HOOKS: list[dict] = [
    {
        "type": "pattern",
        "hook": "You love hard, then disappear. And you know it.",
        "share_text": "Love hard, disappear. Rinse, repeat. The AI sees me.",
        "conditions": [("intensity", ">=", 7), ("stability", "<=", 5)],
    },
    {
        "type": "pattern",
        "hook": "You give everything at the start and then run when it gets real.",
        "share_text": "Give everything, then run. My signature move apparently.",
        "conditions": [("expressiveness", ">=", 7), ("adaptability", ">=", 7), ("stability", "<=", 5)],
    },
    {
        "type": "pattern",
        "hook": "You become the therapist in every relationship. Every single one.",
        "share_text": "The emotional caretaker of every relationship I enter. Help.",
        "conditions": [("expressiveness", ">=", 7), ("dominance", "<=", 5)],
    },
    {
        "type": "pattern",
        "hook": "You sabotage things right before they get good.",
        "share_text": "Sabotaging things right before they get good. The AI clocked me.",
        "conditions": [("adaptability", ">=", 7), ("stability", "<=", 5), ("intensity", ">=", 6)],
    },
    {
        "type": "pattern",
        "hook": "You're loyal to a fault — and you've paid for it.",
        "share_text": "Loyal to a fault and paying the price. Zodiac confirmed.",
        "conditions": [("stability", ">=", 8), ("adaptability", "<=", 5)],
    },
    {
        "type": "pattern",
        "hook": "You analyse every relationship to death instead of living it.",
        "share_text": "Analysing relationships instead of being in them. Guilty.",
        "conditions": [("stability", ">=", 7), ("intensity", ">=", 6), ("expressiveness", "<=", 5)],
    },
    {
        "type": "pattern",
        "hook": "You attract chaos because you're secretly bored by peace.",
        "share_text": "Attracting chaos because I'm bored by peace. Allegedly.",
        "conditions": [("intensity", ">=", 8), ("adaptability", ">=", 7), ("stability", "<=", 5)],
    },
    {
        "type": "pattern",
        "hook": "You are the most emotionally intelligent person in the room — and the loneliest.",
        "share_text": "Most emotionally intelligent in the room, loneliest in my head.",
        "conditions": [("expressiveness", ">=", 7), ("intensity", ">=", 7)],
    },
]

_ATTRACTION_HOOKS: list[dict] = [
    {
        "type": "attraction",
        "hook": "You are drawn to people who need to be fixed. It never ends well.",
        "share_text": "Drawn to people who need fixing. It never ends well. AI said so.",
        "conditions": [("intensity", ">=", 7), ("dominance", ">=", 7), ("adaptability", ">=", 6)],
    },
    {
        "type": "attraction",
        "hook": "You fall for the ones who challenge you — even when it costs you.",
        "share_text": "Fall for people who challenge me even when it costs. Classic.",
        "conditions": [("intensity", ">=", 7), ("dominance", ">=", 6)],
    },
    {
        "type": "attraction",
        "hook": "You want someone stable. You keep choosing chaos.",
        "share_text": "Want stable, keep choosing chaos. The irony is not lost on me.",
        "conditions": [("intensity", ">=", 7), ("adaptability", ">=", 7), ("stability", "<=", 5)],
    },
    {
        "type": "attraction",
        "hook": "You attract intense people because you match their energy.",
        "share_text": "Attracting intense people because I match the energy. Accurate.",
        "conditions": [("intensity", ">=", 8), ("expressiveness", ">=", 7)],
    },
    {
        "type": "attraction",
        "hook": "You're attracted to quiet strength — the kind you can feel before you see it.",
        "share_text": "Attracted to quiet strength. You feel it before you see it.",
        "conditions": [("stability", ">=", 7), ("dominance", ">=", 6), ("expressiveness", "<=", 6)],
    },
    {
        "type": "attraction",
        "hook": "You need someone who can keep up. Almost no one can.",
        "share_text": "Need someone who can keep up. Almost no one can apparently.",
        "conditions": [("adaptability", ">=", 8), ("intensity", ">=", 7)],
    },
    {
        "type": "attraction",
        "hook": "You fall for potential, not reality. And then you're surprised.",
        "share_text": "Fall for potential, not reality, then act surprised. Chronic.",
        "conditions": [("intensity", ">=", 7), ("adaptability", ">=", 6), ("stability", "<=", 6)],
    },
]

_RECOMMENDATION_HOOKS: list[dict] = [
    {
        "type": "recommendation",
        "hook": "Your taste in everything tells a story about who you actually are.",
        "share_text": "My taste in games, movies, and style tells the full story apparently.",
        "conditions": [("expressiveness", ">=", 6)],
    },
    {
        "type": "recommendation",
        "hook": "You pick things the same way you pick people — by energy.",
        "share_text": "Pick things the way I pick people: by energy. Correct.",
        "conditions": [("intensity", ">=", 7), ("adaptability", ">=", 6)],
    },
    {
        "type": "recommendation",
        "hook": "Your preferences reveal more about you than you realize.",
        "share_text": "My preferences reveal more about me than I show. True.",
        "conditions": [("stability", ">=", 6)],
    },
    {
        "type": "recommendation",
        "hook": "Your style is a statement you make before you say a word.",
        "share_text": "My style is a statement before I speak. Zodiac cosigned it.",
        "conditions": [("expressiveness", ">=", 7), ("dominance", ">=", 6)],
    },
]

_HOOK_BANKS: dict[str, list[dict]] = {
    "archetype":      _ARCHETYPE_HOOKS,
    "pattern":        _PATTERN_HOOKS,
    "attraction":     _ATTRACTION_HOOKS,
    "recommendation": _RECOMMENDATION_HOOKS,
}

_DEFAULT_HOOK = {
    "hook":       "You are more complex than most people know.",
    "type":       "generic",
    "confidence": 0.5,
    "reasons":    [],
    "share_text": "Apparently more complex than most people know. The stars said it.",
}


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def _score_template(template: dict, tv: dict) -> float:
    """Return fraction of conditions that pass for a given trait_vector."""
    conditions = template.get("conditions", [])
    if not conditions:
        return 0.5
    passed = 0
    for field, op, threshold in conditions:
        val = tv.get(field, 5)
        if op == ">=" and val >= threshold:
            passed += 1
        elif op == "<=" and val <= threshold:
            passed += 1
        elif op == "==" and val == threshold:
            passed += 1
    return passed / len(conditions)


def generate_hook(trait_vector: dict, hook_type: str) -> dict:
    """
    Select the best-matching viral hook for a given trait_vector and type.

    Args:
        trait_vector: dict with keys intensity, stability, expressiveness,
                      dominance, adaptability (all 0–10 ints).
        hook_type: "archetype" | "pattern" | "attraction" | "recommendation"

    Returns:
        dict with keys: hook, type, confidence, reasons, share_text
    """
    bank = _HOOK_BANKS.get(hook_type, _ARCHETYPE_HOOKS)
    scored = [(t, _score_template(t, trait_vector)) for t in bank]
    scored.sort(key=lambda x: x[1], reverse=True)

    best_template, best_score = scored[0]
    if best_score < 0.4:
        return dict(_DEFAULT_HOOK, type=hook_type)

    reasons = []
    for field, op, threshold in best_template.get("conditions", []):
        val = trait_vector.get(field, 5)
        reasons.append(f"{field}={val} {op} {threshold}")

    return {
        "hook":       best_template["hook"],
        "type":       best_template["type"],
        "confidence": round(best_score, 2),
        "reasons":    reasons,
        "share_text": best_template["share_text"],
    }
