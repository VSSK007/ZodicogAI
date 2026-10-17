# Testing

| Layer | Tool | Where | Needs |
|---|---|---|---|
| Backend units | pytest | `backend/tests/unit` | nothing (Gemini stubbed) |
| Live pipeline (manual) | script | `backend/tests/test_full_pipeline.py` | running server + real `GEMINI_API_KEY` |
| UI end-to-end | Playwright | `frontend/e2e` | a production build; analyses replayed from fixtures |
| Visual regression | Playwright screenshots | `frontend/e2e/visual.spec.ts` | Linux baselines (below) |
| Performance budget | Lighthouse CI | `frontend/lighthouserc.json` | a production build |

CI (`.github/workflows/ci.yml`) runs all of these on every push and PR; deploys
are gated on them.

## Backend

```bash
cd backend && pip install -r requirements-dev.txt && python -m pytest
```

`GEMINI_API_KEY` is set to a dummy and `call_gemini` is stubbed in
`tests/unit/conftest.py`, so tests are fast, free and offline. Covered: `/health`
(incl. disk-full and DB-down 503s), `/metrics`, shared results round-trip and
retention, deterministic engines, the Gemini concurrency limiter and its metrics,
and the AI-backed endpoints' non-AI behaviour.

## End-to-end (Playwright)

```bash
cd frontend
npm run build
npx playwright install chromium      # first time
npm run test:e2e                     # desktop + mobile + visual
E2E_BACKEND=1 npm run test:e2e       # also start the real backend (needed by share.spec.ts)
npx playwright test analyze.spec.ts --project=desktop --headed   # debugging
```

What's covered (about 35 scenarios, ~70 counting both viewports):

- **`analyze.spec.ts`** - every analyze page: fill form, submit, result renders,
  reset; pair modes; validation (nothing sent when incomplete); API failure shows
  a retryable error; the streamed emotional/romantic pages.
- **`dashboard.spec.ts`** - the synastry report: hero, six sections, section index
  and scroll-spy, progress bar, Export PDF, print styles.
- **`chat.spec.ts`** - streamed replies render markdown, intent chip, starter
  prompts, New chat, persistence across reload, stream errors, typing indicator.
- **`share.spec.ts`** - saves a reading to the real backend, opens `/r/<id>`, checks
  the OG image is a PNG, and that a saved report reopens at `#section` (skipped
  automatically if no backend answers `/health`).
- **`navigation.spec.ts`** - command palette, saved profile pre-fill/forget,
  celebrity pages (incl. corrected birth dates), 404, smoke test of key routes.
- **`pwa.spec.ts`** - manifest, Chrome's installability audit, service-worker headers,
  offline page, and that only static assets are ever cached.
- **`mobile.spec.ts`** (Pixel 7) - no sideways scroll, floating buttons appear only
  near the bottom and never as a full-width strip, menu sheet, a reading and the
  report on a phone; the installed-app tab bar, haptics and pull-to-refresh; the
  report's swipeable story mode; the install banner (and that it never shifts the page).

Added with the feature roadmap (all in `frontend/e2e/`):

- **`onboarding.spec.ts`** (3-step `/welcome`), **`today.spec.ts`** (daily card, streak),
  **`home-today.spec.ts`** (returning-visitor strip, layout shift), **`invite.spec.ts`**
  (partner invites), **`story.spec.ts`** (9:16 cards; needs the real backend),
  **`sharecard.spec.ts`** (score/key-line extraction, pure).
- **`celebrity-matches.spec.ts`**, **`celebrity-compare.spec.ts`** (incl. the couples list,
  which is pure and takes an injected list), **`group.spec.ts`**, **`zodiac-wheel.spec.ts`**.
- **`chat-context.spec.ts`** (report + profile context), **`push.spec.ts`**, **`sw-push.spec.ts`**,
  **`digest.spec.ts`** (weekly-email switch; one test uses the real backend).
- **`combos.spec.ts`** - the 192 sign x type guides: sitemap, hub, 404s, the link mesh,
  structured data, and that opening a page of links never prefetches (and so generates) guides.
  The guide page has two valid states (the article, or a calm "being written" state when
  Gemini is unavailable) and the suite asserts whichever it finds.

Tests that need the real backend skip themselves unless `/health` answers; account tests also
need `AUTH_DEV_LINKS=1` on it. Start one the way CI does:

```bash
cd backend && GEMINI_API_KEY=e2e-dummy-key AUTH_DEV_LINKS=1 AUTH_MAX_LINKS_PER_IP_HOUR=10000 \
  CORS_ORIGINS=http://localhost:3100 uvicorn main:app --port 8000
```

### Fixtures

Analyses are answered from **recordings of the real backend** in
`e2e/fixtures/` - realistic payloads, no Gemini cost or flakiness. Re-record after
a response schema changes:

```bash
# backend running on :8000 with a real key
python backend/scripts/record_e2e_fixtures.py --force
```

### Visual regression

Baselines differ per OS, so only the **Linux** ones (`*-linux.png`) are committed.
On the first run there are none and CI prints a notice and skips the step.

1. GitHub -> Actions -> **Visual baselines** -> Run workflow.
2. Download the `visual-baselines` artifact; copy its contents into
   `frontend/e2e/__screenshots__/` and commit.
3. From then on CI fails on any pixel diff above 2%. After an *intentional* UI
   change, re-run the workflow and commit the new baselines.

Locally, `npm run test:e2e:update` creates disposable `*-win32.png` /
`*-darwin.png` files (git-ignored) so you can run the visual tests on your machine.

The animated star canvas is masked and CSS animations are fast-forwarded; the
report test waits for the score count-up to finish.

### Backend tests added with the roadmap

`backend/tests/unit`: `test_daily.py` (daily card and its caches), `test_invites.py`,
`test_celebrity_matches.py`, `test_celebrity_compare.py`, `test_group.py`,
`test_chat_context.py` (prompt-injection handling of saved-reading context), `test_push.py`,
`test_digest.py` (opt-in, unsubscribe tokens, one email per week, in-place DB upgrade),
`test_combo.py`. Cron-driven scripts have `--dry-run` and `--now` so they can be exercised
without sending anything (see `docs/OPERATIONS.md`).

`backend/data/celebrities.json` is generated from `frontend/lib/celebrities.ts`; a test fails
if they drift (fix: `python backend/scripts/export_celebrities.py`).

## Verifying the tests themselves

The suite has been checked to fail when it should: corrupting a recorded fixture
turns the matching scenario red, restoring it turns it green; the whole desktop
suite passes repeatedly (2 runs x 35 scenarios) under parallel load.
