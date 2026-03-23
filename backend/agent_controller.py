"""
Agent Controller — single orchestration layer between the API and all subsystems.

Architecture
------------
  _ENGINE_REGISTRY   : maps engine name → adapter function (ctx → None)
  _PIPELINE_REGISTRY : maps analysis_type → ordered list of engine names
  run_analysis()     : builds ctx, runs the pipeline, calls Gemini, returns result
  run()              : legacy shim kept for main.py backward compatibility

Every adapter function receives a shared mutable context dict (ctx) and writes
its output back into it. This lets later engines in the pipeline read the
results of earlier ones without any explicit argument threading.

main.py only calls run() or run_analysis() — it never touches engines directly.
"""

import concurrent.futures
import threading

# ---------------------------------------------------------------------------
# Imports — engines
# ---------------------------------------------------------------------------

from engines.zodiac_engine import get_zodiac_profile
from engines.mbti_engine import get_mbti_profile
from engines.compatibility_engine import (
    compute_vector_similarity,
    element_compatibility,
    modality_interaction,
    compute_zodiac_compatibility_score,
)
from engines.emotional_engine import compute_emotional_compatibility
from engines.romantic_engine import compute_romantic_compatibility
from engines.sextrology_engine import compute_sextrology

# v2 modular engines
from core.engines import (
    EmotionalCompatibilityEngine,  EmotionalInput,
    RomanticCompatibilityEngine,   RomanticInput,
    SextrologyCompatibilityEngine, SextrologyInput,
)
from core.score_bundle import ScoreBundleBuilder
from core.explainer import ExplanationContext, GeminiExplainer
from engines.love_style_engine import compute_love_style_compatibility
from engines.love_language_engine import compute_love_language_compatibility
from engines.relationship_intelligence import compute_relationship_intelligence
from engines.color_engine import get_color_profile, compute_color_harmony
from engines.numerology_engine import get_numerology_profile, compute_numerology_compatibility
from engines.archetype_engine import compute_archetype
from engines.pattern_engine import compute_pattern
from engines.attraction_engine import compute_attraction
from engines.recommendation_engine import compute_recommendations
from insight_engine import generate_hook

# ---------------------------------------------------------------------------
# Imports — LLM + schemas
# ---------------------------------------------------------------------------

from gemini_client import call_gemini, build_prompt
from models.schemas import (
    HybridAnalysis, CompatibilityAnalysis, SextrologyAnalysis, SextrologySoloAnalysis,
    RelationshipIntelligenceResult, ZodiacArticle,
    ColorSingleAnalysis, ColorPairAnalysis,
    NumerologySingleAnalysis, NumerologyPairAnalysis,
    ArchetypeAnalysis, PatternAnalysis, AttractionAnalysis, RecommendationAnalysis,
)

# ---------------------------------------------------------------------------
# Analysis-type constants (public — imported by main.py)
# ---------------------------------------------------------------------------

HYBRID_ANALYSIS               = "hybrid_analysis"
COMPATIBILITY_ANALYSIS        = "compatibility_analysis"
EMOTIONAL_COMPATIBILITY       = "emotional_compatibility"
ROMANTIC_COMPATIBILITY        = "romantic_compatibility"
SEXTROLOGY_ANALYSIS           = "sextrology_analysis"
SEXTROLOGY_SOLO_ANALYSIS      = "sextrology_solo_analysis"
LOVE_STYLE_ANALYSIS           = "love_style_analysis"
LOVE_LANGUAGE_ANALYSIS        = "love_language_analysis"
FULL_RELATIONSHIP_INTELLIGENCE = "full_relationship_intelligence"
ZODIAC_ARTICLE                = "zodiac_article"
COLOR_ANALYSIS                = "color_analysis"
COLOR_PAIR_ANALYSIS           = "color_pair_analysis"
NUMEROLOGY_ANALYSIS           = "numerology_analysis"
NUMEROLOGY_PAIR_ANALYSIS      = "numerology_pair_analysis"
ARCHETYPE_ANALYSIS            = "archetype_analysis"
PATTERN_ANALYSIS              = "pattern_analysis"
ATTRACTION_ANALYSIS           = "attraction_analysis"
RECOMMENDATION_ANALYSIS       = "recommendation_analysis"

# ---------------------------------------------------------------------------
# Engine adapter functions
#
# Each adapter has signature: (ctx: dict) -> None
# It reads from ctx, calls the underlying engine, and writes results back.
# ---------------------------------------------------------------------------

def _run_zodiac(ctx: dict) -> None:
    if ctx["is_pair"]:
        ctx["a_zodiac"] = get_zodiac_profile(
            ctx["a"]["day"], ctx["a"]["month"]
        )
        ctx["b_zodiac"] = get_zodiac_profile(
            ctx["b"]["day"], ctx["b"]["month"]
        )
    else:
        ctx["zodiac"] = get_zodiac_profile(
            ctx["a"]["day"], ctx["a"]["month"]
        )


def _run_mbti(ctx: dict) -> None:
    if ctx["is_pair"]:
        ctx["a_mbti"] = get_mbti_profile(ctx["a"]["mbti"])
        ctx["b_mbti"] = get_mbti_profile(ctx["b"]["mbti"])
    else:
        ctx["mbti"] = get_mbti_profile(ctx["a"]["mbti"])


def _run_compatibility(ctx: dict) -> None:
    ctx["vector_score"] = compute_vector_similarity(
        ctx["a_zodiac"]["trait_vector"], ctx["b_zodiac"]["trait_vector"]
    )
    ctx["element_score"] = element_compatibility(
        ctx["a_zodiac"]["element"], ctx["b_zodiac"]["element"]
    )
    ctx["modality_score"] = modality_interaction(
        ctx["a_zodiac"]["modality"], ctx["b_zodiac"]["modality"]
    )
    ctx["zodiac_compatibility_score"] = compute_zodiac_compatibility_score(
        ctx["a_zodiac"]["element"],
        ctx["a_zodiac"]["modality"],
        ctx["b_zodiac"]["element"],
        ctx["b_zodiac"]["modality"],
        ctx["vector_score"],
    )


_emotional_engine  = EmotionalCompatibilityEngine()
_romantic_engine   = RomanticCompatibilityEngine()
_sextrology_engine = SextrologyCompatibilityEngine()


def _run_emotional(ctx: dict) -> None:
    result = _emotional_engine.run(EmotionalInput(
        profile_a=ctx["a_zodiac"],
        profile_b=ctx["b_zodiac"],
        name_a=ctx["a"].get("name", "Person A"),
        name_b=ctx["b"].get("name", "Person B"),
    ))
    ctx["emotional"]        = result.raw.raw_result   # backward-compat dict
    ctx["_score_emotional"] = result                  # ScoreResult for bundle


def _run_romantic(ctx: dict) -> None:
    result = _romantic_engine.run(RomanticInput(
        profile_a=ctx["a_zodiac"],
        profile_b=ctx["b_zodiac"],
        emotional_result=ctx["emotional"],
        vector_similarity=ctx.get("vector_score", 50.0),
        name_a=ctx["a"].get("name", "Person A"),
        name_b=ctx["b"].get("name", "Person B"),
    ))
    ctx["romantic"]        = result.raw.raw_result
    ctx["_score_romantic"] = result


def _run_sextrology(ctx: dict) -> None:
    result = _sextrology_engine.run(SextrologyInput(
        profile_a=ctx["a_zodiac"],
        profile_b=ctx["b_zodiac"],
        name_a=ctx["a"].get("name", "Person A"),
        name_b=ctx["b"].get("name", "Person B"),
    ))
    ctx["sextrology"]        = result.raw.raw_result
    ctx["_score_sextrology"] = result


def _run_love_style(ctx: dict) -> None:
    ctx["love_style"] = compute_love_style_compatibility(
        ctx["a_zodiac"], ctx["b_zodiac"]
    )


def _run_love_language(ctx: dict) -> None:
    ctx["love_language"] = compute_love_language_compatibility(
        ctx["a_zodiac"], ctx["b_zodiac"]
    )


def _run_color(ctx: dict) -> None:
    if ctx["is_pair"]:
        ctx["color_harmony"] = compute_color_harmony(
            ctx["a_zodiac"]["sign"], ctx["b_zodiac"]["sign"]
        )
    else:
        ctx["color"] = get_color_profile(ctx["zodiac"]["sign"])


def _run_numerology(ctx: dict) -> None:
    if ctx["is_pair"]:
        ctx["a_numerology"] = get_numerology_profile(
            ctx["a"]["name"], ctx["a"]["day"], ctx["a"]["month"]
        )
        ctx["b_numerology"] = get_numerology_profile(
            ctx["b"]["name"], ctx["b"]["day"], ctx["b"]["month"]
        )
        ctx["numerology_compat"] = compute_numerology_compatibility(
            ctx["a_numerology"], ctx["b_numerology"]
        )
    else:
        ctx["numerology"] = get_numerology_profile(
            ctx["a"]["name"], ctx["a"]["day"], ctx["a"]["month"]
        )


def _run_archetype(ctx: dict) -> None:
    z = ctx.get("zodiac") or ctx.get("a_zodiac", {})
    m = ctx.get("mbti")   or ctx.get("a_mbti",   {})
    ctx["archetype_data"] = compute_archetype(z, m)
    ctx["insight_hook"]   = generate_hook(z.get("trait_vector", {}), "archetype")


def _run_pattern(ctx: dict) -> None:
    z = ctx.get("zodiac") or ctx.get("a_zodiac", {})
    m = ctx.get("mbti")   or ctx.get("a_mbti",   {})
    ctx["pattern_data"]   = compute_pattern(z, m)
    ctx["insight_hook"]   = generate_hook(z.get("trait_vector", {}), "pattern")


def _run_attraction(ctx: dict) -> None:
    z = ctx.get("zodiac") or ctx.get("a_zodiac", {})
    m = ctx.get("mbti")   or ctx.get("a_mbti",   {})
    ctx["attraction_data"] = compute_attraction(z, m)
    ctx["insight_hook"]    = generate_hook(z.get("trait_vector", {}), "attraction")


def _run_recommendation(ctx: dict) -> None:
    z = ctx.get("zodiac") or ctx.get("a_zodiac", {})
    m = ctx.get("mbti")   or ctx.get("a_mbti",   {})
    ctx["recommendation_data"] = compute_recommendations(z, m)
    ctx["insight_hook"]        = generate_hook(z.get("trait_vector", {}), "recommendation")


def _run_relationship_intelligence(ctx: dict) -> None:
    # Requires compatibility, emotional, romantic, sextrology,
    # love_style, and love_language engines to have run first.
    ctx["relationship_intelligence"] = compute_relationship_intelligence(
        vector_score=ctx["vector_score"],
        emotional_result=ctx["emotional"],
        romantic_result=ctx["romantic"],
        sextrology_result=ctx["sextrology"],
        love_style_result=ctx["love_style"],
        love_language_result=ctx["love_language"],
        zodiac_score=ctx["zodiac_compatibility_score"],
    )


# ---------------------------------------------------------------------------
# Engine registry — single source of truth for all available engines
# ---------------------------------------------------------------------------

_ENGINE_REGISTRY: dict[str, callable] = {
    "zodiac_engine":                  _run_zodiac,
    "mbti_engine":                    _run_mbti,
    "compatibility_engine":           _run_compatibility,
    "emotional_engine":               _run_emotional,
    "romantic_engine":                _run_romantic,
    "sextrology_engine":              _run_sextrology,
    "love_style_engine":              _run_love_style,
    "love_language_engine":           _run_love_language,
    "relationship_intelligence_engine": _run_relationship_intelligence,
    "color_engine":                   _run_color,
    "numerology_engine":              _run_numerology,
    "archetype_engine":               _run_archetype,
    "pattern_engine":                 _run_pattern,
    "attraction_engine":              _run_attraction,
    "recommendation_engine":          _run_recommendation,
}

_ALL_PAIR_ENGINES = [
    "zodiac_engine",
    "mbti_engine",
    "compatibility_engine",
    "emotional_engine",
    "romantic_engine",
    "sextrology_engine",
    "love_style_engine",
    "love_language_engine",
    "numerology_engine",
    "color_engine",
    "relationship_intelligence_engine",  # always last — aggregates all others
]

# ---------------------------------------------------------------------------
# Pipeline registry — maps each analysis type to its ordered engine list
# ---------------------------------------------------------------------------

_PIPELINE_REGISTRY: dict[str, list[str]] = {
    HYBRID_ANALYSIS:               ["zodiac_engine", "mbti_engine"],
    COMPATIBILITY_ANALYSIS:        ["zodiac_engine", "mbti_engine", "compatibility_engine"],
    EMOTIONAL_COMPATIBILITY:       ["zodiac_engine", "mbti_engine", "compatibility_engine", "emotional_engine"],
    ROMANTIC_COMPATIBILITY:        ["zodiac_engine", "mbti_engine", "compatibility_engine", "emotional_engine", "romantic_engine"],
    SEXTROLOGY_ANALYSIS:           ["zodiac_engine", "mbti_engine", "compatibility_engine", "sextrology_engine"],
    SEXTROLOGY_SOLO_ANALYSIS:      ["zodiac_engine", "mbti_engine"],
    LOVE_STYLE_ANALYSIS:           ["zodiac_engine", "mbti_engine", "love_style_engine"],
    LOVE_LANGUAGE_ANALYSIS:        ["zodiac_engine", "mbti_engine", "love_language_engine"],
    FULL_RELATIONSHIP_INTELLIGENCE: _ALL_PAIR_ENGINES,
    ZODIAC_ARTICLE:                ["zodiac_engine"],
    COLOR_ANALYSIS:                ["zodiac_engine", "color_engine"],
    COLOR_PAIR_ANALYSIS:           ["zodiac_engine", "color_engine"],
    NUMEROLOGY_ANALYSIS:           ["numerology_engine"],
    NUMEROLOGY_PAIR_ANALYSIS:      ["numerology_engine"],
    ARCHETYPE_ANALYSIS:            ["zodiac_engine", "mbti_engine", "archetype_engine"],
    PATTERN_ANALYSIS:              ["zodiac_engine", "mbti_engine", "pattern_engine"],
    ATTRACTION_ANALYSIS:           ["zodiac_engine", "mbti_engine", "attraction_engine"],
    RECOMMENDATION_ANALYSIS:       ["zodiac_engine", "mbti_engine", "recommendation_engine"],
}

# ---------------------------------------------------------------------------
# Schema registry — which Pydantic model Gemini should conform to
# ---------------------------------------------------------------------------

_SCHEMA_REGISTRY: dict[str, type] = {
    HYBRID_ANALYSIS:               HybridAnalysis,
    COMPATIBILITY_ANALYSIS:        CompatibilityAnalysis,
    EMOTIONAL_COMPATIBILITY:       CompatibilityAnalysis,
    ROMANTIC_COMPATIBILITY:        CompatibilityAnalysis,
    SEXTROLOGY_ANALYSIS:           SextrologyAnalysis,
    SEXTROLOGY_SOLO_ANALYSIS:      SextrologySoloAnalysis,
    LOVE_STYLE_ANALYSIS:           CompatibilityAnalysis,
    LOVE_LANGUAGE_ANALYSIS:        CompatibilityAnalysis,
    FULL_RELATIONSHIP_INTELLIGENCE: CompatibilityAnalysis,
    ZODIAC_ARTICLE:                ZodiacArticle,
    COLOR_ANALYSIS:                ColorSingleAnalysis,
    COLOR_PAIR_ANALYSIS:           ColorPairAnalysis,
    NUMEROLOGY_ANALYSIS:           NumerologySingleAnalysis,
    NUMEROLOGY_PAIR_ANALYSIS:      NumerologyPairAnalysis,
    ARCHETYPE_ANALYSIS:            ArchetypeAnalysis,
    PATTERN_ANALYSIS:              PatternAnalysis,
    ATTRACTION_ANALYSIS:           AttractionAnalysis,
    RECOMMENDATION_ANALYSIS:       RecommendationAnalysis,
}

# ---------------------------------------------------------------------------
# Parallel pipeline execution
# ---------------------------------------------------------------------------

# Dependency phases: engines in the same phase run concurrently.
# Phase N+1 starts only after Phase N completes.
_PHASE_ORDER = [
    # Phase 1 — independent, no deps
    {"zodiac_engine", "mbti_engine", "numerology_engine"},
    # Phase 2 — needs zodiac + mbti
    {"compatibility_engine", "emotional_engine", "sextrology_engine",
     "love_style_engine", "love_language_engine", "color_engine",
     "archetype_engine", "pattern_engine", "attraction_engine", "recommendation_engine"},
    # Phase 3 — needs emotional (from phase 2)
    {"romantic_engine"},
    # Phase 4 — needs everything
    {"relationship_intelligence_engine"},
]

_ctx_lock = threading.Lock()


def _run_pipeline_parallel(analysis_type: str, ctx: dict) -> None:
    """
    Run the engine pipeline for analysis_type using phased parallel execution.

    Engines within the same phase execute concurrently via ThreadPoolExecutor.
    Each phase waits for the previous phase to complete before starting.
    Engine adapters write to the shared ctx dict; writes are protected by _ctx_lock.
    """
    needed: set[str] = set(_PIPELINE_REGISTRY[analysis_type])

    def _safe_run(engine_name: str) -> None:
        # Run the engine, then write results under the lock.
        # Since engine adapters mutate ctx in-place and ctx is a dict (not a
        # primitive), we hold the lock for the entire adapter call so that
        # reads of ctx by the adapter and writes back to ctx are atomic
        # relative to other threads in the same phase.
        with _ctx_lock:
            _ENGINE_REGISTRY[engine_name](ctx)

    for phase in _PHASE_ORDER:
        engines_this_phase = needed & phase
        if not engines_this_phase:
            continue

        if len(engines_this_phase) == 1:
            # No parallelism needed for a single engine — avoid thread overhead.
            _ENGINE_REGISTRY[next(iter(engines_this_phase))](ctx)
        else:
            with concurrent.futures.ThreadPoolExecutor(
                max_workers=len(engines_this_phase)
            ) as executor:
                futures = {
                    executor.submit(_safe_run, name): name
                    for name in engines_this_phase
                }
                for future in concurrent.futures.as_completed(futures):
                    exc = future.exception()
                    if exc is not None:
                        raise exc


# ---------------------------------------------------------------------------
# Engines-only helper (used by streaming endpoints)
# ---------------------------------------------------------------------------

def _run_engines_only(
    analysis_type: str,
    person_a_data: dict,
    person_b_data: dict | None = None,
) -> dict:
    """
    Build ctx, run the full parallel engine pipeline, and return ctx.
    Does NOT call Gemini. Used by streaming endpoints that call Gemini
    themselves after receiving the ctx.

    Args:
        analysis_type : one of the ANALYSIS_TYPE constants.
        person_a_data : dict with keys: name, day, month, mbti.
        person_b_data : same shape; None for single-person analyses.

    Returns:
        Populated ctx dict.
    """
    if analysis_type not in _PIPELINE_REGISTRY:
        raise ValueError(f"Unknown analysis type: '{analysis_type}'")

    is_pair = person_b_data is not None
    ctx: dict = {
        "analysis_type": analysis_type,
        "is_pair": is_pair,
        "a": person_a_data,
        "b": person_b_data or {},
    }

    _run_pipeline_parallel(analysis_type, ctx)

    _BUNDLE_TYPES = {EMOTIONAL_COMPATIBILITY, ROMANTIC_COMPATIBILITY, SEXTROLOGY_ANALYSIS}
    if analysis_type in _BUNDLE_TYPES:
        ctx["_score_bundle"] = _build_score_bundle(analysis_type, ctx)

    return ctx


# ---------------------------------------------------------------------------
# Public entry point — new primary API
# ---------------------------------------------------------------------------

def run_analysis(
    analysis_type: str,
    person_a_data: dict,
    person_b_data: dict | None = None,
) -> dict:
    """
    Run a full analysis pipeline and return a structured result.

    Args:
        analysis_type : one of the ANALYSIS_TYPE constants defined above.
        person_a_data : dict with keys: name, day, month, mbti.
        person_b_data : same shape as person_a_data; None for single-person analyses.

    Returns:
        Fully structured result dict ready for a JSON API response.

    Raises:
        ValueError: unknown analysis_type or invalid engine input.
    """
    ctx = _run_engines_only(analysis_type, person_a_data, person_b_data)

    # Build a prompt and call Gemini.
    schema = _SCHEMA_REGISTRY[analysis_type]
    prompt = build_prompt(analysis_type, ctx)
    analysis = call_gemini(prompt, schema)

    # Assemble and return the final response.
    return _build_result(analysis_type, ctx, analysis)


# ---------------------------------------------------------------------------
# Legacy shim — kept so main.py does not need to change
# ---------------------------------------------------------------------------

def run(request_type: str, params: dict) -> dict:
    """
    Translate legacy (request_type, params) calls into run_analysis().
    main.py calls this; it should never be called from new code.
    """
    if request_type == HYBRID_ANALYSIS:
        return run_analysis(
            HYBRID_ANALYSIS,
            person_a_data={
                "name":  params.get("name", "This person"),
                "day":   params["day"],
                "month": params["month"],
                "mbti":  params["mbti"],
            },
        )

    if request_type == COMPATIBILITY_ANALYSIS:
        return run_analysis(
            COMPATIBILITY_ANALYSIS,
            person_a_data={
                "name":  params.get("person_a_name", "Person A"),
                "day":   params["person_a_day"],
                "month": params["person_a_month"],
                "mbti":  params["person_a_mbti"],
            },
            person_b_data={
                "name":  params.get("person_b_name", "Person B"),
                "day":   params["person_b_day"],
                "month": params["person_b_month"],
                "mbti":  params["person_b_mbti"],
            },
        )

    raise ValueError(f"Unknown request type: '{request_type}'")


# ---------------------------------------------------------------------------
# Result builders — assemble the final API response from ctx + LLM analysis
# ---------------------------------------------------------------------------

def _build_score_bundle(analysis_type: str, ctx: dict):
    """Build an immutable ScoreBundle from whichever ScoreResults are in ctx."""
    builder = ScoreBundleBuilder(metadata={
        "person_a": {"name": ctx["a"].get("name"), "sign": ctx.get("a_zodiac", {}).get("sign"), "mbti": ctx["a"].get("mbti")},
        "person_b": {"name": ctx["b"].get("name"), "sign": ctx.get("b_zodiac", {}).get("sign"), "mbti": ctx["b"].get("mbti")},
        "analysis_type": analysis_type,
    })
    score_keys = {
        "_score_emotional":  ("emotional_compatibility",  _emotional_engine.weight),
        "_score_romantic":   ("romantic_compatibility",   _romantic_engine.weight),
        "_score_sextrology": ("sextrology_compatibility", _sextrology_engine.weight),
    }
    for ctx_key, (dim, weight) in score_keys.items():
        if ctx_key in ctx:
            builder.add(dim, ctx[ctx_key], weight)
    return builder.build()


def _build_result(analysis_type: str, ctx: dict, analysis) -> dict:
    builders = {
        HYBRID_ANALYSIS:               _result_hybrid,
        COMPATIBILITY_ANALYSIS:        _result_compatibility,
        EMOTIONAL_COMPATIBILITY:       _result_emotional,
        ROMANTIC_COMPATIBILITY:        _result_romantic,
        SEXTROLOGY_ANALYSIS:           _result_sextrology,
        SEXTROLOGY_SOLO_ANALYSIS:      _result_sextrology_solo,
        LOVE_STYLE_ANALYSIS:           _result_love_style,
        LOVE_LANGUAGE_ANALYSIS:        _result_love_language,
        FULL_RELATIONSHIP_INTELLIGENCE: _result_full,
        ZODIAC_ARTICLE:                _result_zodiac_article,
        COLOR_ANALYSIS:                _result_color_single,
        COLOR_PAIR_ANALYSIS:           _result_color_pair,
        NUMEROLOGY_ANALYSIS:           _result_numerology_single,
        NUMEROLOGY_PAIR_ANALYSIS:      _result_numerology_pair,
        ARCHETYPE_ANALYSIS:            _result_archetype,
        PATTERN_ANALYSIS:              _result_pattern,
        ATTRACTION_ANALYSIS:           _result_attraction,
        RECOMMENDATION_ANALYSIS:       _result_recommendation,
    }
    return builders[analysis_type](ctx, analysis)


def _result_hybrid(ctx: dict, analysis) -> dict:
    return {
        "name":          ctx["a"]["name"],
        "zodiac_profile": ctx["zodiac"],
        "mbti_profile":  ctx["mbti"],
        "analysis":      analysis.model_dump(),
    }


def _result_compatibility(ctx: dict, analysis) -> dict:
    return {
        "vector_similarity_percent": ctx["vector_score"],
        "element_compatibility":     ctx["element_score"],
        "modality_interaction":      ctx["modality_score"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        **analysis.model_dump(),
    }


def _result_emotional(ctx: dict, analysis) -> dict:
    bundle = ctx.get("_score_bundle")
    return {
        **ctx["emotional"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
        "scores":   bundle.score_map  if bundle else {},
        "labels":   bundle.label_map  if bundle else {},
        "overall":  round(bundle.overall_score, 1) if bundle else None,
    }


def _result_romantic(ctx: dict, analysis) -> dict:
    bundle = ctx.get("_score_bundle")
    return {
        **ctx["romantic"],
        **ctx["emotional"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
        "scores":   bundle.score_map  if bundle else {},
        "labels":   bundle.label_map  if bundle else {},
        "overall":  round(bundle.overall_score, 1) if bundle else None,
    }


def _result_sextrology(ctx: dict, analysis) -> dict:
    bundle = ctx.get("_score_bundle")
    return {
        **ctx["sextrology"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
        "scores":   bundle.score_map  if bundle else {},
        "labels":   bundle.label_map  if bundle else {},
        "overall":  round(bundle.overall_score, 1) if bundle else None,
    }


def _result_sextrology_solo(ctx: dict, analysis) -> dict:
    return {
        "name":      ctx["a"]["name"],
        "sign":      ctx["zodiac"]["sign"],
        "mbti_type": ctx["mbti"]["type"],
        "analysis":  analysis.model_dump(),
    }


def _result_love_style(ctx: dict, analysis) -> dict:
    return {
        **ctx["love_style"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
    }


def _result_love_language(ctx: dict, analysis) -> dict:
    return {
        **ctx["love_language"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
    }


def _result_full(ctx: dict, analysis) -> dict:
    return {
        "vector_similarity_percent": ctx["vector_score"],
        "element_compatibility":     ctx["element_score"],
        "modality_interaction":      ctx["modality_score"],
        "zodiac_compatibility_score": ctx["zodiac_compatibility_score"],
        "emotional":                 ctx["emotional"],
        "romantic":                  ctx["romantic"],
        "sextrology":                ctx["sextrology"],
        "love_style":                ctx["love_style"],
        "love_language":             ctx["love_language"],
        "numerology_compat":         ctx["numerology_compat"],
        "color_harmony":             ctx["color_harmony"],
        "relationship_intelligence": ctx["relationship_intelligence"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
    }


def _result_zodiac_article(ctx: dict, analysis) -> dict:
    return {
        "name":          ctx["a"]["name"],
        "zodiac_profile": ctx["zodiac"],
        "article":       analysis.model_dump(),
    }


def _result_color_single(ctx: dict, analysis) -> dict:
    return {
        "name":    ctx["a"]["name"],
        "sign":    ctx["zodiac"]["sign"],
        "color":   ctx["color"],
        "analysis": analysis.model_dump(),
    }


def _result_color_pair(ctx: dict, analysis) -> dict:
    return {
        "a_name": ctx["a"]["name"],
        "b_name": ctx["b"]["name"],
        **ctx["color_harmony"],
        "analysis": analysis.model_dump(),
    }


def _result_numerology_single(ctx: dict, analysis) -> dict:
    return {
        "name":      ctx["a"]["name"],
        "numerology": ctx["numerology"],
        "analysis":  analysis.model_dump(),
    }


def _result_numerology_pair(ctx: dict, analysis) -> dict:
    return {
        "a_name":        ctx["a"]["name"],
        "b_name":        ctx["b"]["name"],
        "a_numerology":  ctx["a_numerology"],
        "b_numerology":  ctx["b_numerology"],
        "compatibility": ctx["numerology_compat"],
        "analysis":      analysis.model_dump(),
    }


def _fallback_archetype(name: str, ad: dict) -> ArchetypeAnalysis:
    """Generate basic prose from deterministic archetype data when Gemini fails."""
    return ArchetypeAnalysis(
        archetype_prose=(
            f"{name} embodies {ad['archetype']} — {ad['archetype_tagline']}. "
            f"{ad['in_love']} "
            f"This archetype runs deep, shaping how {name} connects, commits, and protects themselves."
        ),
        shadow_deep_dive=(
            f"{name}'s shadow: {ad['shadow']} "
            f"This is the unconscious pattern that emerges under pressure — not a flaw, but a signal."
        ),
        in_love_prose=ad["in_love"],
        compatibility_prose=ad["compatibility_note"],
        growth_invitation=(
            f"The evolution for {name} lies in holding the archetype consciously — "
            f"using its gifts without being ruled by its limits."
        ),
    )


def _fallback_pattern(name: str, pd: dict) -> PatternAnalysis:
    """Generate basic prose from deterministic pattern data when Gemini fails."""
    return PatternAnalysis(
        pattern_prose=(
            f"{name} runs the {pd['pattern_display']} pattern. "
            f"{pd['shadow_behaviour']} "
            f"The confidence score of {pd['pattern_score']}% reflects how strongly this shows up."
        ),
        shadow_deep_dive=pd["shadow_behaviour"],
        root_cause_prose=pd["root_cause"],
        break_the_cycle_prose=pd["break_the_cycle"],
        reframe=(
            f"Seeing the pattern clearly is already half the work. "
            f"{name} has the self-awareness — now it's about the choice."
        ),
    )


def _fallback_attraction(name: str, ad: dict) -> AttractionAnalysis:
    """Generate basic prose from deterministic attraction data when Gemini fails."""
    pulls = ", ".join(ad.get("pull_traits", []))
    avoids = ", ".join(ad.get("avoidance_traits", []))
    return AttractionAnalysis(
        attraction_prose=(
            f"{name} is the {ad['attraction_archetype']}. "
            f"{ad['insight']} "
            f"This shapes every connection they enter."
        ),
        pull_deep_dive=f"{name} is pulled toward: {pulls}. These traits feel magnetic because they mirror or complete something {name} carries internally.",
        avoidance_deep_dive=f"{name} instinctively avoids: {avoids}. Whether this protects or limits depends on the situation.",
        pattern_warning=(
            f"When {name}'s attraction pattern runs unconsciously, it becomes a loop. "
            f"The same person, different face."
        ),
        growth_invitation=(
            f"Awareness of the {ad['attraction_archetype']} archetype gives {name} a choice: "
            f"react from pattern or respond from self."
        ),
    )


def _fallback_recommendation(name: str, rd: dict) -> RecommendationAnalysis:
    """Generate basic prose from deterministic recommendation data when Gemini fails."""
    return RecommendationAnalysis(
        gaming_prose=rd.get("gaming_reasoning", f"{name}'s gaming taste matches their personality profile."),
        movie_prose=rd.get("movie_reasoning", f"{name}'s movie preferences reflect their emotional wiring."),
        sneaker_prose=rd.get("sneaker_reasoning", f"{name}'s footwear instincts reveal their identity expression."),
        taste_profile=(
            f"{name}'s choices across gaming, movies, and style form a coherent identity signal. "
            f"The through-line is {rd.get('gaming_profile', 'their trait vector')} — consistent across every medium."
        ),
    )


def _result_archetype(ctx: dict, analysis) -> dict:
    ad = ctx["archetype_data"]
    name = ctx["a"]["name"]
    if not analysis.archetype_prose or analysis.archetype_prose == "—":
        analysis = _fallback_archetype(name, ad)
    return {
        "name":           name,
        "sign":           ctx["zodiac"]["sign"],
        "mbti_type":      ctx["mbti"]["type"],
        "archetype_data": ad,
        "insight_hook":   ctx.get("insight_hook", {}),
        "analysis":       analysis.model_dump(),
    }


def _result_pattern(ctx: dict, analysis) -> dict:
    pd = ctx["pattern_data"]
    name = ctx["a"]["name"]
    if not analysis.pattern_prose or analysis.pattern_prose == "—":
        analysis = _fallback_pattern(name, pd)
    return {
        "name":         name,
        "sign":         ctx["zodiac"]["sign"],
        "mbti_type":    ctx["mbti"]["type"],
        "pattern_data": pd,
        "insight_hook": ctx.get("insight_hook", {}),
        "analysis":     analysis.model_dump(),
    }


def _result_attraction(ctx: dict, analysis) -> dict:
    ad = ctx["attraction_data"]
    name = ctx["a"]["name"]
    if not analysis.attraction_prose or analysis.attraction_prose == "—":
        analysis = _fallback_attraction(name, ad)
    return {
        "name":            name,
        "sign":            ctx["zodiac"]["sign"],
        "mbti_type":       ctx["mbti"]["type"],
        "attraction_data": ad,
        "insight_hook":    ctx.get("insight_hook", {}),
        "analysis":        analysis.model_dump(),
    }


def _result_recommendation(ctx: dict, analysis) -> dict:
    rd = ctx["recommendation_data"]
    name = ctx["a"]["name"]
    if not analysis.gaming_prose or analysis.gaming_prose == "—":
        analysis = _fallback_recommendation(name, rd)
    return {
        "name":                name,
        "sign":                ctx["zodiac"]["sign"],
        "mbti_type":           ctx["mbti"]["type"],
        "recommendation_data": rd,
        "insight_hook":        ctx.get("insight_hook", {}),
        "analysis":            analysis.model_dump(),
    }
