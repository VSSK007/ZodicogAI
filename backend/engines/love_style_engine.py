"""
Love Style Engine

Maps trait vectors to the six classical love styles (Lee, 1973) and
computes pairwise love-style compatibility. No LLM calls.

Classical styles:
    eros   — passionate, romantic love
    storge — affectionate friendship-based love
    ludus  — playful, non-committal love
    mania  — obsessive, dependent love
    pragma — practical, goal-oriented love
    agape  — selfless, unconditional love

Public interface:
    compute_love_style_profile(profile)          -> dict  (single person)
    compute_love_style_compatibility(a, b)       -> dict  (pair)
"""

import math
from models.schemas import LoveStyleProfile, LoveStyleResult

_TRAIT_MAX = 10.0
_STYLES = ("eros", "storge", "ludus", "mania", "pragma", "agape")


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _tv(profile: dict) -> dict:
    return profile["trait_vector"]


def _score_eros(tv: dict) -> float:
    """
    Eros — passionate love.
    High intensity (emotional drive) + high expressiveness (openness).
    """
    return tv["intensity"] * 0.6 + tv["expressiveness"] * 0.4


def _score_storge(tv: dict) -> float:
    """
    Storge — friendship-based love.
    High stability (steadiness) + moderate expressiveness (not too guarded,
    not too intense — the bell-curve factor peaks when expressiveness ≈ 5).
    """
    mod_expr = (1 - abs(tv["expressiveness"] - 5) / 5)  # 0..1, peaks at 5
    return tv["stability"] * 0.7 + mod_expr * _TRAIT_MAX * 0.3


def _score_ludus(tv: dict) -> float:
    """
    Ludus — playful, game-like love.
    High adaptability (seeks novelty) + low stability (avoids routine/commitment).
    """
    return tv["adaptability"] * 0.6 + (_TRAIT_MAX - tv["stability"]) * 0.4


def _score_mania(tv: dict) -> float:
    """
    Mania — obsessive, anxious love.
    High intensity (emotional volatility) + low stability (insecurity) +
    high dominance (need for control and reassurance).
    """
    return (
        tv["intensity"] * 0.40
        + (_TRAIT_MAX - tv["stability"]) * 0.35
        + tv["dominance"] * 0.25
    )


def _score_pragma(tv: dict) -> float:
    """
    Pragma — rational, practical love.
    High stability (consistency) + high adaptability (long-term planning) +
    low intensity (calm, calculated rather than driven by passion).
    """
    return (
        tv["stability"] * 0.40
        + tv["adaptability"] * 0.35
        + (_TRAIT_MAX - tv["intensity"]) * 0.25
    )


def _score_agape(tv: dict) -> float:
    """
    Agape — selfless, altruistic love.
    Low dominance (not self-serving) + high adaptability (accommodating) +
    high expressiveness (open, giving).
    """
    return (
        (_TRAIT_MAX - tv["dominance"]) * 0.40
        + tv["adaptability"] * 0.35
        + tv["expressiveness"] * 0.25
    )


_SCORERS = {
    "eros":   _score_eros,
    "storge": _score_storge,
    "ludus":  _score_ludus,
    "mania":  _score_mania,
    "pragma": _score_pragma,
    "agape":  _score_agape,
}


def _build_profile(profile: dict) -> LoveStyleProfile:
    """Compute all six love style scores for one personality profile."""
    tv = _tv(profile)
    scores = {style: round(scorer(tv) * 10, 2) for style, scorer in _SCORERS.items()}
    dominant = max(scores, key=scores.__getitem__)
    return LoveStyleProfile(dominant_style=dominant, **scores)


def _cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """
    Cosine similarity between two non-negative vectors, scaled to 0–100.
    Returns 50.0 (neutral) if either vector is all-zero.
    """
    dot  = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a ** 2 for a in v1))
    mag2 = math.sqrt(sum(b ** 2 for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 50.0
    return round((dot / (mag1 * mag2)) * 100, 2)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def compute_love_style_profile(profile: dict) -> dict:
    """
    Compute the love style profile for a single person.

    Args:
        profile: zodiac profile dict from get_zodiac_profile().

    Returns:
        A plain dict matching the LoveStyleProfile schema.
    """
    return _build_profile(profile).model_dump()


def compute_love_style_compatibility(profile_a: dict, profile_b: dict) -> dict:
    """
    Compute love style profiles for both people and their compatibility score.

    Compatibility is measured via cosine similarity of the two six-dimensional
    love style vectors: similar distributions indicate aligned love language
    expectations, reducing friction in how love is expressed and received.

    Args:
        profile_a: zodiac profile dict for person A.
        profile_b: zodiac profile dict for person B.

    Returns:
        A plain dict matching the LoveStyleResult schema.
    """
    a_profile = _build_profile(profile_a)
    b_profile = _build_profile(profile_b)

    vec_a = [getattr(a_profile, s) for s in _STYLES]
    vec_b = [getattr(b_profile, s) for s in _STYLES]

    compat_score = _cosine_similarity(vec_a, vec_b)

    result = LoveStyleResult(
        a_love_style=a_profile,
        b_love_style=b_profile,
        love_style_compatibility_score=compat_score,
    )
    return result.model_dump()
