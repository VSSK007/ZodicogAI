import { expect, test } from "@playwright/test";
import { hydrated } from "./helpers";

/** /welcome: three-step first-run setup that fills the saved profile once. */

test("completing the three steps pre-fills Person A on an analysis form", async ({ page }) => {
  await hydrated(page, "/welcome?next=/analyze/romantic");

  // Step 1: name (focus lands on the field, Enter advances)
  await expect(page.getByText("Step 1 of 3")).toBeVisible();
  await expect(page.getByPlaceholder("Your name")).toBeFocused();
  await page.keyboard.type("Alex");
  await page.keyboard.press("Enter");

  // Step 2: birthday
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
  await expect(page.getByLabel("Month")).toBeFocused();
  await page.getByLabel("Month").selectOption("3");
  await page.getByPlaceholder("Day").fill("15");
  await page.keyboard.press("Enter");

  // Step 3: MBTI via the dropdown
  await expect(page.getByText("Step 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: /MBTI type/ }).click();
  await page.locator("li button", { hasText: "INTJ" }).first().click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();

  await expect(page).toHaveURL(/\/analyze\/romantic/);
  await expect(page.locator("input[placeholder='Name']").first()).toHaveValue("Alex");
  await expect(page.locator("input[placeholder='Day']").first()).toHaveValue("15");
  await expect(page.locator("input[placeholder='Mo']").first()).toHaveValue("3");
});

test("skipping the MBTI step still saves the profile", async ({ page }) => {
  await hydrated(page, "/welcome?next=/profile");
  await page.getByPlaceholder("Your name").fill("Sam");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Month").selectOption("8");
  await page.getByPlaceholder("Day").fill("22");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Finish without MBTI" }).click();

  await expect(page).toHaveURL(/\/profile/);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.profile") ?? "null"));
  expect(saved).toMatchObject({ name: "Sam", day: 22, month: 8, mbti: "" });
});

test("each step validates before moving on, and Back keeps what was typed", async ({ page }) => {
  await hydrated(page, "/welcome");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("name");

  await page.getByPlaceholder("Your name").fill("Kai");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("month");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByPlaceholder("Your name")).toHaveValue("Kai");
});

test("the quiz result lands in the MBTI step", async ({ page }) => {
  await hydrated(page, "/welcome");
  await page.getByPlaceholder("Your name").fill("Rey");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Month").selectOption("1");
  await page.getByPlaceholder("Day").fill("4");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: /Take the quiz/ }).click();
  // Answer all 8 questions with the first option, then use the result.
  const questions = page.locator('[class~="space-y-1.5"]');
  expect(await questions.count()).toBe(8);
  for (let i = 0; i < 8; i++) await questions.nth(i).locator("button").first().click();
  await page.getByRole("button", { name: /Use this type/ }).click();

  await expect(page.getByRole("button", { name: /^[EI][SN][TF][JP]$/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Finish", exact: true })).toBeVisible();
});

test("next only accepts same-site paths", async ({ page }) => {
  await hydrated(page, "/welcome?next=//evil.example");
  await page.getByPlaceholder("Your name").fill("Mo");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Month").selectOption("5");
  await page.getByPlaceholder("Day").fill("9");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Finish without MBTI" }).click();
  await expect(page).toHaveURL(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/today$/); // the default, not evil.example
});

test("a revisit with a saved profile offers Edit profile instead of the wizard", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("zodicog.profile", JSON.stringify({ name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" }));
  });
  await hydrated(page, "/welcome");
  const summary = page.getByTestId("onboarding-summary");
  await expect(summary).toContainText("Alex");
  await summary.getByRole("button", { name: "Edit profile" }).click();
  await expect(page.getByPlaceholder("Your name")).toHaveValue("Alex");
});

test("analysis forms offer the guided setup when there is no profile", async ({ page }) => {
  await hydrated(page, "/analyze/romantic");
  const link = page.getByRole("link", { name: "Set up once, skip the forms" }).first();
  await expect(link).toHaveAttribute("href", /\/welcome\?next=%2Fanalyze%2Fromantic/);
});

test("the wizard works with the keyboard alone", async ({ page }) => {
  await hydrated(page, "/welcome?next=/profile");
  await page.keyboard.type("Ada");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Month")).toBeFocused();
  await page.keyboard.press("ArrowDown"); // native select: first month
  await page.keyboard.press("Tab");
  await page.keyboard.type("10");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Step 3 of 3")).toBeVisible();
});
