# Analytics, feature flags and experiments

PostHog handles product analytics and flags; Google Analytics stays for
acquisition/SEO reporting. Both, plus Sentry, are **lazy and inert without their
keys**, and none of them loads before the visitor's first interaction (or a 6 s
idle fallback), so the performance budget in `docs/PERFORMANCE.md` is unaffected.

## Setup

Create a PostHog project, then set on the build (frontend `.env.production` /
CI env):

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com   # or eu.i.posthog.com / self-hosted
```

Defaults are privacy-preserving: localStorage persistence (no cookies), no
autocapture, no session replay, anonymous profiles until `identify()`, and
Do-Not-Track is honoured (nothing is sent).

## What's tracked

- Every `track()` in `lib/analytics.ts` goes to GA **and** PostHog:
  `analysis_completed`, `share_link_copied`, `zodicognac_opened`, `profile_saved`.
- `$pageview` per route change.
- `web_vital` (LCP, INP, CLS, FCP, TTFB) from real visitors, also sent to GA as
  events, so the lab budget can be compared with field data.
- Errors: `lib/monitoring.ts` sends uncaught errors, unhandled rejections and
  error-boundary hits to Sentry (needs `NEXT_PUBLIC_SENTRY_DSN`).

## Running an experiment

1. In PostHog, create a multivariate flag (e.g. `remember_me_copy` with variants
   `control` and `save_details`) and set a rollout %.
2. In code:

   ```tsx
   import { useFeatureFlag } from "@/lib/posthog";
   const copy = useFeatureFlag<string>("remember_me_copy", "control");
   ```

   The hook returns the fallback (your control) until flags resolve, and forever
   when analytics is off or the visitor sent Do-Not-Track.
3. Pick the success metric in PostHog (an event such as `profile_saved`, which
   already carries the `copy` variant as a property).

**Put flags on surfaces visitors reach after interacting** (forms, results).
Flags resolve shortly after the first interaction, so a flag on first paint
would visibly swap its variant. The live example is the "Remember me" chip in
`components/ui/ProfileNotice.tsx`.

## Identify visitors (once accounts exist)

`identify(userId)` / `resetIdentity()` in `lib/posthog.ts` tie events to a signed-in
user and clear them on sign-out.
