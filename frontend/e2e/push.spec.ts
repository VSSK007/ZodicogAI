import { devices, expect, test, type Page } from "@playwright/test";
import { API, hydrated } from "./helpers";

/**
 * The daily nudge switch. The browser's push machinery is stubbed (headless
 * Chromium has no push service); what is verified is our side: when permission
 * is asked, what is sent to the server, and which states are shown.
 */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};
const PUBLIC_KEY = "BNiGtqgKf8VzTxoT7vdG6B8UcsNPQbUmpXCE5YeA4REthIblTFbsFFAWZMFWijGDYXLjaX6F9BfBzDGhgjvRSts"; // 65 bytes

type Stub = { permission?: "default" | "granted" | "denied"; subscribed?: boolean; noPushManager?: boolean };

async function stubPush(page: Page, { permission = "default", subscribed = false, noPushManager = false }: Stub = {}) {
  await page.addInitScript(
    ({ permission, subscribed, noPushManager }) => {
      const w = window as unknown as {
        __push: { asked: number; subscribeOpts: { userVisibleOnly: boolean; keyLength: number } | null; sub: unknown; unsubscribed: number };
        PushManager?: unknown;
      };
      w.__push = { asked: 0, subscribeOpts: null, sub: null, unsubscribed: 0 };
      if (noPushManager) delete w.PushManager;

      let perm: string = permission;
      Object.defineProperty(Notification, "permission", { get: () => perm, configurable: true });
      Notification.requestPermission = async () => {
        w.__push.asked++;
        if (perm !== "denied") perm = "granted";
        return perm as NotificationPermission;
      };

      const makeSub = () => ({
        endpoint: "https://fcm.example.com/send/xyz",
        toJSON() {
          return { endpoint: this.endpoint, keys: { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA", auth: "tBHItJI5svbpez7KI4CCXg" } };
        },
        async unsubscribe() {
          w.__push.sub = null;
          w.__push.unsubscribed++;
          return true;
        },
      });
      if (subscribed) {
        perm = "granted";
        w.__push.sub = makeSub();
      }
      const reg = {
        pushManager: {
          getSubscription: async () => w.__push.sub,
          subscribe: async (opts: { userVisibleOnly: boolean; applicationServerKey: Uint8Array }) => {
            w.__push.subscribeOpts = { userVisibleOnly: opts.userVisibleOnly, keyLength: opts.applicationServerKey.length };
            w.__push.sub = makeSub();
            return w.__push.sub;
          },
        },
      };
      Object.defineProperty(navigator.serviceWorker, "getRegistration", { value: async () => reg, configurable: true });
      Object.defineProperty(navigator.serviceWorker, "ready", { get: () => Promise.resolve(reg), configurable: true });
    },
    { permission, subscribed, noPushManager },
  );
}

async function mockPushApi(page: Page, { key = PUBLIC_KEY as string | null, subscribeStatus = 200 } = {}) {
  const calls = { subscribe: [] as Record<string, unknown>[], unsubscribe: [] as Record<string, unknown>[] };
  await page.route(`${API}/push/**`, async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;
    if (path === "/push/public-key") {
      return key
        ? route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ public_key: key }) })
        : route.fulfill({ status: 404, contentType: "application/json", headers: CORS, body: '{"detail":"not configured"}' });
    }
    if (req.method() === "POST") {
      calls.subscribe.push(req.postDataJSON());
      return route.fulfill({
        status: subscribeStatus, contentType: "application/json", headers: CORS,
        body: subscribeStatus === 200 ? '{"ok":true}' : '{"detail":"Too many requests from this device."}',
      });
    }
    calls.unsubscribe.push(req.postDataJSON());
    return route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: '{"ok":true,"removed":true}' });
  });
  return calls;
}

async function stubDailyApis(page: Page) {
  await page.route("**/daily/**", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.route("**/celebrities/matches**", (route) => route.fulfill({ status: 500, body: "{}" }));
}

async function withProfile(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem("zodicog.profile", JSON.stringify({ name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" })),
  );
}

const pushState = (page: Page) =>
  page.evaluate(() => (window as unknown as { __push: { asked: number; subscribeOpts: unknown; unsubscribed: number } }).__push);

test("permission is asked only when the switch is flipped; the server gets sign, zone and hour", async ({ page }) => {
  await stubDailyApis(page);
  await stubPush(page);
  const calls = await mockPushApi(page);
  await withProfile(page);
  await hydrated(page, "/today");

  const nudge = page.getByTestId("daily-nudge");
  const toggle = nudge.getByRole("switch", { name: "Daily nudge" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  expect((await pushState(page)).asked).toBe(0); // nothing asked on page load

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  const st = await pushState(page);
  expect(st.asked).toBe(1);
  expect(st.subscribeOpts).toEqual({ userVisibleOnly: true, keyLength: 65 }); // VAPID key decoded to its 65 bytes

  const tz = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  expect(calls.subscribe).toHaveLength(1);
  expect(calls.subscribe[0]).toEqual({
    endpoint: "https://fcm.example.com/send/xyz",
    p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA",
    auth: "tBHItJI5svbpez7KI4CCXg",
    sign: "pisces", // 15 March, sent as a sign, never as a birth date
    mbti: "INTJ",
    tz,
    hour: 8,
  });
  expect(JSON.stringify(calls.subscribe[0])).not.toContain("Alex");
  await expect(page.getByTestId("nudge-confirm")).toContainText("your time");
});

test("changing the time updates the server and is remembered; turning off unsubscribes", async ({ page }) => {
  await stubDailyApis(page);
  await stubPush(page, { subscribed: true });
  const calls = await mockPushApi(page);
  await withProfile(page);
  await page.addInitScript(() => localStorage.setItem("zodicog.push.hour", "7"));
  await hydrated(page, "/profile");

  const nudge = page.getByTestId("daily-nudge");
  const toggle = nudge.getByRole("switch", { name: "Daily nudge" });
  await expect(toggle).toHaveAttribute("aria-checked", "true"); // already subscribed in this browser
  await expect(nudge.getByLabel("Nudge time")).toHaveValue("7");

  await nudge.getByLabel("Nudge time").selectOption("19");
  await expect.poll(() => calls.subscribe.length).toBe(1);
  expect(calls.subscribe[0]).toMatchObject({ hour: 19, sign: "pisces" });
  expect(await page.evaluate(() => localStorage.getItem("zodicog.push.hour"))).toBe("19");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  expect(calls.unsubscribe).toEqual([{ endpoint: "https://fcm.example.com/send/xyz" }]);
  expect((await pushState(page)).unsubscribed).toBe(1);
});

test("blocked notifications are explained, with no switch to fight with", async ({ page }) => {
  await stubDailyApis(page);
  await stubPush(page, { permission: "denied" });
  await mockPushApi(page);
  await withProfile(page);
  await hydrated(page, "/today");
  const nudge = page.getByTestId("daily-nudge");
  await expect(nudge.getByRole("status")).toContainText("blocked");
  await expect(nudge.getByRole("switch")).toHaveCount(0);
});

test("a server that rejects the subscription leaves the switch off and cleans up", async ({ page }) => {
  await stubDailyApis(page);
  await stubPush(page);
  await mockPushApi(page, { subscribeStatus: 429 });
  await withProfile(page);
  await hydrated(page, "/today");
  const nudge = page.getByTestId("daily-nudge");
  await nudge.getByRole("switch", { name: "Daily nudge" }).click();
  await expect(nudge.getByRole("alert")).toContainText("Too many requests");
  await expect(nudge.getByRole("switch", { name: "Daily nudge" })).toHaveAttribute("aria-checked", "false");
  expect((await pushState(page)).unsubscribed).toBe(1); // no orphan subscription left in the browser
});

test.describe("hidden where it can't work", () => {
  test("no push keys on the server", async ({ page }) => {
    await stubDailyApis(page);
    await stubPush(page);
    await mockPushApi(page, { key: null });
    await withProfile(page);
    await hydrated(page, "/today");
    await page.waitForTimeout(600);
    await expect(page.getByTestId("daily-nudge")).toHaveCount(0);
  });

  test("a browser without web push", async ({ page }) => {
    await stubDailyApis(page);
    await stubPush(page, { noPushManager: true });
    await mockPushApi(page);
    await withProfile(page);
    await hydrated(page, "/today");
    await page.waitForTimeout(600);
    await expect(page.getByTestId("daily-nudge")).toHaveCount(0);
  });

  test("no saved profile (the sign is unknown)", async ({ page }) => {
    await stubDailyApis(page);
    await stubPush(page);
    await mockPushApi(page);
    await hydrated(page, "/today");
    await page.waitForTimeout(600);
    await expect(page.getByTestId("daily-nudge")).toHaveCount(0);
  });
});

test.describe("iPhone and iPad", () => {
  const iphone = { ...devices["iPhone 13"] };

  test("in Safari the nudge points to installing the app first", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ ...iphone, baseURL });
    const page = await ctx.newPage();
    await stubDailyApis(page);
    await stubPush(page);
    await mockPushApi(page);
    await withProfile(page);
    await hydrated(page, "/profile");
    const nudge = page.getByTestId("daily-nudge");
    await expect(nudge).toContainText("installed app");
    await expect(nudge.getByRole("switch")).toHaveCount(0);
    await nudge.getByRole("button", { name: /Show me how/ }).click();
    await expect(page.getByRole("dialog", { name: /Add ZodicogAI to your Home Screen/ })).toBeVisible();
    await ctx.close();
  });

  test("in the installed app the switch is available", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ ...iphone, baseURL });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q.includes("display-mode: standalone")
          ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false } as MediaQueryList)
          : real(q);
    });
    await stubDailyApis(page);
    await stubPush(page);
    await mockPushApi(page);
    await withProfile(page);
    await hydrated(page, "/profile");
    await expect(page.getByTestId("daily-nudge").getByRole("switch", { name: "Daily nudge" })).toBeVisible();
    await ctx.close();
  });
});
