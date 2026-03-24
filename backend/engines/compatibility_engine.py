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


_MODALITY_LABELS: dict[frozenset, str] = {
    frozenset({"Cardinal"}):              "Rival Initiators — two starters competing for direction; high ambition, power-struggle risk",
    frozenset({"Fixed"}):                 "Immovable Force — fierce loyalty and resolve, but neither budges in conflict",
    frozenset({"Mutable"}):               "Fluid Mirrors — open-minded and endlessly adaptable together, but may drift without direction",
    frozenset({"Cardinal", "Fixed"}):     "Drive Meets Resistance — bold initiative meets stubborn resolve; transformative tension if both learn to yield",
    frozenset({"Cardinal", "Mutable"}):   "Direction Meets Flow — the initiator sets the path, the adaptor expands it; a natural creative synergy",
    frozenset({"Fixed", "Mutable"}):      "Anchor Meets Wind — stability meets curiosity; deeply grounding if the Fixed allows the Mutable to roam",
}


def modality_interaction(a: str, b: str) -> str:
    return _MODALITY_LABELS.get(frozenset({a, b}), "Dynamic")


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
    frozenset({"Cardinal"}):              58.0,  # competing initiators — ambitious but power-struggle risk
    frozenset({"Fixed"}):                 55.0,  # stubborn standoff — deep loyalty but rigid
    frozenset({"Mutable"}):               65.0,  # fluid understanding — flexible but may lack anchor
    frozenset({"Cardinal", "Mutable"}):   82.0,  # best complement — direction + adaptability
    frozenset({"Fixed", "Mutable"}):      72.0,  # strong complement — stability + flexibility
    frozenset({"Cardinal", "Fixed"}):     58.0,  # tension arc — drive meets resistance
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
