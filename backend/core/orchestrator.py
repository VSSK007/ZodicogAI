"""
CompatibilityOrchestrator — runs engines in parallel, builds ScoreBundle.

Design principles:
- Engines run concurrently via ThreadPoolExecutor (I/O-free, safe to parallelise)
- Each engine failure is isolated — one failing engine never kills the whole run
- The orchestrator never calls Gemini — it only aggregates deterministic scores
- Clean separation: orchestrator → ScoreBundle → ExplanationContext → Gemini
"""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

from core.base_engine import BaseEngine, ScoreResult
from core.score_bundle import ScoreBundleBuilder, ScoreBundle

logger = logging.getLogger(__name__)


class CompatibilityOrchestrator:
    """
    Runs a set of engines concurrently and returns a ScoreBundle.

    Usage:
        orchestrator = CompatibilityOrchestrator(max_workers=8)
        bundle = orchestrator.run(
            engines=[emotional_engine, romantic_engine, sextrology_engine, ...],
            inputs={
                "emotional_compatibility": EmotionalInput(profile_a=..., profile_b=...),
                "romantic_compatibility":  RomanticInput(...),
                "sextrology_compatibility": SextrologyInput(...),
            },
            metadata={"person_a": "Alex", "person_b": "Maya"},
        )
    """

    def __init__(self, max_workers: int = 8):
        self._max_workers = max_workers

    def run(
        self,
        engines: list[BaseEngine],
        inputs:  dict[str, Any],  # dimension_name → engine input model
        metadata: dict | None = None,
    ) -> ScoreBundle:
        """
        Run all engines concurrently.
        Engines whose dimension_name is not in `inputs` are skipped gracefully.
        """
        builder = ScoreBundleBuilder(metadata=metadata or {})
        engine_map = {e.dimension_name: e for e in engines}

        futures: dict = {}

        with ThreadPoolExecutor(max_workers=self._max_workers) as pool:
            for dimension, engine in engine_map.items():
                if dimension not in inputs:
                    logger.debug("Skipping engine '%s' — no input provided", dimension)
                    continue
                future = pool.submit(self._run_engine, engine, inputs[dimension])
                futures[future] = (dimension, engine.weight)

            for future in as_completed(futures):
                dimension, weight = futures[future]
                try:
                    result: ScoreResult = future.result()
                    builder.add(dimension, result, weight)
                    logger.debug(
                        "Engine '%s' → %.1f/100 (%s)",
                        dimension, result.score, result.label,
                    )
                except Exception as exc:
                    logger.error(
                        "Engine '%s' failed: %s — skipping dimension", dimension, exc
                    )

        return builder.build()

    @staticmethod
    def _run_engine(engine: BaseEngine, input_model: Any) -> ScoreResult:
        return engine.run(input_model)


# ── Singleton convenience instance ─────────────────────────────────────────────
default_orchestrator = CompatibilityOrchestrator(max_workers=8)
