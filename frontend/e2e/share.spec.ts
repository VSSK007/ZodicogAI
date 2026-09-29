import { expect, test } from "@playwright/test";
import { ALEX, JORDAN, API, backendUp, fillPerson, fillSimple, mockJson } from "./helpers";

/**
 * Share links exercise the real backend (POST /results, GET /results/:id — no
 * LLM involved); only the analysis itself is served from a fixture.
 */
test.describe("shared readings", () => {
  test.beforeAll(async () => {
    test.skip(!(await backendUp()), `no backend answering ${API}/health (set E2E_BACKEND=1 or start it)`);
  });

  test("a finished reading is saved, shareable, and opens at /r/<id>", async ({ page }) => {
    await mockJson(page, "/analyze/color", "color-solo");
    await page.goto("/analyze/color");
    await fillSimple(page, 0, ALEX);
    await page.getByRole("button", { name: /Reveal Aura Colors/ }).click();

    // ResultActions only offers "Copy link" once the real backend has saved the reading.
    await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible({ timeout: 20_000 });

    const id = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.readings") ?? "[]")[0]?.id);
    expect(id).toBeTruthy();

    // It appears in the reading history.
    await page.goto("/readings");
    await expect(page.getByText(/Alex.s Aura Colors/).first()).toBeVisible();

    // The permalink renders the stored reading for anyone.
    const origin = new URL(page.url()).origin;
    const fresh = await page.context().browser()!.newContext({ baseURL: origin });
    const anon = await fresh.newPage();
    await anon.goto(`/r/${id}`);
    await expect(anon.getByText("Shared reading")).toBeVisible();
    await expect(anon.getByRole("heading", { level: 1 })).toContainText("Alex");
    await expect(anon.locator('svg[aria-label="Reading sigil"]')).toBeVisible();

    // And its social card is a real PNG.
    const og = await anon.request.get(`/r/${id}/opengraph-image`);
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");
    await fresh.close();
  });

  test("a saved synastry report opens as the full report and honours #section", async ({ page }) => {
    await mockJson(page, "/analyze/full", "full");
    await page.goto("/dashboard");
    await fillPerson(page, 0, ALEX);
    await fillPerson(page, 1, JORDAN);
    await page.getByRole("button", { name: /Generate synastry report/ }).click();
    await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible({ timeout: 20_000 });

    const id = await page.evaluate(() => JSON.parse(localStorage.getItem("zodicog.readings") ?? "[]")[0]?.id);
    await page.goto(`/r/${id}#risk`);
    await expect(page.locator("[data-report-section]")).toHaveCount(6);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Jordan");
    await expect(page.locator("#risk")).toBeInViewport({ timeout: 5000 });
  });

  test("an unknown id is a 404 page", async ({ page }) => {
    const res = await page.goto("/r/does-not-exist");
    expect(res?.status()).toBe(404);
  });
});
