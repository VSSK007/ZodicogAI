#!/usr/bin/env python3
"""
Export the celebrity list the matcher needs from the frontend's source of
truth (frontend/lib/celebrities.ts) to backend/data/celebrities.json.

    python backend/scripts/export_celebrities.py          # rewrite the snapshot
    python backend/scripts/export_celebrities.py --check  # exit 1 if it is stale

backend/tests/unit/test_celebrity_matches.py runs the same comparison, so CI
fails when someone edits celebrities.ts without re-running this script.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend" / "lib" / "celebrities.ts"
OUT = ROOT / "backend" / "data" / "celebrities.json"

ROW = re.compile(
    r'\{ name: "([^"]+)",\s*slug: "([^"]+)",\s*sign: "([^"]+)", born: "[^"]+",\s*'
    r'birthDay: (\d+),\s*birthMonth: (\d+),\s*nationality: "[^"]+",\s*category: "([^"]+)"'
)


def parse(text: str) -> list[dict]:
    rows = [
        {"name": n, "slug": s, "sign": sg, "day": int(d), "month": int(m), "category": c}
        for n, s, sg, d, m, c in ROW.findall(text)
    ]
    return sorted(rows, key=lambda r: r["slug"])


def render(rows: list[dict]) -> str:
    return json.dumps(rows, ensure_ascii=False, indent=1) + "\n"


def main() -> int:
    rows = parse(SRC.read_text(encoding="utf-8"))
    if not rows:
        print("no celebrities parsed - has the row format in celebrities.ts changed?")
        return 1
    new = render(rows)
    if "--check" in sys.argv:
        old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if old != new:
            print(f"{OUT} is out of date; run: python backend/scripts/export_celebrities.py")
            return 1
        print(f"ok - {len(rows)} celebrities")
        return 0
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(new, encoding="utf-8", newline="\n")
    print(f"wrote {len(rows)} celebrities to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
