import { expect, test } from "@playwright/test";
import { API, backendUp } from "./helpers";
import { CELEBRITIES } from "../lib/celebrities";
import { aspectBetween } from "../lib/aspects";
import { COUPLES, comparePath, compareRobots, listedComparePaths, listedCouple, orderedPair, validateCouples, type Couple } from "../lib/couples";

/**
 * Compare any two celebrities (item 16) and the owner-approved couples list (item 17).
 * Zodiac and numerology only: no personality types, no claims about a relationship.
 */

const first = (sign: string) => CELEBRITIES.find((c) => c.sign === sign)!;
const aries = first("aries");
const libra = first("libra");
const SLUGS = new Set(CELEBRITIES.map((c) => c.slug));

test.describe("couples list (pure)", () => {
  const injected: Couple[] = [{ a: aries.slug, b: libra.slug, source: "https://example.org/documented" }];

  test("ships empty: nothing is indexable and nothing is in the sitemap list", () => {
    expect(COUPLES).toEqual([]);
    expect(listedComparePaths()).toEqual([]);
    expect(compareRobots(aries.slug, libra.slug)).toEqual({ index: false, follow: true });
    expect(listedCouple(aries.slug, libra.slug)).toBeUndefined();
  });

  test("with a couple injected, that pair (in either order) is indexable and listed - and no other pair is", () => {
    expect(compareRobots(aries.slug, libra.slug, injected)).toEqual({ index: true, follow: true });
    expect(compareRobots(libra.slug, aries.slug, injected)).toEqual({ index: true, follow: true });
    expect(listedCouple(libra.slug, aries.slug, injected)?.source).toBe("https://example.org/documented");

    const other = CELEBRITIES.find((c) => c.slug !== aries.slug && c.slug !== libra.slug)!;
    expect(compareRobots(aries.slug, other.slug, injected).index).toBe(false);
    expect(compareRobots(other.slug, libra.slug, injected).index).toBe(false);

    expect(listedComparePaths(injected)).toEqual([comparePath(aries.slug, libra.slug)]);
  });

  test("both orders share one canonical path", () => {
    expect(comparePath(aries.slug, libra.slug)).toBe(comparePath(libra.slug, aries.slug));
    const [x, y] = orderedPair(libra.slug, aries.slug);
    expect(comparePath(libra.slug, aries.slug)).toBe(`/celebrities/compare/${x}/${y}`);
    // The sitemap never lists the same pair twice.
    const both: Couple[] = [injected[0], { a: libra.slug, b: aries.slug, source: "https://example.org/other" }];
    expect(listedComparePaths(both)).toHaveLength(1);
  });

  test("the validator catches unknown people, missing sources, self-pairs and duplicates", () => {
    expect(validateCouples(injected, SLUGS)).toEqual([]);
    expect(validateCouples([{ a: "nobody", b: libra.slug, source: "https://x.org" }], SLUGS).join()).toContain("unknown celebrity slug");
    expect(validateCouples([{ a: aries.slug, b: libra.slug, source: "" }], SLUGS).join()).toContain("source URL");
    expect(validateCouples([{ a: aries.slug, b: libra.slug, source: "http://insecure.org" }], SLUGS).join()).toContain("source URL");
    expect(validateCouples([{ a: aries.slug, b: aries.slug, source: "https://x.org" }], SLUGS).join()).toContain("themselves");
    expect(validateCouples([injected[0], { a: libra.slug, b: aries.slug, source: "https://y.org" }], SLUGS).join()).toContain("twice");
  });

  test("the shipped list is valid (so a bad entry can't be merged unnoticed)", () => {
    expect(validateCouples(COUPLES, SLUGS)).toEqual([]);
  });
});

test.describe("picker", () => {
  test("choosing two people opens their comparison, in canonical order", async ({ page }) => {
    await page.goto("/celebrities/compare");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare two celebrities");
    const go = page.getByRole("button", { name: "Compare", exact: true });
    await expect(go).toBeDisabled();

    await page.getByLabel("First person").selectOption(libra.slug);
    await expect(go).toBeDisabled();
    await page.getByLabel("Second person").selectOption(aries.slug);
    await expect(go).toBeEnabled();
    await go.click();
    await expect(page).toHaveURL(new RegExp(`${comparePath(aries.slug, libra.slug)}$`));
  });

  test("the same person twice is refused", async ({ page }) => {
    await page.goto("/celebrities/compare");
    await page.getByLabel("First person").selectOption(aries.slug);
    await page.getByLabel("Second person").selectOption(aries.slug);
    await expect(page.getByRole("status")).toContainText("two different people");
    await expect(page.getByRole("button", { name: "Compare", exact: true })).toBeDisabled();
  });

  test("a ?a= link pre-fills the first person, unknown slugs are ignored, and Swap swaps", async ({ page }) => {
    await page.goto(`/celebrities/compare?a=${aries.slug}&b=not-a-person`);
    await expect(page.getByLabel("First person")).toHaveValue(aries.slug);
    await expect(page.getByLabel("Second person")).toHaveValue("");
    await page.getByLabel("Second person").selectOption(libra.slug);
    await page.getByRole("button", { name: "Swap the two people" }).click();
    await expect(page.getByLabel("First person")).toHaveValue(libra.slug);
    await expect(page.getByLabel("Second person")).toHaveValue(aries.slug);
  });

  test("every celebrity page links to the picker with that person pre-filled", async ({ page }) => {
    await page.goto(`/celebrities/${aries.slug}`);
    await expect(page.getByTestId("compare-with")).toHaveAttribute("href", `/celebrities/compare?a=${aries.slug}`);
  });
});

test.describe("a comparison page", () => {
  test("unknown people and a person with themselves are 404", async ({ request }) => {
    for (const path of ["/celebrities/compare/nobody/also-nobody", `/celebrities/compare/${aries.slug}/${aries.slug}`, `/celebrities/compare/${aries.slug}/nobody`]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test("is titled as a zodiac comparison and stays out of search results", async ({ page }) => {
    await page.goto(comparePath(aries.slug, libra.slug));
    await expect(page).toHaveTitle(new RegExp(`Zodiac compatibility: .* & .* \\| ZodicogAI`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(`Zodiac compatibility: `);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://zodicogai.com${comparePath(aries.slug, libra.slug)}`);
    await expect(page.getByTestId("compare-disclaimer")).toContainText("nothing here implies a relationship");
  });

  test("the pair pages are not in the sitemap (only the picker is)", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("<loc>https://zodicogai.com/celebrities/compare</loc>");
    expect(xml).not.toContain("/celebrities/compare/");
  });

  test.describe("with the real comparison API", () => {
    test.beforeAll(async () => {
      test.skip(!(await backendUp()), `no backend answering ${API}/health`);
    });

    test("shows both people, the score, the blend and the aspect between their signs, in neutral words", async ({ page }) => {
      await page.goto(comparePath(aries.slug, libra.slug));
      await expect(page.getByTestId("compare-why")).toContainText(/life paths? \d/);
      await expect(page.getByTestId("compare-why")).not.toContainText(/\byou\b/i);

      // Both people, linked to their own pages.
      await expect(page.getByRole("link", { name: aries.name, exact: true }).first()).toHaveAttribute("href", `/celebrities/${aries.slug}`);
      await expect(page.getByRole("link", { name: libra.name, exact: true }).first()).toHaveAttribute("href", `/celebrities/${libra.slug}`);

      // The wheel draws the aspect between exactly these two signs.
      const wheel = page.getByTestId("zodiac-wheel");
      await expect(wheel).toBeVisible();
      const expected = aspectBetween("aries", "libra")!;
      await expect(wheel).toHaveAttribute("data-aspect", expected.name.toLowerCase());
      await expect(wheel).toContainText(expected.neutral); // third person, not "you challenge each other"
      await expect(wheel).not.toContainText(expected.meaning);
    });

    test("never mentions personality types or a relationship between the two", async ({ page }) => {
      await page.goto(comparePath(aries.slug, libra.slug));
      await expect(page.getByTestId("compare-why")).toBeVisible();
      const text = (await page.locator("main").innerText()).toLowerCase();
      for (const bad of ["mbti", "intj", "enfp", "dating", "married", "boyfriend", "girlfriend", "are a couple", "romantic partner"]) {
        expect(text, bad).not.toContain(bad);
      }
    });

    test("either order gives the same answer", async ({ request }) => {
      const ab = await (await request.get(`${API}/celebrities/compare/${aries.slug}/${libra.slug}`)).json();
      const ba = await (await request.get(`${API}/celebrities/compare/${libra.slug}/${aries.slug}`)).json();
      expect(ab.score).toBe(ba.score);
      expect(ab.zodiac_score).toBe(ba.zodiac_score);
    });
  });
});
