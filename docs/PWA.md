# Installable app (PWA)

ZodicogAI can be installed from the browser (Chrome/Edge/Android: "Install app";
iOS Safari: Share -> Add to Home Screen) and opens full-screen with its own icon.

| Piece | File |
|---|---|
| Manifest (name, colours, icons, shortcuts, screenshots) | `frontend/app/manifest.ts` |
| Icons (generated, not static files) | `frontend/lib/pwaIcon.tsx`, `app/pwa-icon-*/route.tsx` |
| Install-sheet screenshots | `frontend/public/screenshots/` |
| Service worker | `frontend/public/sw.js` |
| Registration (production only) | `frontend/components/ServiceWorkerRegister.tsx` |
| Offline page | `frontend/app/offline/` |

## The in-site "Install app" option

`lib/install.ts` keeps the browser's `beforeinstallprompt` event (it fires once, early)
so an **Install app** button can use the real prompt on Chrome/Edge/Android. Where no
prompt exists (iPhone, Firefox, private windows, or Chrome before it offers one) the
same button opens step-by-step instructions for that platform, so there is always an
option until the app is installed or already running installed (then it disappears).
It is shown on phones and tablets only: a dismissible banner at the top of the homepage, a tile in the mobile menu, a card on the profile page and a search-palette action. Desktop gets no install UI from the site.

## What the service worker does - and refuses to do

- **Caches** content-hashed build assets (`/_next/static/*`), the icons and fonts, so
  repeat visits start instantly. The offline page and its CSS/fonts are cached at install.
- **Offline:** if a page can't be fetched, shows the branded `/offline` page.
- **Never touches** non-GET requests, other origins (the API is on its own origin, so
  readings, sign-in and profile data are never cached or replayed), Next's data and
  image endpoints, or page HTML. Pages always come from the network, so a deploy is
  never hidden behind a stale cached page.

Offline *use* of readings is intentionally not offered: they need the server and an LLM.

## Operating it

- `sw.js` is served `no-cache` so a fixed worker reaches visitors immediately. **If you
  put Cloudflare in front, add a Cache Rule: bypass cache for `/sw.js`.**
- Bump `VERSION` in `sw.js` to drop every visitor's cache on their next visit.
- Debug a visitor's problem by adding `?nosw` to the URL (skips registration), or in
  Chrome DevTools -> Application -> Service Workers -> Unregister.
- The worker is not registered in `next dev`, so local hot-reload is never intercepted.

## Tests

`frontend/e2e/pwa.spec.ts` (runs in CI against the production build) checks: manifest
completeness and that every referenced icon/screenshot returns a PNG; **Chrome's own
installability audit reports no errors**; `sw.js` headers; the offline page renders
styled with no network; the cache contains only static assets (no pages, no API, no
cross-origin entries); and online navigations are fresh.
