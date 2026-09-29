#!/usr/bin/env bash
#
# Back up the shared-readings database, keep the last N days, optionally copy off-box.
#
#   0 3 * * * /root/ZodicogAI/scripts/backup.sh
#
# SQLite (default): uses the online backup API, so it is safe while the app is
# writing. Postgres: set DATABASE_URL=postgresql://... and pg_dump is used.
#
# Env: APP_DIR (~/ZodicogAI), BACKUP_DIR (~/backups), KEEP_DAYS (14),
#      BACKUP_REMOTE (optional rsync/scp destination, e.g. user@host:/backups/zodicog/
#                     or an rclone remote like "rclone:b2:zodicog-backups")

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/ZodicogAI}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$BACKUP_DIR"

if [[ "${DATABASE_URL:-}" == postgres* ]]; then
  OUT="$BACKUP_DIR/zodicog-$STAMP.sql.gz"
  pg_dump "$DATABASE_URL" | gzip -9 > "$OUT"
else
  SRC="${SQLITE_PATH:-$APP_DIR/backend/results.db}"
  [ -f "$SRC" ] || { echo "no database at $SRC" >&2; exit 1; }
  TMP="$BACKUP_DIR/.zodicog-$STAMP.db"
  python3 - "$SRC" "$TMP" <<'PY'
import sqlite3, sys
src = sqlite3.connect(sys.argv[1])
dst = sqlite3.connect(sys.argv[2])
with dst:
    src.backup(dst)
dst.close(); src.close()
PY
  OUT="$BACKUP_DIR/zodicog-$STAMP.db.gz"
  gzip -9 -c "$TMP" > "$OUT"
  rm -f "$TMP"
fi

# Refuse to call an empty file a backup.
[ -s "$OUT" ] || { echo "backup is empty: $OUT" >&2; exit 1; }
echo "backup written: $OUT ($(du -h "$OUT" | cut -f1))"

find "$BACKUP_DIR" -name 'zodicog-*.gz' -mtime +"$KEEP_DAYS" -delete

if [ -n "${BACKUP_REMOTE:-}" ]; then
  if [[ "$BACKUP_REMOTE" == rclone:* ]]; then
    rclone copy "$OUT" "${BACKUP_REMOTE#rclone:}"
  else
    rsync -q "$OUT" "$BACKUP_REMOTE"
  fi
  echo "copied off-box to $BACKUP_REMOTE"
fi
