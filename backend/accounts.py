"""HTTP routes for accounts: sign-in, session, profile sync, readings, deletion."""
import re

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

import auth
import results_store

router = APIRouter()

MBTI_TYPES = {
    "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
}


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def current_user(request: Request) -> dict:
    user = auth.user_for_session(auth.bearer(request.headers.get("authorization")))
    if user is None:
        raise HTTPException(status_code=401, detail="Not signed in")
    return user


def optional_user(request: Request) -> dict | None:
    return auth.user_for_session(auth.bearer(request.headers.get("authorization")))


class EmailInput(BaseModel):
    email: str = Field(max_length=320)


class TokenInput(BaseModel):
    token: str = Field(max_length=200)


class ProfileInput(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    day: int = Field(ge=1, le=31)
    month: int = Field(ge=1, le=12)
    mbti: str = ""
    gender: str = "M"

    @field_validator("mbti")
    @classmethod
    def _mbti(cls, v: str) -> str:
        v = v.strip().upper()
        if v and v not in MBTI_TYPES:
            raise ValueError("invalid MBTI type")
        return v

    @field_validator("gender")
    @classmethod
    def _gender(cls, v: str) -> str:
        if v not in ("M", "F"):
            raise ValueError("gender must be M or F")
        return v

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = re.sub(r"\s+", " ", v).strip()
        if not v:
            raise ValueError("name is required")
        return v


class ClaimInput(BaseModel):
    ids: list[str] = Field(default_factory=list, max_length=200)


def _guard(fn):
    try:
        return fn()
    except auth.AuthError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message)


@router.post("/auth/request-link")
def request_link(data: EmailInput, request: Request):
    """Email a sign-in link. Always answers the same way for any valid address."""
    result = _guard(lambda: auth.request_login_link(data.email, _client_ip(request)))
    body = {"ok": True}
    if result["dev_link"]:
        body["dev_link"] = result["dev_link"]
    return body


@router.post("/auth/verify")
def verify(data: TokenInput):
    session_token, user = _guard(lambda: auth.verify_login_token(data.token))
    return {"session_token": session_token, "user": user}


@router.post("/auth/logout")
def logout(request: Request):
    auth.logout(auth.bearer(request.headers.get("authorization")))
    return {"ok": True}


@router.get("/me")
def me(user: dict = Depends(current_user)):
    return {"user": user}


@router.delete("/me")
def delete_me(user: dict = Depends(current_user)):
    auth.delete_account(user["id"])
    return {"ok": True}


@router.get("/me/profile")
def get_profile(user: dict = Depends(current_user)):
    return {"profile": auth.get_profile(user["id"])}


@router.put("/me/profile")
def put_profile(data: ProfileInput, user: dict = Depends(current_user)):
    auth.set_profile(user["id"], data.model_dump())
    return {"profile": data.model_dump()}


@router.get("/me/readings")
def my_readings(user: dict = Depends(current_user)):
    return {"readings": results_store.list_for_user(user["id"])}


@router.post("/me/claim")
def claim_readings(data: ClaimInput, user: dict = Depends(current_user)):
    return {"claimed": results_store.claim(user["id"], data.ids)}
