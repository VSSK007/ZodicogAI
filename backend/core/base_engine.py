"""
BaseEngine — abstract interface every engine must implement.

Design principles:
- compute() is PURE: deterministic, no I/O, no LLM, fully testable
- Each engine declares its dimension_name and weight (for compatibility synthesis)
- ScoreResult enforces that every engine returns a score + structured rationale
- Type-safe via generics — engine input/output contracts are explicit at the class level
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Generic, TypeVar

from pydantic import BaseModel

# ── Generic type vars ─────────────────────────────────────────────────────────
InputT  = TypeVar("InputT",  bound=BaseModel)
OutputT = TypeVar("OutputT", bound=BaseModel)


# ── Canonical result every engine must produce ────────────────────────────────

@dataclass(frozen=True)
class ScoreResult:
    """
    Immutable output of a single engine dimension.

    score        : 0–100 deterministic compatibility or profile score
    label        : human-readable descriptor (e.g. "Strong Bond", "High Tension")
    rationale    : 1-2 sentence explanation of HOW the score was computed
    sub_scores   : optional dict of constituent components (for explainability)
    raw          : the full engine output (Pydantic model), kept for downstream use
    """
    score:      float
    label:      str
    rationale:  str
    sub_scores: dict[str, float]  = field(default_factory=dict)
    raw:        Any               = field(default=None, compare=False)

    def to_context_str(self) -> str:
        """Render this result as a compact string for Gemini prompt injection."""
        parts = [f"{self.label} ({self.score:.0f}/100): {self.rationale}"]
        if self.sub_scores:
            parts.append("  Sub-scores: " + ", ".join(
                f"{k}={v:.0f}" for k, v in self.sub_scores.items()
            ))
        return "\n".join(parts)


# ── BaseEngine ────────────────────────────────────────────────────────────────

class BaseEngine(ABC, Generic[InputT, OutputT]):
    """
    Abstract base for all ZodicogAI engines.

    Subclasses must implement:
        compute(input: InputT) -> OutputT
        score(output: OutputT) -> ScoreResult
        dimension_name -> str
        weight -> float
    """

    @property
    @abstractmethod
    def dimension_name(self) -> str:
        """e.g. 'emotional_compatibility', 'romantic_polarity'"""
        ...

    @property
    @abstractmethod
    def weight(self) -> float:
        """
        This engine's contribution to the overall compatibility score.
        All active engine weights should sum to 1.0.
        """
        ...

    @abstractmethod
    def compute(self, input: InputT) -> OutputT:
        """
        Pure deterministic computation.
        NO side effects, NO I/O, NO LLM calls.
        Same input → same output, always.
        """
        ...

    @abstractmethod
    def score(self, output: OutputT) -> ScoreResult:
        """
        Derive a ScoreResult from the engine's raw output.
        Provides the label, rationale, and sub-scores for explainability.
        """
        ...

    def run(self, input: InputT) -> ScoreResult:
        """
        Public entry point: compute → score → return ScoreResult.
        Wraps compute() + score() so callers never call them separately.
        """
        output = self.compute(input)
        result = self.score(output)
        # Attach raw output for downstream consumption
        return ScoreResult(
            score=result.score,
            label=result.label,
            rationale=result.rationale,
            sub_scores=result.sub_scores,
            raw=output,
        )


# ── Single-person vs pair engine specialisations ──────────────────────────────

class SingleEngine(BaseEngine[InputT, OutputT]):
    """Engine that profiles a single person (no partner needed)."""
    pass


class PairEngine(BaseEngine[InputT, OutputT]):
    """
    Engine that computes compatibility between two people.
    InputT should be a model containing both person profiles.
    """
    pass
