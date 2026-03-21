"""
SextrologyCompatibilityEngineV2 — conforms to BaseEngine interface.

Wraps sextrology_engine.py with typed I/O and explainability metadata.

Dimension weight: 0.12
"""

from __future__ import annotations

from pydantic import BaseModel

from core.base_engine import PairEngine, ScoreResult
from engines.sextrology_engine import compute_sextrology


# ── Input / Output models ─────────────────────────────────────────────────────

class SextrologyInput(BaseModel):
    profile_a:  dict
    profile_b:  dict
    name_a:     str = "Person A"
    name_b:     str = "Person B"

class SextrologyOutput(BaseModel):
    score:              float
    archetype_a:        str
    archetype_b:        str
    dynamic:            str
    long_term_fire:     float
    raw_result:         dict


# ── Engine ────────────────────────────────────────────────────────────────────

class SextrologyCompatibilityEngine(PairEngine[SextrologyInput, SextrologyOutput]):

    @property
    def dimension_name(self) -> str:
        return "sextrology_compatibility"

    @property
    def weight(self) -> float:
        return 0.12  # Significant for long-term satisfaction, secondary to emotional + romantic

    def compute(self, input: SextrologyInput) -> SextrologyOutput:
        result = compute_sextrology(
            input.profile_a,
            input.profile_b,
        )
        return SextrologyOutput(
            score=result.get("score", 0),
            archetype_a=result.get("archetype_a", ""),
            archetype_b=result.get("archetype_b", ""),
            dynamic=result.get("dynamic", ""),
            long_term_fire=result.get("long_term_fire", 0),
            raw_result=result,
        )

    def score(self, output: SextrologyOutput) -> ScoreResult:
        s = output.score

        if s >= 85:
            label = "Explosive Intimate Chemistry"
        elif s >= 70:
            label = "Deep Intimate Resonance"
        elif s >= 55:
            label = "Compatible Intimate Styles"
        elif s >= 40:
            label = "Mismatched Intimate Rhythms"
        else:
            label = "Significant Intimate Friction"

        rationale = (
            f"{output.archetype_a} meets {output.archetype_b}. "
            f"Dynamic: {output.dynamic}. "
            f"Long-term fire: {output.long_term_fire:.0f}/100. "
            f"{'The intimate chemistry here is self-sustaining — desire deepens with time.' if s >= 75 else 'Intimate compatibility is workable with communication about needs and pacing.' if s >= 50 else 'Significant misalignment in intimate archetypes — explicit negotiation of needs is essential.'}"
        )

        return ScoreResult(
            score=s,
            label=label,
            rationale=rationale,
            sub_scores={
                "long_term_fire": output.long_term_fire,
            },
            raw=output,
        )
