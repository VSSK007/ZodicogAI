import { expect, test, type Page } from "@playwright/test";
import { API, hydrated } from "./helpers";

/** /today: the personal daily card (API answered from a synthetic response). */

const CARD = {
  date: "2026-10-12",
  sign: "aries",
  mbti: "INTJ",
  horoscope: "A steady day for **quiet progress**.",
  focus_area: "Patient momentum",
  scores: { love: 72, career: 64, energy: 81, luck: 58, overall: 69 },
  mbti_tip: "Trust your read of the room.",
  do: "Call a friend you have missed.",
  avoid: "Rewriting that message again.",
  lucky_color: { name: "Bold Red", hex: "#dc2626" },
  lucky_number: 7,
};

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

async function mockDaily(page: Page) {
  const calls: string[] = [];
  await page.route(`${API}/daily/**`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    calls.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify(CARD) });
  });
  return calls;
}

async function withProfile(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "zodicog.profile",
      JSON.stringify({ name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" }),
    );
  });
}

test("without a profile it pitches the setup", async ({ page }) => {
  await mockDaily(page);
  await hydrated(page, "/today");
  const pitch = page.getByTestId("today-no-profile");
  await expect(pitch).toBeVisible();
  await pitch.getByRole("link", { name: /Set up/ }).click();
  await expect(page).toHaveURL(/\/welcome\?next=%2Ftoday|\/welcome\?next=\/today/);
});

test("with a profile it shows the whole card for their sign and type", async ({ page }) => {
  const calls = await mockDaily(page);
  await withProfile(page);
  await hydrated(page, "/today");

  const card = page.getByTestId("daily-card");
  await expect(card).toContainText("Alex");
  await expect(card).toContainText("quiet progress");
  await expect(card).toContainText("Trust your read of the room.");
  await expect(card).toContainText("Bold Red");
  await expect(card).toContainText("7");
  await expect(card).toContainText("Call a friend you have missed.");
  await expect(card).toContainText("Rewriting that message again.");
  await expect(card.getByText("Pisces")).toBeVisible(); // 15 March

  // The request carries sign (path), day, month and type, never the name.
  expect(calls).toHaveLength(1);
  expect(calls[0]).toContain("/daily/pisces?");
  expect(calls[0]).toContain("day=15");
  expect(calls[0]).toContain("month=3");
  expect(calls[0]).toContain("mbti=INTJ");
  expect(calls[0]).not.toContain("Alex");
});

test("the streak counts once per local day, continues, and resets after a gap", async ({ page }) => {
  await mockDaily(page);
  await withProfile(page);

  await page.clock.setFixedTime(new Date("2026-10-12T09:00:00"));
  await hydrated(page, "/today");
  await expect(page.getByTestId("streak")).toContainText("Day 1");

  await page.reload(); // same day: unchanged
  await expect(page.getByTestId("streak")).toContainText("Day 1");

  await page.clock.setFixedTime(new Date("2026-10-13T09:00:00"));
  await page.reload();
  await expect(page.getByTestId("streak")).toContainText("2-day streak");

  await page.clock.setFixedTime(new Date("2026-10-14T23:30:00"));
  await page.reload();
  await expect(page.getByTestId("streak")).toContainText("3-day streak");

  await page.clock.setFixedTime(new Date("2026-10-18T09:00:00")); // missed days
  await page.reload();
  await expect(page.getByTestId("streak")).toContainText("Day 1");
});

test("the share button copies the card text when the Web Share API is absent", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockDaily(page);
  await withProfile(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });
  await hydrated(page, "/today");
  await page.getByRole("button", { name: "Share today" }).click();
  await expect(page.getByRole("button", { name: "Copied to clipboard" })).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("Lucky number 7");
  expect(text).toContain("/today");
});

test("a failed fetch shows a retry that recovers", async ({ page }) => {
  let fail = true;
  await page.route(`${API}/daily/**`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    if (fail) return route.fulfill({ status: 500, contentType: "application/json", headers: CORS, body: JSON.stringify({ detail: "boom" }) });
    return route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify(CARD) });
  });
  await withProfile(page);
  await hydrated(page, "/today");
  await expect(page.locator("div[role=alert]").filter({ hasText: "boom" })).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByTestId("daily-card")).toBeVisible();
});

