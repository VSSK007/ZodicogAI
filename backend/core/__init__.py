"""
ZodicogAI Core — modular AI architecture layer.

Architecture:
    BaseEngine          → typed interface every engine must conform to
    ScoreBundle         → immutable aggregate of all engine outputs
    ScoreBundleBuilder  → mutable builder for ScoreBundle
    ExplanationContext  → builds structured Gemini prompt from ScoreBundle
    GeminiExplainer     → calls LLM with context, returns grounded interpretation

Data flow:
    Input profiles
        → engines compute ScoreResult per dimension
        → ScoreBundleBuilder assembles a ScoreBundle (deterministic, auditable)
        → ExplanationContext.from_bundle()
        → GeminiExplainer.explain()
        → ExplainedResult (scores + narrative)

Pipeline orchestration itself (phased parallel execution across engines)
lives in agent_controller._run_pipeline_parallel, not here — an earlier
CompatibilityOrchestrator that duplicated that job was removed as dead code.
"""
from core.base_engine   import BaseEngine, SingleEngine, PairEngine, ScoreResult
from core.score_bundle  import ScoreBundle, ScoreBundleBuilder
from core.explainer     import ExplanationContext, GeminiExplainer

__all__ = [
    "BaseEngine", "SingleEngine", "PairEngine", "ScoreResult",
    "ScoreBundle", "ScoreBundleBuilder",
    "ExplanationContext", "GeminiExplainer",
]
