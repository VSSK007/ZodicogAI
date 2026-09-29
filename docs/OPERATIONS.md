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
   - **Bypass cache** for the API host and for `/r/*` (shared readings are dynamic).
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
| `AUTH_DEV_LINKS` | backend | `1` returns the link in the API response - **development and CI only** |
| `NEXT_PUBLIC_API_URL` | frontend | backend base URL |
| `NEXT_PUBLIC_SENTRY_DSN` | frontend | error monitoring |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | frontend | product analytics + feature flags |
| `ALERT_WEBHOOK_URL`, `DISK_WARN_PERCENT` | healthcheck.sh | alert destination / threshold (85) |
| `BACKUP_DIR`, `KEEP_DAYS`, `BACKUP_REMOTE` | backup.sh | backup location, retention, off-box copy |
