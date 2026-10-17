#!/usr/bin/env python3
"""
Send the Monday email "Your week ahead" to everyone who opted in (profile page ->
"Weekly email") and has a saved profile. Run it from cron on Mondays at 08:00 server time:

    0 8 * * 1  cd /root/ZodicogAI/backend && venv/bin/python scripts/send_weekly_digest.py >> /var/log/zodicog-digest.log 2>&1

    --dry-run   print who would get what; no AI call, nothing sent, nothing marked
    --now ISO   pretend it is this UTC time (e.g. 2026-10-19T08:00:00+00:00); for testing

Safe to run twice in a week: each person is emailed at most once per ISO week. If no email
provider is configured the run reports `unsent` and tries again next time.

Needs DIGEST_SECRET (signs the unsubscribe links; refuses to send without it) and an email
provider (RESEND_API_KEY or SMTP_*), plus BACKEND_PUBLIC_URL / FRONTEND_URL so the links
point at your site. See docs/OPERATIONS.md (Weekly email).
"""
import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND / ".env")

import digest  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--now", help="pretend it is this UTC time (ISO 8601)")
    args = ap.parse_args()

    now = datetime.fromisoformat(args.now) if args.now else datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    try:
        c = digest.run_weekly(now, dry_run=args.dry_run)
    except RuntimeError as exc:
        print(exc)
        return 1
    print(
        f"{now.isoformat(timespec='minutes')} eligible={c['eligible']} sent={c['sent']} skipped={c['skipped']} "
        f"unsent={c['unsent']} failed={c['failed']}" + (" (dry run)" if args.dry_run else "")
    )
    return 0 if c["failed"] == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
