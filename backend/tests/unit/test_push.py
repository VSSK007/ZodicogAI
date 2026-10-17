"""Web push: subscribing, who is due when, sending, cleaning up, and the cron script."""
import importlib.util
from datetime import datetime, timezone
from pathlib import Path

import pytest
from sqlalchemy import select

import db
import push

ENDPOINT = "https://fcm.googleapis.com/fcm/send/abc123"
SUB = {
    "endpoint": ENDPOINT, "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
    "auth": "tBHItJI5svbpez7KI4CCXg", "sign": "pisces", "mbti": "INTJ", "tz": "Asia/Kolkata", "hour": 8,
}


def rows():
    with db.get_engine().connect() as conn:
        return [dict(r) for r in conn.execute(select(db.push_subscriptions)).mappings().all()]


def subscribe(client, **over):
    return client.post("/push/subscribe", json={**SUB, **over})


@pytest.fixture(autouse=True)
def _reset(monkeypatch):
    push.reset_rate_limits()


# --- API ------------------------------------------------------------------------

def test_public_key_is_404_until_configured(client, monkeypatch):
    monkeypatch.delenv("VAPID_PUBLIC_KEY", raising=False)
    assert client.get("/push/public-key").status_code == 404
    monkeypatch.setenv("VAPID_PUBLIC_KEY", "BKEY")
    assert client.get("/push/public-key").json() == {"public_key": "BKEY"}


def test_subscribe_stores_only_what_the_nudge_needs(client):
    r = subscribe(client)
    assert r.status_code == 200
    (row,) = rows()
    assert row["endpoint"] == ENDPOINT and row["sign"] == "pisces" and row["tz"] == "Asia/Kolkata" and row["hour"] == 8
    assert row["last_sent"] is None
    # No name, birth date or account anywhere in the table.
    assert set(row) == {"endpoint", "p256dh", "auth", "sign", "mbti", "tz", "hour", "created_at", "last_sent"}


def test_subscribing_again_updates_instead_of_duplicating(client):
    subscribe(client)
    push.mark_sent(ENDPOINT, "2026-10-19")
    subscribe(client, hour=19, tz="America/New_York", sign="leo")
    (row,) = rows()
    assert (row["hour"], row["tz"], row["sign"]) == (19, "America/New_York", "leo")
    assert row["last_sent"] == "2026-10-19"  # changing the time must not trigger a second nudge today


def test_unsubscribe_removes_it(client):
    subscribe(client)
    r = client.request("DELETE", "/push/subscribe", json={"endpoint": ENDPOINT})
    assert r.status_code == 200 and r.json()["removed"] is True
    assert rows() == []
    assert client.request("DELETE", "/push/subscribe", json={"endpoint": ENDPOINT}).json()["removed"] is False


@pytest.mark.parametrize("bad", [
    {"endpoint": "http://insecure.example/x"},
    {"sign": "ophiuchus"},
    {"tz": "Mars/Olympus_Mons"},
    {"hour": 24},
    {"hour": -1},
    {"mbti": "XXXX"},
    {"auth": ""},
])
def test_validation(client, bad):
    assert subscribe(client, **bad).status_code == 422
    assert rows() == []


def test_rate_limited_per_ip(client, monkeypatch):
    monkeypatch.setattr(push, "_PER_IP_HOUR", 2)
    assert subscribe(client).status_code == 200
    assert subscribe(client).status_code == 200
    assert subscribe(client).status_code == 429


# --- who is due -----------------------------------------------------------------

def utc(s: str) -> datetime:
    return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)


def test_due_when_the_local_hour_matches():
    ist = {**SUB, "last_sent": None}                       # Asia/Kolkata = UTC+5:30, hour 8
    assert push.is_due(ist, utc("2026-10-20T02:35:00"))     # 08:05 IST
    assert push.is_due(ist, utc("2026-10-20T03:10:00"))     # 08:40 IST, same hour
    assert not push.is_due(ist, utc("2026-10-20T03:30:00"))  # 09:00 IST
    assert not push.is_due(ist, utc("2026-10-20T08:05:00"))  # 13:35 IST


def test_not_due_twice_on_the_same_local_day_but_due_the_next():
    sent = {**SUB, "last_sent": "2026-10-20"}
    assert not push.is_due(sent, utc("2026-10-20T02:35:00"))
    assert push.is_due(sent, utc("2026-10-21T02:35:00"))


def test_time_zones_and_dst_are_respected():
    la = {**SUB, "tz": "America/Los_Angeles", "last_sent": None}  # PDT (UTC-7) on 20 Oct, PST (UTC-8) after 1 Nov
    assert push.is_due(la, utc("2026-10-20T15:05:00"))
    assert not push.is_due(la, utc("2026-10-20T16:05:00"))
    assert push.is_due(la, utc("2026-11-10T16:05:00"))
    assert not push.is_due(la, utc("2026-11-10T15:05:00"))


def test_an_unknown_zone_in_the_table_is_treated_as_utc():
    odd = {**SUB, "tz": "Not/AZone", "hour": 8, "last_sent": None}
    assert push.is_due(odd, utc("2026-10-20T08:05:00"))


# --- sending --------------------------------------------------------------------

def message(sub, day):
    return {"title": f"Your day, {sub['sign'].capitalize()}", "body": "Hello", "url": "/today"}


def add(client, n=1, **over):
    for i in range(n):
        assert subscribe(client, endpoint=f"https://push.example/{i}", **over).status_code == 200


def test_run_daily_sends_to_those_due_once_and_marks_them(client):
    add(client, 2)                                   # both 08:00 IST
    subscribe(client, endpoint="https://push.example/later", hour=20)  # not due at 08:05 IST
    sent = []
    now = utc("2026-10-20T02:35:00")
    counts = push.run_daily(now, message, send=lambda sub, msg: sent.append((sub["endpoint"], msg)))
    assert counts == {"due": 2, "sent": 2, "removed": 0, "failed": 0}
    assert sorted(e for e, _ in sent) == ["https://push.example/0", "https://push.example/1"]
    assert sent[0][1] == {"title": "Your day, Pisces", "body": "Hello", "url": "/today"}
    assert {r["last_sent"] for r in rows() if r["hour"] == 8} == {"2026-10-20"}

    # The next hourly run in the same hour sends nothing.
    again = push.run_daily(utc("2026-10-20T03:05:00"), message, send=lambda *a: sent.append("DUPLICATE"))
    assert again["sent"] == 0 and "DUPLICATE" not in sent


def test_gone_subscriptions_are_deleted(client):
    add(client, 2)

    def send(sub, msg):
        if sub["endpoint"].endswith("/0"):
            raise push.Gone()

    counts = push.run_daily(utc("2026-10-20T02:35:00"), message, send=send)
    assert counts["removed"] == 1 and counts["sent"] == 1
    assert [r["endpoint"] for r in rows()] == ["https://push.example/1"]


def test_a_failure_is_isolated_and_retried_next_time(client):
    add(client, 2)

    def send(sub, msg):
        if sub["endpoint"].endswith("/0"):
            raise RuntimeError("push service down")

    counts = push.run_daily(utc("2026-10-20T02:35:00"), message, send=send)
    assert counts["failed"] == 1 and counts["sent"] == 1
    by_endpoint = {r["endpoint"]: r["last_sent"] for r in rows()}
    assert by_endpoint["https://push.example/0"] is None  # not marked: eligible again in its hour
    assert by_endpoint["https://push.example/1"] == "2026-10-20"


def test_dry_run_sends_and_changes_nothing(client, capsys):
    add(client, 1)
    sent = []
    counts = push.run_daily(utc("2026-10-20T02:35:00"), message, send=lambda *a: sent.append(a), dry_run=True)
    assert counts["due"] == 1 and counts["sent"] == 0 and sent == []
    assert rows()[0]["last_sent"] is None
    assert "[dry-run]" in capsys.readouterr().out


def test_send_webpush_maps_404_and_410_to_gone(monkeypatch):
    import pywebpush

    monkeypatch.setenv("VAPID_PRIVATE_KEY", "dPo-7LYlbTO0xweyuuGXkW12n9FMKeAA-y8BwbJDqXU")

    class Resp:
        def __init__(self, status):
            self.status_code = status

    def boom(status):
        def _webpush(**kwargs):
            raise pywebpush.WebPushException("nope", response=Resp(status))
        return _webpush

    for status in (404, 410):
        monkeypatch.setattr(pywebpush, "webpush", boom(status))
        with pytest.raises(push.Gone):
            push.send_webpush(SUB, {"title": "t"})

    monkeypatch.setattr(pywebpush, "webpush", boom(500))
    with pytest.raises(pywebpush.WebPushException):
        push.send_webpush(SUB, {"title": "t"})


def test_send_webpush_passes_the_subscription_payload_and_vapid(monkeypatch):
    import pywebpush

    seen = {}
    monkeypatch.setenv("VAPID_PRIVATE_KEY", "dPo-7LYlbTO0xweyuuGXkW12n9FMKeAA-y8BwbJDqXU")
    monkeypatch.setenv("VAPID_SUBJECT", "mailto:ops@example.com")
    monkeypatch.setattr(pywebpush, "webpush", lambda **kw: seen.update(kw))
    push.send_webpush(SUB, {"title": "Hi", "body": "There", "url": "/today"})
    assert seen["subscription_info"] == {"endpoint": ENDPOINT, "keys": {"p256dh": SUB["p256dh"], "auth": SUB["auth"]}}
    assert '"title": "Hi"' in seen["data"]
    assert seen["vapid_claims"] == {"sub": "mailto:ops@example.com"}


# --- the cron script --------------------------------------------------------------

def load_script():
    path = Path(__file__).resolve().parents[2] / "scripts" / "send_daily_push.py"
    spec = importlib.util.spec_from_file_location("send_daily_push", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_first_line_is_a_clean_short_sentence():
    script = load_script()
    assert script.first_line("**Today** rewards patience. Then it gets busy.") == "Today rewards patience."
    long = "word " * 80
    out = script.first_line(long)
    assert len(out) <= script.BODY_MAX and out.endswith("…")
    assert script.first_line("") == ""


def test_message_uses_the_first_line_of_todays_horoscope_and_shares_the_site_cache(client, monkeypatch):
    import daily

    script = load_script()
    now = utc("2026-10-20T02:35:00")
    calls = []

    def fake_payload(sign, on):
        calls.append(sign)
        return {"sign": sign, "article": {"reading": "A steady day. Pace yourself.", "focus_area": "x", "advice": "y"}}

    monkeypatch.setattr(daily, "horoscope_payload", fake_payload)
    build = script.make_message_builder(now)
    msg = build({"sign": "pisces"}, "2026-10-20")
    assert msg == {"title": "Your day, Pisces", "body": "A steady day.", "url": "/today"}
    build({"sign": "pisces"}, "2026-10-20")
    assert calls == ["pisces"]  # once per sign per run

    # A second run (or the website) finds it in the database: no new generation.
    build2 = script.make_message_builder(now)
    assert build2({"sign": "pisces"}, "2026-10-20")["body"] == "A steady day."
    assert calls == ["pisces"]


def test_a_failed_generation_falls_back_and_is_not_stored(client, monkeypatch):
    import daily

    script = load_script()
    now = utc("2026-10-20T02:35:00")
    monkeypatch.setattr(daily, "horoscope_payload", lambda sign, on: {"article": {"reading": "—", "focus_area": "—", "advice": "—"}})
    msg = script.make_message_builder(now)({"sign": "leo"}, "2026-10-20")
    assert msg["body"] == "Your Leo reading is ready."
    assert daily.get_json(daily.horoscope_key("leo", now.date())) is None


def test_the_website_and_the_script_share_one_horoscope_per_day(client, monkeypatch):
    """/horoscope/leo generates and stores it; the script then reuses it without Gemini."""
    import daily
    import gemini_client
    import main
    from models.schemas import HoroscopeArticle

    monkeypatch.setattr(
        gemini_client, "call_gemini",
        lambda prompt, schema: HoroscopeArticle(reading="Roar softly. Then rest.", focus_area="Rest", advice="Sleep.")
        if schema is HoroscopeArticle else schema(),
    )
    main._content_cache.clear()
    assert client.get("/horoscope/leo").status_code == 200
    on = datetime.now(timezone.utc).date()
    assert daily.get_json(daily.horoscope_key("leo", on)) is not None  # persisted for other processes

    script = load_script()
    monkeypatch.setattr(daily, "horoscope_payload", lambda *a: pytest.fail("the script must reuse the stored horoscope"))
    msg = script.make_message_builder(datetime.now(timezone.utc))({"sign": "leo"}, on.isoformat())
    assert msg["body"] == "Roar softly."
