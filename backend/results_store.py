"""
Shareable-result persistence — a single-file SQLite store.

Every saved analysis gets a short URL-safe id; the frontend renders it
read-only at /r/{id}. No accounts, no PII beyond what the user typed into
the analysis itself.
"""
import json
import secrets
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path

_DB_PATH = Path(__file__).parent / "results.db"
_lock = threading.Lock()


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


def save_result(analysis_type: str, payload: dict, title: str = "") -> str:
    """Persist a result payload; returns its short id."""
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
