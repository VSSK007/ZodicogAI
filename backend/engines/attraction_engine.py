"""
Attraction Engine — deterministic attraction archetype classification.

Logic chain:
    intensity + adaptability → stimulation-seeking score
    → emotional volatility tolerance → partner archetype

Returns:
    {attraction_archetype, pull_traits, avoidance_traits, pattern_score, trait_vector}
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Attraction archetype definitions
# ---------------------------------------------------------------------------

_ATTRACTION_ARCHETYPES: dict[str, dict] = {
    "The Fixer-Upper Magnet": {
        "pull_traits":    ["potential over reality", "emotional depth", "wounded energy", "need for purpose"],
        "avoidance_traits": ["emotional availability", "stability", "predictability", "ease"],
        "insight": "You are drawn to people who need you. The dynamic feels meaningful but often becomes one-directional.",
    },
    "The Equal Match Seeker": {
        "pull_traits":    ["matched intensity", "intellectual parity", "confident independence", "dry wit"],
        "avoidance_traits": ["neediness", "passivity", "games", "under-investment"],
        "insight": "You need someone who meets you at your level — neither more, nor less. The search is genuinely specific.",
    },
    "The Chaos Chaser": {
        "pull_traits":    ["unpredictability", "raw energy", "emotional volatility", "intensity"],
        "avoidance_traits": ["routine", "emotional flatness", "over-planning", "safety"],
        "insight": "You mistake turbulence for passion. The relationships are memorable. The aftermath, less so.",
    },
    "The Quiet Depth Hunter": {
        "pull_traits":    ["reserved confidence", "hidden layers", "intelligence that shows slowly", "mystery"],
        "avoidance_traits": ["loudness", "surface-level charm", "instant oversharing", "performance"],
        "insight": "You want the person the room hasn't figured out yet. You find them. You rarely regret it.",
    },
    "The Stability Anchor Seeker": {
        "pull_traits":    ["groundedness", "emotional reliability", "consistency", "calm authority"],
        "avoidance_traits": ["volatility", "inconsistency", "emotional unavailability", "hot-and-cold behaviour"],
        "insight": "You want someone who stays. The irony is you sometimes choose people who won't.",
    },
    "The Intellectual Co-Conspirator": {
        "pull_traits":    ["sharp thinking", "unconventional ideas", "curiosity", "conversational depth"],
        "avoidance_traits": ["small talk", "intellectual passivity", "conventional thinking", "emotional expressiveness over logic"],
        "insight": "The mind comes first. Always. If the conversation doesn't spark, nothing else will either.",
    },
}

# ---------------------------------------------------------------------------
# Classification logic
# ---------------------------------------------------------------------------

def _classify_attraction(tv: dict) -> tuple[str, float]:
    """Map trait_vector to attraction archetype. Returns (name, confidence 0–100)."""
    intensity      = tv.get("intensity",      5)
    stability      = tv.get("stability",      5)
    expressiveness = tv.get("expressiveness", 5)
    dominance      = tv.get("dominance",      5)
    adaptability   = tv.get("adaptability",   5)

    scores: dict[str, float] = {}

    scores["The Fixer-Upper Magnet"]      = intensity * 0.35 + dominance * 0.35 + (10 - stability) * 0.30
    scores["The Equal Match Seeker"]      = dominance * 0.35 + intensity * 0.35 + stability * 0.30
    scores["The Chaos Chaser"]            = (10 - stability) * 0.40 + adaptability * 0.30 + intensity * 0.30
    scores["The Quiet Depth Hunter"]      = (10 - expressiveness) * 0.40 + stability * 0.35 + dominance * 0.25
    scores["The Stability Anchor Seeker"] = stability * 0.40 + (10 - intensity) * 0.30 + (10 - adaptability) * 0.30
    scores["The Intellectual Co-Conspirator"] = stability * 0.40 + (10 - expressiveness) * 0.30 + dominance * 0.30

    best = max(scores, key=lambda k: scores[k])
    raw = scores[best]
    confidence = round((raw / 10.0) * 100, 1)
    return best, min(confidence, 99.0)


def compute_attraction(zodiac_profile: dict, mbti_profile: dict | None = None) -> dict:
    """
    Classify a person's attraction archetype from their zodiac trait_vector.

    Args:
        zodiac_profile: dict from get_zodiac_profile(), must contain trait_vector.
        mbti_profile:   optional; currently unused but reserved.

    Returns:
        dict with attraction_archetype, pull_traits, avoidance_traits,
              pattern_score, insight, trait_vector.
    """
    tv = zodiac_profile.get("trait_vector", {})
    archetype_name, score = _classify_attraction(tv)
    meta = _ATTRACTION_ARCHETYPES[archetype_name]

    return {
        "attraction_archetype": archetype_name,
        "pull_traits":          meta["pull_traits"],
        "avoidance_traits":     meta["avoidance_traits"],
        "pattern_score":        score,
        "insight":              meta["insight"],
        "trait_vector":         tv,
    }
