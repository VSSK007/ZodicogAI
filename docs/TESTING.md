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
  report on a phone.

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

## Verifying the tests themselves

The suite has been checked to fail when it should: corrupting a recorded fixture
turns the matching scenario red, restoring it turns it green; the whole desktop
suite passes repeatedly (2 runs x 35 scenarios) under parallel load.
