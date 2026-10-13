import { expect, test, type Page } from "@playwright/test";
import { API, hydrated } from "./helpers";

/** "Your five closest celebrities": deterministic API, shown only with a saved profile. */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

const MATCHES = [
  { slug: "lady-gaga", name: "Lady Gaga", sign: "aries", category: "Musician", score: 84.1, zodiac_score: 80, numerology_score: 88, why: "Fire and Air feed each other; life paths 3 and 5 align naturally." },
  { slug: "emma-watson", name: "Emma Watson", sign: "aries", category: "Actress", score: 82.3, zodiac_score: 78, numerology_score: 86, why: "Both Fire signs: shared fire, so you ignite each other; life path 6 complements each other." },
  { slug: "elton-john", name: "Elton John", sign: "aries", category: "Musician", score: 80.0, zodiac_score: 76, numerology_score: 84, why: "Fire meets Earth: different elements that stay curious about each other; life paths 2 and 4 align naturally." },
  { slug: "mariah-carey", name: "Mariah Carey", sign: "aries", category: "Musician", score: 79.4, zodiac_score: 75, numerology_score: 83, why: "Fire and Air feed each other; life paths 9 and 3 align naturally." },
  { slug: "reese-witherspoon", name: "Reese Witherspoon", sign: "aries", category: "Actress", score: 78.8, zodiac_score: 74, numerology_score: 82, why: "Both Fire signs: shared fire, so you ignite each other; life path 1 complements each other." },
];

async function mockMatches(page: Page, delayMs = 0) {
  const calls: URL[] = [];
  await page.route(`${API}/celebrities/matches**`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    calls.push(new URL(route.request().url()));
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify({ matches: MATCHES }) });
  });
  return calls;
}

async function withProfile(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem("zodicog.profile", JSON.stringify({ name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" })),
  );
}

test("with a profile it lists five matches with scores, reasons and links", async ({ page }) => {
  const calls = await mockMatches(page);
  await withProfile(page);
  await hydrated(page, "/profile");

  const section = page.getByTestId("celebrity-matches");
  await expect(section.getByRole("listitem")).toHaveCount(5);
  await expect(section.getByRole("listitem").first()).toContainText("Lady Gaga");
  await expect(section.getByRole("listitem").first()).toContainText("84");
  await expect(section.getByRole("listitem").first()).toContainText("life paths 3 and 5");
  await expect(section.getByRole("link", { name: "Full match →" }).first()).toHaveAttribute("href", "/celebrities/lady-gaga#match");

  // Sign and numerology inputs only - never the MBTI type.
  expect(calls).toHaveLength(1);
  expect(calls[0].searchParams.get("name")).toBe("Alex");
  expect(calls[0].searchParams.get("day")).toBe("15");
  expect(calls[0].searchParams.get("month")).toBe("3");
  expect(calls[0].searchParams.get("limit")).toBe("5");
  expect(calls[0].search.toLowerCase()).not.toContain("mbti");
  expect(calls[0].search).not.toContain("INTJ");
});

test("it appears on /today and /celebrities too, and not at all without a profile", async ({ page }) => {
  await mockMatches(page);
  await withProfile(page);
  await hydrated(page, "/today");
  await expect(page.getByTestId("celebrity-matches").getByRole("listitem")).toHaveCount(5);
  await page.goto("/celebrities");
  await expect(page.getByTestId("celebrity-matches").getByRole("listitem")).toHaveCount(5);

  const anon = await page.context().browser()!.newContext({ baseURL: new URL(page.url()).origin });
  const p2 = await anon.newPage();
  const calls = await mockMatches(p2);
  await p2.goto("/celebrities");
  await expect(p2.getByTestId("celebrity-matches")).toBeHidden();
  expect(calls).toHaveLength(0); // no profile, no request
  await anon.close();
});

test("a failed request says so quietly and the page still works", async ({ page }) => {
  await page.route(`${API}/celebrities/matches**`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({ status: 500, headers: CORS, contentType: "application/json", body: '{"detail":"x"}' }),
  );
  await withProfile(page);
  await hydrated(page, "/celebrities");
  await expect(page.getByTestId("celebrity-matches").getByRole("status")).toContainText("Couldn't load");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("no layout shift on /celebrities while the matches load", async ({ page }) => {
  await mockMatches(page, 500);
  await withProfile(page);
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await hydrated(page, "/celebrities");
  await expect(page.getByTestId("celebrity-matches").getByRole("listitem")).toHaveCount(5);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.02);
});
