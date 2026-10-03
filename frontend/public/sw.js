/*
 * ZodicogAI service worker.
 *
 * Deliberately small and conservative. It does three things:
 *   1. Makes the site installable and fast: hashed build assets (/_next/static)
 *      are cached on first use and served instantly afterwards.
 *   2. Shows a branded /offline page when a page can't be loaded without a network.
 *   3. Gets out of the way for everything else.
 *
 * It never touches: non-GET requests, other origins (the API lives on its own
 * origin, so readings, sign-in and profile data are never cached or replayed),
 * Next's data/image endpoints, or HTML pages. Page HTML always comes from the
 * network, so a deploy is never masked by a stale cached page.
 *
 * Bump VERSION to drop every old cache on the next visit.
 */
const VERSION = "v1";
const CACHE = `zodicog-static-${VERSION}`;
const OFFLINE_URL = "/offline";
const MAX_ENTRIES = 160; // hashed assets pile up across deploys; keep the newest

// Cached eagerly so the offline page can render with no network at all.
const SHELL = [OFFLINE_URL, "/icon.svg", "/pwa-icon-192", "/pwa-icon-512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(SHELL);

      // The offline page needs its own CSS/JS/fonts; they have hashed names, so
      // read them out of the page that was just cached.
      try {
        const html = await (await cache.match(OFFLINE_URL)).text();
        const assets = new Set(
          [...html.matchAll(/(?:href|src)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]),
        );
        for (const url of [...assets].filter((u) => u.endsWith(".css"))) {
          const css = await (await fetch(url)).text();
          for (const m of css.matchAll(/url\((\/_next\/static\/[^)"']+)\)/g)) assets.add(m[1]);
        }
        await Promise.all(
          [...assets].map((u) => cache.add(u).catch(() => {})), // best effort per asset
        );
      } catch {
        /* the page still works with fallback fonts */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith("zodicog-static-") && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_ENTRIES;
  for (let i = 0; i < excess; i++) {
    // Never evict the offline shell.
    if (!SHELL.some((s) => keys[i].url.endsWith(s))) await cache.delete(keys[i]);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) {
    cache.put(request, res.clone());
    trim(cache);
  }
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || refresh;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API and third parties: untouched

  // Pages: always the network; the offline page only when it can't be reached.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  // Immutable, content-hashed build output.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Small stable assets.
  if (
    url.pathname === "/icon.svg" ||
    url.pathname.startsWith("/pwa-icon") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/screenshots/")
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
  // Everything else (RSC payloads, /_next/image, API-ish paths): default browser behaviour.
});
