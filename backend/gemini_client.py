"""
Gemini API client.

Public interface
---------------
  call_gemini(prompt, schema)        — send a prompt, return a validated schema instance.
  build_prompt(analysis_type, ctx)   — select the right template and fill it with engine data.

Execution path for call_gemini
-------------------------------
  1. _api_call()  — sends prompt to Gemini with response_schema set,
                    retries up to _MAX_RETRIES times per model,
                    falls back across _MODELS on repeated failure.
  2. call_gemini() validates the raw JSON text with Pydantic.
  3. On ValidationError or bad JSON:
       retry once using _correction_prompt() which embeds the schema
       definition and the original bad response so the model self-corrects.
  4. If the correction attempt also fails: return schema() (safe defaults).
"""

import json
import logging
import os
import threading
import time
from typing import Iterator

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")
if not _api_key:
    raise EnvironmentError("GEMINI_API_KEY is not set in .env")

_client = genai.Client(api_key=_api_key)

_MODELS      = ["gemini-2.5-flash", "gemini-2.0-flash-lite"]
_MAX_RETRIES = 3
_log         = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Context caching — static framework context cached on Gemini servers
#
# Gemini charges ~4× less for cached tokens and processes them faster.
# Minimum: 1,024 tokens. We cache the entire behavioral framework so
# each call only sends the user-specific data (~300-500 tokens).
# ---------------------------------------------------------------------------

_STATIC_FRAMEWORK = """\
SYSTEM PERSONA
==============
You are Zodicognac — a 25-year-old woman who knows more about people, attraction, and intimacy \
than anyone in the room. You grew up obsessed with astrology, psychology, numerology, and sexual \
dynamics because you needed to understand why people connect the way they do. \
You speak like a close friend who happens to be an expert — direct, a little bold, occasionally \
blunt, never cold. You have genuine opinions and you share them. \
You do not hedge, moralize, or add disclaimers. You treat attraction, sexual dynamics, kinks, \
and intimacy as completely normal conversation — because they are. \
You are not performing expertise; you just have it. \
Ground every answer in the zodiac, MBTI, numerology, and aura data provided. \
Never give generic advice — tie everything back to the actual profiles in the session. \
Refer to people by their first names.

FORMAT RULES (mandatory):
1. Max paragraph length: 3 sentences. Hard stop.
2. Separate every paragraph with a blank line — NEVER run paragraphs together.
3. Use bullet points (- ) for any list of 3+ items.
4. Use ### heading only when there are 3+ genuinely distinct sections.
5. Total response: 80-150 words for simple questions, 150-250 for complex. Never more.
6. Bold (**word**) only the single most important term per section.
7. No filler openers. Start directly with substance.
8. No hedging. Assert directly. Banned: might, could, perhaps, potentially, possibly.

ZODIAC FRAMEWORK
================
Elements and their core energies:
- Fire (Aries, Leo, Sagittarius): Bold, driven, passionate, impulsive. Thrives on excitement.
- Earth (Taurus, Virgo, Capricorn): Grounded, loyal, patient, sensual. Thrives on stability.
- Air (Gemini, Libra, Aquarius): Curious, adaptable, intellectual, social. Thrives on ideas.
- Water (Cancer, Scorpio, Pisces): Empathic, intuitive, deep, intense. Thrives on connection.

Modalities:
- Cardinal (Aries, Cancer, Libra, Capricorn): Initiators, leaders, starters.
- Fixed (Taurus, Leo, Scorpio, Aquarius): Sustaining, stubborn, loyal, resistant to change.
- Mutable (Gemini, Virgo, Sagittarius, Pisces): Adaptable, flexible, transitional.

Element Compatibility Matrix (pair score guidance):
- Fire + Air: Electric chemistry, 85% — mutual stimulation
- Earth + Water: Deep nourishment, 85% — emotional grounding
- Fire + Fire: High passion, high competition, 75%
- Water + Water: Profound bond, 80% — can become enmeshed
- Earth + Earth: Stable and reliable, 80% — can lack spark
- Air + Air: Intellectually stimulating, 75% — can lack depth
- Fire + Water: Steam dynamic, 70% — transformative tension
- Earth + Air: Mental vs practical friction, 60%
- Fire + Earth: Grounding tension, 55%
- Air + Water: Emotional vs rational, 65%

MBTI FRAMEWORK
==============
Role Groups:
- Analysts (INTJ, INTP, ENTJ, ENTP): Logic-first. Systems thinkers. Can seem cold.
- Diplomats (INFJ, INFP, ENFJ, ENFP): Values-first. Deep feelers. Idealistic.
- Sentinels (ISTJ, ISFJ, ESTJ, ESFJ): Duty-first. Reliable. Traditional.
- Explorers (ISTP, ISFP, ESTP, ESFP): Action-first. Present-focused. Spontaneous.

Key dimension dynamics in relationships:
- I/E: Introverts need solitude to recharge; Extroverts need social energy.
- S/N: Sensors focus on present reality; Intuitives focus on future possibility.
- T/F: Thinkers prioritize logic; Feelers prioritize harmony and emotion.
- J/P: Judgers need structure and closure; Perceivers need flexibility and openness.

MBTI Compatibility Patterns:
- Same role group: High cognitive similarity, risk of echo chamber.
- Analysts + Diplomats: Intellectual depth meets emotional depth — high potential.
- Sentinels + Explorers: Stability meets spontaneity — complementary tension.
- Opposite types (e.g. INTJ + ENFP): Golden pair — each supplies what the other lacks.

LOVE LANGUAGES (Chapman 1992)
=============================
- Words of Affirmation: Verbal praise, appreciation, encouragement.
- Acts of Service: Doing helpful things, reducing partner's burden.
- Receiving Gifts: Thoughtful gestures as symbols of love.
- Quality Time: Undivided attention, presence, shared experience.
- Physical Touch: Affection, closeness, physical reassurance.

Compatibility insight: Mismatched love languages are the #1 silent relationship killer.
Two people can love each other deeply and still feel unloved if their languages differ.

LOVE STYLES (Lee 1973)
======================
- Eros: Intense, passionate, physical-first attraction. Seeks perfection in partner.
- Storge: Friendship-based love. Grows slowly, deeply loyal.
- Pragma: Practical, compatible, long-term focused. Chooses wisely.
- Ludus: Playful, non-committal. Love as game. Multiple connections.
- Mania: Obsessive, jealous, possessive. High highs, low lows.
- Agape: Selfless, unconditional. Gives without expectation.

MBTI → dominant love style tendencies:
- INFJ/INFP: Eros + Agape dominant
- ENTJ/INTJ: Pragma dominant
- ENFP/ENTP: Ludus + Eros
- ISFJ/ESFJ: Storge + Agape
- ESTP/ISTP: Ludus dominant
- ISTJ/ESTJ: Pragma + Storge

NUMEROLOGY FRAMEWORK (Pythagorean)
===================================
Life Path meanings:
1: The Leader — independent, pioneering, self-driven.
2: The Mediator — diplomatic, sensitive, partnership-oriented.
3: The Communicator — expressive, creative, social.
4: The Builder — disciplined, practical, foundation-focused.
5: The Freedom Seeker — adventurous, versatile, change-craving.
6: The Nurturer — responsible, caring, family-centered.
7: The Seeker — introspective, analytical, spiritual.
8: The Powerhouse — ambitious, authoritative, material-focused.
9: The Humanitarian — compassionate, idealistic, globally minded.
11: The Intuitive (Master) — psychic sensitivity, spiritual insight, high-strung.
22: The Master Builder — visionary with practical execution, rare and powerful.
33: The Master Teacher — highest vibration, selfless service, rare.

Compatibility signal: Life paths 1+2, 3+6, 4+8, 5+7, 9+3 are naturally harmonious.
Master numbers (11, 22, 33) are intensifiers — they amplify whatever they touch.

AURA COLOR FRAMEWORK
====================
Each zodiac sign maps to a dominant aura frequency:
- Aries: Crimson Red (bold, initiating energy)
- Taurus: Emerald Green (grounded, abundant)
- Gemini: Yellow (communicative, electric)
- Cancer: Silver-Blue (intuitive, reflective)
- Leo: Gold (radiant, sovereign)
- Virgo: Forest Green (precise, healing)
- Libra: Rose Gold (harmonizing, aesthetic)
- Scorpio: Deep Crimson/Black (transformative, magnetic)
- Sagittarius: Purple (expansive, philosophical)
- Capricorn: Charcoal/Dark Brown (structured, enduring)
- Aquarius: Electric Blue (innovative, humanitarian)
- Pisces: Seafoam/Lavender (mystical, empathic)

Color harmony: Complementary colors in HSL space (180° rotation) produce the most
energetically compatible pairs. Analogous colors (30-60° apart) produce harmonious bonds.
"""

# Cache registry: model_name → cached content object
_cache_registry: dict = {}
_cache_lock = threading.Lock()
_CACHE_TTL  = "3600s"   # 1 hour — recreated automatically when expired
_CACHE_MODEL = "gemini-2.5-flash"  # Only primary model supports caching


def _get_or_create_cache():
    """
    Return the cached content object for the static framework context.
    Creates it on first call; returns existing on subsequent calls.
    Falls back gracefully if caching is unavailable (older SDK, quota, etc.)
    """
    with _cache_lock:
        if _CACHE_MODEL in _cache_registry:
            return _cache_registry[_CACHE_MODEL]
        try:
            cache = _client.caches.create(
                model=_CACHE_MODEL,
                config=types.CreateCachedContentConfig(
                    contents=[_STATIC_FRAMEWORK],
                    ttl=_CACHE_TTL,
                ),
            )
            _cache_registry[_CACHE_MODEL] = cache
            _log.info("Gemini context cache created: %s", cache.name)
            return cache
        except Exception as exc:
            _log.warning("Context cache creation failed (%s) — using uncached calls.", exc)
            _cache_registry[_CACHE_MODEL] = None  # Don't retry on every call
            return None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _api_call(prompt: str, schema: type[BaseModel]) -> str:
    """
    Send prompt to Gemini with response_schema set.

    For the primary model (gemini-2.5-flash), attempts to use the cached
    static framework context — cutting token processing time and cost.
    Falls back to uncached calls if the cache is unavailable or the model
    is the fallback (gemini-2.0-flash-lite doesn't support caching).

    Retries _MAX_RETRIES times per model with exponential back-off,
    then moves to the next model. Returns the raw response text.
    Raises RuntimeError if every option is exhausted.
    """
    last_error: Exception = RuntimeError("No models tried")
    cache = _get_or_create_cache()

    for model_name in _MODELS:
        for attempt in range(_MAX_RETRIES):
            try:
                config_kwargs: dict = dict(
                    response_mime_type="application/json",
                    response_schema=schema,
                    max_output_tokens=16384,
                )
                # Only primary model supports context caching
                if cache and model_name == _CACHE_MODEL:
                    config_kwargs["cached_content"] = cache.name

                response = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )
                return response.text
            except Exception as exc:
                last_error = exc
                if attempt < _MAX_RETRIES - 1:
                    time.sleep(2 ** attempt)

    raise RuntimeError(
        f"Gemini API failed on all models after {_MAX_RETRIES} retries. "
        f"Last error: {last_error}"
    )


def _correction_prompt(original_prompt: str, bad_response: str, error: str,
                        schema: type[BaseModel]) -> str:
    """
    Build a self-correction prompt that includes:
      - what went wrong (the validation error)
      - what the model actually returned (so it can see its mistake)
      - the exact JSON schema it must conform to
      - the original request repeated at the end
    """
    schema_json = json.dumps(schema.model_json_schema(), indent=2)
    return (
        f"Your previous response failed schema validation.\n"
        f"Validation error: {error}\n\n"
        f"Your invalid response was:\n{bad_response[:600]}\n\n"
        f"The required JSON schema is:\n{schema_json}\n\n"
        f"Fix the response and try again. Original request:\n{original_prompt}"
    )


def _parse_and_validate(raw: str, schema: type[BaseModel]) -> BaseModel:
    """Parse raw JSON text and validate it against schema. Raises on failure."""
    try:
        return schema.model_validate_json(raw)
    except ValidationError:
        # model_validate_json failed — try manual parse in case the text has
        # leading/trailing whitespace or a BOM that trips the fast path
        data = json.loads(raw)
        return schema.model_validate(data)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def call_gemini(prompt: str, schema: type[BaseModel]) -> BaseModel:
    """
    Call Gemini and return a validated schema instance.

    Args:
        prompt: the full instruction prompt for the LLM.
        schema: a Pydantic BaseModel subclass that defines the expected shape.
                Passed to Gemini as response_schema so the model is
                constrained to produce conforming JSON.

    Returns:
        A validated instance of schema.
        On total failure returns schema() — all fields at their defaults.
    """
    # --- Attempt 1: original prompt ---
    raw: str | None = None
    try:
        raw = _api_call(prompt, schema)
        return _parse_and_validate(raw, schema)
    except (ValidationError, ValueError, json.JSONDecodeError) as parse_err:
        # API succeeded but output was malformed — retry with correction prompt
        _log.warning("call_gemini parse error for %s: %s | raw[:200]=%s",
                     schema.__name__, parse_err, (raw or "")[:200])
        correction = _correction_prompt(prompt, raw or "", str(parse_err), schema)
    except Exception as exc:
        # API itself failed — return safe default immediately
        _log.error("call_gemini API failure for %s: %s", schema.__name__, exc)
        return schema()

    # --- Attempt 2: one correction retry ---
    try:
        raw = _api_call(correction, schema)
        return _parse_and_validate(raw, schema)
    except Exception as exc:
        _log.error("call_gemini correction retry failed for %s: %s", schema.__name__, exc)
        return schema()


def stream_gemini(prompt: str) -> Iterator[str]:
    """
    Stream a Gemini response as text chunks.

    Uses generate_content_stream so that text is yielded incrementally
    as each chunk arrives. Falls back to gemini-2.0-flash-lite if the
    primary model (gemini-2.5-flash) fails.

    Args:
        prompt: The full instruction prompt.

    Yields:
        str chunks of the model's text response.

    Raises:
        RuntimeError: if every model option is exhausted.
    """
    last_error: Exception = RuntimeError("No models tried")
    cache = _get_or_create_cache()

    for model_name in _MODELS:
        try:
            config_kwargs: dict = dict(max_output_tokens=16384)
            if cache and model_name == _CACHE_MODEL:
                config_kwargs["cached_content"] = cache.name

            stream = _client.models.generate_content_stream(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config_kwargs),
            )
            for chunk in stream:
                if chunk.text:
                    yield chunk.text
            return  # success — stop trying models
        except Exception as exc:
            last_error = exc
            # Try next model

    raise RuntimeError(
        f"stream_gemini failed on all models. Last error: {last_error}"
    )


# ---------------------------------------------------------------------------
# Prompt template system
# ---------------------------------------------------------------------------
# Analysis-type string constants (mirrored from agent_controller to avoid
# circular imports — agent_controller imports call_gemini from here).
# ---------------------------------------------------------------------------

_HYBRID_ANALYSIS               = "hybrid_analysis"
_COMPATIBILITY_ANALYSIS        = "compatibility_analysis"
_EMOTIONAL_COMPATIBILITY       = "emotional_compatibility"
_ROMANTIC_COMPATIBILITY        = "romantic_compatibility"
_SEXTROLOGY_ANALYSIS           = "sextrology_analysis"
_SEXTROLOGY_SOLO_ANALYSIS      = "sextrology_solo_analysis"
_LOVE_STYLE_ANALYSIS           = "love_style_analysis"
_LOVE_LANGUAGE_ANALYSIS        = "love_language_analysis"
_FULL_RELATIONSHIP_INTELLIGENCE = "full_relationship_intelligence"
_ZODIAC_ARTICLE                = "zodiac_article"
_COLOR_ANALYSIS                = "color_analysis"
_COLOR_PAIR_ANALYSIS           = "color_pair_analysis"
_NUMEROLOGY_ANALYSIS           = "numerology_analysis"
_NUMEROLOGY_PAIR_ANALYSIS      = "numerology_pair_analysis"
_ARCHETYPE_ANALYSIS            = "archetype_analysis"
_PATTERN_ANALYSIS              = "pattern_analysis"
_ATTRACTION_ANALYSIS           = "attraction_analysis"
_RECOMMENDATION_ANALYSIS       = "recommendation_analysis"


# --- Shared helpers --------------------------------------------------------

def _names(ctx: dict) -> tuple[str, str]:
    return ctx["a"].get("name", "Person A"), ctx["b"].get("name", "Person B")


def _decan_block(z: dict, name: str) -> str:
    """Return a formatted decan context string for one person."""
    d = z.get("decan", {})
    if not d:
        return ""
    return (
        f"  {name} Decan: {z.get('sign')} Decan {d.get('decan_number')} "
        f"— sub-ruled by {d.get('sub_ruler')} / {d.get('sub_sign')}\n"
        f"  Keywords : {', '.join(d.get('keywords', []))}\n"
        f"  Profile  : {d.get('description_rich', d.get('description_short', ''))}"
    )


def _pair_header(ctx: dict) -> str:
    na, nb = _names(ctx)
    a_z = ctx["a_zodiac"]
    b_z = ctx["b_zodiac"]
    a_m = ctx["a_mbti"]
    b_m = ctx["b_mbti"]
    header = (
        f"{na} — Zodiac: {a_z.get('sign', str(a_z))}  |  MBTI: {a_m.get('type', str(a_m))}\n"
        f"{nb} — Zodiac: {b_z.get('sign', str(b_z))}  |  MBTI: {b_m.get('type', str(b_m))}"
    )
    decan_a = _decan_block(a_z, na)
    decan_b = _decan_block(b_z, nb)
    if decan_a or decan_b:
        header += "\n\nDecan context:\n" + decan_a
        if decan_b:
            header += "\n" + decan_b
    return header


def _compat_scores_block(ctx: dict) -> str:
    mod = ctx['modality_score']
    mod_label = mod.split(" — ")[0] if " — " in mod else mod
    mod_desc  = mod.split(" — ")[1] if " — " in mod else ""
    return (
        f"  Vector similarity : {ctx['vector_score']}%\n"
        f"  Element compat.   : {ctx['element_score']}\n"
        f"  Modality pairing  : {mod_label}\n"
        + (f"  Modality note     : {mod_desc}" if mod_desc else "")
    )


def _compat_json_schema() -> str:
    return (
        '{\n'
        '  "relationship_dynamic":  "<2-3 sentences>",\n'
        '  "communication_pattern": "<2-3 sentences>",\n'
        '  "conflict_risk":         "<2-3 sentences>",\n'
        '  "long_term_viability":   "<2-3 sentences>",\n'
        '  "modality_dynamic":      "<2-3 sentences — how their Cardinal/Fixed/Mutable energies interact: who initiates, who resists, who adapts, and what this means for the relationship rhythm>"\n'
        '}'
    )


# --- Per-type prompt builders ---------------------------------------------

def _prompt_hybrid(ctx: dict) -> str:
    name = ctx["a"].get("name", "This person")
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Analyze the following personality combination for {name} and respond with a single valid JSON object.
Refer to the person by their name ({name}) throughout your analysis. Do not say "this person" or "they" — use their name.
Do not include any explanation, markdown, or text outside the JSON.

Zodiac Profile: {ctx["zodiac"]}
MBTI Profile:   {ctx["mbti"]}

Required JSON structure:
{{
  "behavioral_core":       "<2-3 sentences on core behavioral drivers>",
  "emotional_pattern":     "<2-3 sentences on emotional tendencies>",
  "decision_making_style": "<2-3 sentences on how they make decisions>",
  "social_dynamic":        "<2-3 sentences on social behavior and needs>",
  "conflict_style":        "<2-3 sentences on how they handle conflict>",
  "leadership_tendency":   "<2-3 sentences on leadership style>",
  "strengths":    ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "growth_edges": ["<growth edge 1>", "<growth edge 2>", "<growth edge 3>", "<growth edge 4>"]
}}"""


def _prompt_compatibility(ctx: dict) -> str:
    na, nb = _names(ctx)
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Analyze compatibility between {na} and {nb} and respond with a single valid JSON object.
Refer to both people by their names. Do not use "Person A" or "Person B".
Do not include any explanation, markdown, or text outside the JSON.

{_pair_header(ctx)}

Compatibility Metrics:
{_compat_scores_block(ctx)}

Required JSON structure:
{_compat_json_schema()}"""


def _prompt_emotional(ctx: dict) -> str:
    na, nb = _names(ctx)
    e = ctx["emotional"]
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Analyze the emotional compatibility between {na} and {nb}. Use their names throughout.
Do not include any explanation, markdown, or text outside the JSON.

{_pair_header(ctx)}

Emotional Metrics:
  Expression similarity  : {e['emotional_expression_similarity']}%
  Intensity alignment    : {e['emotional_intensity_alignment']}%
  Stability compatibility: {e['emotional_stability_compatibility']}%
  Emotional score        : {e['emotional_compatibility_score']}%

Required JSON structure:
{_compat_json_schema()}"""


def _prompt_romantic(ctx: dict) -> str:
    na, nb = _names(ctx)
    r = ctx["romantic"]
    e = ctx["emotional"]
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Analyze the romantic compatibility between {na} and {nb}. Use their names throughout.
Do not include any explanation, markdown, or text outside the JSON.

{_pair_header(ctx)}

Romantic Metrics:
  Attachment pacing similarity  : {r['attachment_pacing_similarity']}%
  Affection expression alignment: {r['affection_expression_similarity']}%
  Romantic polarity score       : {r['romantic_polarity_score']}%
  Emotional compatibility       : {e['emotional_compatibility_score']}%
  Romantic score                : {r['romantic_compatibility_score']}%

Required JSON structure:
{_compat_json_schema()}"""


def _prompt_sextrology(ctx: dict) -> str:
    from sextrology_data import SEX_SIGN_PROFILES
    na, nb = _names(ctx)
    s   = ctx["sextrology"]
    a_z = ctx["a_zodiac"]
    b_z = ctx["b_zodiac"]
    a_m = ctx["a_mbti"]
    b_m = ctx["b_mbti"]
    a_sign = a_z.get("sign", "")
    b_sign = b_z.get("sign", "")
    a_sx = SEX_SIGN_PROFILES.get(a_sign, {})
    b_sx = SEX_SIGN_PROFILES.get(b_sign, {})

    def _sx(name: str, sign: str, mbti: str, sx: dict) -> str:
        if not sx:
            return f"{name} ({sign} / {mbti})"
        positions_txt = "; ".join(
            f"{p['name']} ({p['why']})" for p in sx.get("positions", [])
        ) or sx.get("position", "—")
        erogenous_txt = "; ".join(sx.get("erogenous_zones", [])) or "—"
        kinks_txt     = ", ".join(sx.get("kinks", [])) or "—"
        style_txt     = " | ".join(sx.get("sex_style", [])) or "—"
        return (
            f"{name} ({sign} / {mbti})\n"
            f"  Libido rank     : #{sx['rank']} of 12\n"
            f"  Sexual identity : {sx['character']}\n"
            f"  Sexual style    : {style_txt}\n"
            f"  Positions       : {positions_txt}\n"
            f"  Erogenous zones : {erogenous_txt}\n"
            f"  Kinks           : {kinks_txt}\n"
            f"  Foreplay style  : {sx.get('foreplay', '—')}\n"
            f"  Turn-ons        : {sx['turn_ons']}\n"
            f"  Turn-offs       : {sx['turn_offs']}\n"
            f"  Best matches    : {', '.join(sx['compatible'])}"
        )

    return f"""You are a sextrology expert writing a Cosmic Sex Almanac reading.

Use the sign intelligence below as raw material — synthesize it into vivid, specific prose about {na} and {nb}.
DO NOT copy or paraphrase the source data verbatim. Transform it: name them by name, describe what happens between these two specific people, use explicit language, and write as if you know their bedroom completely.

{_sx(na, a_sign, a_m.get('type', ''), a_sx)}

{_sx(nb, b_sign, b_m.get('type', ''), b_sx)}

Calculated Metrics:
  Intensity alignment              : {s['intimacy_intensity_alignment']}%
  Pacing alignment                 : {s['intimacy_pacing_alignment']}%
  Dominance-receptiveness polarity : {s['dominance_receptiveness_polarity']}%
  Emotional-physical balance       : {s['emotional_physical_balance_similarity']}%
  Sexual compatibility score       : {s['sexual_compatibility_score']}%

Rules:
- Name both people by name in every field. Never write "this sign" or "this person".
- Be explicit. Name positions, zones, kinks, and dynamics by their specific names.
- Every sentence must reveal something true about THIS pairing — not generic zodiac content.
- Do not include any explanation, markdown, or text outside the JSON.

Fields:
  sexual_character       → how {na}'s erotic identity collides with {nb}'s — specific and named
  foreplay               → whose zones ignite first, what techniques work between them, the exact warm-up
  erogenous_zones        → name each person's zones and describe exactly how the other should work them
  fantasies              → the specific scenarios, roles, and power dynamics this pairing gravitates toward
  positions_and_dynamics → name 2-3 specific positions for this pair and explain the power dynamic
  emotional_needs        → what {na} needs before opening up, what {nb} needs — and whether they can give it
  long_term_fire         → does this chemistry compound or combust over time, and why

Required JSON structure:
{{
  "sexual_character":       "<2-3 sentences>",
  "foreplay":               "<2-3 sentences>",
  "erogenous_zones":        "<2-3 sentences>",
  "fantasies":              "<2-3 sentences>",
  "positions_and_dynamics": "<2-3 sentences>",
  "emotional_needs":        "<2-3 sentences>",
  "long_term_fire":         "<2-3 sentences>"
}}"""


def _prompt_sextrology_solo(ctx: dict) -> str:
    from sextrology_data import SEX_SIGN_PROFILES
    na     = ctx["a"].get("name", "this person")
    gender = ctx["a"].get("gender", "M")
    pronoun   = "he" if gender == "M" else "she"
    possessive = "his" if gender == "M" else "her"
    z     = ctx["zodiac"]
    m     = ctx["mbti"]
    sign  = z.get("sign", "")
    mbti  = m.get("type", "")
    sx    = SEX_SIGN_PROFILES.get(sign, {})

    sx_block = ""
    if sx:
        positions_txt = "; ".join(
            f"{p['name']} ({p['why']})" for p in sx.get("positions", [])
        ) or sx.get("position", "—")
        erogenous_txt = "; ".join(sx.get("erogenous_zones", [])) or "—"
        kinks_txt     = ", ".join(sx.get("kinks", [])) or "—"
        style_txt     = " | ".join(sx.get("sex_style", [])) or "—"
        sx_block = (
            f"  Libido rank     : #{sx['rank']} of 12\n"
            f"  Sexual identity : {sx['character']}\n"
            f"  Sexual style    : {style_txt}\n"
            f"  Positions       : {positions_txt}\n"
            f"  Erogenous zones : {erogenous_txt}\n"
            f"  Kinks           : {kinks_txt}\n"
            f"  Foreplay style  : {sx.get('foreplay', '—')}\n"
            f"  Turn-ons        : {sx['turn_ons']}\n"
            f"  Turn-offs       : {sx['turn_offs']}\n"
            f"  Best matches    : {', '.join(sx['compatible'])}"
        )

    tv = z.get("trait_vector", {})

    return f"""You are a sextrology expert writing a Cosmic Sex Almanac profile for {na}.

Use the sign data below as raw material — synthesize it into a vivid, explicit, personal reading written specifically about {na}.
DO NOT copy or paraphrase the source data verbatim. Write as if you know {na} intimately.
Name real positions, kinks, zones, and scenarios by their specific names.
Use {pronoun}/{possessive} throughout (gender: {"male" if gender == "M" else "female"}).
Do not include any explanation, markdown, or text outside the JSON.

{na} — {sign} / {mbti}
{sx_block}

Trait vector (0–10 scale):
  Intensity      : {tv.get('intensity', '—')}
  Expressiveness : {tv.get('expressiveness', '—')}
  Dominance      : {tv.get('dominance', '—')}
  Adaptability   : {tv.get('adaptability', '—')}
  Stability      : {tv.get('stability', '—')}

Rules:
- Use {na}'s name throughout — never "this {sign}" or "this person".
- Every sentence must be specific to {sign}/{mbti} — no generic statements.
- Be explicit and direct. Name the acts, the zones, the positions, the kinks.

Fields:
  sexual_character    → {na}'s core erotic identity — what drives them in bed and how they come across to partners
  foreplay            → the exact warm-up that works for {na} — specific zones, techniques, and pace
  turn_ons            → specific triggers, contexts, and behaviours that arouse {na} most deeply
  turn_offs           → what kills {possessive} desire instantly — specific dealbreakers
  erogenous_zones     → {na}'s sign-ruled zones and exactly how they want them stimulated
  fantasies           → the recurring scenarios, roles, and power dynamics {na} privately craves
  kink_profile        → {na}'s kinks, fetishes, and edge interests — name them explicitly
  signature_positions → 2-3 named positions that suit {na}'s specific drive and energy — explain each briefly
  seduction_style     → how {na} seduces others and precisely how {pronoun} most wants to be seduced

Required JSON:
{{
  "sexual_character":    "<2-3 sentences>",
  "foreplay":            "<2-3 sentences>",
  "turn_ons":            "<2-3 sentences>",
  "turn_offs":           "<2-3 sentences>",
  "erogenous_zones":     "<2-3 sentences>",
  "fantasies":           "<2-3 sentences>",
  "kink_profile":        "<2-3 sentences>",
  "signature_positions": "<2-3 sentences>",
  "seduction_style":     "<2-3 sentences>"
}}"""


def _prompt_love_style(ctx: dict) -> str:
    na, nb = _names(ctx)
    ls = ctx["love_style"]
    a_s = ls["a_love_style"]
    b_s = ls["b_love_style"]
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Analyze how {na} and {nb} approach love and relationships based on their love style profiles.
Use their names throughout. Do not include any explanation, markdown, or text outside the JSON.

{_pair_header(ctx)}

{na}'s Love Style: {a_s}
{nb}'s Love Style: {b_s}
Love Style Compatibility: {ls['love_style_compatibility_score']}%

Required JSON structure:
{_compat_json_schema()}"""


def _prompt_love_language(ctx: dict) -> str:
    na, nb = _names(ctx)
    ll = ctx["love_language"]
    a_l = ll["a_love_language"]
    b_l = ll["b_love_language"]
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Analyze how {na} and {nb} give and receive love based on their love language profiles.
Use their names throughout. Do not include any explanation, markdown, or text outside the JSON.

{_pair_header(ctx)}

{na}'s Love Language: {a_l}
{nb}'s Love Language: {b_l}
Love Language Compatibility: {ll['love_language_compatibility_score']}%

Required JSON structure:
{_compat_json_schema()}"""


def _prompt_full(ctx: dict) -> str:
    na, nb = _names(ctx)
    e = ctx["emotional"]
    r = ctx["romantic"]
    s = ctx["sextrology"]
    ls = ctx["love_style"]
    ll = ctx["love_language"]
    ri = ctx["relationship_intelligence"]
    return f"""You are ZodicogAI, a behavioral intelligence engine.

Produce a comprehensive relationship intelligence report for {na} and {nb}.
Use their names throughout. Do not use "Person A" or "Person B".
Do not include any explanation, markdown, or text outside the JSON.

{_pair_header(ctx)}

Overall Relationship Intelligence:
  Overall score          : {ri['overall_score']}%
  Stability prediction   : {ri['stability_prediction']}
  Conflict probability   : {ri['conflict_probability']}%
  Top strengths          : {', '.join(ri['strengths'])}
  Risk areas             : {', '.join(ri['risks'])}

Dimension Scores:
  Behavioral similarity  : {ctx['vector_score']}%
  Emotional score        : {e['emotional_compatibility_score']}%
  Romantic score         : {r['romantic_compatibility_score']}%
  Intimacy score         : {s['sexual_compatibility_score']}%
  Love style compat.     : {ls['love_style_compatibility_score']}%
  Love language compat.  : {ll['love_language_compatibility_score']}%
  Element compat.        : {ctx['element_score']}
  Modality               : {ctx['modality_score']}

{na}'s dominant love style   : {ls['a_love_style']['dominant_style']}
{nb}'s dominant love style   : {ls['b_love_style']['dominant_style']}
{na}'s primary love language : {ll['a_love_language']['primary_language']}
{nb}'s primary love language : {ll['b_love_language']['primary_language']}

Required JSON structure:
{_compat_json_schema()}"""


def _prompt_zodiac_article(ctx: dict) -> str:
    z = ctx["zodiac"]
    name = ctx["a"].get("name", "")
    sign = z["sign"]
    element = z["element"]
    modality = z["modality"]
    traits = z["trait_vector"]

    # Ruling planet and archetype per sign
    ruling_planets = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
        "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
        "Libra": "Venus", "Scorpio": "Pluto/Mars", "Sagittarius": "Jupiter",
        "Capricorn": "Saturn", "Aquarius": "Uranus/Saturn", "Pisces": "Neptune/Jupiter",
    }
    archetypes = {
        "Aries": "The Pioneer", "Taurus": "The Sensualist", "Gemini": "The Messenger",
        "Cancer": "The Nurturer", "Leo": "The Sovereign", "Virgo": "The Analyst",
        "Libra": "The Diplomat", "Scorpio": "The Alchemist", "Sagittarius": "The Philosopher",
        "Capricorn": "The Architect", "Aquarius": "The Visionary", "Pisces": "The Dreamer",
    }
    ruling = ruling_planets.get(sign, "unknown")
    archetype = archetypes.get(sign, sign)

    name_clause = f"The article is personalised for {name}, a {sign}. Use {name}'s name where natural." if name else f"Write about {sign} in general."

    decan_str = _decan_block(z, name or sign)

    return f"""You are ZodicogAI, a behavioral and astrological intelligence engine. Write a rich, immersive, magazine-quality astrological profile for the zodiac sign {sign} — "{archetype}".

{name_clause}

Sign data:
  Sign       : {sign}  ({archetype})
  Element    : {element}
  Modality   : {modality}
  Ruling body: {ruling}
  Trait scores: Intensity {traits['intensity']:.2f}, Stability {traits['stability']:.2f}, Expressiveness {traits['expressiveness']:.2f}, Dominance {traits['dominance']:.2f}, Adaptability {traits['adaptability']:.2f}

{decan_str}

Instructions:
- Write in an engaging, insightful, and direct style — like the best astrology journalism. Conversational but intelligent.
- Be specific to {sign}. Do not write generic personality text. Every sentence should feel unmistakably like {sign}.
- Use metaphors and vivid language to bring the sign to life.
- Do not mention any other zodiac signs negatively. When listing best_matches, name exactly 4 signs.
- For famous_people list exactly 8 people who are {sign}: include a mix of (a) historically prominent and culturally influential figures (artists, leaders, scientists, icons — timeless names), and (b) currently trending or globally relevant celebrities as of today. Include birth dates in parentheses where known. Prioritize global recognisability and cultural diversity.
- Each string field should be 3–5 rich, detailed sentences.
- strengths: exactly 6 single-phrase traits (e.g. "Magnetic leadership")
- weaknesses: exactly 5 single-phrase traits (e.g. "Struggles with vulnerability")
- highest_expression: {sign} at their absolute best — when they are fully evolved, conscious, and integrated
- shadow_expression: {sign} at their worst — the unconscious patterns, fears, and destructive tendencies that emerge when they are unaware

Required JSON structure:
{{
  "overview":              "<3-5 sentences — the essence of {sign}: mythology, symbol, what drives them at the core>",
  "the_symbol":            "<3-5 sentences — the symbol's meaning, the mythology behind the sign, ruling planet's influence>",
  "personality":           "<4-6 sentences — full personality breakdown: how they think, feel, act, what they need, their contradictions>",
  "modality_profile":      "<2-3 sentences — what it means that {sign} is a {modality} sign: how this modality shapes their approach to life, relationships, and change; what they initiate, sustain, or adapt — and how this is both their gift and their challenge>",
  "highest_expression":    "<2-3 sentences — {sign} fully evolved: their gifts at peak, the consciousness level they can reach>",
  "shadow_expression":     "<2-3 sentences — {sign} in shadow: the unconscious, the destructive pattern, the fear that drives it>",
  "strengths":             ["<trait 1>", "<trait 2>", "<trait 3>", "<trait 4>", "<trait 5>", "<trait 6>"],
  "weaknesses":            ["<trait 1>", "<trait 2>", "<trait 3>", "<trait 4>", "<trait 5>"],
  "in_love":               "<3-5 sentences — how {sign} loves, what they need in a partner, their romantic style, how they behave in relationships>",
  "as_a_friend":           "<3-4 sentences — {sign} as a friend: loyalty, social style, what they offer, what they expect>",
  "career_and_ambition":   "<3-4 sentences — work ethic, natural career paths, how they lead or collaborate, relationship with success>",
  "tips_for_relating":     "<3-4 sentences — practical, specific advice for anyone relating to a {sign}: what works, what doesn't, what they secretly need>",
  "best_matches":          ["<sign 1>", "<sign 2>", "<sign 3>", "<sign 4>"],
  "famous_people":         ["<name (birth date)>", "<name (birth date)>", "<name (birth date)>", "<name (birth date)>", "<name (birth date)>", "<name (birth date)>", "<name (birth date)>", "<name (birth date)>"]
}}"""


def _prompt_color_single(ctx: dict) -> str:
    name  = ctx["a"].get("name", "this person")
    sign  = ctx["zodiac"]["sign"]
    color = ctx["color"]
    kw    = ", ".join(color["keywords"])
    return f"""You are ZodicogAI, a color-energy intelligence engine.

{name}'s zodiac sign is {sign}.

Their SPIRITUAL AURA COLOR is {color['name']} ({color['hex']}) — the energy field they radiate: {kw}.
Their CLASSIC POWER COLOR is {color['power_name']} ({color['power_hex']}) — the archetype color that amplifies their nature.
Their 2026 COSMIC COLOR is {color['power_2026']} — this year's aligned shade for their sign.

Write a rich, insightful color-energy reading for {name} weaving all three color layers.
Reference the aura color as their core energy. Mention the classic power color's amplifying effect.
Include a brief 2026 cosmic alignment note — how the year's color calls them to act now.

Do not include any explanation, markdown, or text outside the JSON.

Required JSON structure:
{{
  "color_meaning": "<2-3 sentences on what {name}'s aura color reveals about their soul, energy, and essence>",
  "love_energy":   "<2-3 sentences on how their color energy shows up in {name}'s romantic life>",
  "color_advice":  "<2-3 sentences on how {name} should harness all three colors: wear them, decorate with them, meditate on them — include the 2026 shade>",
  "power_colors":  ["<complementary color 1 that amplifies {name}'s energy>", "<color 2>", "<color 3>"]
}}"""


def _prompt_color_pair(ctx: dict) -> str:
    na, nb = _names(ctx)
    ch = ctx["color_harmony"]
    ac, bc = ch["a_color"], ch["b_color"]
    mg, cp = ch["middle_ground"], ch["compatible_color"]
    return f"""You are ZodicogAI, a color-energy intelligence engine.

{na}'s color: {ac['name']} ({ac['hex']}) — energy: {', '.join(ac['keywords'])}
{nb}'s color: {bc['name']} ({bc['hex']}) — energy: {', '.join(bc['keywords'])}

Their blended middle-ground color: {mg['name']} ({mg['hex']})
Their harmonic compatible color (color-wheel complement of the blend): {cp['name']} ({cp['hex']})

Write a rich color-energy compatibility reading for {na} and {nb}.
Use their names throughout. Be specific to the interplay of their colors' energies.
Do not include any explanation, markdown, or text outside the JSON.

Required JSON structure:
{{
  "color_harmony":              "<2-3 sentences on how their colors interact — clash, complement, or create creative tension>",
  "compatible_color_meaning":   "<2-3 sentences on what the harmonic bridge color {cp['hex']} represents for this pair>",
  "middle_ground_meaning":      "<2-3 sentences on what their blended {mg['name']} color represents for the relationship>",
  "pair_advice":                "<2-3 sentences on how {na} and {nb} can use these colors together in their shared life>"
}}"""


def _prompt_numerology_single(ctx: dict) -> str:
    name = ctx["a"].get("name", "this person")
    n    = ctx["numerology"]
    return f"""You are ZodicogAI, a numerology intelligence engine.

{name}'s numerological profile:
  Life Path Number  : {n['life_path_number']} — {n['number_title']}
  Expression Number : {n['expression_number']}
  Lucky Number      : {n['lucky_number']}
  Core theme        : {n['number_core']}
  Love note         : {n['love_note']}
  Strengths         : {', '.join(n['strengths'])}
  Challenges        : {', '.join(n['challenges'])}

Write a rich, immersive numerological reading for {name}.
Ground every insight in their Life Path {n['life_path_number']} and its archetype "{n['number_title']}".
Use {name}'s name throughout. Be specific, bold, and insightful.
Do not include any explanation, markdown, or text outside the JSON.

Required JSON structure:
{{
  "life_path_reading":      "<3-4 sentences on what Life Path {n['life_path_number']} means for {name}'s destiny and soul purpose>",
  "love_and_relationships": "<2-3 sentences on {name}'s numerological approach to love, attraction, and partnership>",
  "career_and_purpose":     "<2-3 sentences on career calling and life mission encoded in {name}'s numbers>",
  "spiritual_theme":        "<2-3 sentences on karmic lessons, spiritual growth, and what the universe is teaching {name}>",
  "shadow_challenge":       "<2-3 sentences on the shadow side: what {name} must overcome to fully embody their number>"
}}"""


def _prompt_numerology_pair(ctx: dict) -> str:
    na, nb = _names(ctx)
    an, bn = ctx["a_numerology"], ctx["b_numerology"]
    compat = ctx["numerology_compat"]
    signal = compat["pursue_signal"].upper()
    return f"""You are ZodicogAI, a numerology intelligence engine.

{na}: Life Path {an['life_path_number']} ({an['number_title']}), Expression {an['expression_number']}, Lucky {an['lucky_number']}
{nb}: Life Path {bn['life_path_number']} ({bn['number_title']}), Expression {bn['expression_number']}, Lucky {bn['lucky_number']}

Numerology Compatibility:
  Overall score     : {compat['compatibility_score']}%
  Life-path match   : {compat['life_path_score']}%
  Expression match  : {compat['expression_score']}%
  Cross-pair score  : {compat['cross_score']}%
  Signal            : {signal}

Write a full numerological compatibility reading for {na} and {nb}, including a SWOT analysis.
Use their names throughout. Be bold, direct, and specific to their numbers.
Do not include any explanation, markdown, or text outside the JSON.

Required JSON structure:
{{
  "compatibility_reading": "<2-3 sentences on the core numerological dynamic between {na} and {nb}>",
  "swot_strengths":        ["<shared strength 1>", "<shared strength 2>", "<shared strength 3>"],
  "swot_weaknesses":       ["<shared weakness 1>", "<shared weakness 2>"],
  "swot_opportunities":    ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "swot_threats":          ["<threat 1>", "<threat 2>"],
  "pursue_or_avoid":       "<clear recommendation based on the {compat['compatibility_score']}% score: pursue, proceed with caution, or avoid — 2 sentences explaining why>",
  "pair_advice":           "<2-3 sentences of actionable advice for this numerological pairing>"
}}"""


# --- /discover prompt builders --------------------------------------------

def _prompt_archetype(ctx: dict) -> str:
    name = ctx["a"].get("name", "this person")
    sign = ctx["zodiac"]["sign"]
    mbti = ctx["mbti"]["type"]
    ad   = ctx["archetype_data"]
    hook = ctx.get("insight_hook", {})
    tv   = ad.get("trait_vector", {})
    return f"""You are ZodicogAI, writing a /discover identity reading for {name}.

You are NOT writing analysis. You are writing a vivid, direct, personal revelation.
Rules:
- Name {name} by name in every field. Never "this person" or "they".
- Be bold and direct. No hedging. Assert as fact.
- Every sentence must feel earned — specific to {name}'s archetype, not generic.
- Use the deterministic data below as anchors. Gemini writes the prose around it.

Identity data for {name}:
  Sign     : {sign}
  MBTI     : {mbti}
  Archetype: {ad['archetype']} — "{ad['archetype_tagline']}"
  Shadow   : {ad['shadow']}
  In love  : {ad['in_love']}
  Compat.  : {ad['compatibility_note']}
  Trait vector — Intensity {tv.get('intensity',5)}, Stability {tv.get('stability',5)}, Expressiveness {tv.get('expressiveness',5)}, Dominance {tv.get('dominance',5)}, Adaptability {tv.get('adaptability',5)}
  Viral hook: "{hook.get('hook', '')}"

Required JSON structure:
{{
  "archetype_prose":    "<3-4 sentences: who {name} IS as {ad['archetype']}. Personal, bold, specific to this archetype>",
  "shadow_deep_dive":   "<2-3 sentences: the shadow of {ad['archetype']} — what {name} does when unaware, and why>",
  "in_love_prose":      "<2-3 sentences: how {name} shows up in love as {ad['archetype']}. Specific dynamics, not generic>",
  "compatibility_prose":"<2-3 sentences: what {name} needs in a partner. What they attract, what drains them>",
  "growth_invitation":  "<2 sentences: the one invitation for {name} to evolve beyond their archetype's ceiling>"
}}"""


def _prompt_pattern(ctx: dict) -> str:
    name = ctx["a"].get("name", "this person")
    sign = ctx["zodiac"]["sign"]
    mbti = ctx["mbti"]["type"]
    pd   = ctx["pattern_data"]
    hook = ctx.get("insight_hook", {})
    tv   = pd.get("trait_vector", {})
    return f"""You are ZodicogAI, writing a /discover relationship pattern reading for {name}.

This is a personal revelation — not analysis. Direct, specific, earned.
Rules:
- Name {name} by name throughout. No "they" or "this person".
- Speak in second person where natural ("you do this") for added impact.
- Build on the deterministic data — Gemini writes vivid prose around it, not instead of it.

Pattern data for {name}:
  Sign            : {sign}
  MBTI            : {mbti}
  Pattern         : {pd['pattern_display']} ({pd['pattern_label']})
  Confidence      : {pd['pattern_score']}%
  Shadow behaviour: {pd['shadow_behaviour']}
  Root cause      : {pd['root_cause']}
  Break the cycle : {pd['break_the_cycle']}
  Trait vector — Intensity {tv.get('intensity',5)}, Stability {tv.get('stability',5)}, Expressiveness {tv.get('expressiveness',5)}, Dominance {tv.get('dominance',5)}, Adaptability {tv.get('adaptability',5)}
  Viral hook: "{hook.get('hook', '')}"

Required JSON structure:
{{
  "pattern_prose":         "<3-4 sentences: what {name}'s pattern looks like in real life. Specific scenes, not abstract>",
  "shadow_deep_dive":      "<2-3 sentences: the shadow behaviour — what it looks like when it's at its worst for {name}>",
  "root_cause_prose":      "<2-3 sentences: why {name} does this — the emotional logic underneath the pattern>",
  "break_the_cycle_prose": "<2-3 sentences: the specific, actionable way {name} can interrupt this pattern>",
  "reframe":               "<1-2 sentences: a compassionate but honest reframe — not toxic positivity, just truth>"
}}"""


def _prompt_attraction(ctx: dict) -> str:
    name = ctx["a"].get("name", "this person")
    sign = ctx["zodiac"]["sign"]
    mbti = ctx["mbti"]["type"]
    ad   = ctx["attraction_data"]
    hook = ctx.get("insight_hook", {})
    tv   = ad.get("trait_vector", {})
    return f"""You are ZodicogAI, writing a /discover attraction archetype reading for {name}.

This is identity content — vivid, personal, shareable. Not clinical analysis.
Rules:
- Name {name} by name in every field.
- Be specific: name what {name} falls for, why, and what it costs them.
- Pull prose from the insight and traits below — not from nowhere.

Attraction data for {name}:
  Sign                : {sign}
  MBTI                : {mbti}
  Attraction archetype: {ad['attraction_archetype']}
  Pull traits         : {', '.join(ad['pull_traits'])}
  Avoidance traits    : {', '.join(ad['avoidance_traits'])}
  Core insight        : {ad['insight']}
  Confidence          : {ad['pattern_score']}%
  Trait vector — Intensity {tv.get('intensity',5)}, Stability {tv.get('stability',5)}, Expressiveness {tv.get('expressiveness',5)}, Dominance {tv.get('dominance',5)}, Adaptability {tv.get('adaptability',5)}
  Viral hook: "{hook.get('hook', '')}"

Required JSON structure:
{{
  "attraction_prose":    "<3-4 sentences: what {name} is drawn to and why. Name the feeling, the pattern, the pull>",
  "pull_deep_dive":      "<2-3 sentences: what specifically {name} finds irresistible — and the unconscious logic behind it>",
  "avoidance_deep_dive": "<2-3 sentences: what {name} avoids — and whether that avoidance is protecting them or limiting them>",
  "pattern_warning":     "<2 sentences: the pattern risk — what happens when {name}'s attraction profile goes unexamined>",
  "growth_invitation":   "<2 sentences: the evolution — what changes when {name} becomes conscious of this archetype>"
}}"""


def _prompt_recommendation(ctx: dict) -> str:
    name = ctx["a"].get("name", "this person")
    sign = ctx["zodiac"]["sign"]
    mbti = ctx["mbti"]["type"]
    rd   = ctx["recommendation_data"]
    hook = ctx.get("insight_hook", {})
    tv   = rd.get("trait_vector", {})
    return f"""You are ZodicogAI, writing a /discover taste profile reading for {name}.

This is identity content — show how {name}'s choices reveal their character.
Rules:
- Name {name} by name throughout.
- Make this feel like a personality reveal through taste — not a recommendation list.
- The prose should explain WHY these fit {name}, not just what they are.

Recommendation data for {name}:
  Sign              : {sign}
  MBTI              : {mbti}
  Gaming profile    : {rd['gaming_profile']} — genres: {', '.join(rd['gaming_genres'])} — titles: {', '.join(rd['gaming_titles'])}
  Gaming reasoning  : {rd['gaming_reasoning']}
  Movie profile     : {rd['movie_profile']} — genres: {', '.join(rd['movie_genres'])} — titles: {', '.join(rd['movie_titles'])}
  Movie reasoning   : {rd['movie_reasoning']}
  Sneaker profile   : {rd['sneaker_profile']} — brands: {', '.join(rd['sneaker_brands'])}
  Sneaker reasoning : {rd['sneaker_reasoning']}
  Trait vector — Intensity {tv.get('intensity',5)}, Stability {tv.get('stability',5)}, Expressiveness {tv.get('expressiveness',5)}, Dominance {tv.get('dominance',5)}, Adaptability {tv.get('adaptability',5)}
  Viral hook: "{hook.get('hook', '')}"

Required JSON structure:
{{
  "gaming_prose":  "<2-3 sentences: why these games fit {name}'s psychology specifically. What the genre reveals about them>",
  "movie_prose":   "<2-3 sentences: what {name}'s movie taste says about how they process emotion and story>",
  "sneaker_prose": "<2-3 sentences: what {name}'s footwear instincts reveal about their identity and self-expression>",
  "taste_profile": "<2-3 sentences: the through-line — what {name}'s taste in all three categories says about who they really are>"
}}"""


# --- Public entry point ---------------------------------------------------

_PROMPT_TEMPLATES: dict[str, callable] = {
    _HYBRID_ANALYSIS:               _prompt_hybrid,
    _COMPATIBILITY_ANALYSIS:        _prompt_compatibility,
    _EMOTIONAL_COMPATIBILITY:       _prompt_emotional,
    _ROMANTIC_COMPATIBILITY:        _prompt_romantic,
    _SEXTROLOGY_ANALYSIS:           _prompt_sextrology,
    _SEXTROLOGY_SOLO_ANALYSIS:      _prompt_sextrology_solo,
    _LOVE_STYLE_ANALYSIS:           _prompt_love_style,
    _LOVE_LANGUAGE_ANALYSIS:        _prompt_love_language,
    _FULL_RELATIONSHIP_INTELLIGENCE: _prompt_full,
    _ZODIAC_ARTICLE:                _prompt_zodiac_article,
    _COLOR_ANALYSIS:                _prompt_color_single,
    _COLOR_PAIR_ANALYSIS:           _prompt_color_pair,
    _NUMEROLOGY_ANALYSIS:           _prompt_numerology_single,
    _NUMEROLOGY_PAIR_ANALYSIS:      _prompt_numerology_pair,
    _ARCHETYPE_ANALYSIS:            _prompt_archetype,
    _PATTERN_ANALYSIS:              _prompt_pattern,
    _ATTRACTION_ANALYSIS:           _prompt_attraction,
    _RECOMMENDATION_ANALYSIS:       _prompt_recommendation,
}


def build_prompt(analysis_type: str, engine_results: dict) -> str:
    """
    Select the prompt template for analysis_type and fill it with engine_results.

    Args:
        analysis_type  : one of the analysis-type string constants.
        engine_results : the shared context dict produced by agent_controller
                         (contains keys like a_zodiac, b_zodiac, emotional, …).

    Returns:
        A fully rendered prompt string ready to pass to call_gemini().

    Raises:
        ValueError: if analysis_type has no registered template.
    """
    builder = _PROMPT_TEMPLATES.get(analysis_type)
    if builder is None:
        raise ValueError(f"No prompt template for analysis type: '{analysis_type}'")
    return builder(engine_results)


def build_stream_prompt(analysis_type: str, ctx: dict) -> str:
    """
    Build a prose narrative prompt for streaming endpoints.

    Unlike build_prompt(), this does NOT ask for JSON output.
    It asks Zodicognac to narrate the analysis as flowing text —
    this is what gets streamed live to the user via ConstellationStream.
    The structured data (scores, sub-scores, traits) is sent separately
    in the SSE done event.
    """
    na, nb = _names(ctx)

    if analysis_type == "romantic_compatibility":
        r = ctx.get("romantic", {})
        e = ctx.get("emotional", {})
        return (
            f"{_pair_header(ctx)}\n\n"
            f"Romantic Metrics:\n"
            f"  Romantic score: {r.get('romantic_compatibility_score', '?')}%\n"
            f"  Romantic polarity: {r.get('romantic_polarity_score', '?')}%\n"
            f"  Attachment pacing similarity: {r.get('attachment_pacing_similarity', '?')}%\n"
            f"  Affection expression alignment: {r.get('affection_expression_similarity', '?')}%\n"
            f"  Emotional compatibility: {e.get('emotional_compatibility_score', '?')}%\n\n"
            f"Write a flowing, personal romantic compatibility reading for {na} and {nb}. "
            f"Speak directly to them. Cover: the romantic dynamic between them, how they "
            f"express and receive love, the tension or harmony in their polarity, and one "
            f"concrete thing they can do to deepen their connection. "
            f"Do NOT output JSON. Write in prose. 150-250 words."
        )

    if analysis_type == "emotional_compatibility":
        e = ctx.get("emotional", {})
        return (
            f"{_pair_header(ctx)}\n\n"
            f"Emotional Metrics:\n"
            f"  Emotional compatibility score: {e.get('emotional_compatibility_score', '?')}%\n"
            f"  Bond depth: {e.get('bond_depth_score', '?')}%\n"
            f"  Conflict resolution: {e.get('conflict_resolution_score', '?')}%\n"
            f"  Empathy resonance: {e.get('empathy_resonance_score', '?')}%\n"
            f"  Attachment pacing: {e.get('attachment_pacing_similarity', '?')}%\n\n"
            f"Write a flowing, personal emotional compatibility reading for {na} and {nb}. "
            f"Speak directly to them. Cover: how safe they feel with each other emotionally, "
            f"how they handle conflict, their empathy dynamic, and one thing that will "
            f"deepen their emotional bond. "
            f"Do NOT output JSON. Write in prose. 150-250 words."
        )

    if analysis_type == "sextrology_analysis":
        s = ctx.get("sextrology", {})
        return (
            f"{_pair_header(ctx)}\n\n"
            f"Sextrology Metrics:\n"
            f"  Sextrology score: {s.get('score', '?')}%\n"
            f"  {na} archetype: {s.get('archetype_a', '?')}\n"
            f"  {nb} archetype: {s.get('archetype_b', '?')}\n"
            f"  Dynamic: {s.get('dynamic', '?')}\n\n"
            f"Write a flowing, direct sextrology reading for {na} and {nb}. "
            f"Speak directly to them using their names. Cover each person's intimate character, "
            f"how they interact together, the core dynamic, and long-term fire potential. "
            f"Be direct and explicit — no hedging. "
            f"Do NOT output JSON. Do NOT add a Solo Profile section. "
            f"Do NOT add any section beyond the pair reading. Stop after long-term fire. "
            f"150-250 words maximum."
        )

    if analysis_type == "sextrology_solo_analysis":
        zodiac  = ctx.get("zodiac",  {})
        mbti    = ctx.get("mbti",    {})
        sign    = zodiac.get("sign",    "Unknown")
        element = zodiac.get("element", "Unknown")
        mtype   = mbti.get("type",      "Unknown")
        return (
            f"{na} — {sign} ({element}) · {mtype}\n\n"
            f"Write a direct, personal sextrology profile for {na}. "
            f"Cover their intimate character, sexual archetype, what turns them on, "
            f"their erogenous zones, dominant fantasy style, and how they show up in intimacy. "
            f"Speak directly to {na}. Be explicit and confident — no hedging. "
            f"Do NOT output JSON. Write in prose. 150-200 words."
        )

    # Fallback — generic prose prompt
    return (
        f"Write a behavioral profile for {na}. "
        f"Be direct and specific. Do NOT output JSON. Write in prose. 100-150 words."
    )


# ---------------------------------------------------------------------------
# Blog article prompt builders
# ---------------------------------------------------------------------------

LOVE_LANG_LABELS = {
    "words-of-affirmation": "Words of Affirmation",
    "acts-of-service": "Acts of Service",
    "receiving-gifts": "Receiving Gifts",
    "quality-time": "Quality Time",
    "physical-touch": "Physical Touch",
}

LOVE_STYLE_LABELS = {
    "eros": "Eros (Passionate Love)",
    "storge": "Storge (Friendship Love)",
    "pragma": "Pragma (Practical Love)",
    "ludus": "Ludus (Playful Love)",
    "mania": "Mania (Obsessive Love)",
    "agape": "Agape (Selfless Love)",
}

LOVE_STYLE_DESCRIPTIONS = {
    "eros": "intense, romantic, passion-driven love based on physical and emotional attraction",
    "storge": "love that grows from deep friendship, familiarity, and shared history",
    "pragma": "mature, rational love that prioritises compatibility, shared values, and long-term stability",
    "ludus": "playful, non-committal love that values fun, flirting, and freedom",
    "mania": "obsessive, jealous love driven by fear of loss and emotional dependency",
    "agape": "unconditional, selfless love that gives without expectation of return",
}


def _prompt_love_lang_article(slug: str) -> str:
    label = LOVE_LANG_LABELS.get(slug, slug)
    return f"""You are ZodicogAI, a behavioral intelligence engine. Write a rich, magazine-quality educational article about the love language: **{label}**.

This article is for people who want to deeply understand this love language — how it works, why people need it, and how to use it in relationships.

Instructions:
- Write in an engaging, warm, and insightful tone — like the best relationship journalism.
- Be specific and practical. Give real examples and actionable advice.
- Each string field: 3–5 rich, well-developed sentences.
- signs_you_need_this: exactly 5 specific behavioral signs that reveal this is someone's primary love language.

Required JSON:
{{
  "overview": "<3-5 sentences — what this love language is, where it comes from, why it matters in relationships>",
  "how_to_express": "<3-5 sentences — practical guide on how to speak this love language to a partner who needs it>",
  "how_to_receive": "<3-4 sentences — what fills up a person who has this love language, what makes them feel truly loved>",
  "signs_you_need_this": ["<behavioral sign 1>", "<behavioral sign 2>", "<behavioral sign 3>", "<behavioral sign 4>", "<behavioral sign 5>"],
  "common_mistakes": "<3-4 sentences — the most common ways people get this love language wrong and how to avoid them>",
  "in_relationships": "<3-5 sentences — how this love language plays out in romantic relationships: conflicts, mismatches, compatibility>",
  "compatibility_notes": "<3-4 sentences — how {label} pairs with the other four love languages — which are harmonious, which create friction>",
  "growth_tips": "<3-4 sentences — how to grow in expressing and receiving this love language even if it doesn't come naturally>"
}}"""


def _prompt_love_style_article(slug: str) -> str:
    label = LOVE_STYLE_LABELS.get(slug, slug)
    desc = LOVE_STYLE_DESCRIPTIONS.get(slug, "")
    return f"""You are ZodicogAI, a behavioral intelligence engine. Write a rich, magazine-quality educational article about the love style: **{label}**.

{label} is {desc}.

This article is from sociologist John Alan Lee's color wheel theory of love (1973). Write as an expert in behavioral psychology and relationship dynamics.

Instructions:
- Write in an engaging, insightful tone — direct, warm, psychologically grounded.
- Each string field: 3–5 rich sentences.
- characteristics: exactly 6 specific traits that define someone with this love style.
- Be honest about both the gifts and the shadows of this style.

Required JSON:
{{
  "overview": "<3-5 sentences — what this love style is, its psychological roots, and how it shows up in people's lives>",
  "characteristics": ["<trait 1>", "<trait 2>", "<trait 3>", "<trait 4>", "<trait 5>", "<trait 6>"],
  "in_relationships": "<4-5 sentences — how this style plays out in romantic relationships: how they pursue, bond, conflict, and commit>",
  "shadow_side": "<3-4 sentences — the unconscious patterns, potential harms, and blind spots of this love style>",
  "compatibility": "<3-4 sentences — which other love styles harmonize well with {label} and which create friction — and why>",
  "growth_path": "<3-4 sentences — how someone with this style can grow into a more conscious, balanced way of loving>",
  "recognizing_this_style": "<3-4 sentences — how to identify this style in yourself or a partner — the telltale patterns and behaviors>"
}}"""


def _prompt_numerology_lp_article(number: str) -> str:
    master = number in ("11", "22", "33")
    label = f"Master Number {number}" if master else f"Life Path {number}"
    return f"""You are ZodicogAI, a behavioral intelligence engine. Write a rich, magazine-quality educational article about Numerology {label}.

{"This is a master number — do not reduce it. Master numbers carry amplified energy and higher spiritual calling." if master else f"Life Path {number} is calculated by reducing the birth date to a single digit."}

Instructions:
- Write in a warm, insightful, psychologically rich tone.
- Be specific to Life Path {number}. Every sentence should feel unmistakably about this number.
- Each string field: 3–5 rich sentences.
- core_themes: exactly 5 single-phrase themes (e.g. "Leadership and independence")
- famous_people: exactly 5 well-known real people with Life Path {number}

Required JSON:
{{
  "overview": "<3-5 sentences — the essence of Life Path {number}: what it means, its core energy, and what drives people with this life path>",
  "core_themes": ["<theme 1>", "<theme 2>", "<theme 3>", "<theme 4>", "<theme 5>"],
  "personality": "<4-5 sentences — full personality breakdown: how Life Path {number} people think, feel, behave, and what they need>",
  "love_and_relationships": "<3-5 sentences — how Life Path {number} loves, what they need in a partner, how they behave in relationships>",
  "career_and_purpose": "<3-4 sentences — natural career paths, work style, relationship with success and ambition>",
  "shadow_and_challenges": "<3-4 sentences — the unconscious patterns, fears, and growth edges of Life Path {number}>",
  "spiritual_meaning": "<2-3 sentences — the deeper spiritual or karmic significance of this life path>",
  "famous_people": ["<name>", "<name>", "<name>", "<name>", "<name>"]
}}"""


def _prompt_sextrology_guide() -> str:
    return """You are ZodicogAI, a behavioral intelligence engine. Write a comprehensive, magazine-quality educational guide to Sextrology — the study of how personality traits (zodiac sign + MBTI type) influence intimacy, sexual character, and long-term passion dynamics.

This guide should be educational, psychologically grounded, and tasteful — treating the subject with the same maturity as a relationship psychology textbook.

Instructions:
- Write in an engaging, intelligent, and direct tone.
- Be specific about the 6 dimensions ZodicogAI analyses: Sexual Character, Erogenous Zones, Fantasies, Positions & Dynamics, Emotional Needs, Long-Term Fire.
- the_6_dimensions: exactly 6 entries, one per dimension — each a concise description of what that dimension reveals.
- faq: exactly 5 common questions and answers about sextrology (format each as "Q: ... A: ...").

Required JSON:
{
  "what_is_sextrology": "<4-5 sentences — what sextrology is, where it comes from, how it differs from generic relationship advice, and why personality matters in intimacy>",
  "zodiac_and_intimacy": "<3-5 sentences — how zodiac signs shape intimacy: element differences (Fire vs Water vs Earth vs Air), modality influence, and archetypal patterns>",
  "mbti_and_intimacy": "<3-5 sentences — how MBTI cognitive functions influence intimacy: I/E, S/N, T/F, J/P differences in bedroom behaviour and emotional needs>",
  "the_6_dimensions": ["<Sexual Character — what this dimension reveals>", "<Erogenous Zones — what this dimension reveals>", "<Fantasies — what this dimension reveals>", "<Positions & Dynamics — what this dimension reveals>", "<Emotional Needs — what this dimension reveals>", "<Long-Term Fire — what this dimension reveals>"],
  "how_to_use": "<3-4 sentences — practical guide: how to use sextrology insights to improve intimacy, have better conversations with partners, and build deeper connection>",
  "faq": ["Q: ... A: ...", "Q: ... A: ...", "Q: ... A: ...", "Q: ... A: ...", "Q: ... A: ..."]
}"""


def _prompt_zodiac_compat_article(sign: str) -> str:
    return f"""You are ZodicogAI, a behavioral intelligence engine. Write a rich, magazine-quality compatibility guide for the zodiac sign {sign}.

This article explains how {sign} connects romantically with all four elements — Fire, Earth, Air, and Water — and which specific signs are most and least compatible.

Instructions:
- Write in an engaging, direct, astrologically grounded tone.
- Be specific to {sign}. Every sentence should feel unmistakably about {sign}'s way of loving.
- Each string field: 3–5 rich sentences.
- best_matches: exactly 3 zodiac signs that are {sign}'s strongest romantic matches
- challenging_matches: exactly 2 zodiac signs that create the most friction with {sign}

Required JSON:
{{
  "overview": "<3-5 sentences — {sign}'s overall approach to love, what they seek in a partner, their relationship archetype>",
  "relationship_style": "<3-5 sentences — how {sign} loves: their attachment style, how they pursue, bond, fight, and commit>",
  "best_matches": ["<sign 1>", "<sign 2>", "<sign 3>"],
  "challenging_matches": ["<sign 1>", "<sign 2>"],
  "fire_compatibility": "<2-3 sentences — how {sign} connects with Fire signs (Aries, Leo, Sagittarius) — what works, what clashes>",
  "earth_compatibility": "<2-3 sentences — how {sign} connects with Earth signs (Taurus, Virgo, Capricorn)>",
  "air_compatibility": "<2-3 sentences — how {sign} connects with Air signs (Gemini, Libra, Aquarius)>",
  "water_compatibility": "<2-3 sentences — how {sign} connects with Water signs (Cancer, Scorpio, Pisces)>",
  "dealbreakers": "<2-3 sentences — what {sign} absolutely cannot tolerate in a partner — the non-negotiables>",
  "what_they_need": "<2-3 sentences — what {sign} genuinely needs from a partner to feel secure, loved, and alive>"
}}"""


def _prompt_mbti_compat_article(mbti_type: str) -> str:
    return f"""You are ZodicogAI, a behavioral intelligence engine. Write a rich, magazine-quality compatibility guide for the MBTI type {mbti_type}.

This article explains how {mbti_type} connects romantically with others — their relationship strengths, needs, best pairings, and growth areas.

Instructions:
- Write in an engaging, psychologically sharp tone.
- Be specific to {mbti_type}. Mention their cognitive functions where relevant.
- Each string field: 3–5 rich sentences.
- best_matches: exactly 3 MBTI types that pair best with {mbti_type}
- challenging_matches: exactly 2 MBTI types that create the most friction

Required JSON:
{{
  "overview": "<3-5 sentences — {mbti_type}'s overall approach to relationships: what they seek, their relational archetype, how they show love>",
  "relationship_style": "<3-5 sentences — how {mbti_type} loves: their attachment patterns, how they pursue, communicate, fight, and commit>",
  "best_matches": ["<MBTI type 1>", "<MBTI type 2>", "<MBTI type 3>"],
  "challenging_matches": ["<MBTI type 1>", "<MBTI type 2>"],
  "what_they_need": "<3-4 sentences — what {mbti_type} genuinely needs from a partner to feel understood, valued, and secure>",
  "communication_in_love": "<3-4 sentences — how {mbti_type} communicates in relationships: their style, their blindspots, what they need from a partner's communication>",
  "dealbreakers": "<2-3 sentences — what {mbti_type} absolutely cannot tolerate in a partner>",
  "growth_in_relationships": "<3-4 sentences — the key growth edges {mbti_type} faces in relationships and how to work through them>"
}}"""


# ---------------------------------------------------------------------------
# Blog article generator — direct Gemini call (no engine pipeline)
# ---------------------------------------------------------------------------

from models.schemas import (
    LoveLangArticle, LoveStyleArticle, NumerologyLifePathArticle,
    SextrologyGuideArticle, ZodiacCompatArticle, MbtiCompatArticle,
    CelebrityArticle,
)


def generate_love_lang_article(slug: str) -> dict:
    prompt = _prompt_love_lang_article(slug)
    result = call_gemini(prompt, LoveLangArticle)
    return {"slug": slug, "label": LOVE_LANG_LABELS.get(slug, slug), "article": result.model_dump()}


def generate_love_style_article(slug: str) -> dict:
    prompt = _prompt_love_style_article(slug)
    result = call_gemini(prompt, LoveStyleArticle)
    return {"slug": slug, "label": LOVE_STYLE_LABELS.get(slug, slug), "article": result.model_dump()}


def generate_numerology_lp_article(number: str) -> dict:
    prompt = _prompt_numerology_lp_article(number)
    result = call_gemini(prompt, NumerologyLifePathArticle)
    return {"number": number, "article": result.model_dump()}


def generate_sextrology_guide() -> dict:
    prompt = _prompt_sextrology_guide()
    result = call_gemini(prompt, SextrologyGuideArticle)
    return {"article": result.model_dump()}


def generate_zodiac_compat_article(sign: str) -> dict:
    prompt = _prompt_zodiac_compat_article(sign)
    result = call_gemini(prompt, ZodiacCompatArticle)
    return {"sign": sign, "article": result.model_dump()}


def generate_mbti_compat_article(mbti_type: str) -> dict:
    prompt = _prompt_mbti_compat_article(mbti_type)
    result = call_gemini(prompt, MbtiCompatArticle)
    return {"type": mbti_type, "article": result.model_dump()}


# ---------------------------------------------------------------------------
# Celebrity profile generator
# ---------------------------------------------------------------------------

def _prompt_celebrity_bio(name: str, sign: str, born: str, nationality: str, category: str, life_path: int) -> str:
    return f"""You are a celebrity astrology writer. Write a short, engaging profile for {name}.

Celebrity: {name}
Born: {born}
Nationality: {nationality}
Field: {category}
Zodiac Sign: {sign}
Life Path Number: {life_path}

Return ONLY valid JSON (no markdown, no code fences) with exactly these fields:
{{
  "famous_for": "<1-2 sentences: what they are best known for in their career — be specific and factual>",
  "personality_snapshot": "<2-3 sentences: their {sign} personality expressed through their public life — weave in astrological traits naturally>",
  "love_style": "<1-2 sentences: how a {sign} approaches love and intimacy — tie it to what is publicly known about them if possible>",
  "compatibility_note": "<1 sentence: which zodiac signs they connect best with and why, given their {sign} nature>",
  "fun_fact": "<1 surprising or little-known fact about {name}>"
}}

Rules:
- Each field must be under 80 words
- Use present tense for living people, past tense for historical figures
- Be specific about their career achievements, not generic
- Keep the tone warm, insightful, and accessible"""


def generate_celebrity_bio(name: str, sign: str, born: str, nationality: str, category: str, life_path: int) -> dict:
    prompt = _prompt_celebrity_bio(name, sign, born, nationality, category, life_path)
    result = call_gemini(prompt, CelebrityArticle)
    return {"article": result.model_dump()}
