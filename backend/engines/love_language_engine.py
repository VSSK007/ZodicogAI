"""
Love Language Engine

Maps trait vectors to Chapman's five love languages and computes
pairwise love-language alignment. No LLM calls.

Love languages:
    words_of_affirmation — verbal reassurance and praise
    acts_of_service      — helpful actions as love expression
    receiving_gifts      — symbolic tokens of affection
    quality_time         — focused, undivided presence
    physical_touch       — physical closeness and contact

Public interface:
    compute_love_language_profile(profile)         -> dict  (single person)
    compute_love_language_compatibility(a, b)      -> dict  (pair)
"""

import math
from models.schemas import LoveLanguageProfile, LoveLanguageResult

_TRAIT_MAX = 10.0
_LANGUAGES = (
    "words_of_affirmation",
    "acts_of_service",
    "receiving_gifts",
    "quality_time",
    "physical_touch",
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _tv(profile: dict) -> dict:
    return profile["trait_vector"]


def _bell(x: float) -> float:
    """
    Bell-curve factor that peaks at x = 5 (mid-range) and falls to 0
    at the extremes (0 and 10). Returns a value in 0–10.
    Used for love languages that favour moderate trait levels.
    """
    return (1 - abs(x - 5) / 5) * _TRAIT_MAX


def _score_words_of_affirmation(tv: dict) -> float:
    """
    Words of Affirmation — verbal, expressive love.
    High expressiveness (desire to communicate) + low dominance
    (focused on the other person rather than directing).
    """
    return tv["expressiveness"] * 0.6 + (_TRAIT_MAX - tv["dominance"]) * 0.4


def _score_acts_of_service(tv: dict) -> float:
    """
    Acts of Service — love shown through helpful action.
    High stability (reliability, follow-through) + high adaptability
    (willingness to adjust effort to the other's needs).
    """
    return tv["stability"] * 0.5 + tv["adaptability"] * 0.5


def _score_receiving_gifts(tv: dict) -> float:
    """
    Receiving Gifts — love expressed and received through symbolic tokens.
    Moderate expressiveness (open enough to value gesture, not so intense
    as to prefer direct verbal or physical expression) + moderate intensity
    (emotionally engaged but not overwhelmingly passionate).
    """
    return _bell(tv["expressiveness"]) * 0.5 + _bell(tv["intensity"]) * 0.5


def _score_quality_time(tv: dict) -> float:
    """
    Quality Time — love through focused, undivided presence.
    High stability (consistent, patient) + high expressiveness
    (engaged and communicative during shared time).
    """
    return tv["stability"] * 0.5 + tv["expressiveness"] * 0.5


def _score_physical_touch(tv: dict) -> float:
    """
    Physical Touch — love through physical closeness and contact.
    High intensity (strong feeling and urgency) + high dominance
    (initiating and asserting physical presence).
    """
    return tv["intensity"] * 0.6 + tv["dominance"] * 0.4


_SCORERS = {
    "words_of_affirmation": _score_words_of_affirmation,
    "acts_of_service":      _score_acts_of_service,
    "receiving_gifts":      _score_receiving_gifts,
    "quality_time":         _score_quality_time,
    "physical_touch":       _score_physical_touch,
}


def _build_profile(profile: dict) -> LoveLanguageProfile:
    """Compute all five love language scores for one personality profile."""
    tv = _tv(profile)
    scores = {lang: round(scorer(tv) * 10, 2) for lang, scorer in _SCORERS.items()}
    primary = max(scores, key=scores.__getitem__)
    return LoveLanguageProfile(primary_language=primary, **scores)


def _cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """
    Cosine similarity of two non-negative vectors, scaled to 0–100.
    Returns 50.0 (neutral) when either vector is all-zero.
    """
    dot  = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a ** 2 for a in v1))
    mag2 = math.sqrt(sum(b ** 2 for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 50.0
    return round((dot / (mag1 * mag2)) * 100, 2)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

def compute_love_language_profile(profile: dict) -> dict:
    """
    Compute the love language profile for a single person.

    Args:
        profile: zodiac profile dict from get_zodiac_profile().

    Returns:
        A plain dict matching the LoveLanguageProfile schema.
    """
    return _build_profile(profile).model_dump()


def compute_love_language_compatibility(profile_a: dict, profile_b: dict) -> dict:
    """
    Compute love language profiles for both people and their alignment score.

    Alignment is cosine similarity of the two five-dimensional love language
    vectors: when both people share the same primary (and secondary) languages,
    love is more likely to be expressed in a form the other recognises.

    Args:
        profile_a: zodiac profile dict for person A.
        profile_b: zodiac profile dict for person B.

    Returns:
        A plain dict matching the LoveLanguageResult schema.
    """
    a_profile = _build_profile(profile_a)
    b_profile = _build_profile(profile_b)

    vec_a = [getattr(a_profile, lang) for lang in _LANGUAGES]
    vec_b = [getattr(b_profile, lang) for lang in _LANGUAGES]

    compat_score = _cosine_similarity(vec_a, vec_b)

    result = LoveLanguageResult(
        a_love_language=a_profile,
        b_love_language=b_profile,
        love_language_compatibility_score=compat_score,
    )
    return result.model_dump()
