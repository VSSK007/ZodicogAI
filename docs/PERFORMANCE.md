# Performance

## Budget (enforced in CI by Lighthouse CI)

Measured on Lighthouse's **mobile** profile (Moto-class phone: 4x CPU slowdown,
simulated slow 4G), median of 3 runs, on `/`, `/analyze/hybrid` and
`/celebrities/zendaya`. Config: `frontend/lighthouserc.json`.

| Metric | Target (warns) | Hard limit (fails CI) | Where we are |
|---|---|---|---|
| Largest Contentful Paint | 2.5 s | 4.8 s | 3.5 - 4.0 s |
| Total Blocking Time (lab proxy for INP < 200 ms) | 300 ms | 800 ms | 420 - 580 ms |
| Cumulative Layout Shift | - | 0.1 | 0 - 0.02 |
| Performance score | 0.90 | 0.65 | 0.75 - 0.80 |
| Accessibility score | - | 0.90 | 0.95 - 0.96 |
| Script transfer | - | 380 KB | 291 KB (home) |

The hard limits sit just above today's numbers so a regression fails the build;
the targets are what we're driving toward. Ratchet the limits down as the gap closes.

**About the numbers.** Lighthouse's *simulated* mobile LCP is deliberately
pessimistic. In a real Chromium with the same 4x CPU throttle the heading paints
at **0.62 s (home) / 0.79 s (analyze)** (`PerformanceObserver`, FCP == LCP), and
the filmstrip shows the page complete by ~0.75 s. The simulated 3.5 - 4 s is
dominated by how much JavaScript must download and run before the model
considers the page settled, which is why the remaining work is bundle size.

INP can't be measured in a lab run. TBT is the standard proxy; field INP
should be read from Search Console / Sentry Web Vitals once traffic exists.

## What changed (baseline -> now)

| Page | Before | After |
|---|---|---|
| `/` | perf 53, LCP 7.1 s, TBT 620 ms, 795 KB | perf 75-78, LCP 3.8-4.0 s, TBT 400-470 ms, 519 KB |
| `/analyze/hybrid` | perf 56, LCP 5.3 s, TBT 810 ms | perf 72-80, LCP 3.6-4.0 s, TBT 420-590 ms |
| `/celebrities/zendaya` | perf 53, LCP 4.8 s, TBT 1210 ms | perf 75-76, LCP 3.5-3.7 s, TBT 570-580 ms |

1. **Hero copy no longer waits for JavaScript.** The entrance animations used
   Framer's `initial={{opacity: 0}}`, so the LCP text was invisible in the server
   HTML until hydration. They are now CSS animations (`.hero-in`, `.bar-grow`);
   the hero is a server component.
2. **Google Analytics deferred** to first interaction or a 6 s idle fallback
   (`components/DeferredAnalytics.tsx`): ~170 KB and ~280 ms of main thread.
3. **Recharts loaded on demand** (`components/LazyCharts.tsx`): a ~350 KB chunk
   (99 KB gzip) that every route was downloading and that only result pages use.
4. **Star field and doodles on one canvas** (`components/StarCanvas.tsx`) instead
   of ~120 DOM nodes and 16 CSS animations; pauses when the tab is hidden and
   draws a single still frame under `prefers-reduced-motion`.
5. **Below-the-fold homepage sections** are dynamic imports (still server-rendered).
6. **Geist Mono not preloaded** (it only draws small numerals).
7. **Celebrity photos** go through the Next image optimizer with a blur
   placeholder and `priority` on the avatar (was `unoptimized`).

## Remaining levers (largest first)

- **Framer Motion** (~43 KB gzip) is in every page through the layout. Moving to
  `LazyMotion` + `m.*` components would roughly halve it.
- **react-dom + Next runtime** (~70 KB gzip) is the floor for this stack.
- Style & layout time (~0.7 - 1.5 s at 4x CPU) - audit large fixed/blurred layers.
- Field data: add Web Vitals reporting (Sentry/PostHog) so budgets follow real users.

## Running it

```bash
cd frontend && npm run build
npx @lhci/cli autorun --config=./lighthouserc.json     # same as CI
```
