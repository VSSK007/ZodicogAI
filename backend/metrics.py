"""
In-process Gemini metrics - call counts, failure rate and latency per label.

Labels are the response-schema names (HybridAnalysis, SextrologyAnalysis...),
plus "stream" for streamed calls, so failure rate and latency can be read per
analysis type from GET /metrics. Numbers reset when the process restarts; this
is for spotting a bad model day or a slow analysis, not for long-term history
(Sentry and the uptime monitor cover that).
"""
import threading
from collections import deque

_WINDOW = 500  # latency samples kept per label

_lock = threading.Lock()
_stats: dict[str, dict] = {}


def record(label: str, seconds: float, ok: bool) -> None:
    with _lock:
        s = _stats.setdefault(label, {"calls": 0, "failures": 0, "lat": deque(maxlen=_WINDOW)})
        s["calls"] += 1
        if not ok:
            s["failures"] += 1
        s["lat"].append(seconds)


def _pct(sorted_vals: list, p: float) -> float:
    if not sorted_vals:
        return 0.0
    idx = min(len(sorted_vals) - 1, int(round(p * (len(sorted_vals) - 1))))
    return sorted_vals[idx]


def snapshot() -> dict:
    out: dict = {}
    with _lock:
        for label, s in _stats.items():
            lat = sorted(s["lat"])
            calls = s["calls"]
            out[label] = {
                "calls": calls,
                "failures": s["failures"],
                "failure_rate": round(s["failures"] / calls, 4) if calls else 0.0,
                "latency_p50_s": round(_pct(lat, 0.50), 3),
                "latency_p95_s": round(_pct(lat, 0.95), 3),
            }
    return out


def reset() -> None:
    with _lock:
        _stats.clear()
