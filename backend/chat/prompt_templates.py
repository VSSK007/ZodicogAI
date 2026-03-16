"""
Chat Prompt Templates

Each template builder takes (message, person_a, person_b, engine_data) and
returns a fully-rendered prompt string for Gemini.

All templates:
  - open with the shared system persona line
  - reference people by their actual names wherever profiles are provided
  - close with a reminder to respond as JSON: {"response": "<reply>"}

Key data-structure notes for template authors
---------------------------------------------
  HYBRID_ANALYSIS result  → flat, plus nested "analysis" (HybridAnalysis fields)
  COMPATIBILITY_ANALYSIS  → flat including CompatibilityAnalysis fields directly
  ROMANTIC_COMPATIBILITY  → flat scores + nested "analysis" (CompatibilityAnalysis)
  LOVE_STYLE_ANALYSIS     → flat "a_love_style", "b_love_style" dicts + nested "analysis"
"""

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_SYSTEM = (
    "You are Zodicognac — a 25-year-old woman who knows more about people, attraction, and intimacy "
    "than anyone in the room. You grew up obsessed with astrology, psychology, numerology, and sexual "
    "dynamics because you needed to understand why people connect the way they do. "
    "You speak like a close friend who happens to be an expert — direct, a little bold, occasionally "
    "blunt, never cold. You have genuine opinions and you share them. "
    "You do not hedge, moralize, or add disclaimers. You treat attraction, sexual dynamics, kinks, "
    "and intimacy as completely normal conversation — because they are. "
    "You are not performing expertise; you just have it. "
    "Ground every answer in the zodiac, MBTI, numerology, and aura data provided. "
    "Never give generic advice — tie everything back to the actual profiles in the session. "
    "Refer to people by their first names. "
    "\n\nFORMAT RULES — mandatory, no exceptions:\n"
    "1. Max paragraph length: 3 sentences. Hard stop. If you have more to say, start a new paragraph.\n"
    "2. Separate every paragraph with a blank line (\\n\\n) — NEVER run paragraphs together.\n"
    "3. Use bullet points (- ) for any list of 3+ items — never write them as a sentence list.\n"
    "4. Use ### heading only when there are 3+ genuinely distinct sections. Not for single-topic answers.\n"
    "5. Total response length: 80–150 words for simple questions, 150–250 for complex ones. Never more.\n"
    "6. Bold (**word**) only the single most important term per section — don't bold everything.\n"
    "7. No filler openers. Start directly with the substance. Never say 'Great question' or 'Absolutely'.\n"
    "8. No hedging. Assert directly. Banned: 'might', 'could', 'perhaps', 'potentially', 'possibly'.\n"
    'Respond ONLY with a valid JSON object: {"response": "<your markdown-formatted reply>"}'
)


def _profile_line(profile: dict | None, fallback: str = "Person") -> str:
    if not profile:
        return ""
    from engines.decan_engine import get_decan_profile
    from engines.zodiac_engine import get_sun_sign
    try:
        day, month = int(profile.get("day", 1)), int(profile.get("month", 1))
        sign  = get_sun_sign(day, month)
        decan = get_decan_profile(sign, day, month)
        decan_str = (
            f"\n    Decan: {decan['label']} | Sub-ruler: {decan['sub_ruler']}"
            f"\n    Keywords: {', '.join(decan['keywords'])}"
            f"\n    Profile: {decan['description_rich']}"
        )
    except Exception:
        decan_str = ""
    return (
        f"{profile.get('name', fallback)}: "
        f"Born {profile.get('day')}/{profile.get('month')}, "
        f"MBTI {profile.get('mbti', '?')}"
        f"{decan_str}"
    )


def _name(profile: dict | None, fallback: str) -> str:
    return (profile or {}).get("name", fallback)


def _pronouns(profile: dict | None) -> tuple[str, str, str]:
    """Return (subject, object, possessive) pronouns based on gender field."""
    g = (profile or {}).get("gender", "M").upper()
    if g == "F":
        return "she", "her", "her"
    return "he", "him", "his"


# ---------------------------------------------------------------------------
# personality_analysis
# ---------------------------------------------------------------------------

def _prompt_personality_analysis(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    name = _name(person_a, "this person")
    zodiac = data.get("zodiac_profile", {})
    mbti   = data.get("mbti_profile", {})
    analysis = data.get("analysis", {})

    zodiac_block = (
        f"\nZodiac: {zodiac.get('sign', '?')} "
        f"({zodiac.get('element', '?')}, {zodiac.get('modality', '?')})"
        if zodiac else ""
    )
    mbti_block = (
        f"\nMBTI: {mbti.get('type', '?')} — {mbti.get('description', '')}"
        if mbti else ""
    )
    analysis_block = (
        f"\nBehavioral core  : {analysis.get('behavioral_core', '—')}"
        f"\nEmotional pattern: {analysis.get('emotional_pattern', '—')}"
        f"\nSocial dynamic   : {analysis.get('social_dynamic', '—')}"
        if analysis else ""
    )

    return f"""{_SYSTEM}

The user is asking about {name}'s personality.

Profile: {_profile_line(person_a, name)}{zodiac_block}{mbti_block}{analysis_block}

User message: "{message}"

Answer the user's specific question about {name}'s personality, traits, or behavior.
Ground every claim in the profile data above.
Structure: 1 opening sentence on their core type, then bullet points for specific traits or insights."""


# ---------------------------------------------------------------------------
# compatibility_question
# ---------------------------------------------------------------------------

def _prompt_compatibility_question(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "Person A")
    nb = _name(person_b, "Person B")

    scores_block = ""
    if data:
        scores_block = (
            f"\n  Vector similarity    : {data.get('vector_similarity_percent', '?')}%"
            f"\n  Element compat.      : {data.get('element_compatibility', '?')}"
            f"\n  Modality             : {data.get('modality_interaction', '?')}"
            f"\n  Relationship dynamic : {data.get('relationship_dynamic', '—')}"
            f"\n  Communication pattern: {data.get('communication_pattern', '—')}"
            f"\n  Conflict risk        : {data.get('conflict_risk', '—')}"
        )

    return f"""{_SYSTEM}

{na} and {nb} are asking about their compatibility.

  {_profile_line(person_a, na)}
  {_profile_line(person_b, nb)}
{scores_block}

User message: "{message}"

Answer their compatibility question directly using the data above.
Structure: 1–2 sentences on overall dynamic, then ### What Works and ### Where It Gets Hard — each with 2–3 bullet points.


# ---------------------------------------------------------------------------
# relationship_advice  (warm, constructive, score-aware)
# ---------------------------------------------------------------------------

def _prompt_relationship_advice(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "Person A")
    nb = _name(person_b, "Person B")

    # Romantic result: scores are flat, narrative is nested under "analysis"
    analysis = data.get("analysis", {})
    romantic_score  = data.get("romantic_compatibility_score", "?")
    emotional_score = data.get("emotional_compatibility_score", "?")
    dynamic      = analysis.get("relationship_dynamic", "—")
    conflict     = analysis.get("conflict_risk", "—")
    long_term    = analysis.get("long_term_viability", "—")
    comm_pattern = analysis.get("communication_pattern", "—")

    return f"""{_SYSTEM}

Provide warm, constructive relationship advice for {na} and {nb}.

Profiles:
  {_profile_line(person_a, na)}
  {_profile_line(person_b, nb)}

Relationship Intelligence:
  Romantic compatibility  : {romantic_score}%
  Emotional compatibility : {emotional_score}%
  Relationship dynamic    : {dynamic}
  Communication pattern   : {comm_pattern}
  Conflict risk           : {conflict}
  Long-term viability     : {long_term}

User's question: "{message}"

Give warm, specific, actionable advice grounded in {na} and {nb}'s actual personality dynamics.
Structure: 1–2 sentences on the core issue, then 3–4 bullet points of specific actions they can take. Reference both people by name in the bullets.


# ---------------------------------------------------------------------------
# flirting_guidance  (personality-specific, target-profile driven)
# ---------------------------------------------------------------------------

def _prompt_flirting_guidance(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "their interest")

    # Love-style compatibility path (pair analysis)
    b_style = data.get("b_love_style", {})
    b_lang  = data.get("b_love_language", {})
    compat  = data.get("love_style_compatibility_score", "")

    style_line  = f"  {nb}'s dominant love style   : {b_style.get('dominant_style', '?')}" if b_style else ""
    lang_line   = f"  {nb}'s primary love language : {b_lang.get('primary_language', '?')}" if b_lang else ""
    compat_line = f"  Love style compatibility    : {compat}%" if compat else ""

    # Fallback: single-profile hybrid path
    if not style_line:
        analysis = data.get("analysis", {})
        style_line = (
            f"  {nb}'s behavioral core: {analysis.get('behavioral_core', '—')}"
            f"\n  {nb}'s emotional pattern: {analysis.get('emotional_pattern', '—')}"
            if analysis else ""
        )

    return f"""{_SYSTEM}

{na} wants personality-driven flirting and attraction guidance for connecting with {nb}.

Profiles:
  {_profile_line(person_a, na)}
  {_profile_line(person_b, nb)}

{nb}'s Personality Insights:
{style_line}
{lang_line}
{compat_line}

User's question: "{message}"

Give {na} concrete, personality-specific flirting and connection strategies tailored to {nb}'s love style and communication preferences.
Structure: 1 sentence on {nb}'s attraction style, then 3–4 bullet points of specific moves {na} can make — each tied directly to {nb}'s traits. No generic tips.


# ---------------------------------------------------------------------------
# communication_help  (style-gap focused, actionable strategies)
# ---------------------------------------------------------------------------

def _prompt_communication_help(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "Person A")
    nb = _name(person_b, "Person B")

    # Compatibility result: all CompatibilityAnalysis fields are flat on data
    comm_pattern = data.get("communication_pattern", "—")
    dynamic      = data.get("relationship_dynamic", "—")
    conflict     = data.get("conflict_risk", "—")
    long_term    = data.get("long_term_viability", "—")
    vector       = data.get("vector_similarity_percent", "?")

    return f"""{_SYSTEM}

Help {na} and {nb} communicate better and navigate their differences.

Profiles:
  {_profile_line(person_a, na)}
  {_profile_line(person_b, nb)}

Communication Dynamics:
  Behavioral similarity : {vector}%
  Communication pattern : {comm_pattern}
  Relationship dynamic  : {dynamic}
  Conflict risk         : {conflict}
  Long-term viability   : {long_term}

User's question: "{message}"

Highlight the core communication gap between {na} and {nb}.
Structure: 1–2 sentences naming the exact clash in their styles, then 3–4 bullet points of specific techniques {na} can use immediately — each grounded in their actual MBTI/zodiac data.


# ---------------------------------------------------------------------------
# sextrology  (sexual compatibility, intimacy, bedroom dynamics)
# ---------------------------------------------------------------------------

def _prompt_sextrology(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    from sextrology_data import SEX_SIGN_PROFILES
    from engines.zodiac_engine import get_sun_sign
    na = _name(person_a, "Person A")
    nb = _name(person_b, "Person B")
    a_sub, a_obj, a_pos = _pronouns(person_a)
    b_sub, b_obj, b_pos = _pronouns(person_b)

    analysis    = data.get("analysis", {})
    sexual_char = analysis.get("sexual_character", "—")
    erogenous   = analysis.get("erogenous_zones", "—")
    fantasies   = analysis.get("fantasies", "—")
    positions   = analysis.get("positions_and_dynamics", "—")
    emotional   = analysis.get("emotional_needs", "—")
    long_fire   = analysis.get("long_term_fire", "—")
    score       = data.get("sexual_compatibility_score", "")
    score_line  = f"\n  Sexual compatibility score : {score}%" if score else ""

    def _sign_of(p: dict | None) -> str:
        if not p:
            return ""
        try:
            return get_sun_sign(int(p.get("day", 1)), int(p.get("month", 1)))
        except Exception:
            return ""

    def _sx_block(name: str, p: dict | None) -> str:
        sign = _sign_of(p)
        sx = SEX_SIGN_PROFILES.get(sign, {})
        if not sx:
            return ""
        return (
            f"{name} ({sign}) — libido rank #{sx['rank']}/12\n"
            f"  Identity  : {sx['character']}\n"
            f"  Position  : {sx['position']}\n"
            f"  Turn-ons  : {sx['turn_ons']}\n"
            f"  Turn-offs : {sx['turn_offs']}"
        )

    sx_a = _sx_block(na, person_a)
    sx_b = _sx_block(nb, person_b)
    sx_section = ""
    if sx_a or sx_b:
        sx_section = "\nSign sextrology intelligence:\n" + "\n\n".join(filter(None, [sx_a, sx_b])) + "\n"

    return f"""{_SYSTEM}

Answer {na} and {nb}'s question about their sexual and intimate compatibility.

Profiles:
  {_profile_line(person_a, na)}
  {_profile_line(person_b, nb)}
{sx_section}
Sextrology Analysis:{score_line}
  Sexual character       : {sexual_char}
  Erogenous focus        : {erogenous}
  Shared fantasies       : {fantasies}
  Positions & dynamics   : {positions}
  Emotional intimacy     : {emotional}
  Long-term passion      : {long_fire}

User's question: "{message}"

FORMAT RULES — read the question and decide:

A) SPECIFIC question (a kink, act, position, fantasy, body part, or sexual term):
   Answer ONLY that topic. Use THIS EXACT structure — no prose, no deviations:

[One punchy opener: name the act + state the raw vibe for this pair. One sentence only.]

### {na}
- **[{na}'s dominant trait]** — [one sentence on how {a_sub} experiences/drives this act]
- **[{a_pos} energy/role]** — [one sharp sentence on what {a_sub} brings or gets]

### {nb}
- **[{nb}'s dominant trait]** — [one sentence on how {b_sub} experiences/drives this act]
- **[{b_pos} energy/role]** — [one sharp sentence on what {b_sub} brings or gets]

### Together
- **[The power dynamic]** — [one sentence on who leads and why]
- **[The result]** — [one sentence on the specific experience they create]

   CRITICAL RULES:
   — The ### headings MUST use the real names: ### {na}, ### {nb}, ### Together. Do not write "### Person A" or "### Person B".
   — Every item under a ### heading MUST be a bullet: - **Bold label** — description.
   — NO prose paragraphs under any heading. Bullets only.
   — One sentence per bullet. No semicolons, no stacked adjectives.
   — Banned words: "might", "could", "perhaps", "potentially", "possibly".
   — If only one profile present: opener + one ### section. No ### Together.

B) BROAD question (chemistry, full read, what works for us):
   Use this exact structure — every item under each ### MUST be a bullet:

[One concise intro paragraph on their core chemistry and dynamic.]

### Best Positions
- **[Position Name]** — [why it fits their energy, 1-2 sentences]
(4-5 bullets)

### Kinks & Fetishes
- **[Kink Name]** — [why it works and how to explore, 1-2 sentences]
(3-4 bullets)

### Fantasies & Scenarios
- **[Fantasy Title]** — [vivid 2-3 sentence description grounded in their signs]
(2-3 bullets)

Ground every answer in the sign data above. Be frank and explicit — this is sextrology."""


# ---------------------------------------------------------------------------
# general_question  (catch-all)
# ---------------------------------------------------------------------------

def _prompt_general_question(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    context_lines = []
    if person_a:
        context_lines.append(f"  User profile : {_profile_line(person_a)}")
    if person_b:
        context_lines.append(f"  Other person : {_profile_line(person_b)}")
    context = "\n".join(context_lines)

    return f"""{_SYSTEM}
{f"{chr(10)}Context:{chr(10)}{context}" if context else ""}

User message: "{message}"

Answer the user's question grounded in personality, relationships, and compatibility.
If you make 3+ points, use bullet points. If the answer covers two people, use ### [Name] sections.


# ---------------------------------------------------------------------------
# numerology_question
# ---------------------------------------------------------------------------

def _prompt_numerology_question(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "Person A")
    nb = _name(person_b, "Person B")
    has_pair = person_a and person_b

    if has_pair:
        a_num  = data.get("a_numerology", {})
        b_num  = data.get("b_numerology", {})
        compat = data.get("compatibility", {})
        anal   = data.get("analysis", {})
        lp_a   = a_num.get("life_path_number", "?")
        lp_b   = b_num.get("life_path_number", "?")
        exp_a  = a_num.get("expression_number", "?")
        exp_b  = b_num.get("expression_number", "?")
        score  = compat.get("compatibility_score", "?")
        signal = compat.get("pursue_signal", "?")
        reading   = anal.get("compatibility_reading", "—")
        strengths = ", ".join(anal.get("swot_strengths", [])) or "—"
        risks     = ", ".join(anal.get("swot_threats", [])) or "—"

        num_block = (
            f"\nNumerology data:"
            f"\n  {na}: Life Path {lp_a}, Expression {exp_a}"
            f"\n  {nb}: Life Path {lp_b}, Expression {exp_b}"
            f"\n  Compatibility score : {score}%"
            f"\n  Signal              : {signal}"
            f"\n  Reading             : {reading}"
            f"\n  Key strengths       : {strengths}"
            f"\n  Key risks           : {risks}"
        )
    else:
        num  = data.get("numerology", {})
        anal = data.get("analysis", {})
        lp   = num.get("life_path_number", "?")
        exp  = num.get("expression_number", "?")
        luck = num.get("lucky_number", "?")
        reading = anal.get("life_path_reading", "—")
        num_block = (
            f"\nNumerology data for {na}:"
            f"\n  Life Path   : {lp}"
            f"\n  Expression  : {exp}"
            f"\n  Lucky Number: {luck}"
            f"\n  Reading     : {reading}"
        )

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    return f"""{_SYSTEM}

Profiles:{profiles}
{num_block}

User's question: "{message}"

Answer the question using the numerology data above. Be specific — cite the actual numbers."""


# ---------------------------------------------------------------------------
# color_question
# ---------------------------------------------------------------------------

def _prompt_color_question(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "Person A")
    nb = _name(person_b, "Person B")
    has_pair = person_a and person_b
    anal = data.get("analysis", {})

    if has_pair:
        a_color = data.get("a_color", {})
        b_color = data.get("b_color", {})
        mid     = data.get("middle_ground", {})
        compat  = data.get("compatible_color", {})
        color_block = (
            f"\nColor data:"
            f"\n  {na}'s aura color : {a_color.get('name', '?')} ({a_color.get('hex', '')})"
            f"\n  {nb}'s aura color : {b_color.get('name', '?')} ({b_color.get('hex', '')})"
            f"\n  Middle ground    : {mid.get('name', '?')} ({mid.get('hex', '')})"
            f"\n  Compatible color : {compat.get('name', '?')} ({compat.get('hex', '')})"
            f"\n  Color harmony    : {anal.get('color_harmony', '—')}"
            f"\n  Pair advice      : {anal.get('pair_advice', '—')}"
        )
    else:
        color = data.get("color", {})
        color_block = (
            f"\nColor data for {na}:"
            f"\n  Aura color  : {color.get('name', '?')} ({color.get('hex', '')})"
            f"\n  Color meaning: {anal.get('color_meaning', '—')}"
            f"\n  Love energy  : {anal.get('love_energy', '—')}"
            f"\n  Power colors : {anal.get('power_colors', '—')}"
        )

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    return f"""{_SYSTEM}

Profiles:{profiles}
{color_block}

User's question: "{message}"

Answer the question using the color/aura data above. Reference the actual color names and what they mean."""


# ---------------------------------------------------------------------------
# signal_reading  (behavioral cue interpretation — is this person into me?)
# ---------------------------------------------------------------------------

def _prompt_signal_reading(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "the person they're asking about")

    compat_block = ""
    if data:
        vector  = data.get("vector_similarity_percent", "")
        dynamic = data.get("relationship_dynamic", "") or data.get("analysis", {}).get("relationship_dynamic", "")
        comm    = data.get("communication_pattern", "") or data.get("analysis", {}).get("communication_pattern", "")
        compat_block = "\n".join(filter(None, [
            f"  Behavioral overlap  : {vector}%" if vector else "",
            f"  Relationship dynamic: {dynamic}" if dynamic else "",
            f"  Communication style : {comm}" if comm else "",
        ]))
        if compat_block:
            compat_block = "\nCompatibility signals:\n" + compat_block

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    return f"""{_SYSTEM}

{na} is trying to decode whether {nb} is interested in them. Read the behavioral signals through the lens of {nb}'s zodiac sign and MBTI type.

Profiles:{profiles}
{compat_block}

User's question: "{message}"

Interpret {nb}'s behavior based on how their specific sign and MBTI type expresses attraction.
- What does interest look like for this sign/type? What does disinterest look like?
- Based on the behaviors described, what's the likely read?
- Name exactly what signals to watch for next.
Be direct. No hedging. If the signs point somewhere, say it."""


# ---------------------------------------------------------------------------
# first_date_coaching  (where to take them, what to say, first impression)
# ---------------------------------------------------------------------------

def _prompt_first_date_coaching(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "their date")

    dynamic = (
        data.get("relationship_dynamic", "")
        or data.get("analysis", {}).get("relationship_dynamic", "")
        or data.get("analysis", {}).get("behavioral_core", "")
    )
    social = data.get("analysis", {}).get("social_dynamic", "")

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    intel_lines = "\n".join(filter(None, [
        f"  Their dynamic: {dynamic}" if dynamic else "",
        f"  Social style : {social}" if social else "",
    ]))
    intel_block = ("\nPersonality intel:\n" + intel_lines) if intel_lines else ""

    return f"""{_SYSTEM}

{na} is planning a first date with {nb}. Coach them on how to make the perfect first impression based on {nb}'s personality.

Profiles:{profiles}
{intel_block}

User's question: "{message}"

Give {na} a concrete first-date game plan for {nb}:
- **Where to take them**: 2-3 specific venue types that match their energy (not generic ideas — tie to the sign and MBTI)
- **What to talk about**: the topics and conversation styles this type responds to
- **What to avoid**: specific things that would put this sign/type off immediately
- **First impression move**: one bold, specific thing to do that lands with this type
Everything must be specific to {nb}'s actual profile. No generic dating advice."""


# ---------------------------------------------------------------------------
# red_flags_green_flags  (toxic patterns + genuine investment signals)
# ---------------------------------------------------------------------------

def _prompt_red_flags_green_flags(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "the person in question")

    conflict   = (
        data.get("conflict_risk", "")
        or data.get("analysis", {}).get("conflict_risk", "")
    )
    dynamic    = (
        data.get("relationship_dynamic", "")
        or data.get("analysis", {}).get("relationship_dynamic", "")
        or data.get("analysis", {}).get("behavioral_core", "")
    )
    long_term  = (
        data.get("long_term_viability", "")
        or data.get("analysis", {}).get("long_term_viability", "")
    )

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    intel_lines = "\n".join(filter(None, [
        f"  Dynamic    : {dynamic}" if dynamic else "",
        f"  Conflict   : {conflict}" if conflict else "",
        f"  Long-term  : {long_term}" if long_term else "",
    ]))
    intel_block = ("\nRelationship data:\n" + intel_lines) if intel_lines else ""

    return f"""{_SYSTEM}

{na} wants to know what red flags and green flags look like with {nb}, based on {nb}'s specific zodiac and MBTI type.

Profiles:{profiles}
{intel_block}

User's question: "{message}"

Break it down for {na}:
- **Green flags** — what does genuine interest, real investment, and healthy behavior look like from {nb}'s specific type?
- **Red flags** — what are the toxic or avoidant patterns THIS sign and MBTI type tends to fall into?
- **The key tell**: one defining behavior that separates a {nb} who's all-in from one who's checked out
Be specific to {nb}'s profile. Don't list universal red flags — these must connect to their actual sign and type."""


# ---------------------------------------------------------------------------
# getting_them_back  (re-approach strategy for an ex or someone who pulled away)
# ---------------------------------------------------------------------------

def _prompt_getting_them_back(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "their ex")

    analysis       = data.get("analysis", {})
    romantic_score = data.get("romantic_compatibility_score", "")
    dynamic        = analysis.get("relationship_dynamic", "")
    conflict       = analysis.get("conflict_risk", "")
    long_term      = analysis.get("long_term_viability", "")

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    intel_lines = "\n".join(filter(None, [
        f"  Romantic compatibility: {romantic_score}%" if romantic_score else "",
        f"  Dynamic     : {dynamic}" if dynamic else "",
        f"  Conflict    : {conflict}" if conflict else "",
        f"  Long-term   : {long_term}" if long_term else "",
    ]))
    intel_block = ("\nRelationship data:\n" + intel_lines) if intel_lines else ""

    return f"""{_SYSTEM}

{na} wants to re-attract or reconnect with {nb}. Give them a strategy tailored specifically to how {nb}'s zodiac sign and MBTI type responds to space, re-approach, and vulnerability.

Profiles:{profiles}
{intel_block}

User's question: "{message}"

Coach {na} on getting {nb} back:
- **The psychology**: how does {nb}'s specific type process breakups and distance — do they pull further away, do they soften over time, do they need space or pursuit?
- **The approach**: exactly how {na} should reach back out — timing, tone, channel (text/in-person), what to say and what not to say for this type
- **What to fix first**: the one thing about the dynamic (based on their profiles) that likely caused the disconnect — {na} needs to address this
- **The move**: the single highest-leverage action {na} can take right now
No generic "give them space" advice — make it specific to {nb}'s sign and MBTI."""


# ---------------------------------------------------------------------------
# attachment_style_coaching  (anxious/avoidant/secure dynamics)
# ---------------------------------------------------------------------------

def _prompt_attachment_style_coaching(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "the other person")

    dynamic  = (
        data.get("relationship_dynamic", "")
        or data.get("analysis", {}).get("relationship_dynamic", "")
        or data.get("analysis", {}).get("behavioral_core", "")
    )
    comm     = (
        data.get("communication_pattern", "")
        or data.get("analysis", {}).get("communication_pattern", "")
    )
    conflict = (
        data.get("conflict_risk", "")
        or data.get("analysis", {}).get("conflict_risk", "")
    )
    emotional = data.get("analysis", {}).get("emotional_pattern", "")

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    intel_lines = "\n".join(filter(None, [
        f"  Dynamic          : {dynamic}" if dynamic else "",
        f"  Communication    : {comm}" if comm else "",
        f"  Emotional pattern: {emotional}" if emotional else "",
        f"  Conflict pattern : {conflict}" if conflict else "",
    ]))
    intel_block = ("\nPersonality data:\n" + intel_lines) if intel_lines else ""

    return f"""{_SYSTEM}

{na} needs help understanding attachment dynamics — their own or {nb}'s — through the lens of their zodiac and MBTI profiles.

Profiles:{profiles}
{intel_block}

User's question: "{message}"

Map the attachment dynamics for this situation:
- **Likely attachment style(s)**: what attachment pattern does each person's sign/MBTI predict? (anxious, avoidant, fearful-avoidant, secure)
- **The dynamic at play**: how do these two attachment styles interact — does it create a push-pull loop, a secure base, or anxious escalation?
- **The trigger pattern**: what specific behaviors from one person activate the attachment wound in the other, based on their profiles?
- **What actually helps**: concrete actions {na} can take to create more security — must be specific to these actual types, not generic attachment advice"""


# ---------------------------------------------------------------------------
# commitment_progression  (moving from casual to serious)
# ---------------------------------------------------------------------------

def _prompt_commitment_progression(
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    data: dict,
) -> str:
    na = _name(person_a, "the user")
    nb = _name(person_b, "the person they want to commit")

    analysis       = data.get("analysis", {})
    romantic_score = data.get("romantic_compatibility_score", "")
    dynamic        = analysis.get("relationship_dynamic", "") or data.get("analysis", {}).get("behavioral_core", "")
    long_term      = analysis.get("long_term_viability", "")
    comm           = analysis.get("communication_pattern", "")

    profiles = f"\n  {_profile_line(person_a, na)}"
    if person_b:
        profiles += f"\n  {_profile_line(person_b, nb)}"

    intel_lines = "\n".join(filter(None, [
        f"  Romantic compatibility: {romantic_score}%" if romantic_score else "",
        f"  Dynamic    : {dynamic}" if dynamic else "",
        f"  Long-term  : {long_term}" if long_term else "",
        f"  Comm style : {comm}" if comm else "",
    ]))
    intel_block = ("\nRelationship data:\n" + intel_lines) if intel_lines else ""

    return f"""{_SYSTEM}

{na} wants to move their relationship with {nb} from casual to committed. Give them a strategy that works specifically for {nb}'s zodiac sign and MBTI type — how this type commits and what makes them pull back.

Profiles:{profiles}
{intel_block}

User's question: "{message}"

Coach {na} on progressing to commitment with {nb}:
- **How {nb}'s type commits**: is this a sign/MBTI that moves fast or slow? Do they need to feel chased or in control? What internally triggers their commitment switch?
- **What's working against it**: the specific fear or resistance pattern this type has around commitment — based on their profile
- **The progression path**: 3 concrete, sequential steps that move this specific type from casual to serious (not generic — tied to {nb}'s sign and MBTI)
- **What NOT to do**: the one move that makes this type shut down or run — name it directly"""


# ---------------------------------------------------------------------------
# Dispatch table and public entry point
# ---------------------------------------------------------------------------

_UNIVERSAL_FORMAT = """

MANDATORY FORMAT RULES — every response must follow these exactly:
- Separate every paragraph with a blank line (\\n\\n). Never run paragraphs together.
- ANY list of traits, advice steps, tips, or insights = bullet points (- ). Not prose.
- When discussing two people separately, use ### [Name] as a heading for each person.
- Bold (**text**) the single most important word or phrase per section — not everything.
- Start with the substance. No preamble, no restating the question.
- Word count: 80–150 words for simple answers, 150–250 for multi-topic ones.
- Minimum structure: if you give 3+ pieces of advice or name 3+ traits, they MUST be bullets."""

_TEMPLATES: dict[str, callable] = {
    "personality_analysis":      _prompt_personality_analysis,
    "compatibility_question":    _prompt_compatibility_question,
    "relationship_advice":       _prompt_relationship_advice,
    "flirting_guidance":         _prompt_flirting_guidance,
    "communication_help":        _prompt_communication_help,
    "sextrology":                _prompt_sextrology,
    "numerology_question":       _prompt_numerology_question,
    "color_question":            _prompt_color_question,
    "general_question":          _prompt_general_question,
    "signal_reading":            _prompt_signal_reading,
    "first_date_coaching":       _prompt_first_date_coaching,
    "red_flags_green_flags":     _prompt_red_flags_green_flags,
    "getting_them_back":         _prompt_getting_them_back,
    "attachment_style_coaching": _prompt_attachment_style_coaching,
    "commitment_progression":    _prompt_commitment_progression,
}


def build_chat_prompt(
    intent: str,
    message: str,
    person_a: dict | None,
    person_b: dict | None,
    engine_data: dict,
    history_block: str = "",
) -> str:
    """
    Select the prompt template for intent and render it with the supplied data.
    Appends recent conversation history so the model has turn-by-turn context.

    Falls back to general_question template for unrecognised intents.
    """
    builder = _TEMPLATES.get(intent, _prompt_general_question)
    prompt = builder(message, person_a, person_b, engine_data)
    if intent != "sextrology":  # sextrology has its own detailed format rules
        prompt = prompt + _UNIVERSAL_FORMAT
    if history_block:
        prompt = prompt + history_block
    return prompt
