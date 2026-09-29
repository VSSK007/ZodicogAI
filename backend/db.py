"""
Database layer - SQLAlchemy Core over SQLite (default) or Postgres.

    DATABASE_URL unset                      -> SQLite file backend/results.db
    DATABASE_URL=postgresql://user:pw@host/db  -> Postgres (psycopg 3)

Schema is deliberately portable: text ids, ISO-8601 timestamps stored as text,
JSON stored as text. Tables are created on first use and an existing `results`
table from before accounts existed is upgraded in place (user_id column added).

Tables
  results       shared readings (optionally owned by a user)
  users         one row per email address
  login_tokens  single-use, short-lived magic-link tokens (hashed)
  sessions      long-lived session tokens (hashed)
  profiles      one saved "me" per user
"""
import os
import threading
from pathlib import Path

from sqlalchemy import (
    Column, Engine, Index, Integer, MetaData, String, Table, Text, create_engine, event, inspect, text,
)

_DEFAULT_SQLITE = Path(__file__).parent / "results.db"

metadata = MetaData()

results = Table(
    "results", metadata,
    Column("id", String(32), primary_key=True),
    Column("analysis_type", String(64), nullable=False),
    Column("title", Text, nullable=False, server_default=""),
    Column("payload", Text, nullable=False),
    Column("created_at", String(40), nullable=False),
    Column("user_id", String(32), nullable=True),
    Index("ix_results_user_id", "user_id"),
    Index("ix_results_created_at", "created_at"),
)

users = Table(
    "users", metadata,
    Column("id", String(32), primary_key=True),
    Column("email", String(320), nullable=False, unique=True),
    Column("created_at", String(40), nullable=False),
    Column("last_login_at", String(40), nullable=True),
)

login_tokens = Table(
    "login_tokens", metadata,
    Column("token_hash", String(64), primary_key=True),
    Column("email", String(320), nullable=False),
    Column("created_at", String(40), nullable=False),
    Column("expires_at", String(40), nullable=False),
    Column("used", Integer, nullable=False, server_default="0"),
)

sessions = Table(
    "sessions", metadata,
    Column("token_hash", String(64), primary_key=True),
    Column("user_id", String(32), nullable=False),
    Column("created_at", String(40), nullable=False),
    Column("expires_at", String(40), nullable=False),
    Index("ix_sessions_user_id", "user_id"),
)

profiles = Table(
    "profiles", metadata,
    Column("user_id", String(32), primary_key=True),
    Column("data", Text, nullable=False),
    Column("updated_at", String(40), nullable=False),
)

_engine: Engine | None = None
_lock = threading.Lock()


def database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        return f"sqlite:///{_DEFAULT_SQLITE.as_posix()}"
    # Accept the URL forms hosting providers hand out.
    if url.startswith("postgres://"):
        url = "postgresql+psycopg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


def is_sqlite(engine: Engine) -> bool:
    return engine.dialect.name == "sqlite"


def _upgrade(engine: Engine) -> None:
    """Bring a pre-accounts database up to the current schema."""
    insp = inspect(engine)
    if "results" in insp.get_table_names():
        cols = {c["name"] for c in insp.get_columns("results")}
        if "user_id" not in cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE results ADD COLUMN user_id VARCHAR(32)"))


def get_engine() -> Engine:
    """The process-wide engine; creates and upgrades the schema on first use."""
    global _engine
    if _engine is not None:
        return _engine
    with _lock:
        if _engine is not None:
            return _engine
        url = database_url()
        kwargs: dict = {"pool_pre_ping": True}
        if url.startswith("sqlite"):
            kwargs["connect_args"] = {"check_same_thread": False, "timeout": 15}
        engine = create_engine(url, **kwargs)

        if url.startswith("sqlite"):
            @event.listens_for(engine, "connect")
            def _pragmas(dbapi_conn, _record):  # noqa: ANN001
                cur = dbapi_conn.cursor()
                cur.execute("PRAGMA journal_mode=WAL")
                cur.execute("PRAGMA busy_timeout=10000")
                cur.close()

        _upgrade(engine)          # add columns to old tables first...
        metadata.create_all(engine)  # ...then create anything missing (incl. indexes)
        _engine = engine
        return engine


def reset_engine() -> None:
    """Drop the cached engine (tests point DATABASE_URL at a fresh file)."""
    global _engine
    with _lock:
        if _engine is not None:
            _engine.dispose()
        _engine = None
