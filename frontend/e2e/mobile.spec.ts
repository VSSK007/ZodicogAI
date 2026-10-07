import { expect, test } from "@playwright/test";
import { ALEX, JORDAN, expectNoPageErrors, fillPerson, fixture, hydrated, mockJson, trackPageErrors } from "./helpers";

/** Pixel 7 profile (see playwright.config.ts): layout and mobile-only chrome. */

async function noHorizontalScroll(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page is wider than the viewport").toBeLessThanOrEqual(1);
}

test("key pages don't scroll sideways", async ({ page }) => {
  for (const path of ["/", "/about", "/analyze/hybrid", "/celebrities", "/blog", "/profile", "/chat"]) {
    await page.goto(path);
    await noHorizontalScroll(page);
  }
});

test("the floating buttons stay hidden at the top and appear near the bottom", async ({ page }) => {
  await hydrated(page, "/about");
  const fab = page.locator("nav.mobile-fab");
  await expect(fab).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(fab).toBeVisible();
  // Only the button cluster: no full-width strip that could paint a bar.
  const box = await fab.boundingBox();
  const vw = page.viewportSize()!.width;
  expect(box!.width).toBeLessThan(vw * 0.75);
});

test("the menu sheet opens from the hamburger and navigates", async ({ page }) => {
  await hydrated(page, "/about");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Site menu" });
  await expect(menu.getByRole("link", { name: "Behavioral Profile" })).toBeVisible();
  await menu.getByRole("link", { name: "Love Style" }).click();
  await expect(page).toHaveURL(/\/analyze\/love-style/);
});

test("the mobile menu has an Install app tile with Android steps", async ({ page }) => {
  await hydrated(page, "/about");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog", { name: "Site menu" }).getByRole("button", { name: "Install app" }).click();
  const dialog = page.getByRole("dialog", { name: /Install ZodicogAI/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Install app");
  await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden(); // menu closed first
});

test("a reading works end to end on a phone", async ({ page }) => {
  const errors = trackPageErrors(page);
  await mockJson(page, "/analyze/hybrid", "hybrid");
  await page.goto("/analyze/hybrid");
  await fillPerson(page, 0, ALEX);
  await page.getByRole("button", { name: /Analyze Your Profile/ }).click();
  await expect(page.getByText("Behavioral Analysis")).toBeVisible({ timeout: 20_000 });
  await noHorizontalScroll(page);
  await expectNoPageErrors(errors);
});

test("the synastry report is usable on a phone: chips, sections, no overflow", async ({ page }) => {
  await mockJson(page, "/analyze/full", "full");
  await page.goto("/dashboard");
  await fillPerson(page, 0, ALEX);
  await fillPerson(page, 1, JORDAN);
  await page.getByRole("button", { name: /Generate synastry report/ }).click();
  await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alex");
  await expect(page.locator("[data-report-section]")).toHaveCount(6);
  const overall = fixture<{ relationship_intelligence: { overall_score: number } }>("full").relationship_intelligence.overall_score;
  await expect(page.locator("svg text").first()).toHaveText(overall.toFixed(1), { timeout: 5000 });

  // The chips row lets you jump; the desktop index is not shown.
  await page.getByRole("button", { name: "Strengths & risks" }).first().click();
  await expect(page.locator("#risk")).toBeInViewport({ timeout: 5000 });
  await expect(page.getByRole("navigation", { name: "Report sections" })).toBeHidden();
  await noHorizontalScroll(page);
});
