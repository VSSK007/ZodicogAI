"""
Passwordless accounts: email a single-use link, exchange it for a session.

Design notes
  - No passwords, so nothing to leak or reset. Login and session tokens are
    random 256-bit values; only their SHA-256 hashes are stored.
  - Login tokens: single use, 15-minute lifetime.
  - Sessions: 30 days, sent as `Authorization: Bearer`. (Bearer-in-localStorage
    rather than a cookie because the API lives on a different origin from the
    site; the tradeoff is that an XSS bug could read it - mitigated by React's
    escaping and a strict no-third-party-script posture.)
  - Requesting a link always answers the same way whether or not the address
    has an account, so it can't be used to discover who is registered.
  - Requests are rate limited per address and per IP.
"""
import hashlib
import os
import re
import secrets
import threading
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, insert, select, update

import db
import mailer

LOGIN_TOKEN_TTL = timedelta(minutes=15)
SESSION_TTL = timedelta(days=30)

EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,}$")

# --- rate limiting (in memory; one process. Move to Redis if this ever scales out) ---
_WINDOW_S = 3600
# Overridable so end-to-end tests (one IP, many sign-ins) aren't throttled.
_PER_EMAIL = int(os.getenv("AUTH_MAX_LINKS_PER_EMAIL_HOUR", "5"))
_PER_IP = int(os.getenv("AUTH_MAX_LINKS_PER_IP_HOUR", "20"))
_hits: dict[str, list[float]] = {}
_hits_lock = threading.Lock()


class AuthError(Exception):
    """A user-facing authentication failure (safe to show)."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def normalize_email(raw: str) -> str:
    email = (raw or "").strip().lower()
    if not EMAIL_RE.match(email) or len(email) > 320:
        raise AuthError("Enter a valid email address.")
    return email


def _rate_limit(key: str, limit: int) -> None:
    now = time.time()
    with _hits_lock:
        recent = [t for t in _hits.get(key, []) if now - t < _WINDOW_S]
        if len(recent) >= limit:
            _hits[key] = recent
            raise AuthError("Too many sign-in requests. Please wait a while and try again.", 429)
        recent.append(now)
        _hits[key] = recent
        if len(_hits) > 5000:  # opportunistic sweep so the dict can't grow forever
            for k in [k for k, v in _hits.items() if not v or now - v[-1] >= _WINDOW_S]:
                _hits.pop(k, None)


def reset_rate_limits() -> None:
    with _hits_lock:
        _hits.clear()


# --- login links ---------------------------------------------------------------

def request_login_link(raw_email: str, ip: str) -> dict:
    """Create a login token and email it. Returns {"sent": bool, "dev_link": str|None}.
    `dev_link` is only ever present when AUTH_DEV_LINKS=1 (local dev and CI)."""
    email = normalize_email(raw_email)
    _rate_limit(f"ip:{ip}", _PER_IP)
    _rate_limit(f"email:{email}", _PER_EMAIL)

    token = secrets.token_urlsafe(32)
    with db.get_engine().begin() as conn:
        conn.execute(insert(db.login_tokens).values(
            token_hash=_hash(token), email=email, created_at=_iso(_now()),
            expires_at=_iso(_now() + LOGIN_TOKEN_TTL), used=0,
        ))
        conn.execute(delete(db.login_tokens).where(db.login_tokens.c.expires_at < _iso(_now() - timedelta(days=1))))

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    link = f"{frontend}/auth/verify?token={token}"
    sent = False
    try:
        sent = mailer.send_login_email(email, link)
    except Exception:  # noqa: BLE001 - a provider outage must not reveal anything or 500
        import logging
        logging.getLogger(__name__).exception("sending login email failed")
    return {"sent": sent, "dev_link": link if os.getenv("AUTH_DEV_LINKS") == "1" else None}


def verify_login_token(token: str) -> tuple[str, dict]:
    """Exchange a login token for (session_token, user). Single use."""
    if not token or len(token) > 200:
        raise AuthError("This sign-in link is invalid or has expired.")
    lt = db.login_tokens
    with db.get_engine().begin() as conn:
        row = conn.execute(select(lt.c.email, lt.c.expires_at, lt.c.used).where(lt.c.token_hash == _hash(token))).first()
        if row is None or row.used or row.expires_at < _iso(_now()):
            raise AuthError("This sign-in link is invalid or has expired.")
        # Mark used atomically: only one concurrent verify can win.
        claimed = conn.execute(update(lt).where(lt.c.token_hash == _hash(token), lt.c.used == 0).values(used=1)).rowcount
        if not claimed:
            raise AuthError("This sign-in link is invalid or has expired.")

        u = db.users
        user = conn.execute(select(u.c.id, u.c.email).where(u.c.email == row.email)).first()
        if user is None:
            user_id = secrets.token_urlsafe(12)
            conn.execute(insert(u).values(id=user_id, email=row.email, created_at=_iso(_now()), last_login_at=_iso(_now())))
        else:
            user_id = user.id
            conn.execute(update(u).where(u.c.id == user_id).values(last_login_at=_iso(_now())))

        session_token = secrets.token_urlsafe(32)
        conn.execute(insert(db.sessions).values(
            token_hash=_hash(session_token), user_id=user_id,
            created_at=_iso(_now()), expires_at=_iso(_now() + SESSION_TTL),
        ))
    return session_token, {"id": user_id, "email": row.email}


# --- sessions --------------------------------------------------------------------

def user_for_session(token: str | None) -> dict | None:
    if not token:
        return None
    s, u = db.sessions, db.users
    with db.get_engine().connect() as conn:
        row = conn.execute(
            select(u.c.id, u.c.email, s.c.expires_at).join(s, s.c.user_id == u.c.id).where(s.c.token_hash == _hash(token))
        ).first()
    if row is None or row.expires_at < _iso(_now()):
        return None
    return {"id": row.id, "email": row.email}


def logout(token: str | None) -> None:
    if token:
        with db.get_engine().begin() as conn:
            conn.execute(delete(db.sessions).where(db.sessions.c.token_hash == _hash(token)))


def bearer(header: str | None) -> str | None:
    if header and header.lower().startswith("bearer "):
        return header[7:].strip() or None
    return None


# --- profile ---------------------------------------------------------------------

def get_profile(user_id: str) -> dict | None:
    import json
    p = db.profiles
    with db.get_engine().connect() as conn:
        row = conn.execute(select(p.c.data).where(p.c.user_id == user_id)).first()
    return json.loads(row.data) if row else None


def set_profile(user_id: str, data: dict) -> None:
    import json
    p = db.profiles
    payload = json.dumps(data)
    with db.get_engine().begin() as conn:
        updated = conn.execute(update(p).where(p.c.user_id == user_id).values(data=payload, updated_at=_iso(_now()))).rowcount
        if not updated:
            conn.execute(insert(p).values(user_id=user_id, data=payload, updated_at=_iso(_now())))


def delete_account(user_id: str) -> None:
    """Remove the user and everything they own (sessions, profile, readings)."""
    with db.get_engine().begin() as conn:
        conn.execute(delete(db.sessions).where(db.sessions.c.user_id == user_id))
        conn.execute(delete(db.profiles).where(db.profiles.c.user_id == user_id))
        conn.execute(delete(db.results).where(db.results.c.user_id == user_id))
        conn.execute(delete(db.users).where(db.users.c.id == user_id))
