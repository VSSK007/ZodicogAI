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
from engines.love_style_engine import compute_love_style_compatibility
from engines.love_language_engine import compute_love_language_compatibility
from engines.relationship_intelligence import compute_relationship_intelligence
from engines.color_engine import get_color_profile, compute_color_harmony
from engines.numerology_engine import get_numerology_profile, compute_numerology_compatibility

# ---------------------------------------------------------------------------
# Imports — LLM + schemas
# ---------------------------------------------------------------------------

from gemini_client import call_gemini, build_prompt
from models.schemas import (
    HybridAnalysis, CompatibilityAnalysis, SextrologyAnalysis, SextrologySoloAnalysis,
    RelationshipIntelligenceResult, ZodiacArticle,
    ColorSingleAnalysis, ColorPairAnalysis,
    NumerologySingleAnalysis, NumerologyPairAnalysis,
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


def _run_emotional(ctx: dict) -> None:
    ctx["emotional"] = compute_emotional_compatibility(
        ctx["a_zodiac"], ctx["b_zodiac"]
    )


def _run_romantic(ctx: dict) -> None:
    # Requires compatibility_engine and emotional_engine to have run first.
    ctx["romantic"] = compute_romantic_compatibility(
        ctx["a_zodiac"],
        ctx["b_zodiac"],
        ctx["emotional"],
        ctx["vector_score"],
    )


def _run_sextrology(ctx: dict) -> None:
    ctx["sextrology"] = compute_sextrology(ctx["a_zodiac"], ctx["b_zodiac"])


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
}

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
    if analysis_type not in _PIPELINE_REGISTRY:
        raise ValueError(f"Unknown analysis type: '{analysis_type}'")

    is_pair = person_b_data is not None

    # Initialise the shared context with raw inputs.
    ctx: dict = {
        "analysis_type": analysis_type,
        "is_pair": is_pair,
        "a": person_a_data,
        "b": person_b_data or {},
    }

    # Run each engine in the prescribed order.
    for engine_name in _PIPELINE_REGISTRY[analysis_type]:
        _ENGINE_REGISTRY[engine_name](ctx)

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
    return {
        **ctx["emotional"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
    }


def _result_romantic(ctx: dict, analysis) -> dict:
    return {
        **ctx["romantic"],
        **ctx["emotional"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
    }


def _result_sextrology(ctx: dict, analysis) -> dict:
    return {
        **ctx["sextrology"],
        "a_traits": ctx["a_zodiac"]["trait_vector"],
        "b_traits": ctx["b_zodiac"]["trait_vector"],
        "analysis": analysis.model_dump(),
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
