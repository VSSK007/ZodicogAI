#!/usr/bin/env python3
"""
Record real backend responses as fixtures for the Playwright end-to-end tests
(frontend/e2e/fixtures/). The tests replay these instead of calling Gemini, so
they are fast, free and deterministic while exercising realistic payloads.

    # backend running on :8000 with a real GEMINI_API_KEY
    python backend/scripts/record_e2e_fixtures.py

Existing fixtures are kept; pass --force to re-record everything after a
response schema changes.
"""
import json
import sys
from pathlib import Path

import requests

BASE = "http://127.0.0.1:8000"
OUT = Path(__file__).resolve().parents[2] / "frontend" / "e2e" / "fixtures"

A = {"name": "Alex", "day": 15, "month": 3, "mbti": "INTJ"}
B = {"name": "Jordan", "day": 22, "month": 8, "mbti": "ENFP"}


def pair(extra=None):
    body = {
        "person_a_name": A["name"], "person_a_day": A["day"], "person_a_month": A["month"], "person_a_mbti": A["mbti"],
        "person_b_name": B["name"], "person_b_day": B["day"], "person_b_month": B["month"], "person_b_mbti": B["mbti"],
    }
    body.update(extra or {})
    return body


def simple_pair():
    return {
        "person_a_name": A["name"], "person_a_day": A["day"], "person_a_month": A["month"],
        "person_b_name": B["name"], "person_b_day": B["day"], "person_b_month": B["month"],
    }


def simple_solo():
    return {"person_a_name": A["name"], "person_a_day": A["day"], "person_a_month": A["month"]}


JSON_CALLS = {
    "hybrid": ("/analyze/hybrid", A),
    "sextrology-pair": ("/analyze/sextrology", pair({"person_a_gender": "M"})),
    "sextrology-solo": ("/analyze/sextrology", {
        "person_a_name": A["name"], "person_a_day": A["day"], "person_a_month": A["month"],
        "person_a_mbti": A["mbti"], "person_a_gender": "M",
    }),
    "love-style": ("/analyze/love-style", pair()),
    "love-language": ("/analyze/love-language", pair()),
    "color-solo": ("/analyze/color", simple_solo()),
    "color-pair": ("/analyze/color", simple_pair()),
    "numerology-solo": ("/analyze/numerology", simple_solo()),
    "numerology-pair": ("/analyze/numerology", simple_pair()),
    "zodiac": ("/analyze/zodiac", {"name": A["name"], "day": A["day"], "month": A["month"]}),
    "full": ("/analyze/full", pair()),
}

SSE_CALLS = {
    "emotional-stream": ("/analyze/emotional/stream", pair()),
    "romantic-stream": ("/analyze/romantic/stream", pair()),
}


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    failed = []
    force = "--force" in sys.argv
    for name, (path, body) in JSON_CALLS.items():
        if (OUT / f"{name}.json").exists() and not force:
            continue
        r = requests.post(BASE + path, json=body, timeout=180)
        if r.status_code != 200:
            failed.append((name, r.status_code, r.text[:120]))
            continue
        (OUT / f"{name}.json").write_text(json.dumps(r.json(), ensure_ascii=False, indent=1), encoding="utf-8")
        print("recorded", name)
    for name, (path, body) in SSE_CALLS.items():
        if (OUT / f"{name}.sse.txt").exists() and not force:
            continue
        r = requests.post(BASE + path, json=body, timeout=180)
        if r.status_code != 200 or '"done": true' not in r.text:
            failed.append((name, r.status_code, r.text[-120:]))
            continue
        (OUT / f"{name}.sse.txt").write_text(r.text, encoding="utf-8")
        print("recorded", name)
    if failed:
        print("FAILED:", failed)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
