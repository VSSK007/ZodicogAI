"""The personal daily card: GET /daily/{sign}."""
from datetime import date

import pytest

import main
from engines.color_engine import daily_lucky_color
from engines.numerology_engine import personal_day_number


@pytest.fixture()
def gemini_calls(monkeypatch):
    """Replace Gemini with a counter that returns real-looking text."""
    import gemini_client
    from models.schemas import DailyTip, HoroscopeArticle

    calls = {"horoscope": 0, "tip": 0}

    def fake(prompt, schema):
        if schema is HoroscopeArticle:
            calls["horoscope"] += 1
            return HoroscopeArticle(reading="A steady day.", focus_area="Quiet progress", advice="Pace yourself.")
        if schema is DailyTip:
            calls["tip"] += 1
            return DailyTip(mbti_tip="Trust your read of the room.", do_this="Call a friend.", avoid_this="Overthinking.")
        return schema()

    monkeypatch.setattr(gemini_client, "call_gemini", fake)
    main._content_cache.clear()
    return calls


def test_card_has_every_field(client, gemini_calls):
    r = client.get("/daily/leo?mbti=INTJ&day=15&month=3")
    assert r.status_code == 200
    body = r.json()
    assert body["sign"] == "leo" and body["mbti"] == "INTJ"
    assert body["horoscope"] == "A steady day."
    assert body["mbti_tip"] == "Trust your read of the room."
    assert body["do"] == "Call a friend." and body["avoid"] == "Overthinking."
    assert body["lucky_color"]["hex"].startswith("#")
    assert isinstance(body["lucky_number"], int)
    assert set(body["scores"]) >= {"love", "career", "energy", "luck", "overall"}


def test_same_inputs_same_day_are_identical_and_cached(client, gemini_calls):
    a = client.get("/daily/leo?mbti=INTJ&day=15&month=3").json()
    b = client.get("/daily/leo?mbti=INTJ&day=15&month=3").json()
    assert a == b
    assert gemini_calls == {"horoscope": 1, "tip": 1}  # second request cost nothing


def test_tip_is_shared_across_birthdays_but_lucky_extras_are_personal(client, gemini_calls):
    a = client.get("/daily/leo?mbti=INTJ&day=15&month=3").json()
    b = client.get("/daily/leo?mbti=INTJ&day=2&month=11").json()
    assert a["mbti_tip"] == b["mbti_tip"]
    assert gemini_calls["tip"] == 1  # one call per (sign, mbti, day)


def test_different_type_gets_its_own_tip(client, gemini_calls):
    client.get("/daily/leo?mbti=INTJ")
    client.get("/daily/leo?mbti=ENFP")
    assert gemini_calls["tip"] == 2
    assert gemini_calls["horoscope"] == 1  # the horoscope is per sign, not per type


def test_tip_survives_a_restart_of_the_in_memory_cache(client, gemini_calls):
    client.get("/daily/virgo?mbti=ISFJ")
    main._content_cache.clear()  # simulates a process restart
    client.get("/daily/virgo?mbti=ISFJ")
    assert gemini_calls["tip"] == 1  # came back from daily_cache
    assert gemini_calls["horoscope"] == 2


def test_works_without_a_profile(client, gemini_calls):
    r = client.get("/daily/aries")
    assert r.status_code == 200
    assert r.json()["mbti"] == ""
    assert r.json()["mbti_tip"]


def test_failed_generation_shows_fallback_and_is_not_cached(client, monkeypatch):
    # conftest's default stub returns schema() defaults ("—"), i.e. Gemini down.
    main._content_cache.clear()
    r = client.get("/daily/aries?mbti=INTJ")
    assert r.status_code == 200
    assert "—" not in (r.json()["mbti_tip"], r.json()["do"], r.json()["avoid"])
    import daily
    from datetime import datetime

    assert daily.get_cached_tip(daily.tip_key("aries", "INTJ", datetime.utcnow().date())) is None


def test_validation(client, gemini_calls):
    assert client.get("/daily/notasign").status_code == 404
    assert client.get("/daily/leo?mbti=XXXX").status_code == 400
    assert client.get("/daily/leo?day=15").status_code == 400  # day without month
    assert client.get("/daily/leo?day=32&month=3").status_code == 400
    assert client.get("/daily/leo?day=3&month=13").status_code == 400
    assert gemini_calls == {"horoscope": 0, "tip": 0}


def test_ip_budget_is_charged_only_on_a_cache_miss(client, gemini_calls):
    client.get("/daily/leo?mbti=INTJ")  # miss
    before = sum(e["count"] for e in main._ip_usage.values())
    for _ in range(5):
        client.get("/daily/leo?mbti=INTJ")  # hits
    after = sum(e["count"] for e in main._ip_usage.values())
    assert before == 1 and after == 1


def test_ip_budget_exhausted_returns_429_on_a_miss_but_hits_still_work(client, gemini_calls, monkeypatch):
    client.get("/daily/leo?mbti=INTJ")  # warm the cache
    monkeypatch.setattr(main, "MAX_DAILY_AI_CALLS_PER_IP", 1)
    assert client.get("/daily/leo?mbti=INTJ").status_code == 200  # hit: free
    assert client.get("/daily/cancer?mbti=INTJ").status_code == 429  # miss: over budget


def test_lucky_extras_are_deterministic():
    d = date(2026, 10, 12)
    assert daily_lucky_color("3-15", d) == daily_lucky_color("3-15", d)
    assert personal_day_number(15, 3, d) == personal_day_number(15, 3, d)
    # Changes with the day (over a week, not every value can be equal).
    colors = {daily_lucky_color("3-15", date(2026, 10, n))["hex"] for n in range(1, 8)}
    assert len(colors) > 1
    assert personal_day_number(15, 3, d) in {1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33}
