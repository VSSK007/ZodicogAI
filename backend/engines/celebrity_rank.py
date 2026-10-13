"""
Celebrity matches - rank the 360 public figures against one visitor.

Fully deterministic, no AI, and deliberately no MBTI: a celebrity only has a
public birth date and name, so the only fair frameworks are zodiac (sun sign:
element, modality and the sign trait vectors) and numerology (life path from
birth day + month, expression from the name). Inventing a personality type for
a real person would be a fabricated claim.

    score = 50% zodiac + 50% numerology         (0-100, one decimal)

The "why" line is assembled from templates over the same numbers.
"""
import json
from functools import lru_cache
from pathlib import Path

from engines.compatibility_engine import compute_vector_similarity, compute_zodiac_compatibility_score
from engines.numerology_engine import compute_numerology_compatibility, get_numerology_profile
from engines.zodiac_engine import TRAIT_VECTORS, ZODIAC_METADATA, get_sun_sign

DATA = Path(__file__).resolve().parents[1] / "data" / "celebrities.json"

ZODIAC_WEIGHT = 0.5
NUMEROLOGY_WEIGHT = 0.5

_COMPLEMENTARY = [frozenset({"Fire", "Air"}), frozenset({"Earth", "Water"})]
_OPPOSING = [frozenset({"Fire", "Water"}), frozenset({"Air", "Earth"})]

_SAME_ELEMENT = {
    "Fire": "shared fire, so you ignite each other",
    "Earth": "shared earth, so the footing between you is steady",
    "Air": "shared air, so conversation never runs dry",
    "Water": "shared water, so you read each other's moods",
}


@lru_cache(maxsize=1)
def celebrities() -> list[dict]:
    return json.loads(DATA.read_text(encoding="utf-8"))


def _zodiac_score(sign_a: str, sign_b: str) -> float:
    a, b = ZODIAC_METADATA[sign_a], ZODIAC_METADATA[sign_b]
    vector = compute_vector_similarity(TRAIT_VECTORS[sign_a], TRAIT_VECTORS[sign_b])
    return compute_zodiac_compatibility_score(a["element"], a["modality"], b["element"], b["modality"], vector)


def _element_clause(sign_a: str, sign_b: str) -> str:
    ea, eb = ZODIAC_METADATA[sign_a]["element"], ZODIAC_METADATA[sign_b]["element"]
    if ea == eb:
        return f"Both {ea} signs: {_SAME_ELEMENT[ea]}"
    pair = frozenset({ea, eb})
    if pair in _COMPLEMENTARY:
        return f"{ea} and {eb} feed each other"
    if pair in _OPPOSING:
        return f"{ea} meets {eb}: opposite elements that attract through difference"
    return f"{ea} meets {eb}: different elements that stay curious about each other"


def _numerology_clause(lp_a: int, lp_b: int, score: float) -> str:
    if score >= 75:
        verdict = "align naturally"
    elif score >= 60:
        verdict = "complement each other"
    else:
        verdict = "pull in different directions"
    pair = f"{lp_a}" if lp_a == lp_b else f"{lp_a} and {lp_b}"
    return f"life path{'s' if lp_a != lp_b else ''} {pair} {verdict}"


def rank_matches(name: str, day: int, month: int, limit: int = 5) -> list[dict]:
    """The `limit` best-matching celebrities for this person, best first."""
    sign = get_sun_sign(day, month)
    me = get_numerology_profile(name.strip(), day, month)

    scored = []
    for c in celebrities():
        c_sign = get_sun_sign(c["day"], c["month"])
        z = _zodiac_score(sign, c_sign)
        theirs = get_numerology_profile(c["name"], c["day"], c["month"])
        n = compute_numerology_compatibility(me, theirs)["compatibility_score"]
        total = round(z * ZODIAC_WEIGHT + n * NUMEROLOGY_WEIGHT, 1)
        scored.append((total, c, c_sign, z, n, theirs["life_path_number"]))

    # Best first; name breaks ties so the order is stable.
    scored.sort(key=lambda t: (-t[0], t[1]["name"]))

    return [
        {
            "slug": c["slug"],
            "name": c["name"],
            "sign": c_sign.lower(),
            "category": c["category"],
            "score": total,
            "zodiac_score": round(z, 1),
            "numerology_score": round(n, 1),
            "why": f"{_element_clause(sign, c_sign)}; {_numerology_clause(me['life_path_number'], lp, n)}.",
        }
        for total, c, c_sign, z, n, lp in scored[:limit]
    ]
