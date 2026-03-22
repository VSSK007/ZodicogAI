"""
Archetype Engine — deterministic archetype classification from trait_vector.

Logic chain:
    trait_vector → dominance_axis, warmth_axis, fire_axis → 12-archetype grid

12 Archetypes:
    The Hunter, Nurturer, Rebel, Sage, Lover, Strategist,
    Free Spirit, Empath, Performer, Ghost, Anchor, Wildcard

Returns:
    {archetype, archetype_tagline, shadow, in_love, compatibility_note, scores}
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Archetype definitions
# ---------------------------------------------------------------------------

_ARCHETYPES: dict[str, dict] = {
    "The Hunter": {
        "tagline": "You pursue. You conquer. You rarely stay.",
        "shadow": "Mistakes conquest for connection. Leaves before the real story starts.",
        "in_love": "Electrifying to be with — impossible to hold onto. Falls hard, moves faster.",
        "compatibility_note": "Needs someone who matches the chase energy without becoming a trophy.",
    },
    "The Nurturer": {
        "tagline": "You hold everyone together. Including people who should hold themselves.",
        "shadow": "Gives beyond capacity. Uses others' needs to avoid facing their own.",
        "in_love": "Deeply devoted. Remembers every detail. Quietly burns out in silence.",
        "compatibility_note": "Needs someone who actively gives back — or the resentment builds invisibly.",
    },
    "The Rebel": {
        "tagline": "Rules exist so you know which ones to break.",
        "shadow": "Mistakes self-destruction for freedom. Pushes away what they actually want.",
        "in_love": "Intense, unpredictable, and unforgettable. Makes the ordinary feel impossible.",
        "compatibility_note": "Needs someone secure enough not to try to tame them.",
    },
    "The Sage": {
        "tagline": "You see it all — the patterns, the pretense, the truth underneath.",
        "shadow": "Intellectualises feelings instead of having them. Cool when warmth is what's needed.",
        "in_love": "Thoughtful and loyal. Shows love through depth, not drama.",
        "compatibility_note": "Needs someone who matches the intellectual depth and doesn't mistake calm for cold.",
    },
    "The Lover": {
        "tagline": "You live for connection. You feel everything at full volume.",
        "shadow": "Confuses intensity for love. Loses themselves completely in other people.",
        "in_love": "All-in from day one. Romantic to a fault. Makes people feel like the only person alive.",
        "compatibility_note": "Needs someone stable enough to receive that energy without running.",
    },
    "The Strategist": {
        "tagline": "You are always three moves ahead. Including in love.",
        "shadow": "Over-controls everything. Mistakes protection for manipulation.",
        "in_love": "Methodical and reliable. Plans for the future. Sometimes forgets to be present.",
        "compatibility_note": "Needs someone who doesn't interpret caution as emotional absence.",
    },
    "The Free Spirit": {
        "tagline": "You refuse to be defined. And you never will be.",
        "shadow": "Mistakes unavailability for independence. Floats away from everything real.",
        "in_love": "Adventurous and alive. Never boring. Allergic to routine and demands.",
        "compatibility_note": "Needs someone secure enough not to need constant reassurance.",
    },
    "The Empath": {
        "tagline": "You feel everyone's pain. Sometimes more than your own.",
        "shadow": "Takes on emotions that aren't theirs. Disappears into other people's worlds.",
        "in_love": "The most understanding partner in any room. Also the most easily wounded.",
        "compatibility_note": "Needs someone who checks in — not just accepts the care.",
    },
    "The Performer": {
        "tagline": "Every room you enter changes. You make sure of it.",
        "shadow": "Performs love instead of feeling it. Needs applause to feel real.",
        "in_love": "Grand gestures, big energy. Will make you the center of their world — publicly.",
        "compatibility_note": "Needs someone who sees through the performance and loves what's underneath.",
    },
    "The Ghost": {
        "tagline": "You are always present but half-there. And everyone feels it.",
        "shadow": "Disappears emotionally before anyone can leave first. Self-fulfilling prophecy.",
        "in_love": "Mysterious and alluring. Gives just enough to keep interest — never more.",
        "compatibility_note": "Needs someone patient enough to wait for the walls to come down.",
    },
    "The Anchor": {
        "tagline": "You are the reason people feel safe. In every room you enter.",
        "shadow": "Sacrifices personal needs for others' comfort. Carries weight that isn't theirs.",
        "in_love": "The most stable force in any relationship. Makes you feel like home.",
        "compatibility_note": "Needs someone who sees the effort and actively reciprocates.",
    },
    "The Wildcard": {
        "tagline": "No one — including you — knows what you'll do next.",
        "shadow": "Unpredictability becomes a wall. Hard to trust when you can't predict yourself.",
        "in_love": "Electrifying and impossible to forget. Never the same person twice.",
        "compatibility_note": "Needs someone with enormous emotional tolerance and a sense of humor.",
    },
}

# ---------------------------------------------------------------------------
# Classification logic
# ---------------------------------------------------------------------------

def _classify_archetype(tv: dict) -> str:
    """
    Map a trait_vector to one of 12 archetypes via dominance/warmth/fire axes.
    """
    intensity      = tv.get("intensity",      5)
    stability      = tv.get("stability",      5)
    expressiveness = tv.get("expressiveness", 5)
    dominance      = tv.get("dominance",      5)
    adaptability   = tv.get("adaptability",   5)

    warmth = (expressiveness + (10 - dominance)) / 2  # high warmth = expressive + low dominance
    fire   = (intensity + adaptability) / 2           # high fire = intense + adaptable
    order  = (stability + dominance) / 2              # high order = stable + dominant

    # Rule-based scoring per archetype (highest wins)
    scores: dict[str, float] = {}

    scores["The Hunter"]     = 0.6 * dominance + 0.2 * intensity + 0.2 * (10 - stability)
    scores["The Nurturer"]   = 0.5 * warmth + 0.3 * stability + 0.2 * (10 - dominance)
    scores["The Rebel"]      = 0.4 * (10 - stability) + 0.3 * adaptability + 0.3 * intensity
    scores["The Sage"]       = 0.5 * stability + 0.3 * (10 - expressiveness) + 0.2 * dominance
    scores["The Lover"]      = 0.5 * expressiveness + 0.3 * intensity + 0.2 * (10 - stability)
    scores["The Strategist"] = 0.5 * order + 0.3 * (10 - adaptability) + 0.2 * stability
    scores["The Free Spirit"]= 0.5 * adaptability + 0.3 * (10 - stability) + 0.2 * (10 - dominance)
    scores["The Empath"]     = 0.6 * warmth + 0.2 * (10 - dominance) + 0.2 * intensity
    scores["The Performer"]  = 0.5 * expressiveness + 0.3 * dominance + 0.2 * intensity
    scores["The Ghost"]      = 0.5 * (10 - expressiveness) + 0.3 * (10 - stability) + 0.2 * intensity
    scores["The Anchor"]     = 0.5 * stability + 0.3 * (10 - intensity) + 0.2 * warmth
    scores["The Wildcard"]   = 0.4 * adaptability + 0.3 * (10 - stability) + 0.3 * (10 - order)

    return max(scores, key=lambda k: scores[k]), {k: round(v, 1) for k, v in scores.items()}


def compute_archetype(zodiac_profile: dict, mbti_profile: dict | None = None) -> dict:
    """
    Classify a person's love archetype from their zodiac trait_vector.

    Args:
        zodiac_profile: dict from get_zodiac_profile(), must contain trait_vector.
        mbti_profile:   optional; currently unused but reserved for MBTI modifiers.

    Returns:
        dict with archetype, archetype_tagline, shadow, in_love,
              compatibility_note, scores (all 12 raw scores).
    """
    tv = zodiac_profile.get("trait_vector", {})
    archetype_name, scores = _classify_archetype(tv)
    meta = _ARCHETYPES[archetype_name]

    return {
        "archetype":          archetype_name,
        "archetype_tagline":  meta["tagline"],
        "shadow":             meta["shadow"],
        "in_love":            meta["in_love"],
        "compatibility_note": meta["compatibility_note"],
        "scores":             scores,
        "trait_vector":       tv,
    }
