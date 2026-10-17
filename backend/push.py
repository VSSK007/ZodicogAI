"""
Web push: the daily nudge ("Your day, Pisces" + the first line of today's horoscope).

    POST   /push/subscribe     store/update a browser's push subscription (+ sign, tz, hour)
    DELETE /push/subscribe     remove it
    GET    /push/public-key    the VAPID public key the browser subscribes with (404 if unset)

backend/scripts/send_daily_push.py runs hourly from cron and calls run_daily():
every subscription whose *local* hour equals its chosen hour, and that has not
been sent today, gets one notification. Dead subscriptions (404/410) are removed.

Privacy: only the push endpoint/keys, the sun sign, an optional MBTI type, the
time zone and the chosen hour are stored - no name, birth date or account.
"""
import json
import os
import threading
import time
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import delete, insert, select, update

import accounts
import db

router = APIRouter()

SIGNS = {
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
}
DEFAULT_HOUR = 8
_PER_IP_HOUR = int(os.getenv("PUSH_MAX_PER_IP_HOUR", "30"))
_WINDOW_S = 3600
_hits: dict[str, list[float]] = {}
_hits_lock = threading.Lock()


def reset_rate_limits() -> None:
    with _hits_lock:
        _hits.clear()


def _rate_limit(ip: str) -> None:
    now = time.time()
    with _hits_lock:
        recent = [t for t in _hits.get(ip, []) if now - t < _WINDOW_S]
        if len(recent) >= _PER_IP_HOUR:
            _hits[ip] = recent
            raise HTTPException(status_code=429, detail="Too many requests from this device. Please try again later.")
        recent.append(now)
        _hits[ip] = recent


def valid_tz(name: str) -> bool:
    try:
        ZoneInfo(name)
        return True
    except (ZoneInfoNotFoundError, ValueError, OSError):
        return False


class SubscribeInput(BaseModel):
    endpoint: str = Field(max_length=700)
    p256dh: str = Field(min_length=10, max_length=200)
    auth: str = Field(min_length=4, max_length=100)
    sign: str
    mbti: str = ""
    tz: str = Field(default="UTC", max_length=64)
    hour: int = Field(default=DEFAULT_HOUR, ge=0, le=23)

    @field_validator("endpoint")
    @classmethod
    def _endpoint(cls, v: str) -> str:
        if not v.startswith("https://"):
            raise ValueError("endpoint must be an https URL")
        return v

    @field_validator("sign")
    @classmethod
    def _sign(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in SIGNS:
            raise ValueError("unknown sign")
        return v

    @field_validator("mbti")
    @classmethod
    def _mbti(cls, v: str) -> str:
        v = v.strip().upper()
        if v and v not in accounts.MBTI_TYPES:
            raise ValueError("invalid MBTI type")
        return v

    @field_validator("tz")
    @classmethod
    def _tz(cls, v: str) -> str:
        if not valid_tz(v):
            raise ValueError("unknown time zone")
        return v


class UnsubscribeInput(BaseModel):
    endpoint: str = Field(max_length=700)


def public_key() -> str | None:
    return os.getenv("VAPID_PUBLIC_KEY") or None


@router.get("/push/public-key")
def get_public_key():
    key = public_key()
    if not key:
        raise HTTPException(status_code=404, detail="Push notifications are not configured on this server.")
    return {"public_key": key}


@router.post("/push/subscribe")
def subscribe(data: SubscribeInput, request: Request):
    _rate_limit(accounts._client_ip(request))
    t = db.push_subscriptions
    values = {
        "p256dh": data.p256dh, "auth": data.auth, "sign": data.sign, "mbti": data.mbti,
        "tz": data.tz, "hour": data.hour,
    }
    with db.get_engine().begin() as conn:
        updated = conn.execute(update(t).where(t.c.endpoint == data.endpoint).values(**values)).rowcount
        if not updated:
            conn.execute(insert(t).values(
                endpoint=data.endpoint, created_at=datetime.now(timezone.utc).isoformat(), last_sent=None, **values,
            ))
    return {"ok": True, "hour": data.hour, "tz": data.tz}


@router.delete("/push/subscribe")
def unsubscribe(data: UnsubscribeInput, request: Request):
    _rate_limit(accounts._client_ip(request))
    t = db.push_subscriptions
    with db.get_engine().begin() as conn:
        removed = conn.execute(delete(t).where(t.c.endpoint == data.endpoint)).rowcount
    return {"ok": True, "removed": bool(removed)}


# --- sending -----------------------------------------------------------------

class Gone(Exception):
    """The push service says this subscription no longer exists (404/410)."""


def local_now(sub: dict, now_utc: datetime) -> datetime:
    try:
        return now_utc.astimezone(ZoneInfo(sub["tz"]))
    except (ZoneInfoNotFoundError, ValueError, OSError):
        return now_utc.astimezone(timezone.utc)


def is_due(sub: dict, now_utc: datetime) -> bool:
    """Local hour equals the chosen hour, and nothing has been sent on this local day yet."""
    local = local_now(sub, now_utc)
    return local.hour == sub["hour"] and sub.get("last_sent") != local.date().isoformat()


def all_subscriptions() -> list[dict]:
    t = db.push_subscriptions
    with db.get_engine().connect() as conn:
        return [dict(r) for r in conn.execute(select(t)).mappings().all()]


def due_subscriptions(now_utc: datetime) -> list[dict]:
    return [s for s in all_subscriptions() if is_due(s, now_utc)]


def mark_sent(endpoint: str, local_day: str) -> None:
    t = db.push_subscriptions
    with db.get_engine().begin() as conn:
        conn.execute(update(t).where(t.c.endpoint == endpoint).values(last_sent=local_day))


def remove(endpoint: str) -> None:
    t = db.push_subscriptions
    with db.get_engine().begin() as conn:
        conn.execute(delete(t).where(t.c.endpoint == endpoint))


def send_webpush(sub: dict, message: dict) -> None:
    """Deliver one notification through the browser's push service (pywebpush + VAPID)."""
    from pywebpush import WebPushException, webpush

    try:
        webpush(
            subscription_info={"endpoint": sub["endpoint"], "keys": {"p256dh": sub["p256dh"], "auth": sub["auth"]}},
            data=json.dumps(message),
            vapid_private_key=os.environ["VAPID_PRIVATE_KEY"],
            vapid_claims={"sub": os.getenv("VAPID_SUBJECT", "mailto:hello@zodicogai.com")},
            ttl=6 * 3600,  # a nudge is worthless after a few hours
            timeout=15,
        )
    except WebPushException as exc:
        status = getattr(exc.response, "status_code", None)
        if status in (404, 410):
            raise Gone() from exc
        raise


def run_daily(now_utc: datetime, build_message, send=send_webpush, dry_run: bool = False) -> dict:
    """
    Send today's nudge to everyone due at `now_utc`.

    build_message(sub, local_date) -> {"title", "body", "url"} (called once per subscriber).
    send(sub, message) raises Gone for dead subscriptions; any other exception counts as a
    failure and leaves the subscription to be retried at its next due hour.
    Returns counts: {"due", "sent", "removed", "failed"}.
    """
    counts = {"due": 0, "sent": 0, "removed": 0, "failed": 0}
    for sub in due_subscriptions(now_utc):
        counts["due"] += 1
        local_day = local_now(sub, now_utc).date().isoformat()
        message = build_message(sub, local_day)
        if dry_run:
            print(f"[dry-run] {sub['endpoint'][:48]}... {sub['sign']} {sub['tz']} {sub['hour']}h -> {message}")
            continue
        try:
            send(sub, message)
        except Gone:
            remove(sub["endpoint"])
            counts["removed"] += 1
        except Exception as exc:  # noqa: BLE001 - one bad subscription must not stop the rest
            counts["failed"] += 1
            print(f"push failed for {sub['endpoint'][:48]}...: {exc}")
        else:
            mark_sent(sub["endpoint"], local_day)
            counts["sent"] += 1
    return counts
