import { devices, expect, test, type Page } from "@playwright/test";
import { hydrated } from "./helpers";

/**
 * "Install app" is a phone/tablet feature: a home-screen icon is what brings
 * people back. Desktop gets no install UI from the site at all.
 */

/** Fire the event Chrome sends when the site becomes installable. */
async function offerInstallPrompt(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __prompted: number };
    w.__prompted = 0;
    const e = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    e.prompt = async () => { w.__prompted++; };
    e.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
}

test.describe("on an Android phone", () => {
  test.use({ viewport: devices["Pixel 7"].viewport, userAgent: devices["Pixel 7"].userAgent, isMobile: true, hasTouch: true });

  test("without a browser prompt, the profile card shows Android steps", async ({ page }) => {
    await hydrated(page, "/profile");
    await page.getByTestId("install-card").getByRole("button", { name: "Install app" }).click();
    const dialog = page.getByRole("dialog", { name: /Install ZodicogAI/ });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Install app");
    await expect(dialog).toContainText(/Reload the page once/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("when the browser offers its install prompt, the button uses it; everything hides once installed", async ({ page }) => {
    await hydrated(page, "/");
    await offerInstallPrompt(page);

    await page.getByTestId("install-banner").getByRole("button", { name: "Install" }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __prompted: number }).__prompted)).toBe(1);
    await expect(page.getByRole("dialog")).toBeHidden(); // the real prompt, not our instructions

    await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
    await expect(page.getByTestId("install-banner")).toBeHidden();
  });

  test("it is hidden when the app is already running installed", async ({ page }) => {
    await page.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q.includes("display-mode: standalone")
          ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false } as MediaQueryList)
          : real(q);
    });
    await hydrated(page, "/");
    await expect(page.getByTestId("install-banner")).toBeHidden();
    await page.goto("/profile");
    await expect(page.getByTestId("install-card")).toBeHidden();
  });
});

test("iPhone Safari gets the Add to Home Screen steps", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ ...devices["iPhone 13"], baseURL });
  const page = await ctx.newPage();
  await hydrated(page, "/profile");
  await page.getByTestId("install-card").getByRole("button", { name: "Install app" }).click();
  const dialog = page.getByRole("dialog", { name: /Add ZodicogAI to your Home Screen/ });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Add to Home Screen");
  await expect(dialog).toContainText("Share");
  await ctx.close();
});

test("Chrome on iPhone is told to switch to Safari", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    ...devices["iPhone 13"],
    baseURL,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  await hydrated(page, "/profile");
  await page.getByTestId("install-card").getByRole("button", { name: "Install app" }).click();
  await expect(page.getByRole("dialog", { name: /Open in Safari/ })).toBeVisible();
  await ctx.close();
});

test("on desktop the site shows no install option anywhere", async ({ page }) => {
  await hydrated(page, "/");
  await offerInstallPrompt(page); // even if Chrome says it could install

  await expect(page.getByTestId("install-banner")).toBeHidden();
  await expect(page.getByRole("button", { name: "Install app" })).toHaveCount(0);

  await page.goto("/profile");
  await expect(page.getByTestId("install-card")).toBeHidden();

  await hydrated(page, "/about");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.type("install");
  await expect(page.getByRole("dialog", { name: "Search" }).getByRole("option", { name: /Install app/ })).toHaveCount(0);
});
