"""
Numerology Engine

Computes Life Path Number (from birth day + month), Expression Number
(from name using Pythagorean numerology), and Lucky Number (reduced sum
of both) for one or two people.

For pairs: calculates a weighted compatibility score using a traditional
numerology compatibility matrix and produces a pursue/caution/avoid signal.

Public interface:
    get_numerology_profile(name, day, month)             -> dict  (single)
    compute_numerology_compatibility(profile_a, profile_b) -> dict  (pair)
"""

from functools import lru_cache

# ---------------------------------------------------------------------------
# Pythagorean letter-to-number mapping
# ---------------------------------------------------------------------------

_LETTER_VALUES: dict[str, int] = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
}

# Master numbers — never reduced further
_MASTER_NUMBERS: frozenset[int] = frozenset({11, 22, 33})

# ---------------------------------------------------------------------------
# Number meanings
# ---------------------------------------------------------------------------

_NUMBER_MEANINGS: dict[int, dict] = {
    1:  {
        "title": "The Leader",
        "core":  "Independence, pioneering spirit, originality",
        "love":  "Needs admiration; works best with 3, 5, 6",
        "strengths":   ["natural leader", "self-reliant", "innovative", "driven"],
        "challenges":  ["ego-driven", "stubborn", "struggles to share power"],
    },
    2:  {
        "title": "The Diplomat",
        "core":  "Harmony, sensitivity, partnership",
        "love":  "Deeply devoted; compatible with 4, 6, 8",
        "strengths":   ["empathetic", "cooperative", "intuitive", "peacemaker"],
        "challenges":  ["overly dependent", "avoids conflict", "self-doubt"],
    },
    3:  {
        "title": "The Creator",
        "core":  "Expression, joy, creativity, communication",
        "love":  "Playful and romantic; thrives with 1, 5, 9",
        "strengths":   ["charismatic", "imaginative", "optimistic", "social"],
        "challenges":  ["scattered", "superficial", "avoids depth when threatened"],
    },
    4:  {
        "title": "The Builder",
        "core":  "Discipline, stability, hard work, foundation",
        "love":  "Loyal and steady; best with 2, 6, 8",
        "strengths":   ["reliable", "methodical", "loyal", "grounded"],
        "challenges":  ["rigid", "workaholic", "resistant to change"],
    },
    5:  {
        "title": "The Adventurer",
        "core":  "Freedom, curiosity, change, versatility",
        "love":  "Thrilling and unpredictable; pairs well with 1, 3, 7",
        "strengths":   ["magnetic", "adventurous", "adaptable", "quick-witted"],
        "challenges":  ["restless", "commitment issues", "excess-prone"],
    },
    6:  {
        "title": "The Nurturer",
        "core":  "Love, responsibility, family, harmony",
        "love":  "Devoted partner; thrives with 1, 2, 9",
        "strengths":   ["nurturing", "responsible", "compassionate", "warm"],
        "challenges":  ["martyr complex", "over-gives", "possessive"],
    },
    7:  {
        "title": "The Seeker",
        "core":  "Wisdom, introspection, spiritual depth",
        "love":  "Selective; best with 5, 9, 11",
        "strengths":   ["analytical", "insightful", "independent", "spiritual"],
        "challenges":  ["aloof", "secretive", "emotionally distant"],
    },
    8:  {
        "title": "The Powerhouse",
        "core":  "Ambition, material mastery, authority",
        "love":  "Power couple energy; thrives with 2, 4, 6",
        "strengths":   ["ambitious", "strategic", "authoritative", "resilient"],
        "challenges":  ["controlling", "materialistic", "workaholic"],
    },
    9:  {
        "title": "The Sage",
        "core":  "Completion, wisdom, compassion, universal love",
        "love":  "Romantic idealist; best with 3, 6, 9",
        "strengths":   ["wise", "compassionate", "creative", "humanitarian"],
        "challenges":  ["possessive", "idealistic to a fault", "emotionally volatile"],
    },
    11: {
        "title": "The Visionary",
        "core":  "Intuition, spiritual illumination, inspiration",
        "love":  "Intense connection seeker; compatible with 2, 4, 6",
        "strengths":   ["highly intuitive", "inspiring", "empathetic", "visionary"],
        "challenges":  ["hypersensitive", "anxious", "self-doubt under pressure"],
    },
    22: {
        "title": "The Master Builder",
        "core":  "Grand vision, legacy, pragmatic idealism",
        "love":  "Seeks a life partner who matches ambition; thrives with 4, 8",
        "strengths":   ["visionary power", "disciplined", "transformative", "masterful"],
        "challenges":  ["overwhelming pressure", "perfectionist", "self-sabotage"],
    },
    33: {
        "title": "The Master Teacher",
        "core":  "Unconditional love, healing, service",
        "love":  "Unconditional giver; thrives with 6, 9, 11",
        "strengths":   ["deeply compassionate", "inspiring", "selfless", "healer"],
        "challenges":  ["self-neglect", "martyrdom", "overwhelmed by others' pain"],
    },
}

# ---------------------------------------------------------------------------
# Compatibility matrix  {(min_n, max_n): score_0_to_100}
# Covers 1–9 base numbers; master numbers reduce to root for lookup.
# ---------------------------------------------------------------------------

_COMPAT_MATRIX: dict[tuple[int, int], float] = {
    (1, 1): 60.0, (1, 2): 70.0, (1, 3): 85.0, (1, 4): 45.0, (1, 5): 80.0,
    (1, 6): 75.0, (1, 7): 65.0, (1, 8): 60.0, (1, 9): 70.0,
    (2, 2): 75.0, (2, 3): 65.0, (2, 4): 85.0, (2, 5): 60.0, (2, 6): 90.0,
    (2, 7): 70.0, (2, 8): 80.0, (2, 9): 65.0,
    (3, 3): 70.0, (3, 4): 50.0, (3, 5): 85.0, (3, 6): 75.0, (3, 7): 60.0,
    (3, 8): 42.0, (3, 9): 80.0,
    (4, 4): 65.0, (4, 5): 60.0, (4, 6): 85.0, (4, 7): 70.0, (4, 8): 80.0,
    (4, 9): 50.0,
    (5, 5): 70.0, (5, 6): 40.0, (5, 7): 80.0, (5, 8): 60.0, (5, 9): 70.0,
    (6, 6): 80.0, (6, 7): 65.0, (6, 8): 75.0, (6, 9): 85.0,
    (7, 7): 65.0, (7, 8): 45.0, (7, 9): 80.0,
    (8, 8): 70.0, (8, 9): 60.0,
    (9, 9): 75.0,
}

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _reduce(n: int) -> int:
    """Reduce n to a single digit (1-9) or a master number (11, 22, 33)."""
    while n > 9 and n not in _MASTER_NUMBERS:
        n = sum(int(d) for d in str(n))
    return n


def _life_path(day: int, month: int) -> int:
    """
    Life-path approximation from birth day + month only (no year available).
    Sum all digits of day and month, then reduce.
    """
    total = sum(int(d) for d in str(day)) + sum(int(d) for d in str(month))
    return _reduce(total)


def _expression_number(name: str) -> int:
    """Expression number: sum of Pythagorean letter values, reduced."""
    total = sum(_LETTER_VALUES.get(c.upper(), 0) for c in name if c.isalpha())
    return _reduce(max(total, 1))


def _lucky_number(life_path: int, expression: int) -> int:
    """Lucky number: reduce the sum of life path and expression."""
    return _reduce(life_path + expression)


def _base(n: int) -> int:
    """Reduce master numbers to their 1-9 root for matrix lookup."""
    return _reduce(n) if n in _MASTER_NUMBERS else n


def _compat_score(n1: int, n2: int) -> float:
    """Look up compatibility score for two numbers."""
    b1 = (((_base(n1) - 1) % 9) + 1)
    b2 = (((_base(n2) - 1) % 9) + 1)
    key = (min(b1, b2), max(b1, b2))
    return _COMPAT_MATRIX.get(key, 65.0)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1024)
def get_numerology_profile(name: str, day: int, month: int) -> dict:
    """
    Compute the full numerology profile for a single person.

    Returns:
        {
          life_path_number, expression_number, lucky_number,
          number_title, number_core, love_note,
          strengths (list[str]), challenges (list[str])
        }
    """
    lp  = _life_path(day, month)
    exp = _expression_number(name)
    lky = _lucky_number(lp, exp)
    m   = _NUMBER_MEANINGS.get(lp, _NUMBER_MEANINGS[1])

    return {
        "life_path_number":  lp,
        "expression_number": exp,
        "lucky_number":      lky,
        "number_title":      m["title"],
        "number_core":       m["core"],
        "love_note":         m["love"],
        "strengths":         m["strengths"],
        "challenges":        m["challenges"],
    }


def compute_numerology_compatibility(profile_a: dict, profile_b: dict) -> dict:
    """
    Compute compatibility between two numerology profiles.

    Returns:
        {
          compatibility_score,    # 0–100, weighted composite
          life_path_score,        # life-path × life-path match
          expression_score,       # expression × expression match
          cross_score,            # cross-pair average
          pursue_signal           # "pursue" | "caution" | "avoid"
        }
    """
    lp_a,  lp_b  = profile_a["life_path_number"],  profile_b["life_path_number"]
    exp_a, exp_b = profile_a["expression_number"], profile_b["expression_number"]

    lp_score    = _compat_score(lp_a,  lp_b)
    exp_score   = _compat_score(exp_a, exp_b)
    cross_score = round((_compat_score(lp_a, exp_b) + _compat_score(exp_a, lp_b)) / 2, 1)

    overall = round(lp_score * 0.50 + exp_score * 0.30 + cross_score * 0.20, 1)

    signal = (
        "pursue"  if overall >= 70.0 else
        "caution" if overall >= 55.0 else
        "avoid"
    )

    return {
        "compatibility_score": overall,
        "life_path_score":     lp_score,
        "expression_score":    exp_score,
        "cross_score":         cross_score,
        "pursue_signal":       signal,
    }
