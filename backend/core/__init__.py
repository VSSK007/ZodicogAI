"""
ZodicogAI Core — modular AI architecture layer.

Architecture:
    BaseEngine          → typed interface every engine must conform to
    ScoreBundle         → immutable aggregate of all engine outputs
    ScoreBundleBuilder  → mutable builder for ScoreBundle
    CompatibilityOrchestrator → runs engines in parallel, produces ScoreBundle
    ExplanationContext  → builds structured Gemini prompt from ScoreBundle
    GeminiExplainer     → calls LLM with context, returns grounded interpretation

Data flow:
    Input profiles
        → Orchestrator.run(engines, inputs)
        → ScoreBundle (deterministic, auditable)
        → ExplanationContext.from_bundle()
        → GeminiExplainer.explain()
        → ExplainedResult (scores + narrative)
"""
from core.base_engine   import BaseEngine, SingleEngine, PairEngine, ScoreResult
from core.score_bundle  import ScoreBundle, ScoreBundleBuilder
from core.orchestrator  import CompatibilityOrchestrator, default_orchestrator
from core.explainer     import ExplanationContext, GeminiExplainer

__all__ = [
    "BaseEngine", "SingleEngine", "PairEngine", "ScoreResult",
    "ScoreBundle", "ScoreBundleBuilder",
    "CompatibilityOrchestrator", "default_orchestrator",
    "ExplanationContext", "GeminiExplainer",
]
