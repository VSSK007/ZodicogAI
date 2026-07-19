"""
Shareable-result persistence — a single-file SQLite store.

Every saved analysis gets a short URL-safe id; the frontend renders it
read-only at /r/{id}. No accounts, no PII beyond what the user typed into
the analysis itself.

Retention: rows older than RETENTION_DAYS are pruned, and a hard row-count
cap (MAX_ROWS) evicts the oldest rows beyond it regardless of age — so the
table can't grow unbounded even under sustained high traffic. Pruning runs
opportunistically every SWEEP_EVERY saves rather than on a schedule, the
same pattern used for the in-memory rate-limit tracker in main.py.
"""
import json
import secrets
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

_DB_PATH = Path(__file__).parent / "results.db"
_lock = threading.Lock()

RETENTION_DAYS = 90
MAX_ROWS = 20_000
SWEEP_EVERY = 50

_save_count = 0


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS results (
            id          TEXT PRIMARY KEY,
            analysis_type TEXT NOT NULL,
            title       TEXT NOT NULL DEFAULT '',
            payload     TEXT NOT NULL,
            created_at  TEXT NOT NULL
        )
        """
    )
    return conn


def _prune(conn: sqlite3.Connection):
    """Delete rows past the age limit, then trim to the hard row cap. Caller
    holds _lock and an open connection."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)).isoformat()
    conn.execute("DELETE FROM results WHERE created_at < ?", (cutoff,))

    (count,) = conn.execute("SELECT COUNT(*) FROM results").fetchone()
    if count > MAX_ROWS:
        conn.execute(
            """
            DELETE FROM results WHERE id IN (
                SELECT id FROM results ORDER BY created_at ASC LIMIT ?
            )
            """,
            (count - MAX_ROWS,),
        )


def save_result(analysis_type: str, payload: dict, title: str = "") -> str:
    """Persist a result payload; returns its short id."""
    global _save_count
    result_id = secrets.token_urlsafe(6)
    with _lock, _conn() as conn:
        conn.execute(
            "INSERT INTO results (id, analysis_type, title, payload, created_at) VALUES (?, ?, ?, ?, ?)",
            (
                result_id,
                analysis_type,
                title[:120],
                json.dumps(payload),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        _save_count += 1
        if _save_count >= SWEEP_EVERY:
            _save_count = 0
            _prune(conn)
    return result_id


def load_result(result_id: str) -> dict | None:
    with _lock, _conn() as conn:
        row = conn.execute(
            "SELECT analysis_type, title, payload, created_at FROM results WHERE id = ?",
            (result_id,),
        ).fetchone()
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
