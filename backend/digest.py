"""
The Monday email: "Your week ahead".

Opt-in only (users.weekly_digest, off by default, switched on in the profile page),
sent by backend/scripts/send_weekly_digest.py from cron. Every email carries a
one-click unsubscribe link that works without signing in:

    GET  /email/unsubscribe?t=<token>    a small confirmation page (the link in the email)
    POST /email/unsubscribe?t=<token>    RFC 8058 one-click (mail clients' "Unsubscribe" button)

The token is an HMAC of the user id with DIGEST_SECRET, so it cannot be guessed or
forged for another account; a tampered token is rejected and changes nothing.

The AI writes the weekly outlook once per sign per week (at most 12 calls a week),
stored in the database and shared by every recipient of that sign.
"""
import base64
import hashlib
import hmac
import json
import os
from datetime import date, datetime, timedelta
from html import escape

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import select, update

import auth
import daily
import db
import mailer
from engines.zodiac_engine import get_sun_sign

router = APIRouter()

PLACEHOLDER = daily.PLACEHOLDER

FALLBACK = {
    "outlook": "A week to pace yourself: put your energy where it already feels natural, and go easy on the rest.",
    "compatibility_tip": "Say the small kind thing out loud. People close to you are guessing less than you think.",
}


# --- unsubscribe tokens ----------------------------------------------------------

def _secret() -> bytes | None:
    s = os.getenv("DIGEST_SECRET", "")
    return s.encode() if s else None


def _sign(user_id: str, secret: bytes) -> str:
    mac = hmac.new(secret, b"unsubscribe:" + user_id.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(mac).rstrip(b"=").decode()


def unsubscribe_token(user_id: str) -> str:
    secret = _secret()
    if secret is None:
        raise RuntimeError("DIGEST_SECRET is not set")
    return f"{user_id}.{_sign(user_id, secret)}"


def verify_token(token: str) -> str | None:
    """The user id if the token is genuine, else None. Constant-time comparison."""
    secret = _secret()
    if secret is None or not token or len(token) > 200 or "." not in token:
        return None
    user_id, _, sig = token.rpartition(".")
    if not user_id or not hmac.compare_digest(sig, _sign(user_id, secret)):
        return None
    return user_id


def _backend_url() -> str:
    return (os.getenv("BACKEND_PUBLIC_URL") or os.getenv("NEXT_PUBLIC_API_URL") or "http://localhost:8000").rstrip("/")


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def unsubscribe_url(user_id: str) -> str:
    return f"{_backend_url()}/email/unsubscribe?t={unsubscribe_token(user_id)}"


def _turn_off(user_id: str) -> bool:
    with db.get_engine().begin() as conn:
        return bool(conn.execute(update(db.users).where(db.users.c.id == user_id).values(weekly_digest=0)).rowcount)


_PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title></head>
<body style="margin:0;background:#0b0a14;color:#f0eff6;font-family:system-ui,sans-serif">
<main style="max-width:460px;margin:18vh auto;padding:0 24px;text-align:center">
<h1 style="font-size:22px;margin:0 0 12px">{title}</h1>
<p style="color:#a8a5bd;line-height:1.6;margin:0 0 24px">{message}</p>
<a href="{site}" style="color:#a99bff">Back to ZodicogAI</a></main></body></html>"""


def _page(title: str, message: str, status: int) -> HTMLResponse:
    return HTMLResponse(_PAGE.format(title=escape(title), message=escape(message), site=escape(_frontend_url())), status_code=status)


@router.get("/email/unsubscribe")
def unsubscribe_page(t: str = Query(default="", max_length=200)):
    if _secret() is None:
        return _page("Not available", "Unsubscribe links aren't configured on this server.", 503)
    user_id = verify_token(t)
    if user_id is None:
        return _page("This link isn't valid", "It may have been cut off when it was copied. Sign in and turn the weekly email off in your profile.", 400)
    _turn_off(user_id)
    return _page("You're unsubscribed", "You won't get the weekly email any more. You can turn it back on any time in your profile.", 200)


@router.post("/email/unsubscribe")
def unsubscribe_one_click(t: str = Query(default="", max_length=200)):
    if _secret() is None:
        raise HTTPException(status_code=503, detail="Unsubscribe links aren't configured on this server.")
    user_id = verify_token(t)
    if user_id is None:
        return JSONResponse(status_code=400, content={"detail": "Invalid unsubscribe link."})
    _turn_off(user_id)
    return {"ok": True}


# --- who gets it, and what it says -----------------------------------------------

def iso_week(on: date) -> str:
    year, week, _ = on.isocalendar()
    return f"{year}-W{week:02d}"


def pretty_week(on: date) -> str:
    monday = on - timedelta(days=on.weekday())
    return f"Week of {monday.day} {monday.strftime('%B')}"


def eligible_users() -> list[dict]:
    """Opted in AND with a saved profile (we need the sign). Everyone else is skipped."""
    u, p = db.users, db.profiles
    with db.get_engine().connect() as conn:
        rows = conn.execute(
            select(u.c.id, u.c.email, u.c.last_digest_week, p.c.data)
            .join(p, p.c.user_id == u.c.id)
            .where(u.c.weekly_digest == 1)
            .order_by(u.c.email)
        ).all()
    out = []
    for row in rows:
        try:
            profile = json.loads(row.data)
            sign = get_sun_sign(int(profile["day"]), int(profile["month"]))
        except (ValueError, KeyError, TypeError):
            continue
        out.append({"id": row.id, "email": row.email, "last_digest_week": row.last_digest_week, "sign": sign})
    return out


def outlook_for(sign: str, on: date, generate: bool = True) -> dict:
    """The week's outlook for a sign: stored if we have it, else one Gemini call (not stored on failure)."""
    key = f"weekly:{sign.lower()}:{iso_week(on)}"
    stored = daily.get_json(key)
    if stored is None and generate:
        stored = generate_outlook(sign, on)
        daily.store_json(key, stored)
    stored = stored or {}
    return {k: (FALLBACK[k] if stored.get(k, PLACEHOLDER) == PLACEHOLDER else stored[k]) for k in FALLBACK}


def generate_outlook(sign: str, on: date) -> dict:
    from gemini_client import generate_weekly_outlook

    return generate_weekly_outlook(sign, pretty_week(on))


def render(sign: str, outlook: dict, on: date, unsub: str) -> tuple[str, str, str, dict]:
    """(subject, text, html, headers) for one recipient."""
    subject = f"Your week ahead, {sign}"
    week = pretty_week(on)
    today = f"{_frontend_url()}/today"
    text = (
        f"Your week ahead, {sign}\n{week}\n\n{outlook['outlook']}\n\n"
        f"For your closest relationships: {outlook['compatibility_tip']}\n\n"
        f"Open your day: {today}\n\n--\n"
        "You're getting this because you turned on the weekly email in your ZodicogAI profile.\n"
        f"Unsubscribe in one click: {unsub}\n"
    )
    html = (
        '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#14121f;line-height:1.6">'
        f'<p style="margin:0;color:#8a6d1f;font-size:12px;letter-spacing:.16em;text-transform:uppercase">{escape(week)}</p>'
        f'<h2 style="margin:6px 0 14px">Your week ahead, {escape(sign)}</h2>'
        f"<p>{escape(outlook['outlook'])}</p>"
        '<p style="margin:18px 0 4px;font-weight:600">For your closest relationships</p>'
        f"<p style=\"margin-top:0\">{escape(outlook['compatibility_tip'])}</p>"
        f'<p><a href="{escape(today)}" style="display:inline-block;background:#8b7cf6;color:#0b0a14;'
        'padding:12px 24px;border-radius:9px;text-decoration:none;font-weight:600">Open your day</a></p>'
        '<hr style="border:0;border-top:1px solid #e4e1ee;margin:28px 0 14px">'
        '<p style="color:#6a6580;font-size:12px">You\'re getting this because you turned on the weekly email '
        f'in your ZodicogAI profile. <a href="{escape(unsub)}" style="color:#6a6580">Unsubscribe</a></p>'
        "</div>"
    )
    headers = {"List-Unsubscribe": f"<{unsub}>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"}
    return subject, text, html, headers


def _mask(email: str) -> str:
    name, _, domain = email.partition("@")
    return f"{name[:1]}***@{domain}"


def run_weekly(now: datetime, send=mailer.send_email, dry_run: bool = False) -> dict:
    """
    Send "Your week ahead" to every opted-in user with a profile, once per ISO week.

    send(to, subject, text, html, headers) -> True when a real provider accepted it.
    Returns {"eligible", "sent", "skipped", "failed", "unsent"}: `skipped` = already sent this
    week, `unsent` = no email provider configured (retried by the next run).
    A dry run prints who would get what, calls no AI, sends nothing and marks nothing.
    """
    if not dry_run and _secret() is None:
        raise RuntimeError("DIGEST_SECRET is not set: refusing to send emails without working unsubscribe links.")

    on = now.date()
    week = iso_week(on)
    counts = {"eligible": 0, "sent": 0, "skipped": 0, "failed": 0, "unsent": 0}
    outlooks: dict[str, dict] = {}

    for user in eligible_users():
        counts["eligible"] += 1
        if user["last_digest_week"] == week:
            counts["skipped"] += 1
            continue
        sign = user["sign"]
        if sign not in outlooks:
            outlooks[sign] = outlook_for(sign, on, generate=not dry_run)
        unsub = unsubscribe_url(user["id"]) if _secret() else "(DIGEST_SECRET not set)"
        subject, text, html, headers = render(sign, outlooks[sign], on, unsub)

        if dry_run:
            print(f"[dry-run] {_mask(user['email'])}  {subject}  ({pretty_week(on)})")
            continue
        try:
            accepted = send(user["email"], subject, text, html, headers)
        except Exception as exc:  # noqa: BLE001 - one bad address must not stop the rest
            counts["failed"] += 1
            print(f"digest failed for {_mask(user['email'])}: {exc}")
            continue
        if not accepted:
            counts["unsent"] += 1
            continue
        with db.get_engine().begin() as conn:
            conn.execute(update(db.users).where(db.users.c.id == user["id"]).values(last_digest_week=week))
        counts["sent"] += 1
    return counts
