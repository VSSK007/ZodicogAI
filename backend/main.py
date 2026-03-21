import json

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from datetime import datetime

from models.schemas import (
    HybridInput,
    CompatibilityInput,
    SextrologyInput,
    LoveStyleInput,
    LoveLanguageInput,
    ChatInput,
    ZodiacInput,
    ColorInput,
    NumerologyInput,
)
from chat.chat_handler import handle_chat
from agent_controller import (
    run,
    run_analysis,
    _run_engines_only,
    _build_result,
    HYBRID_ANALYSIS,
    COMPATIBILITY_ANALYSIS,
    EMOTIONAL_COMPATIBILITY,
    ROMANTIC_COMPATIBILITY,
    SEXTROLOGY_ANALYSIS,
    SEXTROLOGY_SOLO_ANALYSIS,
    LOVE_STYLE_ANALYSIS,
    LOVE_LANGUAGE_ANALYSIS,
    FULL_RELATIONSHIP_INTELLIGENCE,
    ZODIAC_ARTICLE,
    COLOR_ANALYSIS,
    COLOR_PAIR_ANALYSIS,
    NUMEROLOGY_ANALYSIS,
    NUMEROLOGY_PAIR_ANALYSIS,
)
from gemini_client import stream_gemini, build_prompt, build_stream_prompt

app = FastAPI()

# CORS configuration — restrict to specific origins for security
origins = [
    "http://localhost:3000",      # Local development
    "https://zodicogai.com",      # Production
    "https://www.zodicogai.com",  # Production with www
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# AI Budget Guard — Rate limiting for Gemini API calls
# ---------------------------------------------------------------------------

MAX_DAILY_AI_CALLS = 3000

# Simple in-memory usage tracker (resets daily)
usage_counter = {
    "date": datetime.utcnow().date(),
    "count": 0
}


@app.middleware("http")
async def ai_budget_guard(request: Request, call_next):
    """
    Middleware to track and limit daily AI API calls.
    Prevents overages on Gemini API usage.
    """
    today = datetime.utcnow().date()

    # Reset counter when a new day starts
    if usage_counter["date"] != today:
        usage_counter["date"] = today
        usage_counter["count"] = 0

    # Only guard AI-intensive endpoints
    if request.url.path.startswith("/chat") or request.url.path.startswith("/analyze"):
        # If limit reached, block request
        if usage_counter["count"] >= MAX_DAILY_AI_CALLS:
            raise HTTPException(
                status_code=429,
                detail="Daily AI usage limit reached. Please try again tomorrow."
            )

        # Count the request
        usage_counter["count"] += 1

        # Log usage to server console
        print(f"[AI Budget] Calls today: {usage_counter['count']}/{MAX_DAILY_AI_CALLS}")

    response = await call_next(request)
    return response


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _person(name: str, day: int, month: int, mbti: str) -> dict:
    return {"name": name, "day": day, "month": month, "mbti": mbti}


def _from_pair(data: CompatibilityInput) -> tuple[dict, dict]:
    a = _person(data.person_a_name, data.person_a_day, data.person_a_month, data.person_a_mbti)
    b = _person(data.person_b_name, data.person_b_day, data.person_b_month, data.person_b_mbti)
    return a, b


def _wrap(fn):
    """Standard try/except wrapper shared by every endpoint."""
    try:
        return fn()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Legacy endpoints (kept for backward compatibility with the existing frontend)
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "ZodicogAI backend running"}


@app.post("/hybrid-analysis")
def hybrid_analysis(data: HybridInput):
    return _wrap(lambda: run(HYBRID_ANALYSIS, data.model_dump()))


@app.post("/compatibility")
def compatibility(data: CompatibilityInput):
    return _wrap(lambda: run(COMPATIBILITY_ANALYSIS, data.model_dump()))


# ---------------------------------------------------------------------------
# New /analyze/* endpoints
# ---------------------------------------------------------------------------

@app.post("/analyze/hybrid")
def analyze_hybrid(data: HybridInput):
    return _wrap(lambda: run_analysis(
        HYBRID_ANALYSIS,
        _person(data.name, data.day, data.month, data.mbti),
    ))


@app.post("/analyze/compatibility")
def analyze_compatibility(data: CompatibilityInput):
    return _wrap(lambda: run_analysis(COMPATIBILITY_ANALYSIS, *_from_pair(data)))


@app.post("/analyze/emotional")
def analyze_emotional(data: CompatibilityInput):
    return _wrap(lambda: run_analysis(EMOTIONAL_COMPATIBILITY, *_from_pair(data)))


@app.post("/analyze/romantic")
def analyze_romantic(data: CompatibilityInput):
    return _wrap(lambda: run_analysis(ROMANTIC_COMPATIBILITY, *_from_pair(data)))


@app.post("/analyze/sextrology")
def analyze_sextrology(data: SextrologyInput):
    def _run():
        a = _person(data.person_a_name, data.person_a_day, data.person_a_month, data.person_a_mbti)
        if data.person_b_name:
            b = _person(data.person_b_name, data.person_b_day, data.person_b_month, data.person_b_mbti)
            return run_analysis(SEXTROLOGY_ANALYSIS, a, b)
        return run_analysis(SEXTROLOGY_SOLO_ANALYSIS, a)
    return _wrap(_run)


@app.post("/analyze/love-style")
def analyze_love_style(data: LoveStyleInput):
    def _run():
        a = _person(data.person_a_name, data.person_a_day, data.person_a_month, data.person_a_mbti)
        b = (
            _person(data.person_b_name, data.person_b_day, data.person_b_month, data.person_b_mbti)
            if data.person_b_name
            else None
        )
        return run_analysis(LOVE_STYLE_ANALYSIS, a, b)
    return _wrap(_run)


@app.post("/analyze/love-language")
def analyze_love_language(data: LoveLanguageInput):
    def _run():
        a = _person(data.person_a_name, data.person_a_day, data.person_a_month, data.person_a_mbti)
        b = (
            _person(data.person_b_name, data.person_b_day, data.person_b_month, data.person_b_mbti)
            if data.person_b_name
            else None
        )
        return run_analysis(LOVE_LANGUAGE_ANALYSIS, a, b)
    return _wrap(_run)


@app.post("/analyze/full")
def analyze_full(data: CompatibilityInput):
    return _wrap(lambda: run_analysis(FULL_RELATIONSHIP_INTELLIGENCE, *_from_pair(data)))


@app.post("/analyze/zodiac")
def analyze_zodiac(data: ZodiacInput):
    return _wrap(lambda: run_analysis(
        ZODIAC_ARTICLE,
        {"name": data.name, "day": data.day, "month": data.month, "mbti": ""},
    ))


@app.post("/analyze/color")
def analyze_color(data: ColorInput):
    def _run():
        a = {"name": data.person_a_name, "day": data.person_a_day, "month": data.person_a_month, "mbti": ""}
        if data.person_b_name and data.person_b_day and data.person_b_month:
            b = {"name": data.person_b_name, "day": data.person_b_day, "month": data.person_b_month, "mbti": ""}
            return run_analysis(COLOR_PAIR_ANALYSIS, a, b)
        return run_analysis(COLOR_ANALYSIS, a)
    return _wrap(_run)


@app.post("/analyze/numerology")
def analyze_numerology(data: NumerologyInput):
    def _run():
        a = {"name": data.person_a_name, "day": data.person_a_day, "month": data.person_a_month, "mbti": ""}
        if data.person_b_name and data.person_b_day and data.person_b_month:
            b = {"name": data.person_b_name, "day": data.person_b_day, "month": data.person_b_month, "mbti": ""}
            return run_analysis(NUMEROLOGY_PAIR_ANALYSIS, a, b)
        return run_analysis(NUMEROLOGY_ANALYSIS, a)
    return _wrap(_run)


# ---------------------------------------------------------------------------
# Streaming endpoints — SSE responses for emotional, romantic, sextrology
# ---------------------------------------------------------------------------

def _sse_stream(analysis_type: str, person_a: dict, person_b: dict):
    """
    Shared SSE generator for streaming analyses.

    Protocol:
      - Each Gemini text chunk:  data: {"chunk": "..."}\n\n
      - After streaming done:    data: {"scores": {...}, "labels": {...},
                                        "overall": 78.5, "done": true}\n\n
    """
    # 1. Run deterministic engines only (no Gemini call yet).
    ctx = _run_engines_only(analysis_type, person_a, person_b)

    # 2. Build a prose narrative prompt (not JSON) for streaming.
    prompt = build_stream_prompt(analysis_type, ctx)

    # 3. Stream Gemini text chunks as SSE.
    for chunk_text in stream_gemini(prompt):
        yield f"data: {json.dumps({'chunk': chunk_text})}\n\n"

    # 4. Send the full deterministic result as the final SSE event so the
    #    frontend can render ScoreRing, MetricCard, TraitRadar, etc.
    bundle = ctx.get("_score_bundle")
    base = {
        "done":    True,
        "scores":  bundle.score_map                if bundle else {},
        "labels":  bundle.label_map                if bundle else {},
        "overall": round(bundle.overall_score, 1)  if bundle else None,
        "a_traits": ctx.get("a_zodiac", {}).get("trait_vector", {}),
        "b_traits": ctx.get("b_zodiac", {}).get("trait_vector", {}),
    }
    # Merge the engine-specific sub-scores so the frontend renders
    # ScoreRing, MetricCard, TraitRadar correctly per analysis type
    if analysis_type == EMOTIONAL_COMPATIBILITY:
        base.update(ctx.get("emotional", {}))
    elif analysis_type == ROMANTIC_COMPATIBILITY:
        base.update(ctx.get("romantic",  {}))
        base.update(ctx.get("emotional", {}))
    elif analysis_type == SEXTROLOGY_ANALYSIS:
        base.update(ctx.get("sextrology", {}))
    yield f"data: {json.dumps(base)}\n\n"


@app.post("/analyze/emotional/stream")
async def stream_emotional(req: CompatibilityInput):
    """Stream emotional compatibility analysis as SSE."""
    a, b = _from_pair(req)

    def _gen():
        try:
            yield from _sse_stream(EMOTIONAL_COMPATIBILITY, a, b)
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(_gen(), media_type="text/event-stream")


@app.post("/analyze/romantic/stream")
async def stream_romantic(req: CompatibilityInput):
    """Stream romantic compatibility analysis as SSE."""
    a, b = _from_pair(req)

    def _gen():
        try:
            yield from _sse_stream(ROMANTIC_COMPATIBILITY, a, b)
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(_gen(), media_type="text/event-stream")


@app.post("/analyze/sextrology/stream")
async def stream_sextrology(req: CompatibilityInput):
    """Stream sextrology compatibility analysis as SSE."""
    a, b = _from_pair(req)

    def _gen():
        try:
            yield from _sse_stream(SEXTROLOGY_ANALYSIS, a, b)
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(_gen(), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# Chat endpoint
# ---------------------------------------------------------------------------

@app.post("/chat")
def chat(data: ChatInput):
    def _run():
        a = data.person_a.model_dump() if data.person_a else None
        b = data.person_b.model_dump() if data.person_b else None
        history = [h.model_dump() for h in data.history]
        return handle_chat(data.message, a, b, history)
    return _wrap(_run)
