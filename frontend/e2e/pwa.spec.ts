import { expect, test, type Page } from "@playwright/test";
import { hydrated } from "./helpers";

/**
 * PWA: installable manifest, a service worker that caches only static build
 * assets, and an offline page. Runs against the production build (the worker is
 * deliberately not registered in `next dev`).
 */

async function controlled(page: Page, path = "/") {
  await hydrated(page, path);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // The first load isn't controlled yet; a reload hands the page to the worker.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

test("the manifest is complete and every asset it points at exists", async ({ page, request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.status()).toBe(200);
  const m = await res.json();

  expect(m.id).toBe("/");
  expect(m.scope).toBe("/");
  expect(m.start_url).toBe("/");
  expect(m.display).toBe("standalone");
  expect(m.shortcuts.length).toBeGreaterThanOrEqual(3);
  expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  expect(new Set(m.screenshots.map((s: { form_factor: string }) => s.form_factor))).toEqual(new Set(["wide", "narrow"]));

  const urls = [...m.icons, ...m.screenshots].map((x: { src: string }) => x.src);
  for (const src of urls) {
    const r = await request.get(src);
    expect(r.status(), src).toBe(200);
    expect(r.headers()["content-type"], src).toContain("image/png");
  }
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", /manifest\.webmanifest/);
});

test("Chrome finds no installability problems", async ({ page, context }) => {
  await controlled(page);
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = (await cdp.send("Page.getInstallabilityErrors")) as {
    installabilityErrors: { errorId: string }[];
  };
  expect(installabilityErrors.map((e) => e.errorId)).toEqual([]);
});

test("the service worker script is never cached by the browser", async ({ request }) => {
  const res = await request.get("/sw.js");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/javascript/);
  expect(res.headers()["cache-control"]).toContain("no-cache");
  expect(res.headers()["service-worker-allowed"]).toBe("/");
});

test("offline: a page that can't load shows the branded offline page, styled", async ({ page, context }) => {
  await controlled(page);
  await context.setOffline(true);

  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "The stars are out of range." })).toBeVisible();
  // Its CSS came from the cache: dark brand background, not an unstyled page.
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(11, 10, 20)");

  await context.setOffline(false);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("The stars are out of range.");
});

test("it caches only static build assets - never pages, API calls or user data", async ({ page }) => {
  await controlled(page);
  // Visit a few things so there is plenty the worker could have cached.
  for (const path of ["/about", "/analyze/hybrid", "/profile"]) await page.goto(path);

  const cached = await page.evaluate(async () => {
    const out: string[] = [];
    for (const name of await caches.keys()) {
      for (const req of await (await caches.open(name)).keys()) out.push(new URL(req.url).origin + new URL(req.url).pathname);
    }
    return out;
  });
  expect(cached.length).toBeGreaterThan(0);

  const origin = new URL(page.url()).origin;
  for (const url of cached) {
    expect(url.startsWith(origin), `cached a cross-origin request: ${url}`).toBe(true);
    const path = url.slice(origin.length);
    const allowed =
      path === "/offline" || path === "/icon.svg" || path.startsWith("/pwa-icon") ||
      path.startsWith("/_next/static/") || path.startsWith("/fonts/") || path.startsWith("/screenshots/");
    expect(allowed, `unexpected cache entry: ${path}`).toBe(true);
  }
});

test("online, pages always come fresh from the network (no stale shell)", async ({ page }) => {
  await controlled(page);
  const res = await page.goto("/about");
  expect(res?.status()).toBe(200);
  // The worker handled the navigation by fetching it; nothing was stored for next time.
  const stored = await page.evaluate(async () => !!(await caches.match("/about")));
  expect(stored).toBe(false);
});
