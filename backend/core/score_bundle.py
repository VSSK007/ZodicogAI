"""
ScoreBundle — immutable aggregate of all engine ScoreResults.

Replaces the mutable shared `ctx` dict in agent_controller.py with a typed,
auditable, and serialisable value object.

Design principles:
- Immutable after creation (frozen dataclass)
- Scores are keyed by engine.dimension_name
- Overall score is a weighted synthesis across all present dimensions
- Full audit trail: inputs + per-dimension breakdown always available
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from core.base_engine import ScoreResult


# ── ScoreBundle ────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class ScoreBundle:
    """
    Typed aggregate of all engine outputs for one analysis run.

    dimensions     : dict[engine_name → ScoreResult]
    weights        : dict[engine_name → float] (from engine.weight)
    metadata       : original inputs + run context (for auditing)
    """
    dimensions: dict[str, ScoreResult]
    weights:    dict[str, float]
    metadata:   dict[str, Any] = field(default_factory=dict)

    # ── Derived properties ────────────────────────────────────────────────────

    @property
    def overall_score(self) -> float:
        """
        Weighted average across all dimensions.
        Weights are normalised so they always sum to 1.0 regardless of which
        engines ran (graceful degradation when some engines are skipped).
        """
        if not self.dimensions:
            return 0.0

        active_weights = {
            k: self.weights[k]
            for k in self.dimensions
            if k in self.weights
        }
        total_weight = sum(active_weights.values()) or 1.0

        return sum(
            self.dimensions[k].score * (w / total_weight)
            for k, w in active_weights.items()
        )

    @property
    def score_map(self) -> dict[str, float]:
        """Flat dict of dimension_name → score (for quick lookup)."""
        return {k: v.score for k, v in self.dimensions.items()}

    @property
    def label_map(self) -> dict[str, str]:
        """Flat dict of dimension_name → label."""
        return {k: v.label for k, v in self.dimensions.items()}

    def get(self, dimension: str) -> ScoreResult | None:
        return self.dimensions.get(dimension)

    def raw(self, dimension: str) -> Any:
        """Return the raw engine output for a given dimension."""
        result = self.dimensions.get(dimension)
        return result.raw if result else None

    # ── Serialisation ─────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        return {
            "overall_score": round(self.overall_score, 1),
            "dimensions": {
                k: {
                    "score":      round(v.score, 1),
                    "label":      v.label,
                    "rationale":  v.rationale,
                    "sub_scores": {sk: round(sv, 1) for sk, sv in v.sub_scores.items()},
                }
                for k, v in self.dimensions.items()
            },
            "metadata": self.metadata,
        }

    def to_prompt_context(self) -> str:
        """
        Render the bundle as a compact, structured string for Gemini prompt injection.
        This is the primary interface between the deterministic layer and the LLM.
        """
        lines = [
            f"OVERALL COMPATIBILITY: {self.overall_score:.0f}/100",
            "",
            "DIMENSION BREAKDOWN:",
        ]
        for name, result in self.dimensions.items():
            lines.append(f"\n[{name.upper().replace('_', ' ')}]")
            lines.append(result.to_context_str())

        return "\n".join(lines)


# ── Builder ────────────────────────────────────────────────────────────────────

class ScoreBundleBuilder:
    """
    Mutable builder — accumulates ScoreResults then produces an immutable ScoreBundle.

    Usage:
        builder = ScoreBundleBuilder(metadata={"person_a": ..., "person_b": ...})
        builder.add("emotional_compatibility", result, weight=0.20)
        builder.add("romantic_compatibility",  result, weight=0.15)
        bundle = builder.build()
    """

    def __init__(self, metadata: dict | None = None):
        self._dimensions: dict[str, ScoreResult] = {}
        self._weights:    dict[str, float]        = {}
        self._metadata = metadata or {}

    def add(self, dimension: str, result: ScoreResult, weight: float) -> "ScoreBundleBuilder":
        self._dimensions[dimension] = result
        self._weights[dimension]    = weight
        return self

    def build(self) -> ScoreBundle:
        return ScoreBundle(
            dimensions=dict(self._dimensions),
            weights=dict(self._weights),
            metadata=dict(self._metadata),
        )
