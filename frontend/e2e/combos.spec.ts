import { expect, test } from "@playwright/test";
import { SIGN_KEYS } from "../lib/aspects";
import { ALL_COMBOS, comboPath, comboSlug, famousNativesLabel, MBTI_KEYS, parseCombo } from "../lib/combos";

/**
 * The 192 sign x type guides. The page shows the article when the backend has (or can
 * produce) it and a calm "being written" state when it can't; both are valid and are
 * asserted here, so the suite passes with or without a working Gemini key.
 */

test.describe("combo helpers (pure)", () => {
  test("there are exactly 192, all unique and all parseable", () => {
    expect(ALL_COMBOS).toHaveLength(192);
    const slugs = new Set(ALL_COMBOS.map((c) => comboSlug(c.sign, c.mbti)));
    expect(slugs.size).toBe(192);
    for (const c of ALL_COMBOS) expect(parseCombo(comboSlug(c.sign, c.mbti))).toEqual(c);
    expect(comboPath("leo", "INTJ")).toBe("/blog/types/leo-intj");
  });

  test("anything that is not one of the 192 is rejected", () => {
    for (const bad of ["leo", "leo-", "-intj", "leo-intjx", "ophiuchus-intj", "leo-abcd", "LEO-INTJ", "leo_intj", "leo-intj-x", "", "../etc"]) {
      expect(parseCombo(bad), bad).toBeNull();
    }
  });

  test("the celebrity link never pluralises a sign name (no Ariess, Piscess, Geminis...)", () => {
    expect(famousNativesLabel("aries")).toBe("See famous Aries natives →");
    expect(famousNativesLabel("pisces")).toBe("See famous Pisces natives →");
    for (const sign of SIGN_KEYS) {
      const name = sign.charAt(0).toUpperCase() + sign.slice(1);
      expect(famousNativesLabel(sign)).toBe(`See famous ${name} natives →`);
    }
  });

  test("covers every sign and every type", () => {
    expect(new Set(ALL_COMBOS.map((c) => c.sign))).toEqual(new Set(SIGN_KEYS));
    expect(new Set(ALL_COMBOS.map((c) => c.mbti))).toEqual(new Set(MBTI_KEYS));
  });
});

test("the sitemap lists the hub and all 192 combinations", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const combos = [...xml.matchAll(/<loc>https:\/\/zodicogai\.com\/blog\/types\/([a-z]+-[a-z]{4})<\/loc>/g)].map((m) => m[1]);
  expect(new Set(combos).size).toBe(192);
  expect(combos).toContain("leo-intj");
  expect(combos).toContain("pisces-esfp");
  expect(xml).toContain("<loc>https://zodicogai.com/blog/types</loc>");
});

test("the hub links to every combination", async ({ page }) => {
  await page.goto("/blog/types");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your sign, your type");
  const links = page.locator('main a[href^="/blog/types/"]');
  await expect(links).toHaveCount(192);
  await expect(page.locator('a[href="/blog/types/leo-intj"]')).toHaveText("INTJ");
});

test("opening the hub or a guide never prefetches other guides (each prefetch would render, and so generate, one)", async ({ page }) => {
  const guideRequests: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (/^\/blog\/types\/[a-z]+-[a-z]{4}$/.test(u.pathname)) guideRequests.push(u.pathname);
  });

  await page.goto("/blog/types");
  for (let y = 0; y <= 6000; y += 600) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y); // bring every link into view
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);
  expect(guideRequests, "the hub's 192 links").toEqual([]);

  await page.goto("/blog/types/leo-intj"); // 26 sibling links + best matches
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForTimeout(1500);
  expect(guideRequests.filter((p) => p !== "/blog/types/leo-intj"), "links on a guide").toEqual([]);
});

test("combinations that don't exist are a 404", async ({ request }) => {
  for (const path of ["/blog/types/ophiuchus-intj", "/blog/types/leo-xxxx", "/blog/types/leo", "/blog/types/leo-intj-extra"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test.describe("a combination page", () => {
  test("has its identity, canonical URL and the internal link mesh, whatever state the article is in", async ({ page }) => {
    await page.goto("/blog/types/leo-intj");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Leo\s*×\s*INTJ/);
    await expect(page).toHaveTitle(/Leo INTJ: Personality, Love & Work/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://zodicogai.com/blog/types/leo-intj");

    // Sibling navigation: Leo with the other 15 types, INTJ with the other 11 signs.
    const mesh = page.getByTestId("combo-links");
    await expect(mesh).toHaveCount(2);
    await expect(mesh.nth(0).getByRole("link")).toHaveCount(15);
    await expect(mesh.nth(1).getByRole("link")).toHaveCount(11);
    await expect(page.locator('main a[href="/blog/types/leo-intj"]')).toHaveCount(0); // not linking to itself

    // Always reachable from the page: the sign guide, the type guide and the profile tool.
    await expect(page.locator('a[href="/blog/zodiac/leo"]').first()).toBeVisible();
    await expect(page.locator('a[href="/blog/mbti/intj"]').first()).toBeVisible();
    await expect(page.locator('a[href="/analyze/hybrid"]').first()).toBeVisible();
  });

  test("shows the guide when it exists, otherwise a calm pending state that stays out of the index", async ({ page }) => {
    await page.goto("/blog/types/leo-intj");
    const robots = page.locator('meta[name="robots"]');
    const pending = page.getByTestId("combo-pending");

    if (await pending.count()) {
      await expect(pending).toContainText("being written");
      await expect(robots).toHaveAttribute("content", /noindex/);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
      return;
    }

    // The guide is there: facts from the engines, the four content sections, linked matches, structured data.
    await expect(page.getByTestId("combo-facts")).toContainText("%");
    await expect(page.getByTestId("combo-facts")).toContainText("They pull apart most on");
    for (const title of ["Overview", "In love", "At work", "Best matches"]) {
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    }
    await expect(page.getByText("Strengths", { exact: true })).toBeVisible();
    await expect(page.getByText("Blind spots", { exact: true })).toBeVisible();

    const matches = page.getByTestId("combo-matches").getByRole("link");
    expect(await matches.count()).toBeGreaterThan(0);
    for (const href of await matches.evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      expect(href).toMatch(/^\/blog\/types\/[a-z]+-[a-z]{4}$/); // every match is a real page
      expect(href).not.toBe("/blog/types/leo-intj");
    }

    await expect(robots).toHaveCount(0); // indexable
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(ld["@type"]).toBe("Article");
    expect(ld.mainEntityOfPage).toBe("https://zodicogai.com/blog/types/leo-intj");
    expect(ld.author.name).toBe("ZodicogAI");

    // Famous people: by sign only, and said plainly.
    const famous = page.locator("#famous");
    await expect(famous).toContainText("don't assign personality types to real people");
    await expect(famous.getByRole("link", { name: "See famous Leo natives →" })).toHaveAttribute("href", "/blog/zodiac/leo#famous");
  });

  test("never attaches a personality type to a real person", async ({ page }) => {
    await page.goto("/blog/types/pisces-enfp");
    const text = (await page.locator("main").innerText()).toLowerCase();
    // Real people appear nowhere on the page (the sign guide's celebrity list is only linked).
    for (const name of ["elon musk", "taylor swift", "lady gaga", "albert einstein", "rihanna"]) {
      expect(text).not.toContain(name);
    }
  });

  test("has a social card", async ({ request }) => {
    const ok = await request.get("/blog/types/leo-intj/opengraph-image");
    expect(ok.status()).toBe(200);
    expect(ok.headers()["content-type"]).toContain("image/png");
    const bad = await request.get("/blog/types/leo-nope/opengraph-image");
    expect(bad.status()).toBe(200); // a plain brand card rather than an error
  });
});

test.describe("cross-links from the existing guides", () => {
  test("a sign guide offers that sign with all 16 types", async ({ page }) => {
    await page.goto("/blog/zodiac/leo");
    const nav = page.getByTestId("combo-links");
    await expect(nav).toContainText("Leo as every type");
    await expect(nav.getByRole("link")).toHaveCount(16);
    await expect(nav.locator('a[href="/blog/types/leo-entp"]')).toHaveText("ENTP");
  });

  test("a type guide offers that type with all 12 signs", async ({ page }) => {
    await page.goto("/blog/mbti/intj");
    const nav = page.getByTestId("combo-links");
    await expect(nav).toContainText("Every sign as an INTJ");
    await expect(nav.getByRole("link")).toHaveCount(12);
    await expect(nav.locator('a[href="/blog/types/scorpio-intj"]')).toHaveText("Scorpio");
  });

  test("the Almanac index points to the hub", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator('a[href="/blog/types"]').first()).toBeVisible();
  });
});
