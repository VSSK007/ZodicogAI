import { expect, test } from "@playwright/test";
import { expectNoPageErrors, mockSse, trackPageErrors } from "./helpers";

const REPLY =
  'data: {"chunk": "Scorpio and Leo "}\n\n' +
  'data: {"chunk": "burn **hot**, "}\n\n' +
  'data: {"chunk": "and fast."}\n\n' +
  'data: {"done": true, "intent": "compatibility_question", "data": {}}\n\n';

async function ask(page: import("@playwright/test").Page, text: string) {
  const box = page.getByPlaceholder(/Ask about personalities/);
  await box.fill(text);
  await box.press("Enter");
}

test("a reply streams in, renders markdown, and shows its intent", async ({ page }) => {
  const errors = trackPageErrors(page);
  await mockSse(page, "/chat/stream", REPLY);
  await page.goto("/chat");

  await ask(page, "Why do Scorpios fall for Leos?");
  await expect(page.getByText("Why do Scorpios fall for Leos?")).toBeVisible();
  await expect(page.getByText(/Scorpio and Leo burn/)).toBeVisible();
  await expect(page.locator("strong", { hasText: "hot" })).toBeVisible();
  await expect(page.getByText(/compat/i).first()).toBeVisible();
  await expectNoPageErrors(errors);
});

test("starter prompts fill the composer; New chat clears the session", async ({ page }) => {
  await mockSse(page, "/chat/stream", REPLY);
  await page.goto("/chat");

  const starter = page.getByRole("button", { name: /Why do Scorpios fall so hard for Leos/ });
  await starter.click();
  await expect(page.getByPlaceholder(/Ask about personalities/)).toHaveValue(/Scorpios fall so hard/);

  await page.getByPlaceholder(/Ask about personalities/).press("Enter");
  await expect(page.getByText(/Scorpio and Leo burn/)).toBeVisible();
  await expect(starter).toBeHidden();

  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.getByText(/Scorpio and Leo burn/)).toBeHidden();
  await expect(starter).toBeVisible();
});

test("the conversation survives a reload", async ({ page }) => {
  await mockSse(page, "/chat/stream", REPLY);
  await page.goto("/chat");
  await ask(page, "Persist me");
  await expect(page.getByText(/Scorpio and Leo burn/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("Persist me")).toBeVisible();
  await expect(page.getByText(/Scorpio and Leo burn/)).toBeVisible();
});

test("a stream error is shown without breaking the page", async ({ page }) => {
  const errors = trackPageErrors(page);
  await mockSse(page, "/chat/stream", 'data: {"error": "model overloaded"}\n\n');
  await page.goto("/chat");
  await ask(page, "hello?");
  await expect(page.getByText(/overloaded|went wrong|try again/i).first()).toBeVisible();
  await expect(page.getByPlaceholder(/Ask about personalities/)).toBeEnabled();
  await expectNoPageErrors(errors);
});

test("the typing indicator shows before the first token arrives", async ({ page }) => {
  await page.route("http://127.0.0.1:8000/chat/stream", async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.fulfill({ status: 200, contentType: "text/event-stream", headers: { "access-control-allow-origin": "*" }, body: REPLY });
  });
  await page.goto("/chat");
  await ask(page, "slow one");
  await expect(page.getByText("Zodicognac is reading your chart")).toBeVisible();
  await expect(page.getByText(/Scorpio and Leo burn/)).toBeVisible({ timeout: 10_000 });
});
