"""
Emotional Compatibility Engine

Computes emotional compatibility between two personality profiles using
trait vector sub-scores. No LLM calls — purely deterministic math.

Public interface:
    compute_emotional_compatibility(profile_a, profile_b) -> dict
"""

from models.schemas import EmotionalCompatibilityResult

# Trait scale: all values are 0–10.
_TRAIT_MAX = 10.0

# Weighted contribution of each sub-score to the final score.
_WEIGHTS = {
    "expression": 0.35,
    "intensity":  0.35,
    "stability":  0.30,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _similarity(a: float, b: float) -> float:
    """
    Returns a 0–100 similarity score for two trait values on the same scale.
    Closer values → higher score.
    """
    return round((1 - abs(a - b) / _TRAIT_MAX) * 100, 2)


def _stability_compatibility(a: float, b: float) -> float:
    """
    Stability compatibility rewards similar stability levels (smooth dynamic)
    and penalises large gaps (high + low = friction).

    Uses the same similarity formula as other sub-scores because the
    requirement maps directly: similar stability = higher score,
    large difference = lower score.
    """
    return _similarity(a, b)


def _extract(profile: dict) -> dict:
    """Pull the emotionally relevant traits from a zodiac profile dict."""
    tv = profile["trait_vector"]
    return {
        "expressiveness": float(tv["expressiveness"]),
        "intensity":      float(tv["intensity"]),
        "stability":      float(tv["stability"]),
        "modality":       profile.get("modality", ""),
    }


# Modality pairing → emotional compatibility bonus/penalty (applied to final score)
# Cardinal = initiates emotional processing (can be anxious/reactive)
# Fixed    = sustains emotional states (can be resistant to change)
# Mutable  = adapts emotionally (can be inconsistent)
_MODALITY_EMOTIONAL_BONUS: dict[frozenset, float] = {
    frozenset({"Cardinal", "Mutable"}):  +5.0,  # initiator + adaptor — natural emotional flow
    frozenset({"Fixed", "Mutable"}):     +4.0,  # anchor + flexibility — grounding dynamic
    frozenset({"Cardinal", "Fixed"}):    -4.0,  # initiator meets resistance — emotional friction
    frozenset({"Cardinal"}):             -3.0,  # two initiators — competing emotional triggers
    frozenset({"Fixed"}):                +2.0,  # two anchors — stable but can get stuck
    frozenset({"Mutable"}):              +1.0,  # two adaptors — fluid but no emotional anchor
}


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def compute_emotional_compatibility(profile_a: dict, profile_b: dict) -> dict:
    """
    Compute emotional compatibility between two zodiac profiles.

    Args:
        profile_a: zodiac profile dict (as returned by get_zodiac_profile).
        profile_b: zodiac profile dict (as returned by get_zodiac_profile).

    Returns:
        A plain dict matching the EmotionalCompatibilityResult schema.
    """
    a = _extract(profile_a)
    b = _extract(profile_b)

    expression_sim  = _similarity(a["expressiveness"], b["expressiveness"])
    intensity_align = _similarity(a["intensity"],      b["intensity"])
    stability_compat = _stability_compatibility(a["stability"], b["stability"])

    combined = (
        _WEIGHTS["expression"] * expression_sim
        + _WEIGHTS["intensity"]  * intensity_align
        + _WEIGHTS["stability"]  * stability_compat
    )

    # Apply modality emotional bonus/penalty
    modality_bonus = _MODALITY_EMOTIONAL_BONUS.get(
        frozenset({a["modality"], b["modality"]}), 0.0
    )
    emotional_score = round(max(0.0, min(100.0, combined + modality_bonus)), 2)

    result = EmotionalCompatibilityResult(
        emotional_expression_similarity=expression_sim,
        emotional_intensity_alignment=intensity_align,
        emotional_stability_compatibility=stability_compat,
        emotional_compatibility_score=emotional_score,
    )
    return result.model_dump()
