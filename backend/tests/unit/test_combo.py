"""The 192 sign x MBTI guides: GET /blog/combo/{sign}/{mbti}."""
import pytest

import combo
import main


@pytest.fixture()
def gemini(monkeypatch):
    """Replace Gemini with a counter returning a realistic article (override per test via .reply)."""
    import gemini_client
    from models.schemas import SignTypeArticle

    state = {"n": 0, "prompts": [], "reply": None}

    def default():
        return SignTypeArticle(
            overview="A Leo INTJ leads from the back of the room.",
            strengths=["Strategic", "Magnetic", "Loyal", "Driven"],
            blind_spots=["Aloof", "Proud", "Controlling", "Slow to forgive"],
            in_love="Slow to open, total once in.",
            at_work="Plans three moves ahead.",
            best_matches=[
                {"sign": "aquarius", "mbti": "ENFP", "why": "Sparks and space."},
                {"sign": "sagittarius", "mbti": "ENTP", "why": "Ideas for days."},
            ],
        )

    def fake(prompt, schema):
        if schema is SignTypeArticle:
            state["n"] += 1
            state["prompts"].append(prompt)
            return state["reply"]() if state["reply"] else default()
        return schema()

    monkeypatch.setattr(gemini_client, "call_gemini", fake)
    return state


def get(client, sign="leo", mbti="INTJ"):
    return client.get(f"/blog/combo/{sign}/{mbti}")


def test_the_full_set_is_192():
    assert len(combo.SIGNS) * len(combo.TYPES) == 192


def test_a_valid_combination_returns_facts_and_the_article(client, gemini):
    r = get(client)
    assert r.status_code == 200
    d = r.json()
    assert d["sign"] == "leo" and d["mbti"] == "INTJ" and d["type_name"] == "Architect"
    assert 0 <= d["alignment"] <= 100
    assert d["gaps"][0]["axis"] == "expressiveness" and d["gaps"][0]["gap"] == 5  # the engines' numbers, not the model's
    assert d["article"]["overview"].startswith("A Leo INTJ")
    assert len(d["article"]["strengths"]) == 4 and len(d["article"]["blind_spots"]) == 4


def test_case_is_forgiving_and_invalid_combinations_are_404(client, gemini):
    assert get(client, "LEO", "intj").status_code == 200
    for sign, mbti in [("ophiuchus", "INTJ"), ("leo", "XXXX"), ("leo", "INTJX"), ("", "INTJ")]:
        assert get(client, sign, mbti).status_code in (404, 405)
    assert gemini["n"] == 1  # only the one valid request generated anything


def test_generated_once_and_kept_across_restarts(client, gemini):
    get(client)
    get(client)
    assert gemini["n"] == 1
    main._content_cache.clear()  # a restart wipes memory, not the database
    assert get(client).status_code == 200
    assert gemini["n"] == 1


def test_each_combination_is_generated_separately(client, gemini):
    get(client, "leo", "INTJ")
    get(client, "leo", "ENFP")
    get(client, "pisces", "INTJ")
    assert gemini["n"] == 3


def test_a_failed_generation_is_503_and_not_stored(client, gemini):
    from models.schemas import SignTypeArticle

    gemini["reply"] = lambda: SignTypeArticle()  # the "—" defaults: Gemini down
    r = get(client)
    assert r.status_code == 503
    assert combo.get("leo", "INTJ") is None
    # The next request tries again (and succeeds once Gemini is back).
    gemini["reply"] = None
    assert get(client).status_code == 200
    assert gemini["n"] == 2


def test_best_matches_only_link_to_real_pages_and_never_to_itself(client, gemini):
    from models.schemas import SignTypeArticle

    gemini["reply"] = lambda: SignTypeArticle(
        overview="x", strengths=["a"], blind_spots=["b"], in_love="y", at_work="z",
        best_matches=[
            {"sign": "Aquarius", "mbti": "enfp", "why": "ok"},       # normalised
            {"sign": "aquarius", "mbti": "ENFP", "why": "duplicate"},  # dropped
            {"sign": "leo", "mbti": "INTJ", "why": "itself"},          # dropped
            {"sign": "ophiuchus", "mbti": "INTJ", "why": "not a sign"},  # dropped
            {"sign": "libra", "mbti": "ABCD", "why": "not a type"},      # dropped
            {"sign": "gemini", "mbti": "ENTP", "why": "ok"},
        ],
    )
    matches = get(client).json()["article"]["best_matches"]
    assert [(m["sign"], m["mbti"]) for m in matches] == [("aquarius", "ENFP"), ("gemini", "ENTP")]


def test_matches_are_capped(client, gemini):
    from models.schemas import SignTypeArticle

    many = [{"sign": s, "mbti": "ENFP", "why": "w"} for s in combo.SIGNS if s != "leo"]
    gemini["reply"] = lambda: SignTypeArticle(overview="x", strengths=["a"], blind_spots=["b"], in_love="y", at_work="z", best_matches=many)
    assert len(get(client).json()["article"]["best_matches"]) == combo.MAX_MATCHES


def test_the_prompt_is_grounded_in_the_engine_facts_and_forbids_real_people(client, gemini):
    get(client)
    p = gemini["prompts"][0]
    assert "Leo" in p and "INTJ" in p and "Architect" in p
    assert "Fire / Fixed" in p
    assert "expressiveness: Leo says 8/10, INTJ says 3/10" in p
    assert "Never name, quote or describe any real person" in p
    assert "never claim any real person has this type" in p


def test_the_ai_budget_is_charged_only_for_a_real_generation(client, gemini):
    before = main.usage_counter["count"]
    get(client)
    assert main.usage_counter["count"] == before + 1
    get(client)
    assert main.usage_counter["count"] == before + 1  # stored: free


def test_an_exhausted_budget_is_a_429_not_a_crash(client, gemini, monkeypatch):
    monkeypatch.setattr(main, "MAX_DAILY_AI_CALLS", 0)
    r = get(client)
    assert r.status_code == 429
    assert gemini["n"] == 0


def test_facts_are_deterministic_and_symmetric_in_their_gaps():
    a = combo.facts("aries", "ESTP")
    assert a == combo.facts("aries", "ESTP")
    assert all(g["gap"] == abs(g["sign"] - g["type"]) for g in a["gaps"])
    assert a["gaps"][0]["gap"] >= a["gaps"][1]["gap"]
