"""
Relationship Intelligence Engine

Aggregates all engine scores into a single relationship intelligence report.
No LLM calls — purely deterministic math.

Inputs (from prior engines in the pipeline):
    vector_score        : float 0–100 (behavioral similarity, compatibility_engine)
    emotional_result    : dict from compute_emotional_compatibility()
    romantic_result     : dict from compute_romantic_compatibility()
    sextrology_result   : dict from compute_sextrology()
    love_style_result   : dict from compute_love_style_compatibility()
    love_language_result: dict from compute_love_language_compatibility()

Public interface:
    compute_relationship_intelligence(...) -> dict
"""

import math
from models.schemas import RelationshipIntelligenceResult

# ---------------------------------------------------------------------------
# Dimension definitions
# ---------------------------------------------------------------------------
# Maps internal key → human-readable label for strengths/risks output.

_DIMENSIONS: dict[str, str] = {
    "emotional":     "Emotional Compatibility",
    "romantic":      "Romantic Compatibility",
    "behavioral":    "Behavioral Compatibility",
    "sextrology":    "Intimacy Compatibility",
    "love_style":    "Love Style Alignment",
    "love_language": "Love Language Alignment",
    "zodiac":        "Zodiac Compatibility",
}

# Weights for the overall_score — must sum to 1.0.
_WEIGHTS: dict[str, float] = {
    "emotional":     0.25,
    "romantic":      0.20,
    "behavioral":    0.10,
    "sextrology":    0.15,
    "love_style":    0.10,
    "love_language": 0.10,
    "zodiac":        0.10,
}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _stddev(values: list[float]) -> float:
    """Population standard deviation of a list of floats."""
    n = len(values)
    if n == 0:
        return 0.0
    mean = sum(values) / n
    return math.sqrt(sum((v - mean) ** 2 for v in values) / n)


def _stability_prediction(scores: list[float]) -> str:
    """
    Classify score variance into a relationship stability label.

    stddev ≤ 10 : "stable"   — consistent across all dimensions
    stddev ≤ 20 : "moderate" — some uneven dimensions
    stddev > 20 : "volatile" — large gaps between strong and weak areas
    """
    sd = _stddev(scores)
    if sd <= 10:
        return "stable"
    if sd <= 20:
        return "moderate"
    return "volatile"


def _conflict_probability(sorted_scores: list[float]) -> float:
    """
    Derive conflict probability from the two weakest dimension scores.

    Low bottom scores → high conflict probability.
    Formula: 100 − average(bottom_2)
    Range: 0–100 (higher = more probable conflict).
    """
    bottom_two_avg = (sorted_scores[0] + sorted_scores[1]) / 2
    return round(100 - bottom_two_avg, 2)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def compute_relationship_intelligence(
    vector_score: float,
    emotional_result: dict,
    romantic_result: dict,
    sextrology_result: dict,
    love_style_result: dict,
    love_language_result: dict,
    zodiac_score: float,
) -> dict:
    """
    Compute the overall relationship intelligence summary.

    Args:
        vector_score         : 0–100 behavioral similarity from compatibility_engine.
        emotional_result     : result dict from compute_emotional_compatibility().
        romantic_result      : result dict from compute_romantic_compatibility().
        sextrology_result    : result dict from compute_sextrology().
        love_style_result    : result dict from compute_love_style_compatibility().
        love_language_result : result dict from compute_love_language_compatibility().

    Returns:
        A plain dict matching the RelationshipIntelligenceResult schema.
    """
    # --- Collect the single summary score from each dimension ---
    raw_scores: dict[str, float] = {
        "emotional":     float(emotional_result["emotional_compatibility_score"]),
        "romantic":      float(romantic_result["romantic_compatibility_score"]),
        "behavioral":    float(vector_score),
        "sextrology":    float(sextrology_result["sexual_compatibility_score"]),
        "love_style":    float(love_style_result["love_style_compatibility_score"]),
        "love_language": float(love_language_result["love_language_compatibility_score"]),
        "zodiac":        float(zodiac_score),
    }

    # --- Overall score: weighted average ---
    overall = round(
        sum(_WEIGHTS[dim] * score for dim, score in raw_scores.items()),
        2,
    )

    # --- Sort dimensions by score (ascending) ---
    ranked = sorted(raw_scores.items(), key=lambda x: x[1])
    ranked_scores = [score for _, score in ranked]

    # --- Stability prediction based on score variance ---
    stability = _stability_prediction(list(raw_scores.values()))

    # --- Conflict probability from the two lowest dimensions ---
    conflict_prob = _conflict_probability(ranked_scores)

    # --- Strengths: top 3 dimensions (highest scores) ---
    strengths = [_DIMENSIONS[dim] for dim, _ in ranked[-3:][::-1]]

    # --- Risks: bottom 2 dimensions (lowest scores) ---
    risks = [_DIMENSIONS[dim] for dim, _ in ranked[:2]]

    result = RelationshipIntelligenceResult(
        overall_score=overall,
        stability_prediction=stability,
        conflict_probability=conflict_prob,
        strengths=strengths,
        risks=risks,
    )
    return result.model_dump()
