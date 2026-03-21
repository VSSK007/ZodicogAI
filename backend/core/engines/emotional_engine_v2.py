"""
EmotionalCompatibilityEngineV2 — conforms to BaseEngine interface.

Wraps the existing emotional_engine.py computation with typed I/O and
produces a ScoreResult with full explainability metadata.

Dimension weight: 0.20 (highest — emotional safety is foundational)
"""

from __future__ import annotations

from pydantic import BaseModel

from core.base_engine import PairEngine, ScoreResult
from engines.emotional_engine import compute_emotional_compatibility


# ── Input / Output models ─────────────────────────────────────────────────────

class EmotionalInput(BaseModel):
    profile_a:  dict
    profile_b:  dict
    name_a:     str = "Person A"
    name_b:     str = "Person B"

class EmotionalOutput(BaseModel):
    score:                      float
    bond_depth:                 float
    conflict_resolution:        float
    empathy_resonance:          float
    attachment_pacing:          float
    affection_expression:       float
    raw_result:                 dict


# ── Engine ────────────────────────────────────────────────────────────────────

class EmotionalCompatibilityEngine(PairEngine[EmotionalInput, EmotionalOutput]):

    @property
    def dimension_name(self) -> str:
        return "emotional_compatibility"

    @property
    def weight(self) -> float:
        return 0.20  # Most foundational — without emotional safety, nothing else works

    def compute(self, input: EmotionalInput) -> EmotionalOutput:
        result = compute_emotional_compatibility(
            input.profile_a,
            input.profile_b,
        )
        return EmotionalOutput(
            score=result.get("score", 0),
            bond_depth=result.get("bond_depth_score", 0),
            conflict_resolution=result.get("conflict_resolution_score", 0),
            empathy_resonance=result.get("empathy_resonance_score", 0),
            attachment_pacing=result.get("attachment_pacing_similarity", 0),
            affection_expression=result.get("affection_expression_similarity", 0),
            raw_result=result,
        )

    def score(self, output: EmotionalOutput) -> ScoreResult:
        s = output.score

        if s >= 80:
            label = "Deep Emotional Resonance"
        elif s >= 65:
            label = "Strong Emotional Bond"
        elif s >= 50:
            label = "Moderate Emotional Alignment"
        elif s >= 35:
            label = "Emotional Friction Present"
        else:
            label = "Significant Emotional Distance"

        rationale = (
            f"Bond depth {output.bond_depth:.0f}/100, "
            f"conflict resolution {output.conflict_resolution:.0f}/100, "
            f"empathy resonance {output.empathy_resonance:.0f}/100. "
            f"{'These two create a deeply safe emotional container.' if s >= 75 else 'Intentional communication will be needed to bridge emotional gaps.' if s >= 50 else 'Significant emotional recalibration required for long-term stability.'}"
        )

        return ScoreResult(
            score=s,
            label=label,
            rationale=rationale,
            sub_scores={
                "bond_depth":          output.bond_depth,
                "conflict_resolution": output.conflict_resolution,
                "empathy_resonance":   output.empathy_resonance,
                "attachment_pacing":   output.attachment_pacing,
                "affection_expression": output.affection_expression,
            },
            raw=output,
        )
