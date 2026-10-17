"""The Monday email: opt-in, who is eligible, one AI call per sign, one-click unsubscribe."""
import importlib.util
from datetime import datetime, timezone
from pathlib import Path

import pytest
from sqlalchemy import select

import db
import digest
import mailer

SECRET = "test-digest-secret"
MONDAY = datetime(2026, 10, 19, 8, 0, tzinfo=timezone.utc)  # ISO week 2026-W43


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("DIGEST_SECRET", SECRET)
    monkeypatch.setenv("BACKEND_PUBLIC_URL", "https://api.example.com")
    monkeypatch.setenv("FRONTEND_URL", "https://example.com")


@pytest.fixture()
def inbox(monkeypatch):
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(mailer, "send_login_email", lambda to, link: sent.append((to, link)) or True)
    return sent


def sign_in(client, inbox, email) -> dict:
    assert client.post("/auth/request-link", json={"email": email}).status_code == 200
    token = inbox[-1][1].split("token=")[1]
    r = client.post("/auth/verify", json={"token": token})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['session_token']}"}


def user_id(client, headers) -> str:
    return client.get("/me", headers=headers).json()["user"]["id"]


def profile(client, headers, day=15, month=3, mbti="INTJ"):
    r = client.put("/me/profile", headers=headers, json={"name": "Alex", "day": day, "month": month, "mbti": mbti, "gender": "M"})
    assert r.status_code == 200, r.text


def digest_flag(uid) -> int:
    with db.get_engine().connect() as conn:
        return conn.execute(select(db.users.c.weekly_digest).where(db.users.c.id == uid)).scalar_one()


def opted_in(client, inbox, email, **profile_kw):
    h = sign_in(client, inbox, email)
    profile(client, h, **profile_kw)
    assert client.put("/me/digest", headers=h, json={"enabled": True}).status_code == 200
    return h


@pytest.fixture()
def outlook_calls(monkeypatch):
    import gemini_client
    from models.schemas import WeeklyOutlook

    calls = {"n": 0, "signs": []}

    def fake(prompt, schema):
        if schema is WeeklyOutlook:
            calls["n"] += 1
            calls["signs"].append(prompt.split("for ")[1].split(" ")[0])
            return WeeklyOutlook(outlook="A <b>steady</b> week.", compatibility_tip="Say the kind thing.")
        return schema()

    monkeypatch.setattr(gemini_client, "call_gemini", fake)
    return calls


# --- opting in --------------------------------------------------------------------

def test_off_by_default_and_visible_on_me(client, inbox):
    h = sign_in(client, inbox, "ada@example.com")
    assert client.get("/me", headers=h).json()["user"]["weekly_digest"] is False
    assert digest_flag(user_id(client, h)) == 0


def test_turning_it_on_needs_sign_in_and_a_saved_profile(client, inbox):
    assert client.put("/me/digest", json={"enabled": True}).status_code == 401
    h = sign_in(client, inbox, "ada@example.com")
    r = client.put("/me/digest", headers=h, json={"enabled": True})
    assert r.status_code == 400 and "profile" in r.json()["detail"]
    profile(client, h)
    assert client.put("/me/digest", headers=h, json={"enabled": True}).json() == {"weekly_digest": True}
    assert client.get("/me", headers=h).json()["user"]["weekly_digest"] is True
    assert client.put("/me/digest", headers=h, json={"enabled": False}).json() == {"weekly_digest": False}
    assert client.get("/me", headers=h).json()["user"]["weekly_digest"] is False


# --- unsubscribe tokens -------------------------------------------------------------

def test_token_round_trip_and_tampering():
    token = digest.unsubscribe_token("user-abc_123")
    assert digest.verify_token(token) == "user-abc_123"
    uid, _, sig = token.rpartition(".")
    assert digest.verify_token(f"other-user.{sig}") is None        # a token for someone else
    assert digest.verify_token(f"{uid}.{sig[:-2]}xx") is None      # altered signature
    assert digest.verify_token(sig) is None and digest.verify_token("") is None
    assert digest.verify_token("x" * 500) is None


def test_a_token_signed_with_another_secret_is_rejected(monkeypatch):
    token = digest.unsubscribe_token("u1")
    monkeypatch.setenv("DIGEST_SECRET", "a-different-secret")
    assert digest.verify_token(token) is None


def test_unsubscribe_link_works_without_signing_in(client, inbox):
    h = opted_in(client, inbox, "ada@example.com")
    uid = user_id(client, h)
    token = digest.unsubscribe_token(uid)
    r = client.get(f"/email/unsubscribe?t={token}")  # no Authorization header
    assert r.status_code == 200 and "unsubscribed" in r.text.lower()
    assert digest_flag(uid) == 0


def test_one_click_post_unsubscribes_too(client, inbox):
    h = opted_in(client, inbox, "ada@example.com")
    uid = user_id(client, h)
    r = client.post(f"/email/unsubscribe?t={digest.unsubscribe_token(uid)}", data={"List-Unsubscribe": "One-Click"})
    assert r.status_code == 200 and r.json() == {"ok": True}
    assert digest_flag(uid) == 0


def test_a_tampered_link_is_rejected_and_changes_nothing(client, inbox):
    h = opted_in(client, inbox, "ada@example.com")
    uid = user_id(client, h)
    bad = digest.unsubscribe_token(uid)[:-3] + "AAA"
    assert client.get(f"/email/unsubscribe?t={bad}").status_code == 400
    assert client.post(f"/email/unsubscribe?t={bad}").status_code == 400
    assert client.get("/email/unsubscribe").status_code == 400
    assert digest_flag(uid) == 1


def test_without_a_secret_the_endpoints_say_so(client, monkeypatch):
    monkeypatch.delenv("DIGEST_SECRET")
    assert client.get("/email/unsubscribe?t=x.y").status_code == 503
    assert client.post("/email/unsubscribe?t=x.y").status_code == 503


# --- who gets it -------------------------------------------------------------------

def test_only_opted_in_users_with_a_profile_are_eligible(client, inbox):
    opted_in(client, inbox, "yes@example.com", day=15, month=3)                    # Pisces, opted in
    h = sign_in(client, inbox, "no@example.com"); profile(client, h)                # profile, not opted in
    off = opted_in(client, inbox, "off@example.com"); client.put("/me/digest", headers=off, json={"enabled": False})
    h2 = sign_in(client, inbox, "noprofile@example.com")
    # Force the flag on for a user with no profile (a stale or hand-edited row) - still skipped.
    uid = user_id(client, h2)
    from sqlalchemy import update
    with db.get_engine().begin() as conn:
        conn.execute(update(db.users).where(db.users.c.id == uid).values(weekly_digest=1))
    assert [u["email"] for u in digest.eligible_users()] == ["yes@example.com"]
    assert digest.eligible_users()[0]["sign"] == "Pisces"


# --- sending -----------------------------------------------------------------------

class Outbox:
    def __init__(self):
        self.items = []

    def __call__(self, to, subject, text, html, headers=None):
        self.items.append({"to": to, "subject": subject, "text": text, "html": html, "headers": headers})
        return True


def test_each_recipient_gets_a_complete_email_with_working_unsubscribe(client, inbox, outlook_calls):
    h = opted_in(client, inbox, "ada@example.com", day=15, month=3)
    uid = user_id(client, h)
    out = Outbox()
    counts = digest.run_weekly(MONDAY, send=out)
    assert counts == {"eligible": 1, "sent": 1, "skipped": 0, "failed": 0, "unsent": 0}

    (mail,) = out.items
    assert mail["to"] == "ada@example.com"
    assert mail["subject"] == "Your week ahead, Pisces"
    assert "Week of 19 October" in mail["text"]
    assert "steady" in mail["text"] and "Say the kind thing." in mail["text"]
    assert "https://example.com/today" in mail["text"] and "https://example.com/today" in mail["html"]
    assert "&lt;b&gt;steady&lt;/b&gt;" in mail["html"]  # model text is escaped, never injected as HTML

    token = digest.unsubscribe_token(uid)
    link = f"https://api.example.com/email/unsubscribe?t={token}"
    assert link in mail["text"] and link in mail["html"]
    assert mail["headers"]["List-Unsubscribe"] == f"<{link}>"
    assert mail["headers"]["List-Unsubscribe-Post"] == "List-Unsubscribe=One-Click"


def test_one_ai_call_per_sign_per_week_however_many_recipients(client, inbox, outlook_calls):
    for i in range(3):
        opted_in(client, inbox, f"pisces{i}@example.com", day=15, month=3)
    opted_in(client, inbox, "leo@example.com", day=1, month=8)
    out = Outbox()
    counts = digest.run_weekly(MONDAY, send=out)
    assert counts["sent"] == 4 and len(out.items) == 4
    assert outlook_calls["n"] == 2  # Pisces once, Leo once

    # Next week's run for the same sign generates again; the same week reuses the stored one.
    assert digest.outlook_for("Pisces", MONDAY.date(), generate=True)["outlook"].startswith("A <b>")
    assert outlook_calls["n"] == 2


def test_at_most_one_email_per_person_per_week(client, inbox, outlook_calls):
    opted_in(client, inbox, "ada@example.com")
    out = Outbox()
    assert digest.run_weekly(MONDAY, send=out)["sent"] == 1
    again = digest.run_weekly(MONDAY.replace(hour=9), send=out)
    assert again["sent"] == 0 and again["skipped"] == 1 and len(out.items) == 1
    nxt = digest.run_weekly(MONDAY.replace(day=26), send=out)  # the following Monday
    assert nxt["sent"] == 1 and len(out.items) == 2


def test_a_failure_for_one_address_does_not_stop_the_others(client, inbox, outlook_calls):
    opted_in(client, inbox, "a@example.com")
    opted_in(client, inbox, "b@example.com")
    sent = []

    def flaky(to, subject, text, html, headers=None):
        if to == "a@example.com":
            raise RuntimeError("mailbox full")
        sent.append(to)
        return True

    counts = digest.run_weekly(MONDAY, send=flaky)
    assert counts["failed"] == 1 and counts["sent"] == 1 and sent == ["b@example.com"]
    # The failed one is not marked, so the next run retries it.
    assert [u["email"] for u in digest.eligible_users() if u["last_digest_week"] is None] == ["a@example.com"]


def test_no_email_provider_means_unsent_and_retried(client, inbox, outlook_calls):
    opted_in(client, inbox, "ada@example.com")
    counts = digest.run_weekly(MONDAY, send=lambda *a, **k: False)
    assert counts["unsent"] == 1 and counts["sent"] == 0
    assert digest.eligible_users()[0]["last_digest_week"] is None


def test_dry_run_prints_but_sends_marks_and_generates_nothing(client, inbox, outlook_calls, capsys):
    opted_in(client, inbox, "ada@example.com")
    out = Outbox()
    counts = digest.run_weekly(MONDAY, send=out, dry_run=True)
    assert counts["eligible"] == 1 and counts["sent"] == 0 and out.items == []
    assert outlook_calls["n"] == 0
    printed = capsys.readouterr().out
    assert "[dry-run]" in printed and "a***@example.com" in printed and "ada@" not in printed  # masked
    assert digest.eligible_users()[0]["last_digest_week"] is None


def test_it_refuses_to_send_without_a_secret_but_a_dry_run_is_fine(client, inbox, monkeypatch):
    opted_in(client, inbox, "ada@example.com")
    monkeypatch.delenv("DIGEST_SECRET")
    with pytest.raises(RuntimeError, match="DIGEST_SECRET"):
        digest.run_weekly(MONDAY, send=Outbox())
    digest.run_weekly(MONDAY, send=Outbox(), dry_run=True)


def test_a_failed_generation_uses_a_gentle_fallback_and_is_not_stored(client, inbox):
    # conftest's default stub returns WeeklyOutlook("—", "—"): Gemini is down.
    opted_in(client, inbox, "ada@example.com")
    out = Outbox()
    assert digest.run_weekly(MONDAY, send=out)["sent"] == 1
    assert "—" not in out.items[0]["text"]
    assert digest.FALLBACK["outlook"] in out.items[0]["text"]
    import daily
    assert daily.get_json("weekly:pisces:2026-W43") is None


# --- mailer ------------------------------------------------------------------------

def test_send_email_passes_headers_to_resend(monkeypatch):
    seen = {}

    class Resp:
        def raise_for_status(self):
            pass

    monkeypatch.setenv("RESEND_API_KEY", "re_test")
    monkeypatch.setattr(mailer.httpx, "post", lambda url, headers, json, timeout: seen.update(url=url, json=json) or Resp())
    assert mailer.send_email("a@b.co", "S", "T", "<p>H</p>", {"List-Unsubscribe": "<https://x/u>"}) is True
    assert seen["url"] == "https://api.resend.com/emails"
    assert seen["json"]["headers"] == {"List-Unsubscribe": "<https://x/u>"}
    assert seen["json"]["subject"] == "S" and seen["json"]["to"] == ["a@b.co"]


def test_send_email_without_a_provider_returns_false(monkeypatch):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.delenv("SMTP_HOST", raising=False)
    assert mailer.send_email("a@b.co", "S", "T", "<p>H</p>") is False


# --- the cron script ----------------------------------------------------------------

def test_script_dry_run_and_missing_secret(client, inbox, capsys, monkeypatch):
    path = Path(__file__).resolve().parents[2] / "scripts" / "send_weekly_digest.py"
    spec = importlib.util.spec_from_file_location("send_weekly_digest", path)
    script = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(script)

    opted_in(client, inbox, "ada@example.com")
    monkeypatch.setattr("sys.argv", ["send_weekly_digest.py", "--dry-run", "--now", "2026-10-19T08:00:00+00:00"])
    assert script.main() == 0
    printed = capsys.readouterr().out
    assert "eligible=1" in printed and "sent=0" in printed and "(dry run)" in printed

    monkeypatch.delenv("DIGEST_SECRET")
    monkeypatch.setattr("sys.argv", ["send_weekly_digest.py", "--now", "2026-10-19T08:00:00+00:00"])
    assert script.main() == 1
    assert "DIGEST_SECRET" in capsys.readouterr().out


def test_an_existing_database_is_upgraded_in_place(tmp_path, monkeypatch):
    """A production DB created before the digest existed gains the columns, keeping its users."""
    from sqlalchemy import create_engine, inspect, text

    url = f"sqlite:///{(tmp_path / 'old.db').as_posix()}"
    old = create_engine(url)
    with old.begin() as conn:
        conn.execute(text(
            "CREATE TABLE users (id VARCHAR(32) PRIMARY KEY, email VARCHAR(320) NOT NULL UNIQUE, "
            "created_at VARCHAR(40) NOT NULL, last_login_at VARCHAR(40))"
        ))
        conn.execute(text("INSERT INTO users (id, email, created_at) VALUES ('u1', 'old@example.com', '2026-01-01T00:00:00+00:00')"))
    old.dispose()

    monkeypatch.setenv("DATABASE_URL", url)
    db.reset_engine()
    engine = db.get_engine()
    cols = {c["name"] for c in inspect(engine).get_columns("users")}
    assert {"weekly_digest", "last_digest_week"} <= cols
    with engine.connect() as conn:
        row = conn.execute(text("SELECT email, weekly_digest, last_digest_week FROM users")).one()
    assert tuple(row) == ("old@example.com", 0, None)  # existing users are NOT opted in
