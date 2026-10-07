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

test.describe("mobile menu sheet", () => {
  async function openMenu(page: import("@playwright/test").Page, path = "/about") {
    await hydrated(page, path);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeVisible();
    await page.waitForTimeout(600); // spring animation
    return menu;
  }
  const htmlOverflow = (page: import("@playwright/test").Page) =>
    page.evaluate(() => document.documentElement.style.overflow);

  test("the sheet runs to the bottom of the screen - no dark bar beneath it", async ({ page }) => {
    const menu = await openMenu(page);
    const box = (await menu.boundingBox())!;
    const vh = page.viewportSize()!.height;
    expect(Math.abs(box.y + box.height - vh)).toBeLessThanOrEqual(1);
  });

  test("scrolling inside the menu keeps it open and does not move the page behind it", async ({ page }) => {
    const menu = await openMenu(page);
    const before = await page.evaluate(() => window.scrollY);
    const box = (await menu.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 600); // well past the end, like a hard flick
      await page.waitForTimeout(80);
    }
    await expect(menu).toBeVisible();
    expect(await menu.evaluate((e) => e.scrollTop)).toBeGreaterThan(50); // it did scroll
    expect(await page.evaluate(() => window.scrollY)).toBe(before); // the page did not
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible(); // buttons still there
  });

  test("the page can't scroll while the menu is open, and can again once it closes", async ({ page }) => {
    const menu = await openMenu(page);
    expect(await htmlOverflow(page)).toBe("hidden");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    expect(await htmlOverflow(page)).toBe("");
  });

  test("tapping the dimmed area or the hamburger closes it", async ({ page }) => {
    let menu = await openMenu(page);
    await page.mouse.click(10, 10); // backdrop, above the sheet
    await expect(menu).toBeHidden();
    expect(await htmlOverflow(page)).toBe("");

    await page.getByRole("button", { name: "Open menu" }).click();
    menu = page.getByRole("dialog", { name: "Site menu" });
    await expect(menu).toBeVisible();
    await page.getByRole("button", { name: "Open menu" }).click(); // toggles
    await expect(menu).toBeHidden();
  });

  test("choosing a link, or using the home button, closes the menu and releases scrolling", async ({ page }) => {
    let menu = await openMenu(page);
    await menu.getByRole("link", { name: "Love Style" }).click();
    await expect(page).toHaveURL(/love-style/);
    await expect(menu).toBeHidden();
    expect(await htmlOverflow(page)).toBe("");

    menu = await openMenu(page, "/about");
    await page.getByRole("button", { name: "Go home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeHidden();
    expect(await htmlOverflow(page)).toBe("");
  });

  test("Install app sits under More, not You", async ({ page }) => {
    const menu = await openMenu(page);
    const more = menu.locator("div", { has: page.getByText("More", { exact: true }) }).last();
    await expect(more.getByRole("button", { name: "Install app" })).toBeVisible();
    const you = menu.locator("div", { has: page.getByText("You", { exact: true }) }).first();
    await expect(you.getByRole("button", { name: "Install app" })).toHaveCount(0);
  });
});

test.describe("install banner (phones)", () => {
  test("sits at the very top of the homepage and opens the install steps", async ({ page }) => {
    await hydrated(page, "/");
    const banner = page.getByTestId("install-banner");
    await expect(banner).toBeVisible();
    const box = (await banner.boundingBox())!;
    expect(box.y).toBeLessThanOrEqual(2); // first thing on the page, above the hero
    const hero = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
    expect(box.y).toBeLessThan(hero.y);

    await banner.getByRole("button", { name: "Install" }).click();
    await expect(page.getByRole("dialog", { name: /Install ZodicogAI/ })).toBeVisible();
  });

  test("can be dismissed, and stays dismissed after a reload", async ({ page }) => {
    await hydrated(page, "/");
    await page.getByTestId("install-banner").getByRole("button", { name: "Dismiss" }).click();
    await expect(page.getByTestId("install-banner")).toBeHidden();
    await hydrated(page, "/");
    await expect(page.getByTestId("install-banner")).toBeHidden();
  });

  test("the footer carries no install button (banner and menu tile cover phones)", async ({ page }) => {
    await hydrated(page, "/about");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("footer").getByRole("button", { name: "Install app" })).toHaveCount(0);
  });

  test("it only appears on the homepage", async ({ page }) => {
    await hydrated(page, "/about");
    await expect(page.getByTestId("install-banner")).toHaveCount(0);
  });
});
