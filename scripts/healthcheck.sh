#!/usr/bin/env bash
#
# Cron-driven watchdog: disk usage, backend /health, frontend, PM2 process state.
# Alerts through a webhook when something goes wrong and again when it recovers
# (it does not repeat while the problem persists).
#
#   */5 * * * * ALERT_WEBHOOK_URL=https://... /root/ZodicogAI/scripts/healthcheck.sh
#
# ALERT_WEBHOOK_URL accepts Slack / Discord / Mattermost incoming webhooks and
# ntfy.sh topics (the JSON body carries both "text" and "content").
# Other knobs: DISK_WARN_PERCENT (85), BACKEND_URL, FRONTEND_URL, PM2_APPS.

set -uo pipefail

DISK_WARN_PERCENT="${DISK_WARN_PERCENT:-85}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:3000}"
PM2_APPS="${PM2_APPS:-backend frontend}"
STATE_FILE="${STATE_FILE:-/var/tmp/zodicog-healthcheck.state}"
HOST_NAME="$(hostname)"

problems=()

used=$(df --output=pcent / 2>/dev/null | tail -1 | tr -dc '0-9')
[ -n "$used" ] || used=$(df -P / | awk 'NR==2 {gsub("%","",$5); print $5}' | tr -dc '0-9')
if [ -n "$used" ] && [ "$used" -ge "$DISK_WARN_PERCENT" ]; then
  problems+=("disk ${used}% full on /")
fi

code=$(curl -s -o /dev/null -m 10 -w '%{http_code}' "$BACKEND_URL/health" || true)
[ "$code" = "200" ] || problems+=("backend /health returned $code")

code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$FRONTEND_URL/" || true)
[ "$code" = "200" ] || problems+=("frontend returned $code")

if command -v pm2 >/dev/null 2>&1; then
  for app in $PM2_APPS; do
    status=$(pm2 jlist 2>/dev/null | python3 -c "
import json,sys
try:
    apps=[a for a in json.load(sys.stdin) if a['name']=='$app']
    print(apps[0]['pm2_env']['status'] if apps else 'missing')
except Exception:
    print('unknown')" 2>/dev/null)
    [ "$status" = "online" ] || problems+=("pm2 app '$app' is $status")
  done
fi

current="ok"
[ ${#problems[@]} -eq 0 ] || current=$(printf '%s; ' "${problems[@]}")
previous=$(cat "$STATE_FILE" 2>/dev/null || echo ok)

notify() {
  [ -n "${ALERT_WEBHOOK_URL:-}" ] || { echo "$1"; return; }
  msg=${1//\"/\'}
  curl -s -m 15 -X POST -H 'Content-Type: application/json' \
    -d "{\"text\":\"$msg\",\"content\":\"$msg\"}" "$ALERT_WEBHOOK_URL" >/dev/null || true
}

if [ "$current" != "$previous" ]; then
  if [ "$current" = "ok" ]; then
    notify "RECOVERED [$HOST_NAME]: all checks passing (was: $previous)"
  else
    notify "ALERT [$HOST_NAME]: $current"
  fi
  echo "$current" > "$STATE_FILE"
fi
