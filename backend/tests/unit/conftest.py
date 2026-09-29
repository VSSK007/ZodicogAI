"""
Shared fixtures. Tests never touch the network or a real Gemini key:
GEMINI_API_KEY is set to a dummy before the app imports, and call_gemini is
replaced with a stub that returns each schema's all-defaults instance (the same
thing the real client returns when Gemini is down).
"""
import os
import sys
from pathlib import Path

os.environ.setdefault("GEMINI_API_KEY", "test-key")

BACKEND = Path(__file__).resolve().parents[2]
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

import pytest  # noqa: E402


@pytest.fixture(autouse=True)
def isolated_results_db(tmp_path, monkeypatch):
    """Each test gets a clean database and clean rate limits.

    Default: a throwaway SQLite file. Set TEST_DATABASE_URL (CI does, with a
    Postgres service container) to run the same suite against another engine;
    tables are dropped and recreated before every test.
    """
    import auth
    import db
    import results_store

    url = os.getenv("TEST_DATABASE_URL") or f"sqlite:///{(tmp_path / 'test.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", url)
    monkeypatch.setattr(results_store, "_save_count", 0)
    db.reset_engine()
    if os.getenv("TEST_DATABASE_URL"):
        engine = db.get_engine()
        db.metadata.drop_all(engine)
        db.metadata.create_all(engine)
    auth.reset_rate_limits()
    yield
    db.reset_engine()


@pytest.fixture(autouse=True)
def stub_gemini(monkeypatch):
    import agent_controller
    import gemini_client
    import metrics

    def fake(prompt, schema):
        return schema()

    monkeypatch.setattr(agent_controller, "call_gemini", fake)
    monkeypatch.setattr(gemini_client, "call_gemini", fake)
    metrics.reset()
    yield


@pytest.fixture()
def client():
    from fastapi.testclient import TestClient

    import main

    # Fresh AI budget for every test.
    main.usage_counter["count"] = 0
    main._ip_usage.clear()
    return TestClient(main.app)
