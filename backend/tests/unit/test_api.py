"""API-level tests: health, metrics, shared results, and AI-backed analyses with Gemini stubbed."""
import pytest

import metrics


def test_health_reports_db_and_disk(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["db"] == "ok"
    assert 0 < body["disk"]["percent_used"] < 100


def test_health_is_503_when_disk_is_nearly_full(client, monkeypatch):
    import main

    class Full:
        total, used, free = 100, 99, 1

    monkeypatch.setattr(main.shutil, "disk_usage", lambda _p: Full)
    r = client.get("/health")
    assert r.status_code == 503
    assert r.json()["status"] == "unhealthy"


def test_health_is_503_when_db_is_down(client, monkeypatch):
    import main

    def boom():
        raise OSError("disk I/O error")

    monkeypatch.setattr(main, "ping_store", boom)
    r = client.get("/health")
    assert r.status_code == 503
    assert r.json()["db"].startswith("error")


def test_metrics_open_by_default_and_token_guarded_when_set(client, monkeypatch):
    metrics.record("HybridAnalysis", 1.5, True)
    metrics.record("HybridAnalysis", 3.0, False)
    r = client.get("/metrics")
    assert r.status_code == 200
    stats = r.json()["gemini"]["HybridAnalysis"]
    assert stats["calls"] == 2 and stats["failures"] == 1
    assert stats["failure_rate"] == 0.5

    monkeypatch.setenv("METRICS_TOKEN", "s3cret")
    assert client.get("/metrics").status_code == 401
    ok = client.get("/metrics", headers={"Authorization": "Bearer s3cret"})
    assert ok.status_code == 200


def test_shared_result_round_trip(client):
    payload = {"name": "Maya", "score": 87}
    created = client.post("/results", json={"analysis_type": "color_analysis", "title": "Maya's Aura", "payload": payload})
    assert created.status_code == 200
    rid = created.json()["id"]

    fetched = client.get(f"/results/{rid}")
    assert fetched.status_code == 200
    assert fetched.json()["payload"] == payload
    assert fetched.json()["title"] == "Maya's Aura"


def test_unknown_result_is_404(client):
    assert client.get("/results/does-not-exist").status_code == 404


def test_oversized_result_is_rejected(client):
    big = {"blob": "x" * 210_000}
    r = client.post("/results", json={"analysis_type": "t", "payload": big})
    assert r.status_code in (413, 422)


def test_numerology_solo_returns_deterministic_profile(client):
    body = {"person_a_name": "Ada Lovelace", "person_a_day": 10, "person_a_month": 12}
    a = client.post("/analyze/numerology", json=body)
    b = client.post("/analyze/numerology", json=body)
    assert a.status_code == 200
    assert a.json()["numerology"] == b.json()["numerology"]
    assert 1 <= a.json()["numerology"]["life_path_number"] <= 33


def test_numerology_pair_score_is_bounded(client):
    body = {
        "person_a_name": "Ada", "person_a_day": 10, "person_a_month": 12,
        "person_b_name": "Grace", "person_b_day": 9, "person_b_month": 12,
    }
    r = client.post("/analyze/numerology", json=body)
    assert r.status_code == 200
    score = r.json()["compatibility"]["compatibility_score"]
    assert 0 <= score <= 100


@pytest.mark.parametrize("path", ["/analyze/emotional", "/analyze/romantic", "/analyze/compatibility"])
def test_pair_analyses_return_scores_without_gemini(client, path):
    body = {
        "person_a_name": "Alex", "person_a_day": 15, "person_a_month": 3, "person_a_mbti": "INTJ",
        "person_b_name": "Jordan", "person_b_day": 22, "person_b_month": 8, "person_b_mbti": "ENFP",
    }
    r = client.post(path, json=body)
    assert r.status_code == 200, r.text


def test_invalid_input_is_a_422_not_a_crash(client):
    r = client.post("/analyze/numerology", json={"person_a_name": "x"})
    assert r.status_code == 422
