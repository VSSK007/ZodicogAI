import { expect, test } from "@playwright/test";
import { ALEX, API, backendUp, fillSimple, fixture, mockJson } from "./helpers";

/**
 * 9:16 story cards. The routes fetch the saved reading server-side, so these
 * use the real backend (POST /results, GET /daily is answered with Gemini
 * stubbed/unavailable -> fallback text, which is fine for a card).
 */
function pngSize(buf: Buffer): { width: number; height: number } {
  expect(buf.subarray(1, 4).toString()).toBe("PNG");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test.describe("story cards", () => {
  test.beforeAll(async () => {
    test.skip(!(await backendUp()), `no backend answering ${API}/health (set E2E_BACKEND=1 or start it)`);
  });

  test("a saved reading renders a 1080x1920 PNG with its score", async ({ request }) => {
    const full = fixture<Record<string, unknown>>("full");
    const saved = await request.post(`${API}/results`, {
      data: {
        analysis_type: "full_relationship_intelligence",
        title: "Alex × Jordan Synastry Report",
        payload: { ...full, personas: { a: { name: "Alex", sign: "Pisces" }, b: { name: "Jordan", sign: "Leo" } } },
      },
    });
    expect(saved.ok()).toBeTruthy();
    const { id } = await saved.json();

    const res = await request.get(`/r/${id}/story-image`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    expect(pngSize(await res.body())).toEqual({ width: 1080, height: 1920 });
  });

  test("an unknown reading degrades to a plain card instead of an error", async ({ request }) => {
    const res = await request.get("/r/does-not-exist/story-image");
    expect(res.status()).toBe(200);
    expect(pngSize(await res.body())).toEqual({ width: 1080, height: 1920 });
  });

  test("the daily story card renders, and ignores anything but a valid sign", async ({ request }) => {
    const ok = await request.get("/story/daily?sign=leo&day=15&month=8&mbti=INTJ&name=Alex");
    expect(ok.status()).toBe(200);
    expect(pngSize(await ok.body())).toEqual({ width: 1080, height: 1920 });

    const bad = await request.get("/story/daily?sign=<script>&name=" + encodeURIComponent("x".repeat(500)));
    expect(bad.status()).toBe(200);
    expect(pngSize(await bad.body())).toEqual({ width: 1080, height: 1920 });
  });
  test("the celebrity matches story card renders from the API's ranking", async ({ request }) => {
    const ok = await request.get("/story/celebrities?name=Alex&day=15&month=3");
    expect(ok.status()).toBe(200);
    const okBody = await ok.body();
    expect(pngSize(okBody)).toEqual({ width: 1080, height: 1920 });

    const bad = await request.get("/story/celebrities?name=&day=x&month=3"); // degrades to a plain card
    expect(bad.status()).toBe(200);
    const badBody = await bad.body();
    expect(pngSize(badBody)).toEqual({ width: 1080, height: 1920 });

    // The real card (five rows of text) is far heavier than the plain fallback, so a
    // missing backend endpoint can't masquerade as success.
    expect(okBody.length).toBeGreaterThan(badBody.length * 2);
  });

  test("a finished reading offers Story 9:16 once saved, and downloads the card", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); // force the download path
    });
    await mockJson(page, "/analyze/color", "color-solo");
    await page.goto("/analyze/color");
    await fillSimple(page, 0, ALEX);
    await page.getByRole("button", { name: /Reveal Aura Colors/ }).click();

    // Appears only after the real backend has saved the reading.
    const story = page.getByRole("button", { name: "Story 9:16" });
    await expect(story).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Post 1:1" })).toHaveAttribute("aria-pressed", "true");

    await story.click();
    await expect(story).toHaveAttribute("aria-pressed", "true");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /^(Save & Share|Share)$/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("zodicogai-story.png");
  });
});
