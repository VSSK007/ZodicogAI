"""Group chemistry: 3-8 people, deterministic pair scores, one AI call per group."""
import pytest

from engines import group_engine

PEOPLE = [
    {"name": "Alex", "day": 15, "month": 3, "mbti": "INTJ"},
    {"name": "Jordan", "day": 22, "month": 8, "mbti": "ENFP"},
    {"name": "Sam", "day": 2, "month": 11, "mbti": "ISFJ"},
]


def body(n=3):
    extra = [
        {"name": "Riley", "day": 9, "month": 6, "mbti": "ESTP"},
        {"name": "Kai", "day": 30, "month": 1, "mbti": "INFP"},
        {"name": "Mo", "day": 12, "month": 12, "mbti": "ENTJ"},
        {"name": "Ada", "day": 5, "month": 5, "mbti": "ISTP"},
        {"name": "Lee", "day": 17, "month": 9, "mbti": "ESFJ"},
    ]
    return {"people": (PEOPLE + extra)[:n]}


@pytest.fixture()
def gemini_calls(monkeypatch):
    import gemini_client
    from models.schemas import GroupSummary

    calls = {"n": 0, "prompts": []}

    def fake(prompt, schema):
        if schema is GroupSummary:
            calls["n"] += 1
            calls["prompts"].append(prompt)
            return GroupSummary(
                group_dynamic="A balanced table.", glue_note="Holds it together.",
                strongest_pair_note="Easy.", spiciest_pair_note="Spark.", tip="Plan something.",
            )
        return schema()

    monkeypatch.setattr(gemini_client, "call_gemini", fake)
    return calls


@pytest.mark.parametrize("n", [3, 8])
def test_three_and_eight_people_work(client, gemini_calls, n):
    r = client.post("/analyze/group", json=body(n))
    assert r.status_code == 200, r.text
    data = r.json()
    assert len(data["people"]) == n
    assert len(data["pairs"]) == n * (n - 1) // 2
    assert len(data["matrix"]) == n and all(len(row) == n for row in data["matrix"])
    assert all(data["matrix"][i][i] is None for i in range(n))
    assert all(data["matrix"][i][j] == data["matrix"][j][i] for i in range(n) for j in range(n) if i != j)


@pytest.mark.parametrize("n", [2, 9])
def test_too_few_or_too_many_is_a_friendly_400(client, gemini_calls, n):
    people = [dict(PEOPLE[0], name=f"P{i}") for i in range(n)]
    r = client.post("/analyze/group", json={"people": people})
    assert r.status_code == 400
    assert "between 3 and 8" in r.json()["detail"]
    assert gemini_calls["n"] == 0


def test_exactly_one_gemini_call_per_request_whatever_the_size(client, gemini_calls):
    client.post("/analyze/group", json=body(8))  # 28 pairs
    assert gemini_calls["n"] == 1
    client.post("/analyze/group", json=body(4))
    assert gemini_calls["n"] == 2


def test_summary_headlines_are_consistent_with_the_matrix(client, gemini_calls):
    d = client.post("/analyze/group", json=body(5)).json()
    scores = [p["score"] for p in d["pairs"]]
    assert d["strongest"]["score"] == max(scores)
    assert d["spiciest"]["score"] == min(scores)
    assert d["glue"]["average"] == max(d["averages"])
    assert d["people"][d["glue"]["index"]]["name"] == d["glue"]["name"]
    assert d["group_score"] == pytest.approx(sum(scores) / len(scores), abs=0.1)
    assert d["analysis"]["group_dynamic"] == "A balanced table."


def test_pair_scores_equal_the_full_reports_overall_score(client, gemini_calls):
    d = client.post("/analyze/group", json=body(3)).json()
    a, b = PEOPLE[0], PEOPLE[1]
    full = client.post("/analyze/full", json={
        "person_a_name": a["name"], "person_a_day": a["day"], "person_a_month": a["month"], "person_a_mbti": a["mbti"],
        "person_b_name": b["name"], "person_b_day": b["day"], "person_b_month": b["month"], "person_b_mbti": b["mbti"],
    }).json()
    assert d["matrix"][0][1] == pytest.approx(full["relationship_intelligence"]["overall_score"], abs=0.1)


def test_deterministic(client, gemini_calls):
    a = client.post("/analyze/group", json=body(6)).json()
    b = client.post("/analyze/group", json=body(6)).json()
    for k in ("matrix", "pairs", "averages", "group_score", "glue", "strongest", "spiciest"):
        assert a[k] == b[k]


def test_prompt_carries_numbers_and_names_but_no_birth_dates(client, gemini_calls):
    client.post("/analyze/group", json=body(3))
    prompt = gemini_calls["prompts"][0]
    assert "Alex" in prompt and "Jordan" in prompt and "Pisces" in prompt
    assert "1982" not in prompt and "/03" not in prompt  # no dates are sent
    assert "birth" not in prompt.lower()


def test_validation(client, gemini_calls):
    bad_mbti = body(3)
    bad_mbti["people"][1]["mbti"] = ""
    assert client.post("/analyze/group", json=bad_mbti).status_code == 400
    bad_date = body(3)
    bad_date["people"][2].update(day=31, month=2)
    assert client.post("/analyze/group", json=bad_date).status_code == 400
    blank = body(3)
    blank["people"][0]["name"] = "   "
    assert client.post("/analyze/group", json=blank).status_code == 400
    assert gemini_calls["n"] == 0


def test_engine_rejects_out_of_range_directly():
    with pytest.raises(ValueError, match="between 3 and 8"):
        group_engine.analyze_group(PEOPLE[:2], scorer=lambda a, b: 50.0)


def test_ties_resolve_by_position():
    flat = group_engine.analyze_group(PEOPLE, scorer=lambda a, b: 70.0)
    assert flat["glue"]["index"] == 0
    assert (flat["strongest"]["a"], flat["strongest"]["b"]) == (0, 1)
    assert (flat["spiciest"]["a"], flat["spiciest"]["b"]) == (0, 1)
