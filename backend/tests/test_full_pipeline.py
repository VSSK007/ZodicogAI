"""
Full pipeline integration test.

Calls every API endpoint with sample data and verifies response shape.
Run from the backend/ directory with the server running:
    python tests/test_full_pipeline.py

Or run standalone (starts/stops server automatically):
    python tests/test_full_pipeline.py --standalone
"""

import sys
import io
import json
import time
import subprocess
import argparse
import requests

# Force UTF-8 output on Windows so box/check characters render correctly
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
# Sample data
# ---------------------------------------------------------------------------

PERSON_A = {"name": "Alex",  "day": 15, "month": 3,  "mbti": "INTJ"}
PERSON_B = {"name": "Jordan","day": 22, "month": 8,  "mbti": "ENFP"}

PAIR_BODY = {
    "person_a_name":  PERSON_A["name"],  "person_a_day":   PERSON_A["day"],
    "person_a_month": PERSON_A["month"], "person_a_mbti":  PERSON_A["mbti"],
    "person_b_name":  PERSON_B["name"],  "person_b_day":   PERSON_B["day"],
    "person_b_month": PERSON_B["month"], "person_b_mbti":  PERSON_B["mbti"],
}

SINGLE_BODY = {
    "name": PERSON_A["name"], "day": PERSON_A["day"],
    "month": PERSON_A["month"], "mbti": PERSON_A["mbti"],
}

CHAT_PAIR_BODY = {
    "message": "How well do we communicate and handle conflict?",
    "person_a": PERSON_A,
    "person_b": PERSON_B,
}

CHAT_SINGLE_BODY = {
    "message": "What are my biggest relationship strengths?",
    "person_a": PERSON_A,
}

BASE = "http://localhost:8000"

# ---------------------------------------------------------------------------
# Expected schema keys per endpoint
# ---------------------------------------------------------------------------

EXPECTED_KEYS: dict[str, list[str]] = {
    "/hybrid-analysis":        ["zodiac_profile", "mbti_profile", "analysis"],
    "/compatibility":          ["vector_similarity_percent", "element_compatibility",
                                "modality_interaction", "relationship_dynamic"],
    "/analyze/hybrid":         ["zodiac_profile", "mbti_profile", "analysis"],
    "/analyze/compatibility":  ["vector_similarity_percent", "element_compatibility",
                                "relationship_dynamic", "communication_pattern"],
    "/analyze/emotional":      ["emotional_compatibility_score",
                                "emotional_expression_similarity", "analysis"],
    "/analyze/romantic":       ["romantic_compatibility_score",
                                "emotional_compatibility_score", "analysis"],
    "/analyze/sextrology":     ["sexual_compatibility_score",
                                "intimacy_intensity_alignment", "analysis"],
    "/analyze/love-style":     ["a_love_style", "b_love_style",
                                "love_style_compatibility_score"],
    "/analyze/love-language":  ["a_love_language", "b_love_language",
                                "love_language_compatibility_score"],
    "/analyze/full":           ["vector_similarity_percent", "emotional",
                                "romantic", "sextrology", "love_style",
                                "love_language", "relationship_intelligence", "analysis"],
    "/chat (pair)":            ["intent", "response", "data"],
    "/chat (single)":          ["intent", "response", "data"],
}

# ---------------------------------------------------------------------------
# Test cases: (label, method, path, body)
# ---------------------------------------------------------------------------

TESTS = [
    ("Legacy: /hybrid-analysis",        "POST", "/hybrid-analysis",       SINGLE_BODY),
    ("Legacy: /compatibility",           "POST", "/compatibility",          PAIR_BODY),
    ("New: /analyze/hybrid",             "POST", "/analyze/hybrid",         SINGLE_BODY),
    ("New: /analyze/compatibility",      "POST", "/analyze/compatibility",  PAIR_BODY),
    ("New: /analyze/emotional",          "POST", "/analyze/emotional",      PAIR_BODY),
    ("New: /analyze/romantic",           "POST", "/analyze/romantic",       PAIR_BODY),
    ("New: /analyze/sextrology",         "POST", "/analyze/sextrology",     PAIR_BODY),
    ("New: /analyze/love-style",         "POST", "/analyze/love-style",     PAIR_BODY),
    ("New: /analyze/love-language",      "POST", "/analyze/love-language",  PAIR_BODY),
    ("New: /analyze/full",               "POST", "/analyze/full",           PAIR_BODY),
    ("Chat: /chat (pair)",               "POST", "/chat",                   CHAT_PAIR_BODY),
    ("Chat: /chat (single)",             "POST", "/chat",                   CHAT_SINGLE_BODY),
]

# Map label → expected-keys entry name
_LABEL_TO_KEY = {
    "Legacy: /hybrid-analysis":        "/hybrid-analysis",
    "Legacy: /compatibility":           "/compatibility",
    "New: /analyze/hybrid":             "/analyze/hybrid",
    "New: /analyze/compatibility":      "/analyze/compatibility",
    "New: /analyze/emotional":          "/analyze/emotional",
    "New: /analyze/romantic":           "/analyze/romantic",
    "New: /analyze/sextrology":         "/analyze/sextrology",
    "New: /analyze/love-style":         "/analyze/love-style",
    "New: /analyze/love-language":      "/analyze/love-language",
    "New: /analyze/full":               "/analyze/full",
    "Chat: /chat (pair)":               "/chat (pair)",
    "Chat: /chat (single)":             "/chat (single)",
}

# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

def run_test(label: str, method: str, path: str, body: dict) -> tuple[bool, str]:
    """Run one test. Returns (passed, detail_message)."""
    url = BASE + path
    try:
        resp = requests.request(method, url, json=body, timeout=120)
    except requests.ConnectionError:
        return False, "CONNECTION ERROR — is the server running?"

    status = resp.status_code
    try:
        data = resp.json()
    except Exception:
        return False, f"HTTP {status} — response is not valid JSON"

    if status != 200:
        detail = data.get("detail", data) if isinstance(data, dict) else data
        return False, f"HTTP {status} — {detail}"

    # Schema check
    expected = EXPECTED_KEYS.get(_LABEL_TO_KEY.get(label, ""), [])
    missing = [k for k in expected if k not in data]
    if missing:
        return False, f"HTTP 200 but missing keys: {missing}"

    return True, "OK"


def print_response_preview(data: dict, indent: int = 2) -> None:
    """Print a truncated preview of the response."""
    def _trim(obj, depth=0):
        if depth > 2:
            return "..."
        if isinstance(obj, dict):
            return {k: _trim(v, depth + 1) for k, v in list(obj.items())[:6]}
        if isinstance(obj, list):
            trimmed = [_trim(i, depth + 1) for i in obj[:3]]
            return trimmed + (["..."] if len(obj) > 3 else [])
        if isinstance(obj, str) and len(obj) > 120:
            return obj[:120] + "…"
        return obj

    print(json.dumps(_trim(data), indent=indent, ensure_ascii=False))


# ---------------------------------------------------------------------------
# Optional standalone mode: start/stop uvicorn automatically
# ---------------------------------------------------------------------------

_server_proc: subprocess.Popen | None = None


def _start_server():
    global _server_proc
    import os
    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    backend_dir = str(__file__).replace("\\", "/").rsplit("/tests/", 1)[0]
    _server_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=backend_dir,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    # Wait until the server is accepting connections
    for _ in range(30):
        time.sleep(1)
        try:
            requests.get(BASE + "/", timeout=2)
            return
        except requests.ConnectionError:
            pass
    raise RuntimeError("Server did not start within 30 seconds")


def _stop_server():
    if _server_proc:
        _server_proc.terminate()
        _server_proc.wait(timeout=10)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--standalone", action="store_true",
                        help="Start and stop the uvicorn server automatically")
    args = parser.parse_args()

    if args.standalone:
        print("Starting uvicorn server…")
        _start_server()
        print("Server started.\n")

    passed = 0
    failed = 0
    results = []

    print("=" * 70)
    print(f"  ZodicogAI Full Pipeline Test")
    print(f"  Person A: {PERSON_A['name']} — {PERSON_A['day']}/{PERSON_A['month']}, {PERSON_A['mbti']}")
    print(f"  Person B: {PERSON_B['name']} — {PERSON_B['day']}/{PERSON_B['month']}, {PERSON_B['mbti']}")
    print("=" * 70)

    for label, method, path, body in TESTS:
        print(f"\n{'─' * 70}")
        print(f"  TEST: {label}")
        print(f"  URL : {method} {BASE}{path}")

        ok, detail = run_test(label, method, path, body)
        symbol = "✓  PASS" if ok else "✗  FAIL"
        print(f"  {symbol}  —  {detail}")

        if ok:
            passed += 1
            # Show a preview of the actual response
            try:
                resp = requests.request(method, BASE + path, json=body, timeout=120)
                print("  Response preview:")
                print_response_preview(resp.json())
            except Exception:
                pass
        else:
            failed += 1

        results.append((label, ok, detail))

    print(f"\n{'=' * 70}")
    print(f"  Results: {passed} passed, {failed} failed out of {len(TESTS)} tests")
    print("=" * 70)

    if failed:
        print("\nFailed tests:")
        for label, ok, detail in results:
            if not ok:
                print(f"  ✗  {label}: {detail}")

    if args.standalone:
        _stop_server()

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
