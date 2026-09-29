"""Passwordless accounts: sign-in flow, sessions, ownership, deletion."""
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select, update

import auth
import db
import mailer


@pytest.fixture()
def inbox(monkeypatch):
    """Capture outgoing sign-in emails instead of sending them."""
    sent: list[tuple[str, str]] = []
    monkeypatch.setattr(mailer, "send_login_email", lambda to, link: sent.append((to, link)) or True)
    return sent


def token_from(link: str) -> str:
    return link.split("token=")[1]


def sign_in(client, inbox, email="ada@example.com") -> dict:
    assert client.post("/auth/request-link", json={"email": email}).status_code == 200
    token = token_from(inbox[-1][1])
    r = client.post("/auth/verify", json={"token": token})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['session_token']}"}


def test_full_sign_in_flow(client, inbox):
    headers = sign_in(client, inbox)
    me = client.get("/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["user"]["email"] == "ada@example.com"


def test_email_is_normalised_and_accounts_are_unique(client, inbox):
    a = sign_in(client, inbox, "  Ada@Example.COM ")
    b = sign_in(client, inbox, "ada@example.com")
    assert client.get("/me", headers=a).json()["user"]["id"] == client.get("/me", headers=b).json()["user"]["id"]


def test_login_link_is_single_use(client, inbox):
    client.post("/auth/request-link", json={"email": "ada@example.com"})
    token = token_from(inbox[-1][1])
    assert client.post("/auth/verify", json={"token": token}).status_code == 200
    again = client.post("/auth/verify", json={"token": token})
    assert again.status_code == 400


def test_login_link_expires(client, inbox):
    client.post("/auth/request-link", json={"email": "ada@example.com"})
    token = token_from(inbox[-1][1])
    past = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    with db.get_engine().begin() as conn:
        conn.execute(update(db.login_tokens).values(expires_at=past))
    assert client.post("/auth/verify", json={"token": token}).status_code == 400


def test_garbage_tokens_are_rejected(client):
    for bad in ["", "nope", "x" * 300]:
        assert client.post("/auth/verify", json={"token": bad}).status_code in (400, 422)


def test_tokens_are_stored_hashed_never_raw(client, inbox):
    headers = sign_in(client, inbox)
    raw_login = token_from(inbox[-1][1])
    raw_session = headers["Authorization"].split(" ")[1]
    with db.get_engine().connect() as conn:
        stored = [r[0] for r in conn.execute(select(db.login_tokens.c.token_hash))]
        stored += [r[0] for r in conn.execute(select(db.sessions.c.token_hash))]
    assert raw_login not in stored and raw_session not in stored
    assert all(len(h) == 64 for h in stored)


def test_requesting_a_link_does_not_reveal_whether_an_account_exists(client, inbox):
    sign_in(client, inbox, "exists@example.com")
    known = client.post("/auth/request-link", json={"email": "exists@example.com"})
    unknown = client.post("/auth/request-link", json={"email": "brand-new@example.com"})
    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json()


def test_invalid_email_is_rejected(client, inbox):
    assert client.post("/auth/request-link", json={"email": "not-an-email"}).status_code == 400
    assert inbox == []


def test_requests_are_rate_limited_per_address(client, inbox):
    codes = [client.post("/auth/request-link", json={"email": "spam@example.com"}).status_code for _ in range(7)]
    assert codes[:5] == [200] * 5
    assert 429 in codes[5:]


def test_dev_link_is_only_returned_when_explicitly_enabled(client, inbox, monkeypatch):
    plain = client.post("/auth/request-link", json={"email": "a@example.com"}).json()
    assert "dev_link" not in plain
    monkeypatch.setenv("AUTH_DEV_LINKS", "1")
    dev = client.post("/auth/request-link", json={"email": "b@example.com"}).json()
    assert "/auth/verify?token=" in dev["dev_link"]


def test_protected_routes_need_a_session(client):
    for method, path in [("get", "/me"), ("get", "/me/profile"), ("get", "/me/readings"), ("delete", "/me")]:
        assert getattr(client, method)(path).status_code == 401
    assert client.get("/me", headers={"Authorization": "Bearer forged"}).status_code == 401


def test_logout_invalidates_the_session(client, inbox):
    headers = sign_in(client, inbox)
    assert client.post("/auth/logout", headers=headers).status_code == 200
    assert client.get("/me", headers=headers).status_code == 401


def test_expired_sessions_stop_working(client, inbox):
    headers = sign_in(client, inbox)
    past = (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat()
    with db.get_engine().begin() as conn:
        conn.execute(update(db.sessions).values(expires_at=past))
    assert client.get("/me", headers=headers).status_code == 401


def test_profile_round_trip_and_validation(client, inbox):
    headers = sign_in(client, inbox)
    assert client.get("/me/profile", headers=headers).json() == {"profile": None}

    body = {"name": "Ada", "day": 10, "month": 12, "mbti": "intj", "gender": "F"}
    put = client.put("/me/profile", json=body, headers=headers)
    assert put.status_code == 200
    assert client.get("/me/profile", headers=headers).json()["profile"] == {**body, "mbti": "INTJ"}

    # Replaced, not appended.
    client.put("/me/profile", json={**body, "name": "Ada L."}, headers=headers)
    assert client.get("/me/profile", headers=headers).json()["profile"]["name"] == "Ada L."

    for bad in [{**body, "day": 40}, {**body, "month": 0}, {**body, "mbti": "XXXX"}, {**body, "name": "  "}, {**body, "gender": "Z"}]:
        assert client.put("/me/profile", json=bad, headers=headers).status_code == 422


def test_profiles_are_private_to_their_owner(client, inbox):
    a = sign_in(client, inbox, "a@example.com")
    b = sign_in(client, inbox, "b@example.com")
    client.put("/me/profile", json={"name": "Alice", "day": 1, "month": 1}, headers=a)
    assert client.get("/me/profile", headers=b).json() == {"profile": None}


def test_signed_in_readings_follow_the_user_anonymous_ones_do_not(client, inbox):
    headers = sign_in(client, inbox)
    mine = client.post("/results", json={"analysis_type": "color_analysis", "title": "Mine", "payload": {"x": 1}}, headers=headers).json()["id"]
    anon = client.post("/results", json={"analysis_type": "color_analysis", "title": "Anon", "payload": {"x": 2}}).json()["id"]

    listed = client.get("/me/readings", headers=headers).json()["readings"]
    assert [r["id"] for r in listed] == [mine]
    # Both stay publicly viewable by link.
    assert client.get(f"/results/{mine}").status_code == 200
    assert client.get(f"/results/{anon}").status_code == 200


def test_claiming_adopts_anonymous_readings_but_never_steals_owned_ones(client, inbox):
    anon = client.post("/results", json={"analysis_type": "t", "title": "Anon", "payload": {}}).json()["id"]
    other = sign_in(client, inbox, "other@example.com")
    theirs = client.post("/results", json={"analysis_type": "t", "title": "Theirs", "payload": {}}, headers=other).json()["id"]

    me = sign_in(client, inbox, "me@example.com")
    res = client.post("/me/claim", json={"ids": [anon, theirs, "nonexistent"]}, headers=me)
    assert res.json()["claimed"] == 1
    assert [r["id"] for r in client.get("/me/readings", headers=me).json()["readings"]] == [anon]
    assert [r["id"] for r in client.get("/me/readings", headers=other).json()["readings"]] == [theirs]


def test_deleting_an_account_removes_everything_it_owned(client, inbox):
    headers = sign_in(client, inbox)
    client.put("/me/profile", json={"name": "Ada", "day": 1, "month": 1}, headers=headers)
    rid = client.post("/results", json={"analysis_type": "t", "title": "Mine", "payload": {}}, headers=headers).json()["id"]
    keep = client.post("/results", json={"analysis_type": "t", "title": "Anon", "payload": {}}).json()["id"]

    assert client.delete("/me", headers=headers).status_code == 200
    assert client.get("/me", headers=headers).status_code == 401
    assert client.get(f"/results/{rid}").status_code == 404
    assert client.get(f"/results/{keep}").status_code == 200
    with db.get_engine().connect() as conn:
        assert conn.execute(select(db.users)).first() is None
        assert conn.execute(select(db.profiles)).first() is None


def test_email_provider_failure_does_not_break_or_leak(client, monkeypatch):
    def boom(*_a):
        raise RuntimeError("smtp down")

    monkeypatch.setattr(mailer, "send_login_email", boom)
    r = client.post("/auth/request-link", json={"email": "ada@example.com"})
    assert r.status_code == 200 and r.json() == {"ok": True}


def test_auth_module_helpers():
    assert auth.bearer("Bearer abc") == "abc"
    assert auth.bearer("bearer  abc ") == "abc"
    assert auth.bearer("Basic abc") is None
    assert auth.bearer(None) is None
    with pytest.raises(auth.AuthError):
        auth.normalize_email("a b@c.d")
