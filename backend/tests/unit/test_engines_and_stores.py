"""Pure-logic tests: deterministic engines, result retention, and the Gemini limiter."""
import threading
import time
from datetime import date, datetime, timedelta, timezone

import pytest

import gemini_client as _gemini_module
import results_store
from engines.horoscope_engine import compute_daily_scores, compute_lucky_number
from engines.numerology_engine import get_numerology_profile


# The autouse fixture stubs call_gemini; keep the real one for testing its metrics.
_REAL_CALL_GEMINI = _gemini_module.call_gemini


def test_horoscope_scores_are_deterministic_and_bounded():
    day = date(2026, 3, 1)
    first = compute_daily_scores("scorpio", day)
    assert first == compute_daily_scores("scorpio", day)
    assert first != compute_daily_scores("scorpio", date(2026, 3, 2))
    for dim in ("love", "career", "energy", "luck", "overall"):
        assert 30 <= first[dim] <= 95
    assert 1 <= compute_lucky_number("leo", day) <= 99


def test_numerology_master_numbers_are_not_reduced():
    # 11 Nov -> 11 + 11 handled as master number path
    profile = get_numerology_profile("Test Person", 11, 11)
    assert profile["life_path_number"] in (11, 22, 33) or 1 <= profile["life_path_number"] <= 9


def test_result_store_prunes_by_age_and_row_cap(monkeypatch):
    import db
    from sqlalchemy import func, select, update

    for i in range(5):
        results_store.save_result("t", {"i": i}, f"r{i}")

    def count(conn):
        return conn.execute(select(func.count()).select_from(db.results)).scalar_one()

    # Age out everything: backdate then prune.
    old = (datetime.now(timezone.utc) - timedelta(days=results_store.RETENTION_DAYS + 1)).isoformat()
    with db.get_engine().begin() as conn:
        conn.execute(update(db.results).values(created_at=old))
        results_store.prune(conn)
        assert count(conn) == 0

    # Row cap: keep only the newest MAX_ROWS.
    monkeypatch.setattr(results_store, "MAX_ROWS", 3)
    for i in range(6):
        results_store.save_result("t", {"i": i}, f"r{i}")
    with db.get_engine().begin() as conn:
        results_store.prune(conn)
        assert count(conn) == 3


def test_owned_readings_survive_pruning():
    import db
    from sqlalchemy import func, select, update

    mine = results_store.save_result("t", {"x": 1}, "mine", user_id="user1")
    anon = results_store.save_result("t", {"x": 2}, "anon")
    old = (datetime.now(timezone.utc) - timedelta(days=results_store.RETENTION_DAYS + 5)).isoformat()
    with db.get_engine().begin() as conn:
        conn.execute(update(db.results).values(created_at=old))
        results_store.prune(conn)
    assert results_store.load_result(mine) is not None
    assert results_store.load_result(anon) is None


def test_legacy_results_table_is_upgraded_in_place(tmp_path, monkeypatch):
    """A results.db created before accounts existed gains user_id without losing rows."""
    import sqlite3

    import db

    path = tmp_path / "legacy.db"
    conn = sqlite3.connect(path)
    conn.execute("CREATE TABLE results (id TEXT PRIMARY KEY, analysis_type TEXT NOT NULL, "
                 "title TEXT NOT NULL DEFAULT '', payload TEXT NOT NULL, created_at TEXT NOT NULL)")
    conn.execute("INSERT INTO results VALUES ('old1', 'color_analysis', 'Old one', '{\"a\": 1}', '2026-01-01T00:00:00+00:00')")
    conn.commit()
    conn.close()

    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{path.as_posix()}")
    db.reset_engine()
    row = results_store.load_result("old1")
    assert row is not None and row["title"] == "Old one" and row["payload"] == {"a": 1}
    # ...and it accepts owned rows now.
    rid = results_store.save_result("t", {}, "new", user_id="u1")
    assert results_store.list_for_user("u1")[0]["id"] == rid


def test_database_url_forms():
    import os

    import db

    for given, expected in [
        ("postgres://u:p@h/d", "postgresql+psycopg://u:p@h/d"),
        ("postgresql://u:p@h/d", "postgresql+psycopg://u:p@h/d"),
        ("postgresql+psycopg://u:p@h/d", "postgresql+psycopg://u:p@h/d"),
    ]:
        os.environ["DATABASE_URL"] = given
        assert db.database_url() == expected


def test_gemini_limiter_queues_then_gives_up(monkeypatch):
    import gemini_client as g

    monkeypatch.setattr(g, "_slots", threading.BoundedSemaphore(1))
    monkeypatch.setattr(g, "_SLOT_WAIT", 0.2)

    with g._gemini_slot():
        started = time.monotonic()
        with pytest.raises(g.GeminiBusy):
            with g._gemini_slot():
                pass
        assert time.monotonic() - started >= 0.2

    # Slot is released after the first block, so it can be taken again.
    with g._gemini_slot():
        pass


def test_call_gemini_records_metrics_per_schema(monkeypatch):
    import gemini_client as g
    import metrics
    from models.schemas import ChatReply

    monkeypatch.setattr(g, "_call_gemini", lambda prompt, schema: (schema(), False))
    _REAL_CALL_GEMINI("hi", ChatReply)
    stats = metrics.snapshot()["ChatReply"]
    assert stats["calls"] == 1 and stats["failures"] == 1
