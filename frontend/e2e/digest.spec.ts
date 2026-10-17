import { expect, test, type Page } from "@playwright/test";
import { API, backendUp, hydrated } from "./helpers";

/** The weekly-email switch on the profile page (account endpoints answered by a small stateful mock). */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

async function mockAccount(page: Page, { rejectWith }: { rejectWith?: string } = {}) {
  const state = { weekly: false, puts: [] as unknown[] };
  await page.addInitScript(() => localStorage.setItem("zodicog.session", "test-session-token"));
  await page.route(`${API}/me`, (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    return route.fulfill({
      status: 200, contentType: "application/json", headers: CORS,
      body: JSON.stringify({ user: { id: "u1", email: "ada@example.com", weekly_digest: state.weekly } }),
    });
  });
  await page.route(`${API}/me/digest`, (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    state.puts.push(req.postDataJSON());
    if (rejectWith) {
      return route.fulfill({ status: 400, contentType: "application/json", headers: CORS, body: JSON.stringify({ detail: rejectWith }) });
    }
    state.weekly = (req.postDataJSON() as { enabled: boolean }).enabled;
    return route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ weekly_digest: state.weekly }) });
  });
  return state;
}

test("signed-in visitors can switch the weekly email on and off", async ({ page }) => {
  const state = await mockAccount(page);
  await hydrated(page, "/profile");

  const setting = page.getByTestId("digest-setting");
  const toggle = setting.getByRole("switch", { name: "Weekly email" });
  await expect(setting).toContainText("every Monday");
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  expect(state.puts).toEqual([{ enabled: true }]);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  expect(state.puts).toEqual([{ enabled: true }, { enabled: false }]);
});

test("the choice survives a reload (it comes from the account, not the browser)", async ({ page }) => {
  await mockAccount(page);
  await hydrated(page, "/profile");
  await page.getByRole("switch", { name: "Weekly email" }).click();
  await expect(page.getByRole("switch", { name: "Weekly email" })).toHaveAttribute("aria-checked", "true");
  await page.reload();
  await expect(page.getByRole("switch", { name: "Weekly email" })).toHaveAttribute("aria-checked", "true");
});

test("without a saved profile the server's explanation is shown and the switch stays off", async ({ page }) => {
  await mockAccount(page, { rejectWith: "Save your profile first so we know your sign." });
  await hydrated(page, "/profile");
  const setting = page.getByTestId("digest-setting");
  await setting.getByRole("switch", { name: "Weekly email" }).click();
  await expect(setting.getByRole("alert")).toContainText("Save your profile first");
  await expect(setting.getByRole("switch", { name: "Weekly email" })).toHaveAttribute("aria-checked", "false");
});

test("signed-out visitors don't see it", async ({ page }) => {
  await hydrated(page, "/profile");
  await expect(page.getByTestId("digest-setting")).toHaveCount(0);
});

test.describe("against the real backend", () => {
  let devLinks = false;

  test.beforeAll(async () => {
    if (await backendUp()) {
      const r = await fetch(`${API}/auth/request-link`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: `probe-${Date.now()}@example.com` }),
      });
      devLinks = r.ok && !!((await r.json()) as { dev_link?: string }).dev_link;
    }
  });

  test("the switch needs a profile, then really flips the account's flag", async ({ page, request }) => {
    test.skip(!devLinks, "backend not running with AUTH_DEV_LINKS=1");
    const email = `digest-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByRole("button", { name: /Email me a sign-in link/ }).click();
    await page.getByTestId("dev-link").click();
    await expect(page.getByTestId("account-panel")).toContainText(email, { timeout: 15_000 });

    const switchEl = page.getByRole("switch", { name: "Weekly email" });
    await switchEl.click(); // no profile saved on the account yet
    await expect(page.getByTestId("digest-setting").getByRole("alert")).toContainText("Save your profile first");
    await expect(switchEl).toHaveAttribute("aria-checked", "false");

    // Save a profile (it syncs to the account), then it works.
    await page.getByPlaceholder("Name").fill("Ada");
    await page.getByPlaceholder("Day").fill("15");
    await page.getByPlaceholder("Mo").fill("3");
    await page.getByRole("button", { name: /MBTI type/ }).click();
    await page.locator("li button", { hasText: "INTJ" }).first().click();
    await page.getByRole("button", { name: "Save my profile" }).click();
    await expect(page.getByRole("button", { name: /Saved/ })).toBeVisible();
    await expect.poll(async () => {
      const token = await page.evaluate(() => localStorage.getItem("zodicog.session"));
      const r = await request.get(`${API}/me/profile`, { headers: { Authorization: `Bearer ${token}` } });
      return (await r.json()).profile?.name ?? null;
    }).toBe("Ada");

    await switchEl.click();
    await expect(switchEl).toHaveAttribute("aria-checked", "true");
    const token = await page.evaluate(() => localStorage.getItem("zodicog.session"));
    const me = await (await request.get(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })).json();
    expect(me.user.weekly_digest).toBe(true);
  });
});
