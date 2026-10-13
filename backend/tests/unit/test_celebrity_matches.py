"""Celebrity matches: deterministic ranking by zodiac + numerology, never MBTI."""
import json
import re
import subprocess
import sys
from pathlib import Path

from engines import celebrity_rank

ROOT = Path(__file__).resolve().parents[3]


def get(client, **params):
    base = {"name": "Alex", "day": 15, "month": 3}
    return client.get("/celebrities/matches", params={**base, **params})


def test_returns_five_ranked_matches_by_default(client):
    r = get(client)
    assert r.status_code == 200
    matches = r.json()["matches"]
    assert len(matches) == 5
    scores = [m["score"] for m in matches]
    assert scores == sorted(scores, reverse=True)
    for m in matches:
        assert set(m) == {"slug", "name", "sign", "category", "score", "zodiac_score", "numerology_score", "why"}
        assert 0 <= m["score"] <= 100


def test_deterministic_for_the_same_person(client):
    assert get(client).json() == get(client).json()


def test_limit_and_validation(client):
    assert len(get(client, limit=12).json()["matches"]) == 12
    assert get(client, limit=0).status_code == 400
    assert get(client, limit=21).status_code == 400
    assert get(client, month=13).status_code == 400
    assert get(client, day=31, month=2).status_code == 400
    assert get(client, day=29, month=2).status_code == 200  # leap day exists
    assert get(client, name="   ").status_code == 400
    assert client.get("/celebrities/matches", params={"day": 1, "month": 1}).status_code == 422  # name missing


def test_the_route_is_not_swallowed_by_the_slug_route(client):
    # "/celebrities/{slug}" needs name/sign/born/...; if it won this would be a 422 about those.
    assert get(client).status_code == 200


def test_no_mbti_and_no_relationship_claims_in_the_output(client):
    text = json.dumps(get(client, limit=20).json()).lower()
    for word in ("mbti", "intj", "enfp", "isfj", "couple", "dating", "married", "partner", "relationship"):
        assert word not in text


def test_why_line_names_both_frameworks(client):
    for m in get(client, limit=10).json()["matches"]:
        assert re.search(r"life paths? \d+", m["why"]), m["why"]
        assert any(e in m["why"] for e in ("Fire", "Earth", "Air", "Water")), m["why"]


def test_same_sign_celebrities_fit_better_on_the_zodiac_half(client):
    # The numerology half varies per person (it is half the score), so a same-sign celebrity
    # need not rank first overall - but their zodiac half must beat the field's average.
    ranked = celebrity_rank.rank_matches("Alex", 15, 3, limit=360)
    same = [m["zodiac_score"] for m in ranked if m["sign"] == "pisces"]
    everyone = [m["zodiac_score"] for m in ranked]
    assert len(same) >= 20
    assert min(same) >= 75
    assert sum(same) / len(same) > sum(everyone) / len(everyone)


def test_name_changes_the_numerology_half_only(client):
    a = celebrity_rank.rank_matches("Alex", 15, 3, limit=360)
    b = celebrity_rank.rank_matches("Zed Quillfeather", 15, 3, limit=360)
    za = {m["slug"]: m["zodiac_score"] for m in a}
    zb = {m["slug"]: m["zodiac_score"] for m in b}
    assert za == zb
    na = {m["slug"]: m["numerology_score"] for m in a}
    nb = {m["slug"]: m["numerology_score"] for m in b}
    assert na != nb


def test_snapshot_matches_the_frontend_source_of_truth():
    """celebrities.json is generated from frontend/lib/celebrities.ts - keep them in sync."""
    result = subprocess.run(
        [sys.executable, str(ROOT / "backend" / "scripts" / "export_celebrities.py"), "--check"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_every_celebrity_has_a_real_date_and_matching_sign():
    from engines.zodiac_engine import get_sun_sign

    rows = celebrity_rank.celebrities()
    assert len(rows) == 360
    for c in rows:
        assert get_sun_sign(c["day"], c["month"]).lower() == c["sign"], c["slug"]
