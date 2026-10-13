import { expect, test, type Page } from "@playwright/test";
import { ALEX, fillPerson, hydrated, mockJson } from "./helpers";
import { aspectBetween, normalizeSign, SIGN_KEYS, signDistance } from "../lib/aspects";

/** The zodiac wheel and the aspect table behind it. */

test.describe("aspects (pure)", () => {
  test("the named examples", () => {
    expect(aspectBetween("Leo", "Aquarius")?.name).toBe("Opposite");
    expect(aspectBetween("Leo", "Sagittarius")?.name).toBe("Trine");
    expect(aspectBetween("Aries", "Gemini")?.name).toBe("Sextile");
    expect(aspectBetween("Aries", "Cancer")?.name).toBe("Square");
    expect(aspectBetween("Leo", "Leo")?.name).toBe("Conjunct");
  });

  test("symmetric, tolerant of case, and wraps around the wheel", () => {
    for (const a of SIGN_KEYS)
      for (const b of SIGN_KEYS) {
        expect(aspectBetween(a, b)?.name).toBe(aspectBetween(b, a)?.name);
        expect(signDistance(a, b)).toBeLessThanOrEqual(6);
      }
    expect(aspectBetween("  LEO ", "aquarius")?.degrees).toBe(180);
    expect(aspectBetween("Pisces", "Aries")?.name).toBe("Semi-sextile"); // neighbours across the year end
    expect(aspectBetween("Aries", "Pisces")?.degrees).toBe(30);
  });

  test("unknown names give nothing rather than a wrong aspect", () => {
    expect(aspectBetween("Leo", "Ophiuchus")).toBeNull();
    expect(aspectBetween("", "leo")).toBeNull();
    expect(normalizeSign(undefined)).toBeNull();
  });

  test("every aspect has a degree, a tone and a one-line meaning", () => {
    for (const k of SIGN_KEYS) {
      const asp = aspectBetween("aries", k)!;
      expect(asp.meaning.length).toBeGreaterThan(20);
      expect(["harmonious", "dynamic", "neutral"]).toContain(asp.tone);
    }
  });
});

async function withProfile(page: Page, day: number, month: number) {
  await page.addInitScript(
    ([d, m]) => localStorage.setItem("zodicog.profile", JSON.stringify({ name: "Alex", day: d, month: m, mbti: "INTJ", gender: "M" })),
    [day, month],
  );
}

/** Stub every API the /today page calls so it renders without a backend. */
async function stubTodayApis(page: Page) {
  await page.route("**/daily/**", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.route("**/celebrities/matches**", (route) => route.fulfill({ status: 500, body: "{}" }));
}

test.describe("on /today", () => {
  test("shows the visitor's sign, with twelve labelled, focusable segments", async ({ page }) => {
    await stubTodayApis(page);
    await withProfile(page, 15, 3); // Pisces
    await hydrated(page, "/today");

    const wheel = page.getByTestId("zodiac-wheel");
    await expect(wheel).toBeVisible();
    await expect(wheel).toContainText("Pisces");
    await expect(wheel.getByTestId("wheel-aspect-line")).toHaveCount(0); // one sign: no aspect

    const segments = wheel.getByRole("link");
    await expect(segments).toHaveCount(12);
    await expect(wheel.locator('[data-sign="pisces"]')).toHaveAttribute("aria-current", "true");
    await expect(wheel.locator('[data-sign="aries"]')).toHaveAttribute("aria-label", /Aries \(Fire, Cardinal\)/);
    await expect(wheel.locator('[data-sign="aries"]')).not.toHaveAttribute("aria-current", "true");
  });

  test("a segment opens that sign's guide, by click and by keyboard", async ({ page }) => {
    await stubTodayApis(page);
    await withProfile(page, 15, 3);
    await hydrated(page, "/today");

    await page.getByTestId("zodiac-wheel").locator('[data-sign="leo"]').click();
    await expect(page).toHaveURL(/\/blog\/zodiac\/leo$/);

    await page.goBack();
    await expect(page.getByTestId("zodiac-wheel")).toBeVisible();
    const taurus = page.getByTestId("zodiac-wheel").locator('[data-sign="taurus"]');
    await taurus.focus();
    await expect(taurus).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/blog\/zodiac\/taurus$/);
  });

  test("the ring turns to the sign, instantly under reduced motion", async ({ page }) => {
    await stubTodayApis(page);
    await withProfile(page, 15, 3); // Pisces = index 11 -> -(11*30+15) = -345deg
    await page.emulateMedia({ reducedMotion: "reduce" });
    await hydrated(page, "/today");
    const ring = page.getByTestId("zodiac-wheel").locator("svg > g").first();
    await expect(ring).toBeVisible();
    // No animation: the very first read is already the final angle (no polling).
    expect(await ring.evaluate((el) => (el as SVGElement).style.transform)).toContain("rotate(-345deg)");
  });

  test("without a profile there is no wheel", async ({ page }) => {
    await stubTodayApis(page);
    await hydrated(page, "/today");
    await expect(page.getByTestId("zodiac-wheel")).toHaveCount(0);
  });
});

test.describe("in the report", () => {
  async function report(page: Page, a: { day: string; month: string }, b: { day: string; month: string }) {
    await mockJson(page, "/analyze/full", "full");
    await page.goto("/dashboard");
    await fillPerson(page, 0, { ...ALEX, ...a, name: "Lea" });
    await fillPerson(page, 1, { ...ALEX, ...b, name: "Aqua", mbti: "ENFP" });
    await page.getByRole("button", { name: /Generate synastry report/ }).click();
    await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });
    return page.getByTestId("zodiac-wheel");
  }

  test("Leo and Aquarius are drawn as an opposition", async ({ page }) => {
    const wheel = await report(page, { day: "22", month: "8" }, { day: "5", month: "2" });
    await expect(wheel).toHaveAttribute("data-aspect", "opposite");
    await expect(wheel).toContainText("Leo and Aquarius: opposite.");
    await expect(wheel.getByTestId("wheel-aspect-line")).toHaveCount(1);
    await expect(wheel.locator('[data-sign="leo"]')).toHaveAttribute("aria-current", "true");
    await expect(wheel.locator('[data-sign="aquarius"]')).toHaveAttribute("aria-current", "true");
  });

  test("Leo and Sagittarius are drawn as a trine", async ({ page }) => {
    const wheel = await report(page, { day: "22", month: "8" }, { day: "1", month: "12" });
    await expect(wheel).toHaveAttribute("data-aspect", "trine");
    await expect(wheel).toContainText("Leo and Sagittarius: trine.");
  });
});
