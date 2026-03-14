"""
Sextrology Engine

Derives intimacy-relevant metrics from personality trait vectors and
computes a sexual_compatibility_score. All outputs are analytical and
psychological — no explicit content. No LLM calls.

Public interface:
    compute_sextrology(profile_a, profile_b) -> dict
"""

from models.schemas import SextrologyResult

_TRAIT_MAX = 10.0

# Weights for the final score — must sum to 1.0.
_WEIGHTS = {
    "intensity_alignment":        0.30,
    "pacing_alignment":           0.25,
    "polarity_contribution":      0.20,
    "balance_similarity":         0.25,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _tv(profile: dict) -> dict:
    return profile["trait_vector"]


def _similarity(a: float, b: float) -> float:
    """0–100 similarity for two values on the same 0–10 scale."""
    return round((1 - abs(a - b) / _TRAIT_MAX) * 100, 2)


def _intimacy_intensity(tv: dict) -> float:
    """
    Measures how intense a person's intimacy engagement is.

    High intensity + high expressiveness → highly engaged, passionate style.
    Low intensity + low expressiveness  → calm, reserved intimacy style.

    Result range: 0–10.
    """
    return tv["intensity"] * 0.6 + tv["expressiveness"] * 0.4


def _intimacy_pacing(tv: dict) -> float:
    """
    Measures how quickly a person moves toward intimacy.

    High adaptability → faster pacing (open to new experiences quickly).
    Low stability     → also faster pacing (less need for security first).

    Result range: 0–10.
    """
    return tv["adaptability"] * 0.6 + (10 - tv["stability"]) * 0.4


def _dominance_receptiveness_polarity(tv_a: dict, tv_b: dict) -> float:
    """
    Measures how polarised the two profiles are on the dominance axis.

    0   → similar dominance levels (balanced, egalitarian dynamic).
    100 → opposite ends (one strongly leads, the other strongly receives).

    Moderate-to-high polarity typically correlates with complementary roles;
    the polarity score is reported as-is and used as a positive contributor
    to the final score (natural role differentiation aids compatibility).
    """
    return round((abs(tv_a["dominance"] - tv_b["dominance"]) / _TRAIT_MAX) * 100, 2)


def _emotional_physical_balance(tv: dict) -> float:
    """
    Positions a person on the emotional–physical intimacy axis.

    Emotionally driven : high expressiveness + high stability → value 0.
    Physically driven  : high intensity    + high dominance  → value 10.

    Returns a continuous value on the 0–10 axis; similar values
    indicate a shared orientation toward intimacy.
    """
    emotional_drive = tv["expressiveness"] * 0.6 + tv["stability"] * 0.4
    physical_drive  = tv["intensity"] * 0.6 + tv["dominance"] * 0.4
    total = emotional_drive + physical_drive
    if total == 0:
        return 5.0  # neutral midpoint when both drives are absent
    # ratio 0 = fully emotional, ratio 1 = fully physical → scale to 0–10
    return round((physical_drive / total) * 10, 4)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def compute_sextrology(profile_a: dict, profile_b: dict) -> dict:
    """
    Compute intimacy compatibility between two zodiac profiles.

    Args:
        profile_a: zodiac profile dict (from get_zodiac_profile).
        profile_b: zodiac profile dict (from get_zodiac_profile).

    Returns:
        A plain dict matching the SextrologyResult schema.
    """
    tv_a = _tv(profile_a)
    tv_b = _tv(profile_b)

    # --- Sub-scores ---
    intensity_alignment = _similarity(
        _intimacy_intensity(tv_a),
        _intimacy_intensity(tv_b),
    )
    pacing_alignment = _similarity(
        _intimacy_pacing(tv_a),
        _intimacy_pacing(tv_b),
    )
    polarity = _dominance_receptiveness_polarity(tv_a, tv_b)
    balance_similarity = _similarity(
        _emotional_physical_balance(tv_a),
        _emotional_physical_balance(tv_b),
    )

    # --- Final score ---
    # Polarity contributes positively: complementary dominance profiles
    # naturally align roles and reduce friction.
    sexual_score = round(
        _WEIGHTS["intensity_alignment"]   * intensity_alignment
        + _WEIGHTS["pacing_alignment"]    * pacing_alignment
        + _WEIGHTS["polarity_contribution"] * polarity
        + _WEIGHTS["balance_similarity"]  * balance_similarity,
        2,
    )

    result = SextrologyResult(
        intimacy_intensity_alignment=intensity_alignment,
        intimacy_pacing_alignment=pacing_alignment,
        dominance_receptiveness_polarity=polarity,
        emotional_physical_balance_similarity=balance_similarity,
        sexual_compatibility_score=sexual_score,
    )
    return result.model_dump()
