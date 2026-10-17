#!/usr/bin/env python3
"""
Send the daily web-push nudge. Run it HOURLY from cron:

    5 * * * *  cd /root/ZodicogAI/backend && venv/bin/python scripts/send_daily_push.py >> /var/log/zodicog-push.log 2>&1

Every subscription whose local hour equals its chosen hour (default 8) and that
has not been nudged today gets "Your day, <Sign>" plus the first line of today's
horoscope. Dead subscriptions (the browser says 404/410) are deleted.

    --dry-run   print who would be notified and what, send nothing, change nothing
    --now ISO   pretend it is this UTC time (e.g. 2026-10-20T08:05:00+00:00); for testing

Needs VAPID_PRIVATE_KEY (and VAPID_SUBJECT) in the environment or backend/.env;
see docs/OPERATIONS.md and scripts/generate_vapid_keys.py. The horoscope text is
shared with the website (one Gemini call per sign per day, stored in the database).
"""
import argparse
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND / ".env")

import daily  # noqa: E402
import push  # noqa: E402

BODY_MAX = 140


def first_line(text: str, limit: int = BODY_MAX) -> str:
    """The first sentence of a horoscope, plain text, short enough for a notification."""
    t = " ".join((text or "").replace("*", "").split())
    cut = t.find(". ")
    sentence = t[: cut + 1] if 0 < cut < limit else t
    return sentence if len(sentence) <= limit else sentence[: limit - 1].rsplit(" ", 1)[0] + "…"


def make_message_builder(now_utc: datetime):
    """build_message(sub, local_day) with one horoscope lookup per sign per run."""
    today = now_utc.date()  # the website serves the horoscope for the UTC date: share its cache
    by_sign: dict[str, str] = {}

    def horoscope_line(sign: str) -> str:
        if sign in by_sign:
            return by_sign[sign]
        key = daily.horoscope_key(sign, today)
        payload = daily.get_json(key)
        if payload is None:
            payload = daily.horoscope_payload(sign, today)
            daily.store_json(key, payload)  # skipped when Gemini failed
        reading = (payload.get("article") or {}).get("reading", "")
        line = "" if reading in ("", daily.PLACEHOLDER) else first_line(reading)
        by_sign[sign] = line or f"Your {sign.capitalize()} reading is ready."
        return by_sign[sign]

    def build(sub: dict, _local_day: str) -> dict:
        return {"title": f"Your day, {sub['sign'].capitalize()}", "body": horoscope_line(sub["sign"]), "url": "/today"}

    return build


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--now", help="pretend it is this UTC time (ISO 8601)")
    args = ap.parse_args()

    now = datetime.fromisoformat(args.now) if args.now else datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    if not args.dry_run and not os.getenv("VAPID_PRIVATE_KEY"):
        print("VAPID_PRIVATE_KEY is not set: nothing sent. See docs/OPERATIONS.md (Web push).")
        return 1

    counts = push.run_daily(now, make_message_builder(now), dry_run=args.dry_run)
    print(f"{now.isoformat(timespec='minutes')} due={counts['due']} sent={counts['sent']} "
          f"removed={counts['removed']} failed={counts['failed']}" + (" (dry run)" if args.dry_run else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
