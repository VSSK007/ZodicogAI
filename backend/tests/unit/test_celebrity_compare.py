"""Compare any two public figures: GET /celebrities/compare/{a}/{b} (zodiac + numerology only)."""
import itertools
import json
import re

from engines import celebrity_rank


def get(client, a="lady-gaga", b="elton-john"):
    return client.get(f"/celebrities/compare/{a}/{b}")


def test_returns_both_sides_and_the_blend(client):
    r = get(client)
    assert r.status_code == 200
    d = r.json()
    assert d["a"]["name"] == "Lady Gaga" and d["b"]["name"] == "Elton John"
    assert d["a"]["sign"] == "aries" and d["a"]["element"] == "Fire"
    assert isinstance(d["a"]["life_path"], int)
    # 50/50 blend (each half is rounded for display, so allow a rounding hair)
    assert abs(d["score"] - (d["zodiac_score"] + d["numerology_score"]) / 2) <= 0.1
    assert 0 <= d["score"] <= 100


def test_unknown_and_identical_are_rejected(client):
    assert get(client, "nobody-real", "elton-john").status_code == 404
    assert get(client, "lady-gaga", "nobody-real").status_code == 404
    assert get(client, "lady-gaga", "lady-gaga").status_code == 400


def test_deterministic(client):
    assert get(client).json() == get(client).json()


def test_the_zodiac_half_is_symmetric_and_the_numerology_half_follows_the_engine():
    ab = celebrity_rank.compare("lady-gaga", "emma-watson")
    ba = celebrity_rank.compare("emma-watson", "lady-gaga")
    assert ab["zodiac_score"] == ba["zodiac_score"]
    assert ab["numerology_score"] == ba["numerology_score"]
    assert ab["score"] == ba["score"]


def test_output_never_mentions_mbti_or_a_relationship_between_the_two(client):
    # Every pair in a sample across all signs: the text is about signs and numbers only.
    people = celebrity_rank.celebrities()
    sample = [p["slug"] for p in people[::12]][:30]
    banned = ("mbti", "intj", "enfp", "couple", "dating", "married", "partner", "relationship", "together", "lovers", "you ")
    for a, b in itertools.islice(itertools.combinations(sample, 2), 120):
        text = json.dumps(celebrity_rank.compare(a, b)).lower()
        for word in banned:
            assert word not in text, (a, b, word)


def test_the_why_line_is_third_person_and_names_both_frameworks():
    for a, b in [("lady-gaga", "elton-john"), ("emma-watson", "elon-musk"), ("tom-hanks", "taylor-swift")]:
        if not (celebrity_rank.by_slug(a) and celebrity_rank.by_slug(b)):
            continue
        why = celebrity_rank.compare(a, b)["why"]
        assert re.search(r"life paths? \d+", why), why
        assert any(e in why for e in ("Fire", "Earth", "Air", "Water")), why
        assert "you" not in why.lower().split(), why


def test_the_personal_matcher_keeps_its_second_person_wording(client):
    # rank_matches talks to the visitor ("you"); only the two-celebrity comparison is neutral.
    why = celebrity_rank.rank_matches("Alex", 15, 3, limit=40)
    assert any("you" in m["why"].lower() for m in why)


def test_the_route_is_not_swallowed_by_the_slug_route(client):
    # /celebrities/{slug} needs name/sign/born/...; if it won this would be a 422 about those.
    assert get(client).status_code == 200


def test_a_shared_life_path_reads_grammatically():
    from engines.celebrity_rank import _numerology_clause

    assert _numerology_clause(3, 3, 80) == "shared life path 3, a natural fit"
    assert _numerology_clause(3, 3, 65) == "shared life path 3, a workable fit"
    assert _numerology_clause(3, 3, 40) == "shared life path 3, a mixed fit"
    assert _numerology_clause(3, 5, 80) == "life paths 3 and 5 align naturally"
    assert _numerology_clause(4, 1, 51) == "life paths 4 and 1 pull in different directions"
