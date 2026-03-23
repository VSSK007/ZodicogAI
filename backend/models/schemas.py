from typing import Optional
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Decan profile (computed from decans_data.py)
# ---------------------------------------------------------------------------

class DecanProfile(BaseModel):
    number: int
    date_range: str
    sub_ruler: str
    sub_sign: str
    keywords: list[str]
    description_short: str
    description_rich: str
    vector_modifier: dict[str, float]


# ---------------------------------------------------------------------------
# API request schemas (validated by FastAPI on the way in)
# ---------------------------------------------------------------------------

class HybridInput(BaseModel):
    name: str
    day: int
    month: int
    mbti: str


class CompatibilityInput(BaseModel):
    person_a_name: str
    person_a_day: int
    person_a_month: int
    person_a_mbti: str
    person_b_name: str
    person_b_day: int
    person_b_month: int
    person_b_mbti: str


# ---------------------------------------------------------------------------
# LLM response schemas
#
# These serve three purposes:
#   1. Passed to Gemini as response_schema — constrains output to this shape
#   2. Used by Pydantic to validate and deserialise the Gemini response
#   3. Instantiated as schema() to produce the safe fallback on total failure
#
# All fields carry defaults so schema() always returns a fully usable object.
# ---------------------------------------------------------------------------

class HybridAnalysis(BaseModel):
    behavioral_core: str = "—"
    emotional_pattern: str = "—"
    decision_making_style: str = "—"
    social_dynamic: str = "—"
    conflict_style: str = "—"
    leadership_tendency: str = "—"
    strengths: list[str] = []
    growth_edges: list[str] = []


class CompatibilityAnalysis(BaseModel):
    relationship_dynamic: str = "—"
    communication_pattern: str = "—"
    conflict_risk: str = "—"
    long_term_viability: str = "—"


class SextrologyAnalysis(BaseModel):
    sexual_character: str = "—"
    foreplay: str = "—"
    erogenous_zones: str = "—"
    fantasies: str = "—"
    positions_and_dynamics: str = "—"
    emotional_needs: str = "—"
    long_term_fire: str = "—"


class SextrologySoloAnalysis(BaseModel):
    sexual_character: str = "—"
    foreplay: str = "—"
    turn_ons: str = "—"
    turn_offs: str = "—"
    erogenous_zones: str = "—"
    fantasies: str = "—"
    kink_profile: str = "—"
    signature_positions: str = "—"
    seduction_style: str = "—"


class EmotionalCompatibilityResult(BaseModel):
    emotional_expression_similarity: float = 0.0
    emotional_intensity_alignment: float = 0.0
    emotional_stability_compatibility: float = 0.0
    emotional_compatibility_score: float = 0.0


class RomanticCompatibilityResult(BaseModel):
    attachment_pacing_similarity: float = 0.0
    affection_expression_similarity: float = 0.0
    romantic_polarity_score: float = 0.0
    romantic_compatibility_score: float = 0.0


class SextrologyResult(BaseModel):
    intimacy_intensity_alignment: float = 0.0
    intimacy_pacing_alignment: float = 0.0
    dominance_receptiveness_polarity: float = 0.0
    emotional_physical_balance_similarity: float = 0.0
    sexual_compatibility_score: float = 0.0


class LoveStyleProfile(BaseModel):
    eros: float = 0.0
    storge: float = 0.0
    ludus: float = 0.0
    mania: float = 0.0
    pragma: float = 0.0
    agape: float = 0.0
    dominant_style: str = "—"


class LoveStyleResult(BaseModel):
    a_love_style: LoveStyleProfile = LoveStyleProfile()
    b_love_style: LoveStyleProfile = LoveStyleProfile()
    love_style_compatibility_score: float = 0.0


class LoveLanguageProfile(BaseModel):
    words_of_affirmation: float = 0.0
    acts_of_service: float = 0.0
    receiving_gifts: float = 0.0
    quality_time: float = 0.0
    physical_touch: float = 0.0
    primary_language: str = "—"


class LoveLanguageResult(BaseModel):
    a_love_language: LoveLanguageProfile = LoveLanguageProfile()
    b_love_language: LoveLanguageProfile = LoveLanguageProfile()
    love_language_compatibility_score: float = 0.0


class RelationshipIntelligenceResult(BaseModel):
    overall_score: float = 0.0
    stability_prediction: str = "—"
    conflict_probability: float = 0.0
    strengths: list[str] = []
    risks: list[str] = []


class ZodiacArticle(BaseModel):
    overview: str = "—"
    the_symbol: str = "—"
    personality: str = "—"
    highest_expression: str = "—"
    shadow_expression: str = "—"
    strengths: list[str] = []
    weaknesses: list[str] = []
    in_love: str = "—"
    as_a_friend: str = "—"
    career_and_ambition: str = "—"
    tips_for_relating: str = "—"
    best_matches: list[str] = []
    famous_people: list[str] = []


# ---------------------------------------------------------------------------
# Optional-pair input schemas (person B may be omitted for single-person mode)
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Chat schemas
# ---------------------------------------------------------------------------

class PersonProfile(BaseModel):
    name: str
    day: int
    month: int
    mbti: str
    gender: str = "M"  # "M" or "F"


class HistoryMessage(BaseModel):
    role: str  # "user" or "ai"
    text: str


class ChatInput(BaseModel):
    message: str
    person_a: Optional[PersonProfile] = None
    person_b: Optional[PersonProfile] = None
    history: list[HistoryMessage] = []


class IntentClassification(BaseModel):
    intent: str = "general_question"


class ChatReply(BaseModel):
    response: str = ""


# ---------------------------------------------------------------------------
# Optional-pair input schemas (person B may be omitted for single-person mode)
# ---------------------------------------------------------------------------

class SextrologyInput(BaseModel):
    person_a_name: str
    person_a_day: int
    person_a_month: int
    person_a_mbti: str
    person_a_gender: Optional[str] = "M"
    person_b_name: Optional[str] = None
    person_b_day: Optional[int] = None
    person_b_month: Optional[int] = None
    person_b_mbti: Optional[str] = None


class LoveStyleInput(BaseModel):
    person_a_name: str
    person_a_day: int
    person_a_month: int
    person_a_mbti: str
    person_b_name: Optional[str] = None
    person_b_day: Optional[int] = None
    person_b_month: Optional[int] = None
    person_b_mbti: Optional[str] = None


class LoveLanguageInput(BaseModel):
    person_a_name: str
    person_a_day: int
    person_a_month: int
    person_a_mbti: str
    person_b_name: Optional[str] = None
    person_b_day: Optional[int] = None
    person_b_month: Optional[int] = None
    person_b_mbti: Optional[str] = None


class ZodiacInput(BaseModel):
    name: str
    day: int
    month: int


class ColorInput(BaseModel):
    person_a_name: str
    person_a_day: int
    person_a_month: int
    person_b_name: Optional[str] = None
    person_b_day: Optional[int] = None
    person_b_month: Optional[int] = None


class NumerologyInput(BaseModel):
    person_a_name: str
    person_a_day: int
    person_a_month: int
    person_b_name: Optional[str] = None
    person_b_day: Optional[int] = None
    person_b_month: Optional[int] = None


# ---------------------------------------------------------------------------
# Color LLM response schemas
# ---------------------------------------------------------------------------

class ColorSingleAnalysis(BaseModel):
    color_meaning: str = "—"
    love_energy: str = "—"
    color_advice: str = "—"
    power_colors: list[str] = []


class ColorPairAnalysis(BaseModel):
    color_harmony: str = "—"
    compatible_color_meaning: str = "—"
    middle_ground_meaning: str = "—"
    pair_advice: str = "—"


# ---------------------------------------------------------------------------
# Numerology LLM response schemas
# ---------------------------------------------------------------------------

class NumerologySingleAnalysis(BaseModel):
    life_path_reading: str = "—"
    love_and_relationships: str = "—"
    career_and_purpose: str = "—"
    spiritual_theme: str = "—"
    shadow_challenge: str = "—"


class NumerologyPairAnalysis(BaseModel):
    compatibility_reading: str = "—"
    swot_strengths: list[str] = []
    swot_weaknesses: list[str] = []
    swot_opportunities: list[str] = []
    swot_threats: list[str] = []
    pursue_or_avoid: str = "—"
    pair_advice: str = "—"


# ---------------------------------------------------------------------------
# /discover LLM response schemas
# ---------------------------------------------------------------------------

class ArchetypeAnalysis(BaseModel):
    archetype_prose: str = "—"
    shadow_deep_dive: str = "—"
    in_love_prose: str = "—"
    compatibility_prose: str = "—"
    growth_invitation: str = "—"


class PatternAnalysis(BaseModel):
    pattern_prose: str = "—"
    shadow_deep_dive: str = "—"
    root_cause_prose: str = "—"
    break_the_cycle_prose: str = "—"
    reframe: str = "—"


class AttractionAnalysis(BaseModel):
    attraction_prose: str = "—"
    pull_deep_dive: str = "—"
    avoidance_deep_dive: str = "—"
    pattern_warning: str = "—"
    growth_invitation: str = "—"


class RecommendationAnalysis(BaseModel):
    gaming_prose: str = "—"
    movie_prose: str = "—"
    sneaker_prose: str = "—"
    taste_profile: str = "—"


# ---------------------------------------------------------------------------
# /discover request schema
# ---------------------------------------------------------------------------

class DiscoverInput(BaseModel):
    name: str
    day: int
    month: int
    mbti: str


# ---------------------------------------------------------------------------
# Blog article LLM response schemas
# ---------------------------------------------------------------------------

class LoveLangArticle(BaseModel):
    overview: str = "—"
    how_to_express: str = "—"
    how_to_receive: str = "—"
    signs_you_need_this: list[str] = []
    common_mistakes: str = "—"
    in_relationships: str = "—"
    compatibility_notes: str = "—"
    growth_tips: str = "—"

class LoveStyleArticle(BaseModel):
    overview: str = "—"
    characteristics: list[str] = []
    in_relationships: str = "—"
    shadow_side: str = "—"
    compatibility: str = "—"
    growth_path: str = "—"
    recognizing_this_style: str = "—"

class NumerologyLifePathArticle(BaseModel):
    overview: str = "—"
    core_themes: list[str] = []
    personality: str = "—"
    love_and_relationships: str = "—"
    career_and_purpose: str = "—"
    shadow_and_challenges: str = "—"
    spiritual_meaning: str = "—"
    famous_people: list[str] = []

class SextrologyGuideArticle(BaseModel):
    what_is_sextrology: str = "—"
    zodiac_and_intimacy: str = "—"
    mbti_and_intimacy: str = "—"
    the_6_dimensions: list[str] = []
    how_to_use: str = "—"
    faq: list[str] = []

class ZodiacCompatArticle(BaseModel):
    overview: str = "—"
    relationship_style: str = "—"
    best_matches: list[str] = []
    challenging_matches: list[str] = []
    fire_compatibility: str = "—"
    earth_compatibility: str = "—"
    air_compatibility: str = "—"
    water_compatibility: str = "—"
    dealbreakers: str = "—"
    what_they_need: str = "—"

class MbtiCompatArticle(BaseModel):
    overview: str = "—"
    relationship_style: str = "—"
    best_matches: list[str] = []
    challenging_matches: list[str] = []
    what_they_need: str = "—"
    communication_in_love: str = "—"
    dealbreakers: str = "—"
    growth_in_relationships: str = "—"
