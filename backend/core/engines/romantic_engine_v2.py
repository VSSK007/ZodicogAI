"""
RomanticCompatibilityEngineV2 — conforms to BaseEngine interface.

Wraps romantic_engine.py with typed I/O and explainability metadata.

Dimension weight: 0.18
"""

from __future__ import annotations

from pydantic import BaseModel

from core.base_engine import PairEngine, ScoreResult
from engines.romantic_engine import compute_romantic_compatibility


# ── Input / Output models ─────────────────────────────────────────────────────

class RomanticInput(BaseModel):
    profile_a:        dict
    profile_b:        dict
    emotional_result: dict = {}      # from EmotionalCompatibilityEngine
    vector_similarity: float = 50.0  # from compatibility_engine
    name_a:           str = "Person A"
    name_b:           str = "Person B"

class RomanticOutput(BaseModel):
    score:                      float
    polarity_score:             float
    passion_intensity:          float
    attachment_pacing:          float
    affection_expression:       float
    romantic_tension:           str
    raw_result:                 dict


# ── Engine ────────────────────────────────────────────────────────────────────

class RomanticCompatibilityEngine(PairEngine[RomanticInput, RomanticOutput]):

    @property
    def dimension_name(self) -> str:
        return "romantic_compatibility"

    @property
    def weight(self) -> float:
        return 0.18  # Strong influence — polarity drives long-term attraction

    def compute(self, input: RomanticInput) -> RomanticOutput:
        result = compute_romantic_compatibility(
            input.profile_a,
            input.profile_b,
            input.emotional_result,
            input.vector_similarity,
        )
        return RomanticOutput(
            score=result.get("score", 0),
            polarity_score=result.get("romantic_polarity_score", 0),
            passion_intensity=result.get("passion_intensity", 0),
            attachment_pacing=result.get("attachment_pacing_similarity", 0),
            affection_expression=result.get("affection_expression_similarity", 0),
            romantic_tension=result.get("romantic_tension", ""),
            raw_result=result,
        )

    def score(self, output: RomanticOutput) -> ScoreResult:
        s = output.score

        if s >= 85:
            label = "Electric Romantic Chemistry"
        elif s >= 70:
            label = "Strong Romantic Pull"
        elif s >= 55:
            label = "Comfortable Romantic Fit"
        elif s >= 40:
            label = "Moderate Romantic Friction"
        else:
            label = "Low Romantic Polarity"

        tension = output.romantic_tension or "balanced"
        rationale = (
            f"Romantic polarity {output.polarity_score:.0f}/100, "
            f"passion intensity {output.passion_intensity:.0f}/100. "
            f"Dynamic: {tension}. "
            f"{'The magnetic tension between these two creates a self-sustaining attraction.' if s >= 70 else 'The romantic dynamic requires conscious cultivation to maintain spark.' if s >= 50 else 'Low polarity — the relationship may feel more platonic than passionate without deliberate effort.'}"
        )

        return ScoreResult(
            score=s,
            label=label,
            rationale=rationale,
            sub_scores={
                "polarity_score":      output.polarity_score,
                "passion_intensity":   output.passion_intensity,
                "attachment_pacing":   output.attachment_pacing,
                "affection_expression": output.affection_expression,
            },
            raw=output,
        )
