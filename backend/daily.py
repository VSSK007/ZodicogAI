"""
Personal daily card - the pieces around the Gemini call.

    horoscope    shared with /horoscope/{sign} (cached once per sign per day)
    mbti_tip,
    do, avoid    ONE Gemini call per (sign, mbti, date), stored in `daily_cache`
                 so it survives restarts and is shared by every visitor
    lucky colour and number
                 deterministic, seeded by birthday + date (no AI, no storage)

Failed generations (Gemini returns the "—" defaults) are never cached.
"""
import json
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import delete, insert, select

import db
from engines.color_engine import daily_lucky_color
from engines.horoscope_engine import compute_lucky_number
from engines.numerology_engine import personal_day_number

KEEP_DAYS = 7
PLACEHOLDER = "—"

# Shown (and not cached) when generation fails, so the card is never empty.
FALLBACK = {
    "mbti_tip": "Lean on what comes naturally to you today; small, steady choices carry more than big gestures.",
    "do_this": "Finish one thing you have been putting off.",
    "avoid_this": "Reading too much into a quiet reply.",
}


def tip_key(sign: str, mbti: str, on: date) -> str:
    return f"tip:{sign.lower()}:{(mbti or 'any').upper()}:{on.isoformat()}"


def get_cached_tip(key: str) -> dict | None:
    c = db.daily_cache
    with db.get_engine().connect() as conn:
        row = conn.execute(select(c.c.payload).where(c.c.key == key)).first()
    return json.loads(row[0]) if row else None


def store_tip(key: str, tip: dict) -> None:
    """Store a good generation; ignore failures and the occasional duplicate race."""
    if any(v == PLACEHOLDER for v in tip.values()):
        return
    c = db.daily_cache
    now = datetime.now(timezone.utc)
    try:
        with db.get_engine().begin() as conn:
            conn.execute(delete(c).where(c.c.created_at < (now - timedelta(days=KEEP_DAYS)).isoformat()))
            conn.execute(insert(c).values(key=key, payload=json.dumps(tip), created_at=now.isoformat()))
    except Exception:
        # Another worker stored the same key first - the cached copy is equivalent.
        pass


def lucky_extras(sign: str, day: int, month: int, on: date) -> dict:
    """Deterministic lucky colour + number; personalised when a birthday is known."""
    if day and month:
        return {
            "lucky_color": daily_lucky_color(f"{month}-{day}", on),
            "lucky_number": personal_day_number(day, month, on),
        }
    return {
        "lucky_color": daily_lucky_color(sign.lower(), on),
        "lucky_number": compute_lucky_number(sign.lower(), on),
    }


def usable(tip: dict) -> dict:
    """Replace any failed field with the static fallback."""
    return {k: (FALLBACK[k] if tip.get(k, PLACEHOLDER) == PLACEHOLDER else tip[k]) for k in FALLBACK}
