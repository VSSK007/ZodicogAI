import { expect, test } from "@playwright/test";
import { ALEX, expectNoPageErrors, fillSimple, hydrated, trackPageErrors } from "./helpers";

test.describe("command palette", () => {
  test("Ctrl+K opens it, filters, and Enter navigates", async ({ page }) => {
    const errors = trackPageErrors(page);
    await hydrated(page, "/");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toBeVisible();

    await page.keyboard.type("love language");
    await expect(dialog.getByRole("option").first()).toContainText(/Love Language/i);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/analyze\/love-language/);
    await expect(dialog).toBeHidden();
    await expectNoPageErrors(errors);
  });

  test("it finds celebrities from the lazily-loaded dataset and signs by name", async ({ page }) => {
    await hydrated(page, "/");
    const dialog = page.getByRole("dialog", { name: "Search" });
    await page.keyboard.press("Control+k");
    await page.keyboard.type("zendaya");
    await expect(dialog.getByRole("option").first()).toContainText("Zendaya");
    await page.keyboard.press("Escape");

    await page.keyboard.press("Control+k");
    await page.keyboard.type("scorpio");
    await expect(dialog.getByRole("option", { name: /Scorpio/ }).first()).toBeVisible();
  });

  test("arrow keys move the selection; Escape closes; '/' opens; unmatched text offers Ask Zodicognac", async ({ page }) => {
    await hydrated(page, "/about");
    await page.keyboard.press("/");
    const dialog = page.getByRole("dialog", { name: "Search" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(dialog.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.keyboard.press("Control+k");
    await page.keyboard.type("qwertyzxcv");
    await expect(dialog.getByRole("option").last()).toContainText("Ask it as a question");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/chat\?ask=qwertyzxcv/);
  });
});

test.describe("saved profile", () => {
  test("Remember me on one form pre-fills the others and shows on /profile", async ({ page }) => {
    await page.goto("/analyze/color");
    await fillSimple(page, 0, ALEX);
    await page.getByRole("button", { name: /Remember me|Save my details/ }).click();
    await expect(page.getByText("Using your saved profile")).toBeVisible();

    await page.goto("/analyze/numerology");
    const inputs = page.locator("input");
    await expect(inputs.nth(0)).toHaveValue("Alex");
    await expect(page.getByPlaceholder("Day").first()).toHaveValue("15");
    await expect(page.getByPlaceholder("Mo").first()).toHaveValue("3");

    await page.goto("/profile");
    await expect(page.getByText("saved on this device")).toBeVisible();
    await expect(page.getByRole("link", { name: /Your profile \(Alex\)/ })).toBeVisible();
  });

  test("Forget me clears it everywhere", async ({ page }) => {
    await page.goto("/analyze/color");
    await fillSimple(page, 0, ALEX);
    await page.getByRole("button", { name: /Remember me|Save my details/ }).click();
    await page.goto("/profile");
    await page.getByRole("button", { name: /Forget me/ }).click();
    await page.goto("/analyze/numerology");
    await expect(page.locator("input").nth(0)).toHaveValue("");
  });
});

test("celebrity pages and the match feature work", async ({ page }) => {
  await page.goto("/celebrities/zendaya");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Zendaya");
  await expect(page.getByText(/Sep 1, 1996/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Check your match/ })).toBeVisible();
});

test("404 and error pages are on-brand, not blank", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /home|back/i }).first()).toBeVisible();
});

test("key routes respond without console-level crashes", async ({ page }) => {
  const errors = trackPageErrors(page);
  for (const path of ["/", "/about", "/blog", "/blog/faq", "/celebrities", "/discover", "/horoscope", "/readings", "/profile", "/chat"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBeLessThan(400);
  }
  await expectNoPageErrors(errors);
});
