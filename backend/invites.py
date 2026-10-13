"""
Partner invites: "Check our compatibility" creates a link; the partner adds
their details at /i/{token}; the full synastry report is generated once and
both people read it at /r/{result_id}.

Privacy: the partner-facing GET exposes only the inviter's first name and sun
sign - never the birth date, email or account.
"""
import json
import os
import re
import secrets
import threading
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import insert, select, update

import accounts
import db
import results_store
from agent_controller import FULL_RELATIONSHIP_INTELLIGENCE, run_analysis
from engines.zodiac_engine import get_sun_sign

router = APIRouter()

TTL_DAYS = 14
_PER_IP_HOUR = int(os.getenv("INVITES_MAX_PER_IP_HOUR", "20"))
_WINDOW_S = 3600

_hits: dict[str, list[float]] = {}
_hits_lock = threading.Lock()

# main.py installs the shared AI-budget guard here (it owns the counters).
_budget_guard = None


def set_budget_guard(fn) -> None:
    """fn(request) is called before the pipeline runs; it raises HTTPException when over budget."""
    global _budget_guard
    _budget_guard = fn


def reset_rate_limits() -> None:
    with _hits_lock:
        _hits.clear()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _rate_limit(ip: str) -> None:
    now = time.time()
    with _hits_lock:
        recent = [t for t in _hits.get(ip, []) if now - t < _WINDOW_S]
        if len(recent) >= _PER_IP_HOUR:
            _hits[ip] = recent
            raise HTTPException(status_code=429, detail="Too many invites from this device. Please try again later.")
        recent.append(now)
        _hits[ip] = recent


class PersonIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    day: int = Field(ge=1, le=31)
    month: int = Field(ge=1, le=12)
    mbti: str
    gender: str = "M"

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = re.sub(r"\s+", " ", v).strip()
        if not v:
            raise ValueError("name is required")
        return v

    @field_validator("mbti")
    @classmethod
    def _mbti(cls, v: str) -> str:
        v = v.strip().upper()
        if v not in accounts.MBTI_TYPES:
            raise ValueError("invalid MBTI type")
        return v

    @field_validator("gender")
    @classmethod
    def _gender(cls, v: str) -> str:
        return v if v in ("M", "F") else "M"


class CreateInvite(BaseModel):
    inviter: PersonIn


class AcceptInvite(BaseModel):
    partner: PersonIn


def _row(token: str):
    t = db.invites
    with db.get_engine().connect() as conn:
        return conn.execute(select(t).where(t.c.token == token)).mappings().first()


def _status(row) -> str:
    if row["status"] == "accepted":
        return "accepted"
    if row["expires_at"] < _iso(_now()):
        return "expired"
    return "pending"


def _frontend() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


@router.post("/invites")
def create_invite(data: CreateInvite, request: Request):
    ip = accounts._client_ip(request)
    _rate_limit(ip)
    owner = accounts.optional_user(request)
    token = secrets.token_urlsafe(16)
    now = _now()
    with db.get_engine().begin() as conn:
        conn.execute(insert(db.invites).values(
            token=token,
            inviter_json=json.dumps(data.inviter.model_dump()),
            inviter_user_id=owner["id"] if owner else None,
            created_at=_iso(now),
            expires_at=_iso(now + timedelta(days=TTL_DAYS)),
            status="pending",
            result_id=None,
        ))
    return {"token": token, "url": f"{_frontend()}/i/{token}"}


@router.get("/invites/{token}")
def get_invite(token: str):
    row = _row(token)
    if row is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    inviter = json.loads(row["inviter_json"])
    status = _status(row)
    return {
        # Deliberately only this much: no birth date, no email, no account.
        "first_name": inviter["name"].split(" ")[0],
        "sign": get_sun_sign(inviter["day"], inviter["month"]),
        "status": status,
        "result_id": row["result_id"] if status == "accepted" else None,
        "expires_at": row["expires_at"],
    }


@router.post("/invites/{token}/accept")
def accept_invite(token: str, data: AcceptInvite, request: Request):
    row = _row(token)
    if row is None:
        raise HTTPException(status_code=404, detail="Invite not found")
    status = _status(row)
    if status == "accepted":
        return {"result_id": row["result_id"]}  # accepting twice returns the same report
    if status == "expired":
        raise HTTPException(status_code=410, detail="This invite has expired. Ask them for a new link.")

    # Claim it first so two simultaneous accepts can't both run the pipeline.
    t = db.invites
    with db.get_engine().begin() as conn:
        claimed = conn.execute(
            update(t).where(t.c.token == token, t.c.status == "pending").values(status="accepting")
        ).rowcount
    if not claimed:
        again = _row(token)
        if again is not None and again["status"] == "accepted":
            return {"result_id": again["result_id"]}
        raise HTTPException(status_code=409, detail="This invite is being opened right now. Try again in a moment.")

    try:
        if _budget_guard is not None:
            _budget_guard(request)
        inviter = json.loads(row["inviter_json"])
        a = {"name": inviter["name"], "day": inviter["day"], "month": inviter["month"], "mbti": inviter["mbti"]}
        p = data.partner
        b = {"name": p.name, "day": p.day, "month": p.month, "mbti": p.mbti}
        result = run_analysis(FULL_RELATIONSHIP_INTELLIGENCE, a, b)
        payload = {
            **result,
            "personas": {
                "a": {"name": a["name"], "sign": get_sun_sign(a["day"], a["month"]), "mbti": a["mbti"]},
                "b": {"name": b["name"], "sign": get_sun_sign(b["day"], b["month"]), "mbti": b["mbti"]},
            },
        }
        result_id = results_store.save_result(
            FULL_RELATIONSHIP_INTELLIGENCE,
            payload,
            f"{a['name']} × {b['name']} Synastry Report",
            row["inviter_user_id"],
        )
        with db.get_engine().begin() as conn:
            conn.execute(update(t).where(t.c.token == token).values(status="accepted", result_id=result_id))
        return {"result_id": result_id}
    except HTTPException:
        with db.get_engine().begin() as conn:
            conn.execute(update(t).where(t.c.token == token).values(status="pending"))
        raise
    except Exception as exc:
        with db.get_engine().begin() as conn:
            conn.execute(update(t).where(t.c.token == token).values(status="pending"))
        raise HTTPException(status_code=500, detail=str(exc))
