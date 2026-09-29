# syntax=docker/dockerfile:1
#
# ZodicogAI backend (FastAPI). Configuration is via environment variables -
# see docs/OPERATIONS.md (GEMINI_API_KEY is required).
#
#   docker build -t zodicog-backend ./backend

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

# Run unprivileged; /data holds the SQLite file when no DATABASE_URL is set.
RUN useradd --system --create-home app && mkdir -p /data && chown -R app:app /app /data
USER app
ENV DATABASE_URL=sqlite:////data/results.db

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4).status == 200 else 1)"

# One process on purpose: the AI budget and rate limits are in-memory.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
