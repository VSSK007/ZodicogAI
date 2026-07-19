"""
Daily horoscope engine — deterministic per-sign "energy scores" for a given
calendar date. Seeded from (sign, date), so the same sign on the same date
always produces the same scores: reproducible, auditable, no state to store.

Gemini only narrates these numbers (see gemini_client._prompt_horoscope) —
the scores themselves are pure computation, consistent with every other
engine in this codebase.
"""
import hashlib
import random
from datetime import date

DIMENSIONS = ("love", "career", "energy", "luck")

# Scores are bounded away from the extremes (30-95) so a "bad day" reads as
# a real caution rather than a flat zero, and a "great day" still leaves
# room to feel earned rather than arbitrary.
_SCORE_MIN, _SCORE_MAX = 30, 95


def _seed(sign: str, on: date) -> int:
    digest = hashlib.sha256(f"{sign.lower()}:{on.isoformat()}".encode()).hexdigest()
    return int(digest[:16], 16)


def compute_daily_scores(sign: str, on: date) -> dict:
    """Deterministic 0-100 scores across love/career/energy/luck for one day."""
    rng = random.Random(_seed(sign, on))
    scores = {dim: rng.randint(_SCORE_MIN, _SCORE_MAX) for dim in DIMENSIONS}
    scores["overall"] = round(sum(scores.values()) / len(scores))
    return scores


def compute_lucky_number(sign: str, on: date) -> int:
    rng = random.Random(_seed(sign, on) ^ 0x5A5A5A5A)
    return rng.randint(1, 99)
