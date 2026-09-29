import { expect, test, type Browser, type Page } from "@playwright/test";
import { ALEX, API, backendUp, fillSimple, mockJson } from "./helpers";

/**
 * Accounts against the real backend. Needs AUTH_DEV_LINKS=1 on the server so the
 * sign-in link comes back in the response instead of by email (CI sets it).
 */
let devLinksEnabled = false;

test.beforeAll(async () => {
  if (await backendUp()) {
    const r = await fetch(`${API}/auth/request-link`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: `probe-${Date.now()}@example.com` }),
    });
    devLinksEnabled = r.ok && !!((await r.json()) as { dev_link?: string }).dev_link;
  }
});

test.beforeEach(() => {
  test.skip(!devLinksEnabled, "backend not running with AUTH_DEV_LINKS=1");
});

const uniqueEmail = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByRole("button", { name: /Email me a sign-in link/ }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();
  await page.getByTestId("dev-link").click();
  await expect(page).toHaveURL(/\/profile/, { timeout: 15_000 });
  await expect(page.getByTestId("account-panel")).toContainText(email);
}

const token = (page: Page) => page.evaluate(() => localStorage.getItem("zodicog.session"));

async function newDevice(browser: Browser, baseURL: string) {
  const ctx = await browser.newContext({ baseURL });
  return { ctx, page: await ctx.newPage() };
}

test("sign in with an emailed link, then sign out", async ({ page }) => {
  const email = uniqueEmail();
  await signIn(page, email);
  expect(await token(page)).toBeTruthy();
  await expect(page.getByRole("link", { name: /Your (profile|account)/ })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByTestId("account-panel")).toBeHidden();
  await expect(page.getByText("Sync across devices")).toBeVisible();
  expect(await token(page)).toBeNull();
});

test("a sign-in link works once", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(uniqueEmail());
  await page.getByRole("button", { name: /Email me a sign-in link/ }).click();
  const link = await page.getByTestId("dev-link").getAttribute("href");
  await page.goto(link!);
  await expect(page).toHaveURL(/\/profile/, { timeout: 15_000 });

  const other = await page.context().browser()!.newContext({ baseURL: new URL(page.url()).origin });
  const p2 = await other.newPage();
  await p2.goto(link!);
  await expect(p2.getByText(/invalid or has expired/i)).toBeVisible();
  await other.close();
});

test("a bad link explains itself and offers a new one", async ({ page }) => {
  await page.goto("/auth/verify?token=not-a-real-token");
  await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Get a new link/ })).toBeVisible();
});

test("readings and profile made anonymously are adopted on sign-in and follow you to a second device", async ({ page, browser, baseURL }) => {
  test.setTimeout(120_000); // two devices, two sign-ins, several round trips
  // --- device 1: anonymous use first ---
  await mockJson(page, "/analyze/color", "color-solo");
  await page.goto("/analyze/color");
  await fillSimple(page, 0, ALEX);
  await page.getByRole("button", { name: /Remember me|Save my details/ }).click(); // before submitting: the form is replaced by the result
  await page.getByRole("button", { name: /Reveal Aura Colors/ }).click();
  await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible({ timeout: 20_000 });
  const readingId = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.readings") ?? "[]")[0]?.id);
  expect(readingId).toBeTruthy();

  // --- sign in: the anonymous reading + profile are adopted ---
  const email = uniqueEmail();
  await signIn(page, email);
  await expect.poll(async () => {
    const res = await page.request.get(`${API}/me/readings`, { headers: { Authorization: `Bearer ${await token(page)}` } });
    return (await res.json()).readings?.map((r: { id: string }) => r.id) ?? [];
  }, { timeout: 10_000 }).toContain(readingId);

  // --- device 2: a fresh browser with nothing stored ---
  const { ctx, page: phone } = await newDevice(browser, baseURL!);
  await signIn(phone, email);
  await phone.goto("/readings");
  await expect(phone.getByText(/Alex.s Aura Colors/).first()).toBeVisible({ timeout: 10_000 });
  await phone.goto("/analyze/numerology");
  await expect(phone.locator("input").nth(0)).toHaveValue("Alex", { timeout: 10_000 }); // profile pulled from the account
  await ctx.close();
});

test("readings made while signed in belong to the account", async ({ page }) => {
  const email = uniqueEmail();
  await signIn(page, email);
  await mockJson(page, "/analyze/color", "color-solo");
  await page.goto("/analyze/color");
  await fillSimple(page, 0, ALEX);
  await page.getByRole("button", { name: /Reveal Aura Colors/ }).click();
  await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible({ timeout: 20_000 });
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.readings") ?? "[]")[0]?.id);

  const res = await page.request.get(`${API}/me/readings`, { headers: { Authorization: `Bearer ${await token(page)}` } });
  expect((await res.json()).readings.map((r: { id: string }) => r.id)).toContain(id);
});

test("deleting the account revokes the session and removes its readings", async ({ page }) => {
  const email = uniqueEmail();
  await signIn(page, email);
  await mockJson(page, "/analyze/color", "color-solo");
  await page.goto("/analyze/color");
  await fillSimple(page, 0, ALEX);
  await page.getByRole("button", { name: /Reveal Aura Colors/ }).click();
  await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible({ timeout: 20_000 });
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.readings") ?? "[]")[0]?.id);
  const tok = await token(page);

  await page.goto("/profile");
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page.getByTestId("account-panel")).toBeHidden({ timeout: 10_000 });

  expect((await page.request.get(`${API}/me`, { headers: { Authorization: `Bearer ${tok}` } })).status()).toBe(401);
  expect((await page.request.get(`${API}/results/${id}`)).status()).toBe(404);
});
