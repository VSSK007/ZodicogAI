# Handoff: ZodicogAI feature + UI roadmap (18 items)

You are picking up work on **ZodicogAI**, a live astrology × MBTI "relationship intelligence"
web app. The owner wants **all 18 items below built**. Work through them **in the phase order
given**, one item at a time. Each item ends in a green test run and its own commit.

Read this whole document before writing any code.

---

## 0. How to work

1. **Before each item:** read the files named in its "Where" line plus anything they import.
   Match the surrounding code's style, comment density and naming. Don't invent new patterns
   when one already exists (see §2).
2. **After each item, run (from `frontend/`):**
   - `npm run typecheck`
   - `npm run build` (must print `Compiled successfully`)
   - `npx playwright test` (the whole suite, not just your new spec)
   - backend changes: `cd backend && venv/Scripts/python -m pytest tests/unit -q`
3. **Commit per item** on `main` with a message like `feat(invite): partner invite links`,
   then `git push`. Never commit `backend/*.db*` files or `.env`.
4. **If a test fails, fix the cause.** Don't loosen or delete an existing test to make it pass.
   Only change a test when the behaviour it checks has been changed on purpose, and say so in
   the commit message.
5. **Stop and ask the owner** before: adding a paid service, adding a dependency over ~50 kB
   gzipped to the client bundle, changing the database in a way that isn't additive, or
   anything in §3 (content rules) you're unsure about.
6. **At the end of each phase,** post a short report: what shipped, commit hashes, test counts,
   anything skipped and why, and any new env vars or cron lines the owner must add on the VPS.

## 1. Project map

| Area | Path / fact |
|---|---|
| Backend | FastAPI, Python 3.10, venv `backend/venv/`. Entry: `backend/main.py` |
| Pipeline | `backend/agent_controller.py` (engine and schema registries); prompts in `backend/gemini_client.py` |
| Engines (deterministic) | `backend/engines/` (zodiac, mbti, compatibility, emotional, romantic, love_style, love_language, color_engine, numerology_engine, …) |
| Schemas | `backend/models/schemas.py` (Pydantic v2) |
| DB | SQLAlchemy Core in `backend/db.py`: SQLite by default, Postgres via `DATABASE_URL`. **Tables must work on both.** |
| Accounts | `backend/auth.py`, `backend/accounts.py` (magic-link sign-in, `/me`, `/me/profile`, `/me/readings`, `/me/claim`), `backend/mailer.py` (Resend or SMTP) |
| Saved results | `backend/results_store.py`, `POST /results`, `GET /results/{id}`; shared at `frontend/app/r/[id]` (has an `opengraph-image.tsx`) |
| Chat | `POST /chat`, `POST /chat/stream`; `backend/chat/chat_handler.py` + `prompt_templates.py`; UI `frontend/app/chat`, `components/MobileChatSheet.tsx`. The assistant persona is called **Zodicognac** |
| Horoscope | `GET /horoscope/{sign}`; UI `frontend/app/horoscope` |
| AI budget | `MAX_DAILY_AI_CALLS_PER_IP = 40` in `backend/main.py`, plus a Gemini concurrency limiter in `gemini_client.py`. Gemini 2.5 Flash, falling back to 2.0 Flash Lite |
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (`@theme` tokens in `app/globals.css`), Framer Motion, Recharts 3 |
| API helpers | `frontend/lib/api.ts` (`apiFetch`, `PersonData`, `pairBody`, `emptyPerson`) |
| Saved profile | `frontend/lib/profile.ts`: localStorage key `zodicog.profile`, synced to `/me/profile` when signed in; `usePrefilledSimple` etc. |
| Sign helpers | `frontend/lib/zodiac.ts` (`getSign` returns **capitalised** names, `SIGN_SYMBOL`/`SIGN_COLOR` are **lowercase-keyed**: use `getSignKey`) |
| MBTI data | `frontend/lib/mbti-data.ts` |
| Celebrities | `frontend/lib/celebrities.ts` (360 people, 30 per sign), `lib/celeb-bios.json`, `components/CelebrityMatch.tsx`, `components/CelebrityExplorer.tsx` |
| Report | `components/report/SynastryReport.tsx` (flagship full report), `/dashboard` |
| Share images | `components/ShareImageButton.tsx`, `ShareCelebButton.tsx`, and `opengraph-image.tsx` routes using `next/og` |
| PWA | `app/manifest.ts`, `public/sw.js` (`VERSION` constant; bump it whenever SW logic or cached assets change), `lib/install.ts`, `components/InstallProvider.tsx`, `components/InstallButton.tsx`, `components/home/InstallBanner.tsx`, `lib/pwaIcon.tsx` |
| Navigation | Desktop `components/Navbar.tsx`; mobile `components/MobileNavbar.tsx` (floating FAB + hamburger) + `components/MobileMenuSheet.tsx`; `components/CommandPalette.tsx` (Ctrl+K) |
| Home | `app/page.tsx` + `components/home/*` |
| Analytics / monitoring | `lib/posthog.ts` (`capture(event, props)`), `lib/monitoring.ts` (Sentry) |
| Tests | Playwright in `frontend/e2e/` (helpers: `hydrated(page, path)` waits for `html[data-hydrated="true"]`); API fixtures recorded with `backend/scripts/record_e2e_fixtures.py`; backend unit tests in `backend/tests/unit/` |
| Docs | `docs/OPERATIONS.md`, `PERFORMANCE.md`, `TESTING.md`, `EXPERIMENTS.md`, `PWA.md`; `.env.example` at the repo root |

Project memory (`MEMORY.md` and linked files) loads automatically. Treat it as background,
and check that a file it names still exists before relying on it.

## 2. Conventions and known traps

- **Design tokens only.** Colours: `ink`, `ink-secondary`, `ink-muted`, `ink-faint`,
  `surface-*`, `accent`/`accent-bright` (violet), `gold`/`gold-bright` (co-accent), `hairline*`,
  and the semantic `danger`/`success`/`warning`. Type: `text-micro` plus the Tailwind scale.
  Radii: `rounded-card`, `rounded-control`. Motion: `DUR` and the easing curves in `lib/motion.ts`.
  No hard-coded hex values in components.
- **Reuse the UI primitives** in `components/ui/` (`Button`, `Card`, `SectionHeader`, `Eyebrow`,
  `AIHeader`, `SimpleForm`, `ErrorNotice`, `glyphs`), plus `ScoreRing`, `MetricCard`,
  `ConstellationLoader` and `Sigil`.
- **Gemini text** must be rendered with `renderMd()` (`lib/renderMd.tsx`) or `ui/Markdown`.
- **Recharts 3 + React 19:** don't use grouped vertical `BarChart` with `radius`/`barSize` (it
  crashes at runtime). Use CSS or Framer Motion bars. Don't give `ReferenceLine` both `x` and `y`.
- **Respect `prefers-reduced-motion`** for every new animation (see `MotionProvider.tsx`).
- **Mobile first.** Check at 390 px wide: no horizontal scroll, and tap targets ≥ 44 px.
  Floating UI must sit above `env(safe-area-inset-bottom)`. Desktop layout starts at `lg`.
- **No layout shift.** Anything that appears after hydration (it depends on localStorage) needs
  reserved space or must render below the fold. The homepage LCP budget is tight
  (see `docs/PERFORMANCE.md`).
- **Don't call Gemini in new N² loops.** Use the deterministic engines for scores and at most
  **one** Gemini call per user action. Cache generated text server-side where it's reusable
  (per sign/day, per pair).
- **Installed-app detection:** `useInstall().status === "installed"` or the CSS media query
  `(display-mode: standalone)`. "Install app" UI is **phones/tablets only**, never desktop.
- **Windows dev machine:** Python `open(..., "w")` writes CRLF, so pass `newline="\n"`. Prefer
  file-edit tools over shell heredocs.
- **VPS:** IONOS Ubuntu, **1.8 GB RAM**, PM2. Builds run with `SKIP_TYPECHECK=1`. Don't add
  heavy build-time work. Every new env var goes in `.env.example` and `docs/OPERATIONS.md`.
  Every new cron job goes in `docs/OPERATIONS.md` with its exact `crontab -e` line.
- **Visual-regression baselines are Linux-only.** Don't run `--update-snapshots` on Windows.
  If you change a page that has a visual test, say so in your phase report.
- **Analytics:** add a `capture()` event for each new feature's key action (for example
  `invite_created`, `invite_accepted`, `push_subscribed`).

## 3. Content rules (non-negotiable)

- **Never invent personality claims about real people.** Celebrities have only public birth
  dates and names. Use zodiac and numerology only, never an MBTI type for a celebrity. This is
  why `CelebrityMatch.tsx` uses numerology.
- **Never state or imply that two real people are or were a couple** unless it is in a curated
  list the owner approves (see item 17). Pair pages are framed as "zodiac compatibility of X and
  Y", not as commentary on a relationship.
- **Privacy:** an invite link must not expose the inviter's full birth date, email or account to
  the partner. Show first name and sun sign only.
- **Notifications and email are opt-in only,** and every email has a working one-click
  unsubscribe link.
- Results are presented as entertainment/self-reflection. Keep the existing disclaimers.

---

## 4. The work: 18 items in 7 phases

Each item gives its goal, where the code goes, the spec, and acceptance checks
(each check becomes a Playwright or pytest test).

### Phase 1: Foundations

**1. Three-step first-run setup** (UI)
- *Goal:* ask for name, birthday and MBTI once; every form is pre-filled after that.
- *Where:* new `frontend/app/welcome/page.tsx` + `components/onboarding/*`; uses `lib/profile.ts`.
- *Spec:* step 1 is name, step 2 is day + month, step 3 is MBTI (`MbtiSelect`, or "Not sure? Take
  the quiz" with `MbtiQuiz`, and "Skip"). There's a progress indicator, Back and Next buttons,
  Enter advances, and focus moves to each step's first field. On finish, save with the existing
  profile setter (it syncs to `/me/profile` when signed in) and go to `?next=` or `/today`.
  Entry points: a non-blocking "Set up once, skip the forms" notice on analysis forms when no
  profile exists (extend `ui/ProfileNotice.tsx`), and the Profile page. **Never a forced modal.**
- *Accept:* completing it fills Person A on `/analyze/romantic`; Skip on MBTI still saves; the
  page is keyboard-only operable; a revisit with a profile shows "Edit profile" instead.

**2. App-style bottom tab bar in the installed app** (UI)
- *Goal:* when running installed, the app feels native.
- *Where:* new `components/AppTabBar.tsx`, mounted in `app/layout.tsx`; adjust
  `MobileNavbar.tsx` and `Footer.tsx`.
- *Spec:* render only when installed (standalone) **and** below `lg`. Tabs: **Today** (`/today`),
  **Analyze** (opens a sheet listing `ANALYZE_YOU` and `ANALYZE_TOGETHER` from `lib/analyses.ts`),
  **Chat** (`/chat`), **Readings** (`/readings`), **Me** (`/profile`). Show the active state from
  `usePathname`. Pad for the safe area. While the tab bar shows, hide the FAB and hamburger
  (`MobileNavbar`) and the site footer, and add bottom padding to `<main>` so content isn't
  covered. In a normal browser tab nothing changes.
- *Accept:* emulate standalone (see `e2e/install.spec.ts` for the `matchMedia` stub): tab bar
  visible, FAB, hamburger and footer gone, every tab navigates, active tab marked with
  `aria-current="page"`. In a normal mobile browser: no tab bar, FAB present.

**3. Native touches in the installed app** (UI)
- *Where:* `lib/haptics.ts`, `components/PullToRefresh.tsx`.
- *Spec:* `haptic()` calls `navigator.vibrate(8)` only when installed, the API exists, and
  reduced motion is off. Use it on primary buttons, tab switches and the score reveal.
  Pull-to-refresh works on `/today` and `/readings` in standalone only: a constellation spinner,
  then re-fetch the data without a full reload. Page transitions already use `<ViewTransition>`;
  make sure the tab bar doesn't animate with the page.
- *Accept:* no `vibrate` calls in a normal browser tab (spy in the test); pull-to-refresh
  triggers one refetch.

### Phase 2: Daily habit

**4. Personal daily card** (feature) + **`/today` page**
- *Goal:* a reason to open the app every day.
- *Backend:* `GET /daily/{sign}?mbti=XXXX&name=...&day=..&month=..` returns
  `{date, horoscope, mbti_tip, lucky_color{name,hex}, lucky_number, do, avoid}`.
  The horoscope comes from the existing horoscope generator, cached per sign per day.
  `mbti_tip`, `do` and `avoid` come from **one** Gemini call per (sign, mbti, date), cached in a
  new `daily_cache` table. Lucky colour and number are deterministic: seed from date + birthday
  using `color_engine` and `numerology_engine`. It must work without an account.
  Count it toward the per-IP AI budget only on a cache miss.
- *Frontend:* `app/today/page.tsx` (client) and `components/today/DailyCard.tsx`. With no
  profile, show a short pitch plus a link to `/welcome?next=/today`. Show a streak counter:
  localStorage `zodicog.streak` = `{last: "YYYY-MM-DD", count}`, increment once per local day,
  reset on a gap. Show a "Share today" button (reuse the share-image pattern).
- *Accept:* the same inputs on the same day give identical output (cached); the streak
  increments once per day (mock the clock in the test); the page works logged out.

**5. Personal homepage for returning users** (UI)
- *Where:* `components/home/TodayStrip.tsx`, rendered in `app/page.tsx` under `InstallBanner`.
- *Spec:* keep the server-rendered marketing hero exactly as it is (LCP). If a saved profile
  exists, show a compact strip after hydration: greeting by name, sign glyph, today's one-line
  horoscope, streak, buttons "Open today" and "New reading", and the last 3 readings (reuse
  `home/RecentReadings`). Reserve its height (fixed min-height wrapper that collapses to 0 only
  when there's no profile, decided before paint via a tiny inline script that sets
  `html[data-has-profile]`) so there is **no layout shift**. Change the manifest `start_url` to
  `/today` so the installed app opens there.
- *Accept:* CLS stays below 0.02 on home in both states (measure with PerformanceObserver in a
  test); no strip without a profile; manifest `start_url` is `/today`.

### Phase 3: Sharing and the partner loop

**6. Invite your partner** (feature: top priority for growth)
- *Goal:* "Check our compatibility" creates a link; the partner adds their details; both get
  the full report.
- *Backend:* new `backend/invites.py` router plus an `invites` table: `token` (random 22 chars,
  primary key), `inviter_json` (PersonData), `inviter_user_id` (nullable), `created_at`,
  `expires_at` (+14 days), `status` (`pending`/`accepted`/`expired`), `result_id` (nullable).
  Endpoints:
  - `POST /invites` with `{inviter: PersonData}` returns `{token, url}`. Rate-limit per IP.
  - `GET /invites/{token}` returns `{first_name, sign, status, result_id?}` only (§3 privacy).
  - `POST /invites/{token}/accept` with `{partner: PersonData}` runs the full pipeline (same as
    `/analyze/full`), stores it through `results_store`, sets `accepted` + `result_id`, and
    returns `{result_id}`. Accepting twice returns the same result. Expired returns 410.
  - If the inviter is signed in, the result shows up in their `/me/readings`.
- *Frontend:* an "Invite your partner" button on the profile page, `/dashboard` and the end of
  `SynastryReport`. It opens a sheet with a copy-link button and the Web Share API (fallback:
  copy). New `app/i/[token]/page.tsx`: "Alex (♌ Leo) invited you to check your compatibility",
  a `PersonForm` pre-filled from the visitor's own saved profile if one exists, a submit that
  shows `ConstellationLoader` and then routes to `/r/{result_id}`. Add an OG image for
  `/i/[token]` ("Alex wants to check your compatibility"). The inviter can revisit their link
  and see "Waiting…" or "Ready → view report".
- *Accept:* pytest covers create, get (no DOB in the response), accept, double-accept (same
  result) and expired (410). e2e covers inviter creates → partner accepts with fixture data →
  report renders → inviter page shows ready.

**7. Story cards (9:16)** (feature)
- *Where:* `app/r/[id]/story-image/route.tsx` (1080×1920, `next/og`); extend
  `ShareImageButton.tsx` with a format choice ("Post 1:1" / "Story 9:16").
- *Spec:* score ring, both names + sign glyphs, one key line from the result, ZodicogAI mark
  (same geometry as `lib/pwaIcon.tsx`), and the URL. Use `navigator.share({files})` where
  supported, otherwise download. Add the same card for the daily card (item 4) and celebrity
  matches (item 9).
- *Accept:* the route returns 200 `image/png` at 1080×1920 for a fixture result; the share
  button offers both formats.

**8. Swipeable report on mobile** (UI)
- *Where:* `components/report/StoryMode.tsx`, launched from `SynastryReport.tsx`.
- *Spec:* below `lg`, a "Story mode" button opens a full-screen viewer with one section per
  card: score reveal → each framework → strengths → watch-outs → share card (item 7) → "Invite
  someone else" (item 6). Swipe or tap the edges to move, use the arrow keys on keyboard,
  Escape closes. A segmented progress bar sits at the top. Respect reduced motion (crossfade,
  no slide). Lock body scroll the same way `MobileMenuSheet` does.
- *Accept:* open → advance through every card → close restores scroll position;
  `role="dialog"` with a label; keyboard navigation works.

### Phase 4: Discovery

**9. Your 5 most compatible celebrities** (feature)
- *Where:* `backend/engines/celebrity_rank.py` + `GET /celebrities/matches?day=&month=&name=`
  (or compute client-side if all the needed data is already in `lib/celebrities.ts`; choose the
  smaller bundle impact and say which you chose). UI: `components/CelebrityMatches.tsx` on
  `/today`, `/profile` and `/celebrities`.
- *Spec:* rank all 360 by a deterministic blend of zodiac element/modality compatibility and
  the numerology compatibility already used by `CelebrityMatch.tsx`. No Gemini, and **no MBTI
  for celebrities** (§3). The "why" line comes from templates ("Both fire signs…", "Life paths 3
  and 5 share…"). Each entry links to the celebrity page and has "See full match" (existing
  `CelebrityMatch`).
- *Accept:* deterministic ordering for a fixed birthday (unit test); a celebrity with an
  identical birthday ranks near the top; no MBTI text in the output.

**10. Friend-group chemistry** (feature)
- *Where:* `backend/engines/group_engine.py`, `POST /analyze/group`, `app/analyze/group/page.tsx`.
- *Spec:* 3–8 people (name, day, month, optional MBTI). Score every pair with the existing
  deterministic compatibility engine (up to 28 pairs, **no Gemini per pair**), then make **one**
  Gemini call for a group summary: the "glue" person (highest average), the strongest pair, the
  spiciest pair (lowest), and group dynamics. UI: a heat-map grid (CSS grid, not Recharts) plus
  a circular "web" (SVG; line thickness and colour by score) and the summary. Shareable through
  `POST /results` like the other analyses. Add it to `lib/analyses.ts`, the menus and the palette.
- *Accept:* 3 and 8 people both work; 2 or 9 people are rejected with a friendly error; the
  pair count is n(n−1)/2; one Gemini call per request (assert in pytest with a mock).

**11. Interactive zodiac wheel** (UI)
- *Where:* `components/ZodiacWheel.tsx` (pure SVG + Framer Motion).
- *Spec:* 12 segments with glyphs coloured by element. It highlights one or two signs and
  draws the aspect line between them, labelled (conjunct / sextile / square / trine / opposite)
  with a one-line meaning. It rotates gently to bring the highlighted sign to the top (no
  rotation under reduced motion). Tapping a segment opens that sign's blog page. Use it on
  `/today` (your sign) and in the `SynastryReport` hero (both signs). Lazy-load below the fold.
- *Accept:* Leo + Aquarius shows "opposite"; Leo + Sagittarius shows "trine"; segments are
  focusable links with labels.

### Phase 5: Zodicognac with memory

**12. Zodicognac that knows you and your reports** (feature)
- *Where:* `backend/chat/chat_handler.py`, `prompt_templates.py`, `/chat` request schema;
  `app/chat/page.tsx`, `MobileChatSheet.tsx`.
- *Spec:* the chat request gains an optional `context: {profile?: PersonData,
  reading?: {id, type, summary}}`. The frontend sends the saved profile automatically (with a
  visible "Using your profile ✕" chip to turn it off). Add an **"Ask Zodicognac about this
  report"** button on `/r/[id]` and `SynastryReport` that opens `/chat?r={id}`. The chat loads
  that result and sends a **compact summary** (scores + headline lines, ≤ 1,500 characters), not
  the whole JSON. Inject it into the system prompt as clearly delimited data, so text inside it
  is never treated as instructions. Offer suggested starter questions based on the report.
- *Accept:* with `?r=` the first answer references the report (fixture/mocked Gemini in
  pytest: assert the prompt contains the summary and stays under the size cap); removing the
  chip stops sending the profile.

### Phase 6: Re-engagement channels

**13. Web push daily nudge** (feature)
- *Backend:* `pywebpush` dependency; env `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `VAPID_SUBJECT` (document generating them with `npx web-push generate-vapid-keys`). Table
  `push_subscriptions` (`endpoint` primary key, `p256dh`, `auth`, `sign`, `mbti`, `tz`,
  `hour` default 8, `created_at`, `last_sent`). Endpoints `POST /push/subscribe`,
  `DELETE /push/subscribe`, `GET /push/public-key`. Script
  `backend/scripts/send_daily_push.py` runs **hourly from cron** and sends to subscribers whose
  local time equals their `hour` and who haven't been sent today: title "Your day, {Sign}",
  body = the first line of the cached daily card (item 4), URL `/today`. Delete subscriptions
  that return 404/410.
- *Frontend:* `public/sw.js` gets `push` and `notificationclick` handlers (focus an existing
  window or open `/today`); **bump `VERSION`**. Add a "Daily nudge" toggle with a time picker on
  `/today` and `/profile`. Show it only where push works: Android/desktop Chromium always, and
  iOS **only when installed** (otherwise show "Install the app to get daily nudges", linking to
  the install flow). Ask for permission only after the user taps the toggle.
- *Accept:* pytest covers subscribe/unsubscribe, the hour-matching selection logic, and that
  410 deletes the row. e2e: the toggle requests permission (grant via Playwright context
  permissions) and POSTs a subscription; SW tests in `e2e/pwa.spec.ts` still pass.
- *Owner action:* generate VAPID keys, set the env vars, add the cron line. Put all of it in
  `docs/OPERATIONS.md`.

**14. Weekly email digest** (feature)
- *Where:* `backend/scripts/send_weekly_digest.py`, email template next to `mailer.py`, a
  `weekly_digest` boolean (default **false**) on the user/profile record, and a toggle on
  `/profile` (signed-in users only).
- *Spec:* every Monday 08:00 server time, send "Your week ahead": weekly outlook for their
  sign (one cached Gemini call per sign per week, so at most 12 a week), a compatibility tip,
  and a link to `/today`. Plain, mobile-friendly HTML plus a text part. A one-click unsubscribe
  link uses an HMAC-signed token (`GET /email/unsubscribe?t=`) and works without signing in.
  Add the `List-Unsubscribe` header.
- *Accept:* pytest covers that only opted-in users are selected, the unsubscribe token flips
  the flag, and a tampered token is rejected. A dry-run flag prints instead of sending.

### Phase 7: Search traffic

**15. Sign × MBTI pages** (192 pages)
- *Where:* `frontend/app/blog/types/[combo]/page.tsx` (e.g. `/blog/types/leo-intj`),
  `GET /blog/combo/{sign}/{mbti}`. Follow the existing blog pattern (ISR config, generators and
  caching as in the zodiac/MBTI blogs under `frontend/app/blog/`; the project memory file
  `BLOG_SYSTEM.md` describes it).
- *Spec:* sections: overview, strengths, blind spots, in love, at work, best matches (links to
  other combo pages), and famous people **only via sign** (link to the sign's celebrity list, no
  MBTI claims about real people). Generate on demand and cache. **Don't pre-generate all 192 at
  build time** (VPS memory and Gemini budget). Add every combo URL to `app/sitemap.ts`, with an
  OG image, canonical URL and JSON-LD `Article`. Cross-link from the zodiac and MBTI blog pages.
- *Accept:* the page renders for a fixture combo; an invalid combo returns 404; the sitemap
  contains 192 combo URLs.

**16. Compare any two celebrities**
- *Where:* `app/celebrities/compare/page.tsx` (two pickers from `lib/celebrities.ts`) and
  `app/celebrities/compare/[a]/[b]/page.tsx`.
- *Spec:* zodiac + numerology compatibility of two public figures, from the deterministic
  engines (§3: no MBTI, no relationship claims; title "Zodiac compatibility: A & B").
  Arbitrary pairs are `noindex`. Link to it from each celebrity page ("Compare with…").
- *Accept:* the page renders for two fixture celebrities; the pair page has `noindex`; no MBTI
  or relationship language appears.

**17. Curated famous-couple pages (indexed)**
- *Where:* `frontend/lib/couples.ts` exporting `COUPLES: {a: slug, b: slug, source: url}[]`
  (**ship it empty** with a comment explaining the rule), plus logic that marks a compare page
  indexable and adds it to the sitemap **only** if the pair is in `COUPLES`.
- *Spec:* the owner fills the list later with publicly documented couples, each with a source
  URL. Don't populate it yourself.
- *Accept:* with a test-only couple injected, the page is indexable and in the sitemap;
  otherwise it's `noindex`.

### Last: polish pass

**18. Consistency sweep**
- Add every new page to `lib/analyses.ts`, `Navbar`, `MobileMenuSheet`, the `AppTabBar` Analyze
  sheet and the `CommandPalette` as appropriate, and to `app/sitemap.ts` if public.
- Every new page has a `<title>`, a description, an OG image (or inherits a sensible one), an
  empty state, an error state (`ui/ErrorNotice`) and a loading state (`ConstellationLoader` or a
  skeleton).
- Run Lighthouse on mobile for home, `/today` and a report (`frontend/lighthouserc.json`) and
  confirm there are no regressions against `docs/PERFORMANCE.md`.
- Update `docs/PWA.md`, `docs/OPERATIONS.md` and `docs/TESTING.md` for everything added.

---

## 5. Final report to the owner

When all phases are done, write one message with:
1. A table of the 18 items: status, commit hash, and the main files touched.
2. Test totals (Playwright passed/skipped, pytest passed).
3. **VPS checklist:** new env vars, new cron lines (exact text for `crontab -e`), new Python
   packages (`pip install -r backend/requirements.txt`), and the deploy commands:
   ```
   cd ~/ZodicogAI && git pull
   backend/venv/bin/pip install -r backend/requirements.txt
   cd frontend && npm ci && SKIP_TYPECHECK=1 NODE_OPTIONS=--max-old-space-size=2048 npm run build
   pm2 restart backend frontend
   ```
4. Anything skipped, decided differently from this spec, or needing an owner decision
   (for example filling `lib/couples.ts`).
