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

// ── Installed app: bottom tab bar replaces the floating buttons and the footer ──

test.describe("installed app (standalone)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q.includes("display-mode: standalone")
          ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false } as MediaQueryList)
          : real(q);
    });
  });

  test("shows the tab bar; the floating buttons and the footer are gone", async ({ page }) => {
    await hydrated(page, "/about");
    const bar = page.getByTestId("app-tabbar");
    await expect(bar).toBeVisible();
    for (const name of ["Today", "Analyze", "Chat", "Readings", "Me"]) {
      await expect(bar.getByText(name, { exact: true })).toBeVisible();
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("nav.mobile-fab")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    // Last content must not hide under the bar.
    const barTop = (await bar.boundingBox())!.y;
    const lastBottom = await page.evaluate(() => document.querySelector("main")!.getBoundingClientRect().bottom);
    expect(lastBottom).toBeLessThanOrEqual(barTop + 1);
  });

  test("every tab navigates and the active one is marked", async ({ page }) => {
    await hydrated(page, "/about");
    const bar = page.getByTestId("app-tabbar");

    await bar.getByRole("link", { name: "Chat" }).click();
    await expect(page).toHaveURL(/\/chat$/);
    await expect(bar.getByRole("link", { name: "Chat" })).toHaveAttribute("aria-current", "page");

    await bar.getByRole("link", { name: "Readings" }).click();
    await expect(page).toHaveURL(/\/readings$/);
    await expect(bar.getByRole("link", { name: "Readings" })).toHaveAttribute("aria-current", "page");

    await bar.getByRole("link", { name: "Me" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(bar.getByRole("link", { name: "Me" })).toHaveAttribute("aria-current", "page");
    await expect(bar.getByRole("link", { name: "Chat" })).not.toHaveAttribute("aria-current", "page");

    await bar.getByRole("link", { name: "Today" }).click();
    await expect(page).toHaveURL(/\/today$/);
  });

  test("Analyze opens a sheet of analyses that navigates and closes", async ({ page }) => {
    await hydrated(page, "/about");
    const bar = page.getByTestId("app-tabbar");
    await bar.getByRole("button", { name: "Analyze" }).click();

    const sheet = page.getByRole("dialog", { name: "Analyze" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Romantic" })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Zodiac Deep-Dive" })).toBeVisible();
    // The bar stays reachable above the sheet.
    await expect(bar).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();

    await bar.getByRole("button", { name: "Analyze" }).click();
    await sheet.getByRole("link", { name: "Romantic" }).click();
    await expect(page).toHaveURL(/\/analyze\/romantic$/);
    await expect(sheet).toBeHidden();
    await expect(bar.getByRole("button", { name: "Analyze" })).toHaveAttribute("aria-current", "page");
  });

  test("chat's composer clears the bar", async ({ page }) => {
    await hydrated(page, "/chat");
    const barTop = (await page.getByTestId("app-tabbar").boundingBox())!.y;
    const shell = await page.locator(".chat-shell").boundingBox();
    expect(shell!.y + shell!.height).toBeLessThanOrEqual(barTop + 1);
  });
});

const STANDALONE_STUB = () => {
  const real = window.matchMedia.bind(window);
  window.matchMedia = (q: string) =>
    q.includes("display-mode: standalone")
      ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false } as MediaQueryList)
      : real(q);
};
const SPY_VIBRATE = () => {
  (window as unknown as { __vibrations: number[] }).__vibrations = [];
  navigator.vibrate = ((p: number | number[]) => {
    (window as unknown as { __vibrations: number[] }).__vibrations.push(Array.isArray(p) ? p[0] : p);
    return true;
  }) as typeof navigator.vibrate;
};
const vibrations = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as unknown as { __vibrations: number[] }).__vibrations.length);

test.describe("native touches", () => {
  test("haptic ticks fire on primary actions in the installed app", async ({ page }) => {
    await page.addInitScript(STANDALONE_STUB);
    await page.addInitScript(SPY_VIBRATE);
    await hydrated(page, "/profile");
    expect(await vibrations(page)).toBe(0);
    await page.getByRole("button", { name: "Save my profile" }).click(); // primary Button
    expect(await vibrations(page)).toBeGreaterThan(0);

    const before = await vibrations(page);
    await page.getByTestId("app-tabbar").getByRole("link", { name: "Chat" }).click(); // tab switch
    await expect.poll(() => vibrations(page)).toBeGreaterThan(before);
  });

  test("a normal browser tab never vibrates", async ({ page }) => {
    await page.addInitScript(SPY_VIBRATE);
    await hydrated(page, "/profile");
    await page.getByRole("button", { name: "Save my profile" }).click();
    expect(await vibrations(page)).toBe(0);
  });

  test("reduced motion silences haptics", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(STANDALONE_STUB);
    await page.addInitScript(SPY_VIBRATE);
    await hydrated(page, "/profile");
    await page.getByRole("button", { name: "Save my profile" }).click();
    expect(await vibrations(page)).toBe(0);
  });

  test("pulling down on Readings refreshes the list once, without a reload", async ({ page }) => {
    await page.addInitScript(STANDALONE_STUB);
    await hydrated(page, "/readings");
    await expect(page.getByText("No readings yet.")).toBeVisible();
    await page.evaluate(() => {
      (window as unknown as { __marker: string }).__marker = "same-page";
      localStorage.setItem(
        "zodicog.readings",
        JSON.stringify([{ id: "abc123", type: "hybrid_analysis", title: "Pulled in", date: new Date().toISOString() }]),
      );
    });

    // Drag from the top of the page to ~160px down (damped to >70px).
    await page.evaluate(async () => {
      const touch = (y: number) =>
        new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y });
      const fire = (type: string, y: number | null) =>
        document.dispatchEvent(
          new TouchEvent(type, {
            touches: y === null ? [] : [touch(y)],
            changedTouches: [touch(y ?? 0)],
            bubbles: true,
            cancelable: true,
          }),
        );
      fire("touchstart", 100);
      for (let y = 110; y <= 260; y += 25) {
        fire("touchmove", y);
        await new Promise((r) => setTimeout(r, 16));
      }
      fire("touchend", null);
    });

    await expect(page.getByText("Pulled in")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __marker?: string }).__marker)).toBe("same-page");
  });

  test("a short pull does nothing, and a normal tab has no pull-to-refresh", async ({ page }) => {
    await hydrated(page, "/readings"); // not installed
    await page.evaluate(() => {
      localStorage.setItem(
        "zodicog.readings",
        JSON.stringify([{ id: "x1", type: "hybrid_analysis", title: "Should not appear", date: new Date().toISOString() }]),
      );
      const touch = (y: number) => new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y });
      document.dispatchEvent(new TouchEvent("touchstart", { touches: [touch(100)], bubbles: true }));
      document.dispatchEvent(new TouchEvent("touchmove", { touches: [touch(300)], bubbles: true }));
      document.dispatchEvent(new TouchEvent("touchend", { touches: [], changedTouches: [touch(300)], bubbles: true }));
    });
    await expect(page.getByTestId("pull-indicator")).toHaveCount(0);
    await expect(page.getByText("Should not appear")).toHaveCount(0);
  });
});

test("in a normal browser tab there is no tab bar and the floating buttons remain", async ({ page }) => {
  await hydrated(page, "/about");
  await expect(page.getByTestId("app-tabbar")).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator("nav.mobile-fab")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

// ── Story mode: the report as swipeable cards ──────────────────────────────────

test.describe("report story mode", () => {
  async function openStory(page: import("@playwright/test").Page) {
    await mockJson(page, "/analyze/full", "full");
    await page.goto("/dashboard");
    await fillPerson(page, 0, ALEX);
    await fillPerson(page, 1, JORDAN);
    await page.getByRole("button", { name: /Generate synastry report/ }).click();
    await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("story-mode-open").click();
    const story = page.getByRole("dialog", { name: "Story mode" });
    await expect(story).toBeVisible();
    return story;
  }
  const position = (story: import("@playwright/test").Locator) =>
    story.getByRole("progressbar").getAttribute("aria-valuenow").then(Number);

  test("opens on the score, advances with Next/Back and the keyboard, and closes with Escape", async ({ page }) => {
    const story = await openStory(page);
    expect(await position(story)).toBe(1);
    await expect(story.getByText("Your compatibility")).toBeVisible();
    const total = Number(await story.getByRole("progressbar").getAttribute("aria-valuemax"));
    expect(total).toBeGreaterThanOrEqual(13); // score, verdict, 8 frameworks, strengths, risks, share, invite (+ reading)

    await story.getByRole("button", { name: "Next", exact: true }).click();
    await expect(story.getByText("The verdict")).toBeVisible();
    expect(await position(story)).toBe(2);

    await page.keyboard.press("ArrowRight");
    await expect.poll(() => position(story)).toBe(3);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => position(story)).toBe(2);
    await story.getByRole("button", { name: "Back" }).click();
    await expect.poll(() => position(story)).toBe(1);
    await expect(story.getByRole("button", { name: "Back" })).toBeDisabled();

    await page.keyboard.press("Escape");
    await expect(story).toBeHidden();
  });

  test("swiping moves between cards", async ({ page }) => {
    const story = await openStory(page);
    const card = story.getByTestId("story-card");
    const box = (await card.boundingBox())!;
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 8 }); // swipe left = next
    await page.mouse.up();
    await expect.poll(() => position(story)).toBe(2);

    await expect(story.getByText("The verdict")).toBeVisible(); // the next card has finished arriving
    const box2 = (await story.getByTestId("story-card").boundingBox())!;
    await page.mouse.move(box2.x + box2.width * 0.2, y);
    await page.mouse.down();
    await page.mouse.move(box2.x + box2.width * 0.8, y, { steps: 8 }); // swipe right = back
    await page.mouse.up();
    await expect.poll(() => position(story)).toBe(1);
  });

  test("every framework gets a card, then share and invite close it out", async ({ page }) => {
    const story = await openStory(page);
    const names: string[] = [];
    await page.keyboard.press("ArrowRight"); // verdict
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("ArrowRight");
      names.push(((await story.getByRole("progressbar").getAttribute("aria-valuetext")) ?? "").split(": ")[1]);
    }
    expect(names).toEqual(["Emotional", "Romantic", "Behavioral", "Intimacy", "Love Style", "Love Language", "Numerology", "Zodiac"]);

    // Then the last two cards.
    const total = Number(await story.getByRole("progressbar").getAttribute("aria-valuemax"));
    for (let i = 0; i < total; i++) await page.keyboard.press("ArrowRight");
    await expect(story.getByText("Check it with someone else")).toBeVisible();
    await expect(story.getByRole("button", { name: "Done" })).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(story.getByRole("button", { name: "Share story card" })).toBeVisible();
    await expect(story.getByRole("button", { name: /Copy link|Copied/ })).toBeVisible();
  });

  test("closing restores the page where it was, and the page can't scroll while open", async ({ page }) => {
    await mockJson(page, "/analyze/full", "full");
    await page.goto("/dashboard");
    await fillPerson(page, 0, ALEX);
    await fillPerson(page, 1, JORDAN);
    await page.getByRole("button", { name: /Generate synastry report/ }).click();
    await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });

    await page.evaluate(() => window.scrollTo(0, 400));
    const before = await page.evaluate(() => window.scrollY);
    await page.getByTestId("story-mode-open").click();
    await expect(page.getByRole("dialog", { name: "Story mode" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");

    await page.getByRole("button", { name: "Close story mode" }).click();
    await expect(page.getByRole("dialog", { name: "Story mode" })).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe("hidden");
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("reduced motion still navigates (crossfade, no slide)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const story = await openStory(page);
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => position(story)).toBe(2);
  });

  test("it isn't offered on desktop", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await mockJson(page, "/analyze/full", "full");
    await page.goto("/dashboard");
    await fillPerson(page, 0, ALEX);
    await fillPerson(page, 1, JORDAN);
    await page.getByRole("button", { name: /Generate synastry report/ }).click();
    await expect(page.locator("[data-report]")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("story-mode-open")).toBeHidden();
    await ctx.close();
  });
});
