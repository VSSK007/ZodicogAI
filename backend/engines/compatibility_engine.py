import math


ELEMENT_COMPATIBILITY = {
    "Fire": ["Air", "Fire"],
    "Air": ["Fire", "Air"],
    "Earth": ["Water", "Earth"],
    "Water": ["Earth", "Water"]
}


def trait_vector_distance(v1, v2):
    keys = v1.keys()
    squared_sum = sum((v1[k] - v2[k]) ** 2 for k in keys)
    return math.sqrt(squared_sum)


def compute_vector_similarity(v1, v2):
    distance = trait_vector_distance(v1, v2)
    max_distance = math.sqrt(len(v1) * (10 ** 2))
    similarity = 1 - (distance / max_distance)
    return round(similarity * 100, 2)


def element_compatibility(a, b):
    if b in ELEMENT_COMPATIBILITY.get(a, []):
        return "High"
    return "Moderate"


def modality_interaction(a, b):
    if a == b:
        return "Intense"
    return "Dynamic"


# Numeric affinity tables for zodiac compatibility scoring
_ELEMENT_AFFINITY: dict[frozenset, float] = {
    frozenset({"Fire"}):            85.0,   # same element
    frozenset({"Earth"}):           85.0,
    frozenset({"Air"}):             85.0,
    frozenset({"Water"}):           85.0,
    frozenset({"Fire", "Air"}):     75.0,   # complementary
    frozenset({"Earth", "Water"}):  75.0,
    frozenset({"Fire", "Earth"}):   50.0,   # neutral
    frozenset({"Air", "Water"}):    50.0,
    frozenset({"Fire", "Water"}):   30.0,   # opposing
    frozenset({"Air", "Earth"}):    30.0,
}

_MODALITY_SCORE: dict[frozenset, float] = {
    frozenset({"Cardinal"}):              55.0,  # same modality
    frozenset({"Fixed"}):                 55.0,
    frozenset({"Mutable"}):               55.0,
    frozenset({"Cardinal", "Mutable"}):   80.0,  # complementary flow
    frozenset({"Cardinal", "Fixed"}):     60.0,
    frozenset({"Fixed", "Mutable"}):      60.0,
}


def compute_zodiac_compatibility_score(
    element_a: str,
    modality_a: str,
    element_b: str,
    modality_b: str,
    vector_score: float,
) -> float:
    """
    Compute a 0–100 astrology-informed zodiac compatibility score.

    Weights: element 0.50, modality 0.30, vector 0.20
    """
    elem_score = _ELEMENT_AFFINITY.get(frozenset({element_a, element_b}), 50.0)
    mod_score = _MODALITY_SCORE.get(frozenset({modality_a, modality_b}), 60.0)
    return round(elem_score * 0.50 + mod_score * 0.30 + vector_score * 0.20, 2)
