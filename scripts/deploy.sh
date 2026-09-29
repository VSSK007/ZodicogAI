#!/usr/bin/env bash
#
# Deploy ZodicogAI on the VPS.
#
#   scripts/deploy.sh [git-ref]        default: origin/main
#
# Steps: take a lock -> refuse if the disk is nearly full -> fast-forward the
# checkout -> install backend deps -> npm ci + build -> restart PM2 apps ->
# health-check both. If any step fails the previous commit is rebuilt and
# restarted, and the script exits non-zero so CI shows the deploy as failed.
#
# Usage from CI: see .github/workflows/ci.yml (pipes this file over SSH).
# Overridable via environment: APP_DIR, PM2_BACKEND, PM2_FRONTEND,
# BACKEND_URL, FRONTEND_URL, MIN_FREE_MB, BACKEND_PIP.

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/ZodicogAI}"
APP_DIR="${APP_DIR/#\~/$HOME}"
TARGET="${1:-origin/main}"
PM2_BACKEND="${PM2_BACKEND:-backend}"
PM2_FRONTEND="${PM2_FRONTEND:-frontend}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:3000}"
MIN_FREE_MB="${MIN_FREE_MB:-2500}"

log()  { printf '[deploy %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

cd "$APP_DIR" || fail "cannot cd to $APP_DIR"

# One deploy at a time.
exec 9>/tmp/zodicog-deploy.lock
flock -n 9 || fail "another deploy is already running"

# The builds need real headroom; a full disk is what broke the last deploy.
free_mb=$(df -Pm "$APP_DIR" | awk 'NR==2 {print $4}')
[ "$free_mb" -ge "$MIN_FREE_MB" ] || fail "only ${free_mb}MB free (need ${MIN_FREE_MB}MB) - free disk space first"

# Never clobber hand edits on the server.
git diff --quiet && git diff --cached --quiet || fail "tracked files have local changes; commit or stash them first"

PREV_SHA=$(git rev-parse HEAD)
git fetch --quiet --prune origin main
git merge --quiet --ff-only "$TARGET" || fail "cannot fast-forward to $TARGET (history diverged?)"
NEW_SHA=$(git rev-parse HEAD)
log "deploying ${PREV_SHA:0:7} -> ${NEW_SHA:0:7}"

pip_bin() {
  if [ -n "${BACKEND_PIP:-}" ]; then echo "$BACKEND_PIP"
  elif [ -x backend/venv/bin/pip ]; then echo backend/venv/bin/pip
  else echo pip3; fi
}

build() {
  log "installing backend dependencies"
  "$(pip_bin)" install --quiet -r backend/requirements.txt
  log "installing frontend dependencies + building"
  (cd frontend && npm ci --no-audit --no-fund --loglevel=error && npm run build)
}

restart() {
  log "restarting $PM2_BACKEND and $PM2_FRONTEND"
  pm2 restart "$PM2_BACKEND" "$PM2_FRONTEND" --update-env >/dev/null
}

# Backend must answer /health with 200 (a 404 means the pre-/health version is
# running, which is only expected while rolling back to an old commit).
healthy() {
  local i code
  for i in $(seq 1 30); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL/health" || true)
    if [ "$code" = "404" ]; then code=$(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL/" || true); fi
    if [ "$code" = "200" ] && curl -fs -o /dev/null "$FRONTEND_URL/"; then return 0; fi
    sleep 2
  done
  return 1
}

if build && restart && healthy; then
  log "OK - now serving ${NEW_SHA:0:7}"
  echo "$(date -u +%FT%TZ) deployed ${NEW_SHA}" >> "$HOME/deploys.log"
  exit 0
fi

log "FAILED - rolling back to ${PREV_SHA:0:7}"
git reset --quiet --hard "$PREV_SHA"
if build && restart && healthy; then
  log "rollback OK - serving ${PREV_SHA:0:7} again"
  echo "$(date -u +%FT%TZ) ROLLED BACK ${NEW_SHA} -> ${PREV_SHA}" >> "$HOME/deploys.log"
else
  log "rollback ALSO failed - manual intervention needed (pm2 logs)"
fi
exit 1
