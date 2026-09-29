import { expect, test } from "@playwright/test";
import {
  ALEX, JORDAN, expectNoPageErrors, fillPerson, fillSimple, mockJson, mockSse, sseFixture, trackPageErrors,
} from "./helpers";

/**
 * Every analyze page, end to end: fill the form, submit, get a (recorded)
 * response back, see the result, and reset to the form again.
 */

type Case = {
  name: string;
  path: string;
  people: "person" | "simple";
  count: number;
  submit: RegExp;
  result: string | RegExp;
  api?: { path: string; fixture: string };
  sse?: { path: string; fixture: string };
  before?: (page: import("@playwright/test").Page) => Promise<void>;
};

const CASES: Case[] = [
  { name: "hybrid", path: "/analyze/hybrid", people: "person", count: 1, submit: /Analyze Your Profile/, result: "Behavioral Analysis", api: { path: "/analyze/hybrid", fixture: "hybrid" } },
  { name: "love-style", path: "/analyze/love-style", people: "person", count: 2, submit: /Analyze Love Styles/, result: "Love Style Distribution", api: { path: "/analyze/love-style", fixture: "love-style" } },
  { name: "love-language", path: "/analyze/love-language", people: "person", count: 2, submit: /Analyze Love Languages/, result: "Love Language Distribution", api: { path: "/analyze/love-language", fixture: "love-language" } },
  { name: "color (solo)", path: "/analyze/color", people: "simple", count: 1, submit: /Reveal Aura Colors/, result: "Spiritual Aura", api: { path: "/analyze/color", fixture: "color-solo" } },
  { name: "numerology (solo)", path: "/analyze/numerology", people: "simple", count: 1, submit: /Reveal Numerology/, result: /Numerology Profile/, api: { path: "/analyze/numerology", fixture: "numerology-solo" } },
  { name: "zodiac", path: "/analyze/zodiac", people: "simple", count: 1, submit: /Generate Zodiac Profile/, result: /Sun Sign/, api: { path: "/analyze/zodiac", fixture: "zodiac" } },
  { name: "sextrology (solo)", path: "/analyze/sextrology", people: "person", count: 1, submit: /Reveal Your Sextrology Profile/, result: "Sextrology Profile", api: { path: "/analyze/sextrology", fixture: "sextrology-solo" } },
  { name: "emotional (streamed)", path: "/analyze/emotional", people: "person", count: 2, submit: /Analyze Emotional Compatibility/, result: "Celestial Reading Complete", sse: { path: "/analyze/emotional/stream", fixture: "emotional-stream" } },
  { name: "romantic (streamed)", path: "/analyze/romantic", people: "person", count: 2, submit: /Analyze Romantic Compatibility/, result: "Celestial Reading Complete", sse: { path: "/analyze/romantic/stream", fixture: "romantic-stream" } },
];

for (const c of CASES) {
  test(`${c.name}: form -> result -> reset`, async ({ page }) => {
    const errors = trackPageErrors(page);
    if (c.api) await mockJson(page, c.api.path, c.api.fixture);
    if (c.sse) await mockSse(page, c.sse.path, sseFixture(c.sse.fixture));

    await page.goto(c.path);
    const people = [ALEX, JORDAN];
    for (let i = 0; i < c.count; i++) {
      if (c.people === "person") await fillPerson(page, i, people[i]);
      else await fillSimple(page, i, people[i]);
    }
    await page.getByRole("button", { name: c.submit }).click();

    await expect(page.getByText(c.result).first()).toBeVisible({ timeout: 20_000 });
    await expectNoPageErrors(errors);

    // Reset returns to an empty-or-prefilled form and hides the result.
    const reset = page.getByRole("button", { name: /Try another reading|Try again|Analyze another/i }).first();
    if (await reset.isVisible().catch(() => false)) {
      await reset.click();
      await expect(page.getByRole("button", { name: c.submit })).toBeVisible();
    }
  });
}

test("sextrology pair mode returns the intimacy score", async ({ page }) => {
  const errors = trackPageErrors(page);
  await mockJson(page, "/analyze/sextrology", "sextrology-pair");
  await page.goto("/analyze/sextrology");
  await fillPerson(page, 0, ALEX);
  await page.getByRole("button", { name: /Add Person B/ }).click();
  await fillPerson(page, 1, JORDAN);
  await page.getByRole("button", { name: /Analyze Intimacy Compatibility/ }).click();
  await expect(page.getByText("Intimacy Score")).toBeVisible({ timeout: 20_000 });
  await expectNoPageErrors(errors);
});

test("color pair mode shows the harmonic palette", async ({ page }) => {
  await mockJson(page, "/analyze/color", "color-pair");
  await page.goto("/analyze/color");
  await fillSimple(page, 0, ALEX);
  await page.getByRole("button", { name: /Add Person B/ }).click();
  await fillSimple(page, 1, JORDAN);
  await page.getByRole("button", { name: /Reveal Aura Colors/ }).click();
  await expect(page.getByText("Harmonic Palette")).toBeVisible({ timeout: 20_000 });
});

test("numerology pair mode shows the compatibility breakdown", async ({ page }) => {
  await mockJson(page, "/analyze/numerology", "numerology-pair");
  await page.goto("/analyze/numerology");
  await fillSimple(page, 0, ALEX);
  await page.getByRole("button", { name: /Add Person B/ }).click();
  await fillSimple(page, 1, JORDAN);
  await page.getByRole("button", { name: /Reveal Numerology/ }).click();
  await expect(page.getByText("Numerology Compatibility")).toBeVisible({ timeout: 20_000 });
});

test("validation: an incomplete form shows an error and sends nothing", async ({ page }) => {
  const calls = await mockJson(page, "/analyze/hybrid", "hybrid");
  await page.goto("/analyze/hybrid");
  await page.getByRole("button", { name: /Analyze Your Profile/ }).click();
  await expect(page.getByText(/Name is required/)).toBeVisible();
  expect(calls.count).toBe(0);
});

test("API failure surfaces a retryable error, not a crash", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.route("http://127.0.0.1:8000/analyze/hybrid", (route) =>
    route.fulfill({ status: 429, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ detail: "You've reached today's reading limit for this device." }) }),
  );
  await page.goto("/analyze/hybrid");
  await fillPerson(page, 0, ALEX);
  await page.getByRole("button", { name: /Analyze Your Profile/ }).click();
  await expect(page.getByText(/reading limit/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Retry/ })).toBeVisible();
  await expectNoPageErrors(errors);
});
