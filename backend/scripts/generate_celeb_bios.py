#!/usr/bin/env python3
"""
Generate celebrity bios by calling the local backend API for all 360 celebrities.
Reads celebrity data directly from frontend/lib/celebrities.ts using regex.
Saves results to frontend/lib/celeb-bios.json.

Usage (from the repo root or backend/):
    python backend/scripts/generate_celeb_bios.py

Or from backend/:
    python scripts/generate_celeb_bios.py

Requirements:
    - Backend must be running at http://localhost:8000
    - Run after `git pull` so the /celebrities/{slug} endpoint exists
    - The script is resumable: re-run to retry any failed entries
"""

import json
import re
import time
import sys
import urllib.request
import urllib.parse
from pathlib import Path

BACKEND_URL = "http://localhost:8000"
DELAY_SECONDS = 0.35   # pause between Gemini calls to stay within rate limits
SAVE_EVERY    = 10     # write progress to disk every N completions

SIGN_LABEL = {
    "aries": "Aries",       "taurus": "Taurus",    "gemini": "Gemini",
    "cancer": "Cancer",     "leo": "Leo",           "virgo": "Virgo",
    "libra": "Libra",       "scorpio": "Scorpio",   "sagittarius": "Sagittarius",
    "capricorn": "Capricorn","aquarius": "Aquarius", "pisces": "Pisces",
}


def parse_celebrities(ts_path: Path) -> list[dict]:
    """Extract the CELEBRITIES array from the TypeScript source using regex."""
    text = ts_path.read_text(encoding="utf-8")
    pattern = re.compile(
        r'\{\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*sign:\s*"([^"]+)",\s*'
        r'born:\s*"([^"]+)",\s*birthDay:\s*(\d+),\s*birthMonth:\s*(\d+),\s*'
        r'nationality:\s*"([^"]+)",\s*category:\s*"([^"]+)"\s*\}'
    )
    return [
        {
            "name":       m.group(1),
            "slug":       m.group(2),
            "sign":       m.group(3),
            "born":       m.group(4),
            "birthDay":   int(m.group(5)),
            "birthMonth": int(m.group(6)),
            "nationality":m.group(7),
            "category":   m.group(8),
        }
        for m in pattern.finditer(text)
    ]


def fetch_bio(celeb: dict) -> dict | None:
    """Call the backend and return {article: {...}, life_path: N} or None on failure."""
    sign_label = SIGN_LABEL[celeb["sign"]]
    params = urllib.parse.urlencode({
        "name":        celeb["name"],
        "sign":        sign_label,
        "born":        celeb["born"],
        "nationality": celeb["nationality"],
        "category":    celeb["category"],
        "day":         celeb["birthDay"],
        "month":       celeb["birthMonth"],
    })
    url = f"{BACKEND_URL}/celebrities/{celeb['slug']}?{params}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read())
            # Validate: must have article with at least one real field
            if data.get("article") and data["article"].get("famous_for", "—") != "—":
                return data
            print(f"  WARN: empty article returned", file=sys.stderr)
            return None
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return None


def main():
    script_dir = Path(__file__).parent
    repo_root  = script_dir.parent.parent

    ts_path  = repo_root / "frontend" / "lib" / "celebrities.ts"
    out_path = repo_root / "frontend" / "lib" / "celeb-bios.json"

    if not ts_path.exists():
        print(f"ERROR: cannot find {ts_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Parsing {ts_path.name} ...", flush=True)
    celebs = parse_celebrities(ts_path)
    print(f"Found {len(celebs)} celebrities\n")

    # Load existing results so we can resume after interruption
    existing: dict = {}
    if out_path.exists():
        try:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = {}
    if existing:
        print(f"Resuming — {len(existing)} bios already present, skipping those.\n")

    results = dict(existing)
    pending = [c for c in celebs if c["slug"] not in results]
    failed  = []

    print(f"To generate: {len(pending)}  |  Already done: {len(existing)}\n")

    completed_this_run = 0
    for i, celeb in enumerate(pending, 1):
        print(f"[{i:3}/{len(pending)}] {celeb['name']} ({celeb['nationality']}, {SIGN_LABEL[celeb['sign']]}) ...",
              end=" ", flush=True)
        data = fetch_bio(celeb)
        if data:
            results[celeb["slug"]] = data
            completed_this_run += 1
            print("OK")
        else:
            failed.append(celeb["slug"])
            print("FAILED")

        # Persist progress periodically so interruption doesn't lose work
        if completed_this_run % SAVE_EVERY == 0:
            out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  [saved {len(results)} entries so far]")

        time.sleep(DELAY_SECONDS)

    # Final save
    out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{'='*50}")
    print(f"Done.")
    print(f"  Generated this run : {completed_this_run}")
    print(f"  Already existed    : {len(existing)}")
    print(f"  Failed             : {len(failed)}")
    print(f"  Total in JSON      : {len(results)}")
    if failed:
        print(f"\nFailed slugs ({len(failed)}):")
        for s in failed:
            print(f"  - {s}")
        print("\nRe-run the script to retry failed entries.")
    else:
        print(f"\nAll {len(results)} bios saved to {out_path}")


if __name__ == "__main__":
    main()
