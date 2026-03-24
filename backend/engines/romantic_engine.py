"""
Romantic Compatibility Engine

Builds on compatibility_engine and emotional_engine outputs to compute
romantic-specific compatibility. No LLM calls — purely deterministic math.

Public interface:
    compute_romantic_compatibility(
        profile_a, profile_b, emotional_result, vector_similarity
    ) -> dict

Args:
    profile_a / profile_b : zodiac profile dicts from get_zodiac_profile()
    emotional_result       : dict from compute_emotional_compatibility()
    vector_similarity      : float 0–100 from compute_vector_similarity()
"""

from models.schemas import RomanticCompatibilityResult

_TRAIT_MAX = 10.0

# Traits used to measure how complementary the two profiles are.
_POLARITY_TRAITS = ("intensity", "dominance", "expressiveness")

# Final score weights — must sum to 1.0.
_WEIGHTS = {
    "pacing":     0.25,
    "affection":  0.25,
    "polarity":   0.15,
    "emotional":  0.25,
    "vector":     0.10,
}

# Modality pairing → romantic compatibility bonus/penalty
# Cardinal = pursuer (initiates romance, sets the pace)
# Fixed    = steady partner (reliable, slow to open but deeply loyal)
# Mutable  = romantic chameleon (adapts to partner's love style)
_MODALITY_ROMANTIC_BONUS: dict[frozenset, float] = {
    frozenset({"Cardinal", "Mutable"}):  +6.0,  # pursuer + chameleon — thrilling, responsive dynamic
    frozenset({"Fixed", "Mutable"}):     +4.0,  # anchor + adaptor — safe depth meets excitement
    frozenset({"Cardinal", "Fixed"}):    -3.0,  # pursuer meets wall — initial spark, long-term friction
    frozenset({"Cardinal"}):             -4.0,  # two pursuers — competition over initiation
    frozenset({"Fixed"}):                +3.0,  # two anchors — deep trust, low spontaneity
    frozenset({"Mutable"}):              +0.0,  # two chameleons — fun but neither leads
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _tv(profile: dict) -> dict:
    """Return the trait_vector sub-dict from a zodiac profile."""
    return profile["trait_vector"]


def _similarity(a: float, b: float) -> float:
    """0–100 similarity for two trait values. Closer → higher."""
    return round((1 - abs(a - b) / _TRAIT_MAX) * 100, 2)


def _attachment_pacing(tv: dict) -> float:
    """
    Quantify how quickly/slowly a person moves in relationships.

    High stability + low adaptability → slow pacer (high value).
    Low stability + high adaptability → fast pacer (low value).

    Result range: 0–10.
    """
    return tv["stability"] * 0.6 + (10 - tv["adaptability"]) * 0.4


def _affection_expression(tv: dict) -> float:
    """
    Quantify the intensity and openness of affection expression.

    High expressiveness + high dominance → bold, intense expression.
    Low expressiveness + low dominance  → reserved, subtle expression.

    Result range: 0–10.
    """
    return tv["expressiveness"] * 0.6 + tv["dominance"] * 0.4


def _polarity_score(tv_a: dict, tv_b: dict) -> float:
    """
    Score how romantically complementary the two profiles are.

    Uses a bell-curve centred at moderate divergence (avg_diff ≈ 5):
      - avg_diff = 5  → score 100  (healthy complementarity)
      - avg_diff = 0  → score 50   (identical — less tension/spark)
      - avg_diff = 10 → score 50   (too opposite — high friction)

    Formula: 100 − |avg_diff − 5| × 10
    """
    diffs = [abs(tv_a[t] - tv_b[t]) for t in _POLARITY_TRAITS]
    avg_diff = sum(diffs) / len(diffs)
    return round(max(0.0, 100 - abs(avg_diff - 5) * 10), 2)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def compute_romantic_compatibility(
    profile_a: dict,
    profile_b: dict,
    emotional_result: dict,
    vector_similarity: float,
) -> dict:
    """
    Compute romantic compatibility between two zodiac profiles.

    Args:
        profile_a         : zodiac profile dict for person A.
        profile_b         : zodiac profile dict for person B.
        emotional_result  : result dict from compute_emotional_compatibility().
        vector_similarity : 0–100 score from compute_vector_similarity().

    Returns:
        A plain dict matching the RomanticCompatibilityResult schema.
    """
    tv_a = _tv(profile_a)
    tv_b = _tv(profile_b)

    # --- Sub-scores ---
    pacing_sim = _similarity(
        _attachment_pacing(tv_a),
        _attachment_pacing(tv_b),
    )
    affection_sim = _similarity(
        _affection_expression(tv_a),
        _affection_expression(tv_b),
    )
    polarity = _polarity_score(tv_a, tv_b)
    emotional_score = float(emotional_result["emotional_compatibility_score"])

    # --- Weighted final score ---
    base_score = (
        _WEIGHTS["pacing"]    * pacing_sim
        + _WEIGHTS["affection"] * affection_sim
        + _WEIGHTS["polarity"]  * polarity
        + _WEIGHTS["emotional"] * emotional_score
        + _WEIGHTS["vector"]    * float(vector_similarity)
    )

    # Apply modality romantic bonus/penalty
    modality_bonus = _MODALITY_ROMANTIC_BONUS.get(
        frozenset({profile_a.get("modality", ""), profile_b.get("modality", "")}), 0.0
    )
    romantic_score = round(max(0.0, min(100.0, base_score + modality_bonus)), 2)

    result = RomanticCompatibilityResult(
        attachment_pacing_similarity=pacing_sim,
        affection_expression_similarity=affection_sim,
        romantic_polarity_score=polarity,
        romantic_compatibility_score=romantic_score,
    )
    return result.model_dump()
