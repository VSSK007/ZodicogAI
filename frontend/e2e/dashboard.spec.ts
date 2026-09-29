import { expect, test } from "@playwright/test";
import { ALEX, JORDAN, expectNoPageErrors, fillPerson, mockJson, trackPageErrors } from "./helpers";

async function generateReport(page: import("@playwright/test").Page) {
  await mockJson(page, "/analyze/full", "full");
  await page.goto("/dashboard");
  await fillPerson(page, 0, ALEX);
  await fillPerson(page, 1, JORDAN);
  await page.getByRole("button", { name: /Generate synastry report/ }).click();
  await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });
}

test("synastry report renders the hero, six sections and the section index", async ({ page }) => {
  const errors = trackPageErrors(page);
  await generateReport(page);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Alex");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jordan");
  await expect(page.locator("[data-report-section]")).toHaveCount(6);
  for (const label of ["Verdict", "Dimensions", "Love intelligence", "Trait vectors", "Strengths & risks", "The reading"]) {
    await expect(page.locator("[data-report-section] h2", { hasText: label })).toBeVisible();
  }
  await expect(page.locator('svg[aria-label="Reading sigil"]').first()).toBeVisible();
  await expectNoPageErrors(errors);
});

test("clicking the index jumps to a section and marks it current", async ({ page }) => {
  await generateReport(page);
  const nav = page.getByRole("navigation", { name: "Report sections" });
  await nav.getByRole("button", { name: /Strengths & risks/ }).click();
  await expect(page.locator("#risk")).toBeInViewport({ timeout: 5000 });
  await expect(nav.getByRole("button", { name: /Strengths & risks/ })).toHaveAttribute("aria-current", "true");
});

test("the reading-progress bar advances as you scroll", async ({ page }) => {
  await generateReport(page);
  const bar = page.locator("[data-report] > div.fixed").first();
  const scale = async () => bar.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  const start = await scale();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(scale).toBeGreaterThan(start + 0.5);
});

test("Export PDF triggers the browser print dialog", async ({ page }) => {
  await generateReport(page);
  await page.evaluate(() => {
    (window as unknown as { __printed: number }).__printed = 0;
    window.print = () => { (window as unknown as { __printed: number }).__printed++; };
  });
  await page.getByRole("button", { name: /Export PDF/ }).click();
  expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);
});

test("print styles: chrome is hidden and sections are readable on white", async ({ page }) => {
  await generateReport(page);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Report sections" })).toBeHidden();
  // Unscrolled sections must not print blank (scroll reveals are forced to their end state).
  const opacities = await page.locator("[data-report-section]").evaluateAll((els) =>
    els.map((e) => getComputedStyle(e.firstElementChild as Element).opacity));
  expect(opacities.every((o) => o === "1")).toBe(true);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(255, 255, 255)");
});
