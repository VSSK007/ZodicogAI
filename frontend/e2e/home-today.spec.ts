import { expect, test, type Page } from "@playwright/test";
import { API, hydrated } from "./helpers";

/** Homepage "Your day" strip for returning visitors, and its layout stability. */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

const CARD = {
  date: "2026-10-12", sign: "pisces", mbti: "INTJ",
  horoscope: "A steady day for **quiet progress** and one honest conversation that you have been postponing for a while now.",
  focus_area: "Patient momentum",
  scores: { love: 72, career: 64, energy: 81, luck: 58, overall: 69 },
  mbti_tip: "Trust your read of the room.", do: "Call a friend.", avoid: "Rewriting it again.",
  lucky_color: { name: "Bold Red", hex: "#dc2626" }, lucky_number: 7,
};

async function mockDaily(page: Page, delayMs = 0) {
  await page.route(`${API}/daily/**`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify(CARD) });
  });
}

async function seed(page: Page, { profile = true, readings = true } = {}) {
  await page.addInitScript(
    ({ profile, readings }) => {
      if (profile) {
        localStorage.setItem("zodicog.profile", JSON.stringify({ name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" }));
      }
      if (readings) {
        localStorage.setItem(
          "zodicog.readings",
          JSON.stringify([
            { id: "r1", type: "hybrid_analysis", title: "Alex & Jordan", date: new Date().toISOString() },
            { id: "r2", type: "romantic_compatibility", title: "Alex & Sam", date: new Date().toISOString() },
          ]),
        );
      }
    },
    { profile, readings },
  );
}

/** Total layout shift (excluding input-driven) accumulated on the page. */
async function trackShifts(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const cls = (page: Page) => page.evaluate(() => (window as unknown as { __cls: number }).__cls);

test("a visitor without a profile gets the marketing page and the plain readings row", async ({ page }) => {
  await mockDaily(page);
  await seed(page, { profile: false });
  await hydrated(page, "/");
  await expect(page.getByTestId("today-strip")).toBeHidden();
  await expect(page.getByText("Your recent readings")).toBeVisible();
});

test("a returning visitor sees their own day above the hero", async ({ page }) => {
  await mockDaily(page);
  await seed(page);
  await hydrated(page, "/");

  const strip = page.getByTestId("today-strip");
  await expect(strip).toBeVisible();
  await expect(strip).toContainText("Alex");
  await expect(strip).toContainText("Pisces");
  await expect(strip).toContainText("quiet progress"); // markdown asterisks stripped
  await expect(strip).not.toContainText("**");
  await expect(strip.getByRole("link", { name: "Open today" })).toHaveAttribute("href", "/today");
  await expect(strip.getByRole("link", { name: "New reading" })).toBeVisible();
  await expect(strip.getByRole("link", { name: "Alex & Jordan" })).toHaveAttribute("href", "/r/r1");

  // The standalone readings row is replaced, not duplicated.
  await expect(page.getByText("Your recent readings")).toBeHidden();

  // It sits above the hero heading.
  const stripBox = (await strip.boundingBox())!;
  const h1Box = (await page.locator("h1").first().boundingBox())!;
  expect(stripBox.y).toBeLessThan(h1Box.y);
});

for (const withProfile of [false, true]) {
  test(`no layout shift on the homepage (${withProfile ? "with" : "without"} a profile)`, async ({ page }) => {
    await mockDaily(page, 400); // the one-liner arrives late, as it would on a slow link
    await seed(page, { profile: withProfile });
    await trackShifts(page);
    await hydrated(page, "/");
    if (withProfile) await expect(page.getByTestId("today-strip")).toContainText("quiet progress");
    await page.waitForTimeout(1500);
    expect(await cls(page)).toBeLessThan(0.02);
  });
}

test("the strip survives a failed daily fetch", async ({ page }) => {
  await page.route(`${API}/daily/**`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({ status: 500, headers: CORS, contentType: "application/json", body: '{"detail":"x"}' }),
  );
  await seed(page);
  await hydrated(page, "/");
  const strip = page.getByTestId("today-strip");
  await expect(strip).toContainText("Alex");
  await expect(strip.getByRole("link", { name: "Open today" })).toBeVisible();
});
