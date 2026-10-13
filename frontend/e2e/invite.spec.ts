import { expect, test, type Page } from "@playwright/test";
import { API, JORDAN, fillPerson, hydrated } from "./helpers";

/** Partner invites: create a link, the partner accepts, the inviter sees "Ready". */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

const PROFILE = { name: "Alex Morgan", day: 15, month: 3, mbti: "INTJ", gender: "M" };

async function withProfile(page: Page, profile: object = PROFILE) {
  await page.addInitScript((p) => localStorage.setItem("zodicog.profile", JSON.stringify(p)), profile);
}

function json(route: import("@playwright/test").Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", headers: CORS, body: JSON.stringify(body) });
}

/** A tiny in-memory invite backend. */
async function mockInvites(page: Page, initial: Partial<{ status: string; result_id: string | null }> = {}) {
  const state = {
    status: initial.status ?? "pending",
    result_id: (initial.result_id ?? null) as string | null,
    created: [] as unknown[],
    accepted: [] as unknown[],
  };
  await page.route(`${API}/invites**`, async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;

    if (req.method() === "POST" && path === "/invites") {
      state.created.push(req.postDataJSON());
      return json(route, { token: "tok123", url: "http://localhost:3000/i/tok123" });
    }
    if (req.method() === "POST" && path.endsWith("/accept")) {
      state.accepted.push(req.postDataJSON());
      state.status = "accepted";
      state.result_id = "rid456";
      return json(route, { result_id: "rid456" });
    }
    if (path === "/invites/missing") return json(route, { detail: "Invite not found" }, 404);
    return json(route, {
      first_name: "Alex",
      sign: "Pisces",
      status: state.status,
      result_id: state.status === "accepted" ? state.result_id : null,
      expires_at: "2099-01-01T00:00:00+00:00",
    });
  });
  return state;
}

test("the inviter creates a link from their profile and it is remembered", async ({ page }) => {
  const api = await mockInvites(page);
  await withProfile(page);
  await hydrated(page, "/profile");

  await page.getByTestId("invite-card").getByTestId("invite-open").click();
  const dialog = page.getByRole("dialog", { name: "Invite your partner" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Create my invite link" }).click();
  const link = dialog.getByLabel("Invite link");
  await expect(link).toHaveValue(/\/i\/tok123$/);
  // Always this site's origin, whatever FRONTEND_URL the server has.
  expect(await link.inputValue()).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/i\/tok123$/);

  // The request carries the inviter's details for the server to snapshot.
  expect(api.created).toHaveLength(1);
  expect(api.created[0]).toMatchObject({ inviter: { name: "Alex Morgan", day: 15, month: 3, mbti: "INTJ" } });

  const remembered = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.invites") ?? "[]"));
  expect(remembered).toEqual(["tok123"]);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("without an MBTI type the profile points to the setup instead", async ({ page }) => {
  await mockInvites(page);
  await withProfile(page, { ...PROFILE, mbti: "" });
  await hydrated(page, "/profile");
  const link = page.getByTestId("invite-card").getByRole("link", { name: /Set up your profile to invite/ });
  await expect(link).toHaveAttribute("href", /\/welcome\?next=%2Fprofile/);
  await expect(page.getByTestId("invite-open")).toHaveCount(0);
});

test("the partner sees only a first name and sign, adds their details and lands on the report", async ({ page }) => {
  const api = await mockInvites(page);
  await hydrated(page, "/i/tok123");

  await expect(page.getByRole("heading", { name: /Alex\s+wants to check your compatibility/ })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Morgan");
  await expect(page.locator("main")).not.toContainText("INTJ");

  await fillPerson(page, 0, JORDAN);
  await page.getByRole("button", { name: "See our compatibility" }).click();

  await expect(page).toHaveURL(/\/r\/rid456$/);
  expect(api.accepted).toEqual([
    { partner: { name: "Jordan", day: 22, month: 8, mbti: "ENFP", gender: "M" } },
  ]);
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.readings") ?? "[]"));
  expect(history[0]).toMatchObject({ id: "rid456", title: "Alex × Jordan Synastry Report" });
});

test("a partner's own saved profile pre-fills the form", async ({ page }) => {
  await mockInvites(page);
  await withProfile(page, { name: "Sam", day: 2, month: 11, mbti: "ENFP", gender: "F" });
  await hydrated(page, "/i/tok123");
  await expect(page.locator("input[placeholder='Name']").first()).toHaveValue("Sam");
});

test("the form validates before contacting the server", async ({ page }) => {
  const api = await mockInvites(page);
  await hydrated(page, "/i/tok123");
  await page.getByRole("button", { name: "See our compatibility" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("Name is required");
  expect(api.accepted).toHaveLength(0);
});

test("an unknown invite and an expired invite say so", async ({ page }) => {
  await mockInvites(page);
  await hydrated(page, "/i/missing");
  await expect(page.getByTestId("invite-missing")).toBeVisible();

  await page.unroute(`${API}/invites**`);
  await mockInvites(page, { status: "expired" });
  await page.goto("/i/tok123");
  await expect(page.getByTestId("invite-expired")).toContainText("expired");
});

test("the inviter revisiting sees Waiting, then Ready with the report link", async ({ page }) => {
  const api = await mockInvites(page);
  await page.addInitScript(() => localStorage.setItem("zodicog.invites", JSON.stringify(["tok123"])));
  await hydrated(page, "/i/tok123");
  await expect(page.getByTestId("invite-waiting")).toBeVisible();
  await expect(page.getByRole("button", { name: "See our compatibility" })).toHaveCount(0); // not the partner form

  api.status = "accepted";
  api.result_id = "rid456";
  await page.reload();
  const ready = page.getByTestId("invite-ready");
  await expect(ready).toContainText("Ready");
  await expect(ready.getByRole("link", { name: /View the report/ })).toHaveAttribute("href", "/r/rid456");
});

test("past invites are listed in the sheet with their status", async ({ page }) => {
  await mockInvites(page, { status: "accepted", result_id: "rid456" });
  await page.addInitScript(() => localStorage.setItem("zodicog.invites", JSON.stringify(["tok123"])));
  await withProfile(page);
  await hydrated(page, "/profile");
  await page.getByTestId("invite-open").click();
  const dialog = page.getByRole("dialog", { name: "Invite your partner" });
  await expect(dialog.getByRole("link", { name: /View report/ })).toHaveAttribute("href", "/r/rid456");
});
