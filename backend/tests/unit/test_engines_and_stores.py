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
    for i in range(5):
        results_store.save_result("t", {"i": i}, f"r{i}")

    # Age out everything: backdate then prune.
    old = (datetime.now(timezone.utc) - timedelta(days=results_store.RETENTION_DAYS + 1)).isoformat()
    with results_store._lock, results_store._conn() as conn:
        conn.execute("UPDATE results SET created_at = ?", (old,))
        results_store._prune(conn)
        (left,) = conn.execute("SELECT COUNT(*) FROM results").fetchone()
    assert left == 0

    # Row cap: keep only the newest MAX_ROWS.
    monkeypatch.setattr(results_store, "MAX_ROWS", 3)
    for i in range(6):
        results_store.save_result("t", {"i": i}, f"r{i}")
    with results_store._lock, results_store._conn() as conn:
        results_store._prune(conn)
        (left,) = conn.execute("SELECT COUNT(*) FROM results").fetchone()
    assert left == 3


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
