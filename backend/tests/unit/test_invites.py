"""Partner invites: /invites, /invites/{token}, /invites/{token}/accept."""
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import update

import db
import main

INVITER = {"name": "Alex Morgan", "day": 15, "month": 3, "mbti": "INTJ", "gender": "M"}
PARTNER = {"name": "Jordan", "day": 22, "month": 8, "mbti": "ENFP", "gender": "F"}


@pytest.fixture()
def pipeline_calls(monkeypatch):
    import invites

    calls = {"n": 0}

    def fake(analysis_type, a, b=None):
        calls["n"] += 1
        return {"relationship_intelligence": {"overall_compatibility_score": 77}, "names": [a["name"], b["name"]]}

    monkeypatch.setattr(invites, "run_analysis", fake)
    return calls


def _create(client, **kw):
    r = client.post("/invites", json={"inviter": INVITER}, **kw)
    assert r.status_code == 200, r.text
    return r.json()


def test_create_returns_a_token_and_link(client):
    body = _create(client)
    assert len(body["token"]) >= 20
    assert body["url"].endswith(f"/i/{body['token']}")


def test_partner_view_exposes_only_first_name_and_sign(client):
    token = _create(client)["token"]
    r = client.get(f"/invites/{token}")
    assert r.status_code == 200
    body = r.json()
    assert body["first_name"] == "Alex"
    assert body["sign"] == "Pisces"
    assert body["status"] == "pending"
    assert body["result_id"] is None
    # Nothing about the inviter's birth date, type or surname reaches the partner.
    for secret in ("Morgan", "INTJ", "birth"):
        assert secret not in r.text
    assert 15 not in body.values() and 3 not in body.values()
    assert set(body) == {"first_name", "sign", "status", "result_id", "expires_at"}


def test_unknown_token_is_404(client):
    assert client.get("/invites/nope").status_code == 404
    assert client.post("/invites/nope/accept", json={"partner": PARTNER}).status_code == 404


def test_accept_creates_the_report_for_both(client, pipeline_calls):
    token = _create(client)["token"]
    r = client.post(f"/invites/{token}/accept", json={"partner": PARTNER})
    assert r.status_code == 200
    rid = r.json()["result_id"]

    report = client.get(f"/results/{rid}").json()
    assert report["analysis_type"] == "full_relationship_intelligence"
    assert report["title"] == "Alex Morgan × Jordan Synastry Report"
    personas = report["payload"]["personas"]
    assert personas["a"]["name"] == "Alex Morgan" and personas["a"]["sign"] == "Pisces"
    assert personas["b"]["name"] == "Jordan" and personas["b"]["sign"] == "Leo"

    # The inviter's link now says "ready" and points at the same report.
    state = client.get(f"/invites/{token}").json()
    assert state["status"] == "accepted" and state["result_id"] == rid


def test_accepting_twice_returns_the_same_report_without_rerunning(client, pipeline_calls):
    token = _create(client)["token"]
    first = client.post(f"/invites/{token}/accept", json={"partner": PARTNER}).json()["result_id"]
    other = {**PARTNER, "name": "Someone Else"}
    second = client.post(f"/invites/{token}/accept", json={"partner": other}).json()["result_id"]
    assert first == second
    assert pipeline_calls["n"] == 1


def test_expired_invite_is_410_and_reported_expired(client, pipeline_calls):
    token = _create(client)["token"]
    past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    with db.get_engine().begin() as conn:
        conn.execute(update(db.invites).where(db.invites.c.token == token).values(expires_at=past))

    assert client.get(f"/invites/{token}").json()["status"] == "expired"
    r = client.post(f"/invites/{token}/accept", json={"partner": PARTNER})
    assert r.status_code == 410
    assert pipeline_calls["n"] == 0


def test_signed_in_inviter_owns_the_report(client, pipeline_calls, monkeypatch):
    import mailer

    sent = []
    monkeypatch.setattr(mailer, "send_login_email", lambda to, link: sent.append(link) or True)
    assert client.post("/auth/request-link", json={"email": "inviter@example.com"}).status_code == 200
    verified = client.post("/auth/verify", json={"token": sent[-1].split("token=")[1]}).json()
    headers = {"Authorization": f"Bearer {verified['session_token']}"}

    token = client.post("/invites", json={"inviter": INVITER}, headers=headers).json()["token"]
    rid = client.post(f"/invites/{token}/accept", json={"partner": PARTNER}).json()["result_id"]  # partner is anonymous

    mine = client.get("/me/readings", headers=headers).json()["readings"]
    assert [r["id"] for r in mine] == [rid]


def test_validation(client):
    bad = dict(INVITER, mbti="XXXX")
    assert client.post("/invites", json={"inviter": bad}).status_code == 422
    assert client.post("/invites", json={"inviter": dict(INVITER, day=40)}).status_code == 422
    assert client.post("/invites", json={}).status_code == 422
    token = _create(client)["token"]
    assert client.post(f"/invites/{token}/accept", json={"partner": dict(PARTNER, mbti="")}).status_code == 422


def test_creating_invites_is_rate_limited_per_ip(client, monkeypatch):
    import invites

    monkeypatch.setattr(invites, "_PER_IP_HOUR", 3)
    for _ in range(3):
        assert client.post("/invites", json={"inviter": INVITER}).status_code == 200
    assert client.post("/invites", json={"inviter": INVITER}).status_code == 429


def test_accept_is_charged_to_the_ai_budget_and_failure_leaves_it_retryable(client, pipeline_calls, monkeypatch):
    token = _create(client)["token"]
    before = main.usage_counter["count"]
    assert client.post(f"/invites/{token}/accept", json={"partner": PARTNER}).status_code == 200
    assert main.usage_counter["count"] == before + 1

    # A pipeline failure must not burn the invite.
    import invites

    token2 = _create(client)["token"]

    def boom(*a, **k):
        raise RuntimeError("gemini down")

    monkeypatch.setattr(invites, "run_analysis", boom)
    assert client.post(f"/invites/{token2}/accept", json={"partner": PARTNER}).status_code == 500
    assert client.get(f"/invites/{token2}").json()["status"] == "pending"
