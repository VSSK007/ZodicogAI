"""
Sign x MBTI guides: the 192 pages at /blog/types/<sign>-<type>.

For each combination the deterministic engines supply the facts (how closely the
sign's and the type's trait vectors line up, and the two axes they disagree on
most); one Gemini call turns them into the article. The result is stored
permanently in `articles` (never pruned), so each of the 192 is generated at
most once, ever, and survives restarts and deploys.

Real people are never described here: the article is about the *combination*,
and the page links to the sign's celebrity list only by sign. No MBTI type is
ever asserted for a real person.
"""
import json
from datetime import datetime, timezone

from sqlalchemy import insert, select

import db
from engines.compatibility_engine import compute_vector_similarity
from engines.mbti_engine import MBTI_TYPES
from engines.zodiac_engine import TRAIT_VECTORS, ZODIAC_METADATA

PLACEHOLDER = "—"
SIGNS = [s.lower() for s in ZODIAC_METADATA]
TYPES = sorted(MBTI_TYPES)
MAX_MATCHES = 5


def valid(sign: str, mbti: str) -> bool:
    return sign.lower() in SIGNS and mbti.upper() in MBTI_TYPES


def key(sign: str, mbti: str) -> str:
    return f"combo:{sign.lower()}:{mbti.upper()}"


def facts(sign: str, mbti: str) -> dict:
    """Deterministic facts about the pairing: alignment and the biggest disagreements."""
    s = TRAIT_VECTORS[sign.capitalize()]
    t = MBTI_TYPES[mbti.upper()]["trait_vector"]
    gaps = sorted(
        ({"axis": k, "sign": s[k], "type": t[k], "gap": abs(s[k] - t[k])} for k in s),
        key=lambda g: (-g["gap"], g["axis"]),
    )
    return {
        "alignment": compute_vector_similarity(s, t),
        "blend": {k: round((s[k] + t[k]) / 2, 1) for k in s},
        "gaps": gaps[:2],
        "element": ZODIAC_METADATA[sign.capitalize()]["element"],
        "modality": ZODIAC_METADATA[sign.capitalize()]["modality"],
        "type_name": MBTI_TYPES[mbti.upper()]["name"],
    }


def get(sign: str, mbti: str) -> dict | None:
    a = db.articles
    with db.get_engine().connect() as conn:
        row = conn.execute(select(a.c.payload).where(a.c.key == key(sign, mbti))).first()
    return json.loads(row[0]) if row else None


def store(sign: str, mbti: str, article: dict) -> None:
    """Permanent. A concurrent duplicate insert is harmless: both are equivalent generations."""
    try:
        with db.get_engine().begin() as conn:
            conn.execute(insert(db.articles).values(
                key=key(sign, mbti), payload=json.dumps(article), created_at=datetime.now(timezone.utc).isoformat(),
            ))
    except Exception:
        pass


def failed(article: dict) -> bool:
    """Gemini was down / returned defaults: don't store it, don't serve it."""
    return article.get("overview", PLACEHOLDER) == PLACEHOLDER or not article.get("strengths")


def clean_matches(matches: list, own_sign: str, own_mbti: str) -> list[dict]:
    """Keep only real combinations (so every match links to a real page), no duplicates, not itself."""
    out, seen = [], {(own_sign.lower(), own_mbti.upper())}
    for m in matches or []:
        s, t = str(m.get("sign", "")).strip().lower(), str(m.get("mbti", "")).strip().upper()
        if not valid(s, t) or (s, t) in seen:
            continue
        seen.add((s, t))
        out.append({"sign": s, "mbti": t, "why": str(m.get("why", "")).strip()})
        if len(out) == MAX_MATCHES:
            break
    return out


def generate(sign: str, mbti: str) -> dict:
    """One Gemini call; returns the cleaned article dict (maybe `failed`)."""
    from gemini_client import generate_sign_type_article

    article = generate_sign_type_article(sign.capitalize(), mbti.upper(), facts(sign, mbti))
    article["best_matches"] = clean_matches(article.get("best_matches", []), sign, mbti)
    return article
