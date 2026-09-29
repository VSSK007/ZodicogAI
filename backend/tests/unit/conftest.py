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
    """Each test gets its own throwaway results database."""
    import results_store

    monkeypatch.setattr(results_store, "_DB_PATH", tmp_path / "results.db")
    monkeypatch.setattr(results_store, "_save_count", 0)
    yield


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
