"""
Pattern Engine — deterministic relationship pattern classification.

Logic chain:
    stability + expressiveness → attachment style
    → control tendency → pattern category → label

7 Pattern categories:
    love_bomber, ghoster, emotional_caretaker, commitment_phobe,
    overanalyser, magnetic_chaos, secure_anchor

Returns:
    {pattern_label, pattern_display, pattern_score, shadow_behaviour,
     root_cause, break_the_cycle, trait_vector}
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Pattern definitions
# ---------------------------------------------------------------------------

_PATTERNS: dict[str, dict] = {
    "love_bomber": {
        "display": "The Love Bomber",
        "shadow_behaviour": "Overwhelms with intensity early. Then disappears or flips when the person commits back.",
        "root_cause": "Deep fear of being unloved. Proves worth through grand gestures before vulnerability is required.",
        "break_the_cycle": "Slow down the opening act. Real connection is built in weeks, not days. Match their pace.",
    },
    "ghoster": {
        "display": "The Ghoster",
        "shadow_behaviour": "Pulls away without explanation. Goes quiet precisely when closeness becomes real.",
        "root_cause": "Intimacy triggers the fear of losing self. Disappearing feels safer than navigating the feeling.",
        "break_the_cycle": "Name the discomfort out loud before disappearing. One sentence is enough to not vanish.",
    },
    "emotional_caretaker": {
        "display": "The Emotional Caretaker",
        "shadow_behaviour": "Puts everyone else's emotional needs first. Uses helping to avoid being helped.",
        "root_cause": "Equates worth with usefulness. Being needed feels safer than being known.",
        "break_the_cycle": "Practise asking for something specific from someone you trust. Receiving is a skill.",
    },
    "commitment_phobe": {
        "display": "The Commitment-Phobe",
        "shadow_behaviour": "Keeps one foot out the door. Gets close, then creates distance. Labels it 'independence'.",
        "root_cause": "Past experience taught that full commitment leads to loss of freedom or self.",
        "break_the_cycle": "Distinguish between freedom and avoidance. One is healthy. The other is a wound.",
    },
    "overanalyser": {
        "display": "The Overanalyser",
        "shadow_behaviour": "Intellectualises every feeling into a thesis. Analysis becomes a substitute for action.",
        "root_cause": "Needs certainty before vulnerability. But love doesn't offer certainty — only the choice to try.",
        "break_the_cycle": "Set a 48-hour rule: feel the feeling, then decide. Not the other way around.",
    },
    "magnetic_chaos": {
        "display": "Magnetic Chaos",
        "shadow_behaviour": "Attracts intensity, creates drama, then is surprised by the fallout.",
        "root_cause": "Stability feels boring. Unconsciously recreates turbulence because calm feels like indifference.",
        "break_the_cycle": "Notice when you escalate situations that didn't need escalating. Boredom is not danger.",
    },
    "secure_anchor": {
        "display": "The Secure Anchor",
        "shadow_behaviour": "Can drift into over-giving. Assumes their stability means they don't need checking in on.",
        "root_cause": "Genuine security — but can become martyrdom if not balanced with self-advocacy.",
        "break_the_cycle": "Your stability is a gift. Ask for the same. You're allowed.",
    },
}

# ---------------------------------------------------------------------------
# Classification logic
# ---------------------------------------------------------------------------

def _classify_pattern(tv: dict) -> tuple[str, float]:
    """
    Score each pattern against trait_vector.
    Returns (pattern_key, confidence_score 0–100).
    """
    intensity      = tv.get("intensity",      5)
    stability      = tv.get("stability",      5)
    expressiveness = tv.get("expressiveness", 5)
    dominance      = tv.get("dominance",      5)
    adaptability   = tv.get("adaptability",   5)

    scores: dict[str, float] = {}

    scores["love_bomber"]          = (intensity * 0.4 + adaptability * 0.3 + (10 - stability) * 0.3)
    scores["ghoster"]              = ((10 - expressiveness) * 0.4 + (10 - stability) * 0.3 + intensity * 0.3)
    scores["emotional_caretaker"]  = (expressiveness * 0.4 + (10 - dominance) * 0.4 + stability * 0.2)
    scores["commitment_phobe"]     = (adaptability * 0.4 + (10 - stability) * 0.3 + (10 - dominance) * 0.3)
    scores["overanalyser"]         = (stability * 0.4 + (10 - adaptability) * 0.3 + (10 - expressiveness) * 0.3)
    scores["magnetic_chaos"]       = ((10 - stability) * 0.4 + intensity * 0.3 + adaptability * 0.3)
    scores["secure_anchor"]        = (stability * 0.5 + (10 - intensity) * 0.25 + dominance * 0.25)

    best = max(scores, key=lambda k: scores[k])
    # Normalise to 0–100
    raw = scores[best]
    confidence = round((raw / 10.0) * 100, 1)
    return best, min(confidence, 99.0)


def compute_pattern(zodiac_profile: dict, mbti_profile: dict | None = None) -> dict:
    """
    Classify a person's relationship pattern from their zodiac trait_vector.

    Args:
        zodiac_profile: dict from get_zodiac_profile(), must contain trait_vector.
        mbti_profile:   optional; currently unused but reserved.

    Returns:
        dict with pattern_label, pattern_display, pattern_score,
              shadow_behaviour, root_cause, break_the_cycle, trait_vector.
    """
    tv = zodiac_profile.get("trait_vector", {})
    pattern_key, score = _classify_pattern(tv)
    meta = _PATTERNS[pattern_key]

    return {
        "pattern_label":    pattern_key,
        "pattern_display":  meta["display"],
        "pattern_score":    score,
        "shadow_behaviour": meta["shadow_behaviour"],
        "root_cause":       meta["root_cause"],
        "break_the_cycle":  meta["break_the_cycle"],
        "trait_vector":     tv,
    }
