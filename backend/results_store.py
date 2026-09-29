"""
Shareable-result persistence.

Every saved analysis gets a short URL-safe id; the frontend renders it
read-only at /r/{id}. A reading saved while signed in also records its owner so
it follows the user across devices; anonymous readings work exactly as before.

Retention: rows older than RETENTION_DAYS are pruned, and a hard row-count cap
(MAX_ROWS) evicts the oldest rows beyond it regardless of age, so the table
can't grow unbounded under sustained traffic. Pruning runs opportunistically
every SWEEP_EVERY saves rather than on a schedule.
"""
import json
import secrets
import threading
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, func, insert, select, text, update

import db

RETENTION_DAYS = 90
MAX_ROWS = 20_000
SWEEP_EVERY = 50

_save_count = 0
_count_lock = threading.Lock()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def prune(conn) -> None:
    """Delete rows past the age limit, then trim to the hard row cap.
    Rows owned by an account are kept for as long as the account exists."""
    r = db.results
    cutoff = (datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)).isoformat()
    conn.execute(delete(r).where(r.c.created_at < cutoff, r.c.user_id.is_(None)))

    count = conn.execute(select(func.count()).select_from(r)).scalar_one()
    if count > MAX_ROWS:
        oldest = (
            select(r.c.id)
            .where(r.c.user_id.is_(None))
            .order_by(r.c.created_at.asc())
            .limit(count - MAX_ROWS)
        )
        ids = [row[0] for row in conn.execute(oldest)]
        if ids:
            conn.execute(delete(r).where(r.c.id.in_(ids)))


def save_result(analysis_type: str, payload: dict, title: str = "", user_id: str | None = None) -> str:
    """Persist a result payload; returns its short id."""
    global _save_count
    result_id = secrets.token_urlsafe(6)
    with db.get_engine().begin() as conn:
        conn.execute(
            insert(db.results).values(
                id=result_id,
                analysis_type=analysis_type,
                title=title[:120],
                payload=json.dumps(payload),
                created_at=_now(),
                user_id=user_id,
            )
        )
        with _count_lock:
            _save_count += 1
            sweep = _save_count >= SWEEP_EVERY
            if sweep:
                _save_count = 0
        if sweep:
            prune(conn)
    return result_id


def load_result(result_id: str) -> dict | None:
    r = db.results
    with db.get_engine().connect() as conn:
        row = conn.execute(
            select(r.c.analysis_type, r.c.title, r.c.payload, r.c.created_at).where(r.c.id == result_id)
        ).first()
    if row is None:
        return None
    analysis_type, title, payload, created_at = row
    return {
        "id": result_id,
        "analysis_type": analysis_type,
        "title": title,
        "payload": json.loads(payload),
        "created_at": created_at,
    }


def list_for_user(user_id: str, limit: int = 100) -> list[dict]:
    r = db.results
    with db.get_engine().connect() as conn:
        rows = conn.execute(
            select(r.c.id, r.c.analysis_type, r.c.title, r.c.created_at)
            .where(r.c.user_id == user_id)
            .order_by(r.c.created_at.desc())
            .limit(limit)
        ).all()
    return [{"id": i, "type": t, "title": ti, "date": c} for i, t, ti, c in rows]


def claim(user_id: str, ids: list[str]) -> int:
    """Attach still-anonymous readings to a user (ids are unguessable, so
    knowing one is proof the visitor created it). Returns how many were claimed."""
    ids = [i for i in ids if isinstance(i, str)][:200]
    if not ids:
        return 0
    r = db.results
    with db.get_engine().begin() as conn:
        res = conn.execute(update(r).where(r.c.id.in_(ids), r.c.user_id.is_(None)).values(user_id=user_id))
        return res.rowcount or 0


def delete_for_user(user_id: str) -> int:
    r = db.results
    with db.get_engine().begin() as conn:
        return conn.execute(delete(r).where(r.c.user_id == user_id)).rowcount or 0


def ping() -> None:
    """Raise if the database can't be reached and queried."""
    with db.get_engine().connect() as conn:
        conn.execute(text("SELECT 1"))
