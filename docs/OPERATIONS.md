# Operations guide

How ZodicogAI is built, shipped, watched and recovered. Everything here is
wired into the repo; the sections marked **One-time setup** are the only manual
steps.

## Pipeline at a glance

```
git push main ──► GitHub Actions
                    ├─ backend    pytest (Gemini stubbed, no key/network)
                    ├─ frontend   eslint · tsc · next build
                    ├─ e2e        Playwright (mocked API)            [see docs/TESTING.md]
                    ├─ lighthouse mobile budget: LCP < 2.5s          [see docs/PERFORMANCE.md]
                    └─ deploy     ssh VPS → scripts/deploy.sh
                                    lock → disk check → ff-merge → pip install
                                    → npm ci → build → pm2 restart
                                    → /health ✓ ? done : rebuild previous commit
```

A red job stops the deploy. A failed health check after restart rolls the VPS
back to the previous commit automatically and fails the workflow.

## One-time setup

### 1. GitHub → Settings → Secrets and variables → Actions

| Name | Kind | Value |
|---|---|---|
| `VPS_HOST` | secret | server IP or hostname |
| `VPS_USER` | secret | SSH user (e.g. `root`) |
| `VPS_SSH_KEY` | secret | private half of a **dedicated deploy key** (below) |
| `VPS_KNOWN_HOSTS` | secret | output of `ssh-keyscan -H <host>` (pins the host key) |
| `VPS_APP_DIR` | variable | checkout path on the server, default `~/ZodicogAI` |
| `DEPLOY_ENABLED` | variable | set to `true` **last**, once the four secrets above exist; until then CI runs tests/build but skips the deploy job |

Create the environment **production** (Settings → Environments); add required
reviewers there if you want a manual approval before each deploy.

Deploy key, on your laptop:

```bash
ssh-keygen -t ed25519 -f zodicog_deploy -C "github-actions-deploy" -N ""
ssh-copy-id -i zodicog_deploy.pub root@<host>     # or append to ~/.ssh/authorized_keys
# paste the contents of zodicog_deploy into the VPS_SSH_KEY secret, then delete the local copy
```

### 2. On the VPS

```bash
cd ~/ZodicogAI
chmod +x scripts/*.sh

# PM2 app names must match scripts/deploy.sh (defaults: backend, frontend).
pm2 list

# Monitoring + backups (crontab -e)
*/5 * * * *  ALERT_WEBHOOK_URL=https://hooks.slack.com/... /root/ZodicogAI/scripts/healthcheck.sh
0 3 * * *    /root/ZodicogAI/scripts/backup.sh
```

The server must be able to `git fetch origin` (deploy key or token) and
`node` 22+ / `python3` must be on the PATH used by PM2.

### 3. Error monitoring (Sentry) — optional but recommended

Create two projects (Next.js, FastAPI) at sentry.io, then set:

| Where | Variable |
|---|---|
| backend `.env` on the VPS | `SENTRY_DSN`, optionally `SENTRY_TRACES_SAMPLE_RATE` (default 0.05), `APP_ENV` |
| frontend build env | `NEXT_PUBLIC_SENTRY_DSN`, optionally `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT` to upload source maps |

Without a DSN both SDKs are inert.

### 4. External uptime monitor

Point UptimeRobot / Better Stack / Cronitor at:

- `https://zodicogai.com/` (expects 200)
- `https://<api-host>/health` (expects 200; 503 means disk ≥ 95% or DB down)

The cron watchdog above is the *inside* view (disk, PM2); the external monitor
is the *outside* view (DNS, TLS, the reverse proxy). Use both.

## Observability

| Signal | Where |
|---|---|
| Crashes / exceptions | Sentry (frontend + backend) |
| Gemini latency and failure rate per analysis type | `GET /metrics` (set `METRICS_TOKEN` to require `Authorization: Bearer`) |
| Liveness, disk, DB | `GET /health` |
| Deploy history | `~/deploys.log` on the VPS (`deployed …` / `ROLLED BACK …`) |

`/metrics` example:

```json
{"gemini": {"HybridAnalysis": {"calls": 41, "failures": 1, "failure_rate": 0.0244,
                               "latency_p50_s": 6.2, "latency_p95_s": 14.8}}}
```

Counters reset when the backend restarts; they answer "is Gemini having a bad
hour?", not long-term trends.

## Backups

`scripts/backup.sh` writes `~/backups/zodicog-<timestamp>.db.gz` (SQLite online
backup API, safe while the app is running), keeps 14 days, and optionally
copies off-box with `BACKUP_REMOTE=user@host:/path/` or `rclone:<remote>:<path>`.
With `DATABASE_URL=postgresql://…` it uses `pg_dump` instead.

Restore (SQLite): stop the backend, `gunzip -c backup.db.gz > backend/results.db`,
start it. Test a restore once — an untested backup is a hope.

## Rollback

- **Automatic:** a failed post-restart health check rebuilds the previous commit.
- **Manual:** pick the good commit from `git log --oneline`, then
  `git reset --hard <sha> && (cd frontend && npm ci && npm run build) && pm2 restart backend frontend`.

## Cloudflare in front of the VPS (recommended)

TLS, caching and DDoS protection, with the origin hidden.

1. Add the domain to Cloudflare; switch nameservers.
2. DNS: `zodicogai.com`, `www`, and the API host → the VPS IP, **proxied (orange cloud)**.
3. SSL/TLS → **Full (strict)** (install a Cloudflare Origin Certificate in nginx), enable *Always Use HTTPS*.
4. Caching rules:
   - Cache everything under `/_next/static/*` and `/fonts/*` (immutable, long TTL).
   - **Bypass cache** for the API host, for `/r/*` (shared readings are dynamic) and for
     `/sw.js` (a cached service worker can't be fixed - see `docs/PWA.md`).
5. Security: enable Bot Fight Mode; add a rate-limiting rule on the API host
   (e.g. 60 requests / 10 s per IP) as a first line ahead of the app's own
   per-IP AI budget.
6. Lock the origin: allow ports 80/443 only from [Cloudflare's IP ranges](https://www.cloudflare.com/ips/)
   (ufw), and make nginx trust `CF-Connecting-IP` (`set_real_ip_from` for those
   ranges) so the backend's per-IP rate limit sees real visitors.

## Accounts and Postgres

Accounts are optional and passwordless: a visitor enters an email, gets a
one-time link (valid 15 minutes, single use), and is signed in for 30 days.
Signing in adopts the readings made on that device and syncs the saved profile,
so history follows the person across devices. Anonymous use is unchanged.

**Email** (sign-in links): set one of
- `RESEND_API_KEY` (recommended) and `MAIL_FROM="ZodicogAI <login@yourdomain>"`, or
- `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`.

Without either, links are only written to the backend log (the site tells nobody
"sent"), which is fine for development and useless in production. Also set
`FRONTEND_URL=https://zodicogai.com` so links point at the site.

**Postgres** (recommended once accounts exist; SQLite still works):

```bash
# 1. create a database and user (or use a managed Postgres)
# 2. stop the backend, copy existing data (idempotent; ids and /r/<id> links are preserved)
DATABASE_URL=postgresql://user:pw@host/zodicog python backend/scripts/migrate_sqlite_to_postgres.py
# 3. add DATABASE_URL to the backend environment and restart
pm2 restart backend --update-env
```

The same test-suite runs against SQLite and a real Postgres in CI. `backup.sh`
switches to `pg_dump` automatically when `DATABASE_URL` is set.

**Deleting an account** (Profile page -> Delete account) removes the user, their
sessions, saved profile and owned readings. Anonymous readings are unaffected.

**Session storage.** Sessions are bearer tokens kept in `localStorage` because the
API is on a different origin from the site. Tokens are 256-bit random and stored
only as SHA-256 hashes; login requests are rate-limited per address and per IP.

## Docker (reproducible deploys)

The repo builds as two small images and a compose file that also runs Postgres:

```bash
cp .env.example .env        # set GEMINI_API_KEY and POSTGRES_PASSWORD at least
docker compose up --build   # frontend :3000, backend :8000, Postgres with a volume
```

- `frontend/Dockerfile`: multi-stage, Next.js **standalone** output (`NEXT_OUTPUT=standalone`),
  non-root, healthcheck. `NEXT_PUBLIC_*` values are build args because they are baked
  into the client bundle (they are public, not secrets).
- `backend/Dockerfile`: python:3.11-slim, non-root, healthcheck on `/health`, one
  uvicorn process on purpose (the AI budget and rate limits live in memory).
  Without `DATABASE_URL` it uses SQLite at `/data/results.db` (mount a volume there).
- CI builds both images and boots them (`docker` job): `/health` must answer, and the
  frontend must serve the site with security headers.
- The standalone build can't be produced on Windows (a dependency ships a file name
  containing `:`); build images on Linux or in CI.

`deploy/nginx.conf.example` is a reference reverse proxy: HTTPS, HSTS, long-cache
for hashed assets, **no buffering for streamed (SSE) responses**, and the
Cloudflare real-IP setup so per-IP limits see visitors, not the CDN.

Baseline security headers (nosniff, frame denial, referrer and permissions
policies) are set by Next itself; a strict CSP is deliberately left for later since
GA/PostHog/Sentry need a tested allow-list.

The current PM2 deployment keeps working unchanged; moving to containers is
opt-in.

## Web push: the daily nudge

Visitors with a saved profile can switch on a morning notification ("Your day,
Pisces" plus the first line of today's horoscope). It needs three things on the VPS:
VAPID keys, an hourly cron line, and `pip install -r backend/requirements.txt`
(adds `pywebpush` and `tzdata`). Without keys the switch simply never appears.

**1. Generate the keys once** (keep the private key secret, never regenerate: that
silently invalidates every existing subscription):

```bash
cd ~/ZodicogAI/backend && venv/bin/python scripts/generate_vapid_keys.py
```

Paste the three printed lines (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
into the backend `.env`, then `pm2 restart backend`. (`npx web-push generate-vapid-keys`
gives a compatible pair too.)

**2. The hourly cron line** (`crontab -e`). It sends each person their nudge at *their*
chosen hour in *their* time zone, once a day, and deletes subscriptions the browser has
dropped:

```cron
5 * * * *  cd /root/ZodicogAI/backend && venv/bin/python scripts/send_daily_push.py >> /var/log/zodicog-push.log 2>&1
```

The script reads `backend/.env` itself. Check it any time with
`venv/bin/python scripts/send_daily_push.py --dry-run` (prints who is due and what they
would get, sends nothing) or `--now 2026-10-20T02:35:00+00:00` to simulate a time.

**What is stored:** per subscription only the push endpoint and keys, the sun sign, an
optional MBTI type, the time zone and the chosen hour. No name, birth date or account.
The horoscope text is the same single Gemini call per sign per day the website uses
(stored in the database, so the 8am run and the site share it): at most 12 a day.

**iPhone/iPad** only deliver web push to the *installed* app (iOS 16.4+); the site says
so and shows the install steps there.

## Weekly email: "Your week ahead"

Signed-in visitors can switch on a Monday email (profile page -> *Weekly email*). It is
**off by default**, needs a saved profile (for the sign), and every email has a one-click
unsubscribe link that works without signing in. You need an email provider that already
sends sign-in links (`RESEND_API_KEY` or `SMTP_*`), plus two new variables in the backend `.env`:

| Variable | What it is |
|---|---|
| `DIGEST_SECRET` | any long random string; signs the unsubscribe links (`openssl rand -hex 32`). Keep it stable: changing it breaks links already in people's inboxes. The script refuses to send without it. |
| `BACKEND_PUBLIC_URL` | the public address of the API, e.g. `https://api.zodicogai.com`; used for the unsubscribe link and the `List-Unsubscribe` header (falls back to `NEXT_PUBLIC_API_URL`) |

Set `MAIL_FROM` to an address on a domain you have verified with your provider, and keep
`FRONTEND_URL` correct (the "Open your day" button). Then restart the backend, which adds the
new `users` columns by itself, and add one cron line (`crontab -e`), Mondays 08:00 server time:

```cron
0 8 * * 1  cd /root/ZodicogAI/backend && venv/bin/python scripts/send_weekly_digest.py >> /var/log/zodicog-digest.log 2>&1
```

Check it first with `venv/bin/python scripts/send_weekly_digest.py --dry-run` (lists who would get
an email, calls no AI, sends nothing). It is safe to run twice in a week: each person gets at most
one email per ISO week, and a person whose send failed is retried by the next run. If no provider is
configured the run reports `unsent=N` and sends nothing.

The AI writes the weekly outlook once per sign per week (at most 12 calls a week), stored in the
database and shared by every recipient of that sign. Mail clients' own "Unsubscribe" button uses the
one-click `List-Unsubscribe-Post` header; a tampered link is rejected and changes nothing.

## Environment variable reference

| Variable | Used by | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | backend | required |
| `GEMINI_MAX_CONCURRENT` / `GEMINI_SLOT_WAIT_SECONDS` | backend | concurrent Gemini calls (8) / max queue wait (45 s) |
| `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, `APP_ENV` | backend | error monitoring |
| `METRICS_TOKEN` | backend | protect `/metrics` |
| `DATABASE_URL` | backend | Postgres (`postgresql://…`); SQLite file when unset |
| `RESEND_API_KEY` or `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`, `MAIL_FROM` | backend | sign-in email |
| `FRONTEND_URL` | backend | base URL used in sign-in links |
| `CORS_ORIGINS` | backend | extra allowed origins (staging, previews), comma-separated |
| `AUTH_MAX_LINKS_PER_EMAIL_HOUR`, `AUTH_MAX_LINKS_PER_IP_HOUR` | backend | sign-in throttles (5 / 20) |
| `INVITES_MAX_PER_IP_HOUR` | backend | partner invites a device may create per hour (default 20) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | backend + cron | web push keys and contact (see *Web push*); push is off when unset |
| `PUSH_MAX_PER_IP_HOUR` | backend | push subscribe/unsubscribe calls a device may make per hour (default 30) |
| `DIGEST_SECRET`, `BACKEND_PUBLIC_URL` | backend + cron | weekly email: unsubscribe-link signing secret and the API's public URL (see *Weekly email*) |
| `AUTH_DEV_LINKS` | backend | `1` returns the link in the API response - **development and CI only** |
| `NEXT_PUBLIC_API_URL` | frontend | backend base URL |
| `NEXT_PUBLIC_SENTRY_DSN` | frontend | error monitoring |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | frontend | product analytics + feature flags |
| `ALERT_WEBHOOK_URL`, `DISK_WARN_PERCENT` | healthcheck.sh | alert destination / threshold (85) |
| `BACKUP_DIR`, `KEEP_DAYS`, `BACKUP_REMOTE` | backup.sh | backup location, retention, off-box copy |
