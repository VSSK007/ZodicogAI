import { expect, test, type Page } from "@playwright/test";
import { API, backendUp, fixture, mockSse } from "./helpers";

/** Zodicognac with context: a saved reading (?r=) and the visitor's profile. */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

const REPLY =
  'data: {"chunk": "Your zodiac gap is real."}\n\n' +
  'data: {"done": true, "intent": "general_question", "data": {}}\n\n';

const TITLE = "Alex × Jordan Synastry Report";

async function mockReading(page: Page, id = "abc123") {
  const full = fixture<Record<string, unknown>>("full");
  await page.route(`${API}/results/${id}`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: CORS,
          body: JSON.stringify({
            id,
            analysis_type: "full_relationship_intelligence",
            title: TITLE,
            created_at: "2026-10-12T10:00:00Z",
            payload: {
              ...full,
              personas: { a: { name: "Alex", sign: "Pisces", mbti: "INTJ" }, b: { name: "Jordan", sign: "Leo", mbti: "ENFP" } },
            },
          }),
        }),
  );
}

/** Capture the JSON body of every POST to /chat/stream while replying with REPLY. */
async function captureChat(page: Page) {
  const bodies: Record<string, unknown>[] = [];
  await page.route(`${API}/chat/stream`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "text/event-stream", headers: CORS, body: REPLY });
  });
  return bodies;
}

async function ask(page: Page, text: string) {
  const box = page.getByPlaceholder(/Ask about personalities/);
  await box.fill(text);
  await box.press("Enter");
  await expect(page.getByText("Your zodiac gap is real.").last()).toBeVisible();
}

test("opening a report in chat shows what Zodicognac can see, with starters from its numbers", async ({ page }) => {
  await mockReading(page);
  await mockSse(page, "/chat/stream", REPLY);
  await page.goto("/chat?r=abc123");

  await expect(page.getByTestId("chat-reading-chip")).toContainText(`Discussing: ${TITLE}`);
  const starters = page.getByTestId("chat-starters").getByRole("button");
  await expect(starters).toHaveCount(3);
  await expect(starters.nth(0)).toHaveText("Why is zodiac our lowest score (49)?");
  await expect(starters.nth(2)).toContainText("love style"); // the strongest area in the fixture
  await expect(page.getByRole("button", { name: /Why do Scorpios fall so hard for Leos/ })).toBeHidden(); // generic ones step aside

  await starters.nth(0).click();
  await expect(page.getByPlaceholder(/Ask about personalities/)).toHaveValue("Why is zodiac our lowest score (49)?");
});

test("the message carries a compact summary of the report, not the whole payload", async ({ page }) => {
  await mockReading(page);
  const bodies = await captureChat(page);
  await page.goto("/chat?r=abc123");
  await expect(page.getByTestId("chat-reading-chip")).toBeVisible();

  await ask(page, "Why is zodiac so low?");
  expect(bodies).toHaveLength(1);
  const ctx = (bodies[0].context as { reading: { id: string; type: string; summary: string } }).reading;
  expect(ctx.id).toBe("abc123");
  expect(ctx.type).toBe("full_relationship_intelligence");
  expect(ctx.summary.length).toBeLessThanOrEqual(1500);
  expect(ctx.summary).toContain("Alex (Pisces, INTJ) and Jordan (Leo, ENFP)");
  expect(ctx.summary).toContain("Overall 79/100");
  expect(ctx.summary).toContain("Zodiac 49");
  expect(ctx.summary).toContain("Love Style 95");
  expect(ctx.summary).toMatch(/conflict risk 44%/);
  expect(JSON.stringify(bodies[0]).length).toBeLessThan(6000); // nowhere near the full report JSON
});

test("dropping the reading stops sending it and cleans the URL", async ({ page }) => {
  await mockReading(page);
  const bodies = await captureChat(page);
  await page.goto("/chat?r=abc123");
  await page.getByTestId("chat-reading-chip").click();
  await expect(page.getByTestId("chat-reading-chip")).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("r")).toBeNull();

  await ask(page, "Anything else?");
  expect(bodies[0].context).toBeUndefined();
});

test("a reading that can't be loaded is explained and chat still works", async ({ page }) => {
  await page.route(`${API}/results/missing`, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({ status: 404, headers: CORS, contentType: "application/json", body: '{"detail":"Reading not found"}' }),
  );
  const bodies = await captureChat(page);
  await page.goto("/chat?r=missing");
  await expect(page.getByRole("status").filter({ hasText: "Couldn't load that reading" })).toBeVisible();
  await ask(page, "Hello");
  expect(bodies[0].context).toBeUndefined();
});

test.describe("your profile", () => {
  const PROFILE = { name: "Alex", day: 15, month: 3, mbti: "INTJ", gender: "M" };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((p) => localStorage.setItem("zodicog.profile", JSON.stringify(p)), PROFILE);
  });

  test("is sent by default, can be turned off, and the choice is remembered", async ({ page }) => {
    const bodies = await captureChat(page);
    await page.goto("/chat");

    const chip = page.getByTestId("chat-profile-chip");
    await expect(chip).toContainText("Using your profile · Alex");
    await ask(page, "First question");
    expect(bodies[0].person_a).toMatchObject({ name: "Alex", day: 15, month: 3, mbti: "INTJ" });

    await chip.click();
    await expect(chip).toContainText("Not using your profile");
    await ask(page, "Second question");
    expect(bodies[1].person_a).toBeUndefined();

    await page.reload();
    await expect(page.getByTestId("chat-profile-chip")).toContainText("Not using your profile");

    await page.getByTestId("chat-profile-chip").click();
    await expect(page.getByTestId("chat-profile-chip")).toContainText("Using your profile");
  });

  test("works alongside a discussed report", async ({ page }) => {
    await mockReading(page);
    const bodies = await captureChat(page);
    await page.goto("/chat?r=abc123");
    await expect(page.getByTestId("chat-reading-chip")).toBeVisible();
    await ask(page, "Tell me about us");
    expect(bodies[0].person_a).toMatchObject({ name: "Alex" });
    expect((bodies[0].context as { reading: { id: string } }).reading.id).toBe("abc123");
  });
});

test.describe("entry points (real backend)", () => {
  test.beforeAll(async () => {
    test.skip(!(await backendUp()), `no backend answering ${API}/health`);
  });

  test("a saved report page links to chat with its id", async ({ page, request }) => {
    const full = fixture<Record<string, unknown>>("full");
    const saved = await request.post(`${API}/results`, {
      data: {
        analysis_type: "full_relationship_intelligence",
        title: TITLE,
        payload: { ...full, personas: { a: { name: "Alex", sign: "Pisces" }, b: { name: "Jordan", sign: "Leo" } } },
      },
    });
    const { id } = await saved.json();

    await mockSse(page, "/chat/stream", REPLY);
    await page.goto(`/r/${id}`);
    const link = page.getByTestId("ask-zodicognac");
    await expect(link).toHaveAttribute("href", `/chat?r=${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/chat\\?r=${id}`));
    await expect(page.getByTestId("chat-reading-chip")).toContainText(TITLE);
  });
});
