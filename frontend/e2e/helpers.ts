import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";

/** Where the frontend build sends its API calls (NEXT_PUBLIC_API_URL default). */
export const API = process.env.E2E_API ?? "http://127.0.0.1:8000";

const FIXTURES = fileURLToPath(new URL("./fixtures/", import.meta.url));

export function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, `${name}.json`), "utf-8")) as T;
}

export function sseFixture(name: string): string {
  return readFileSync(join(FIXTURES, `${name}.sse.txt`), "utf-8");
}

/** Answer POST <API><path> with a recorded JSON fixture. Returns a call counter. */
export async function mockJson(page: Page, path: string, name: string) {
  const calls = { count: 0, lastBody: undefined as unknown };
  await page.route(`${API}${path}`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors() });
    calls.count++;
    calls.lastBody = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", headers: cors(), body: JSON.stringify(fixture(name)) });
  });
  return calls;
}

/** Answer POST <API><path> with a recorded (or synthetic) SSE body. */
export async function mockSse(page: Page, path: string, body: string) {
  await page.route(`${API}${path}`, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors() });
    await route.fulfill({ status: 200, contentType: "text/event-stream", headers: cors(), body });
  });
}

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "*",
  };
}

/** Fail the test on any uncaught page error (console errors are logged, not fatal). */
export function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

export const ALEX = { name: "Alex", day: "15", month: "3", mbti: "INTJ" };
export const JORDAN = { name: "Jordan", day: "22", month: "8", mbti: "ENFP" };

/** Fill one PersonForm (name/day/month inputs + custom MBTI dropdown). index 0 = first form. */
export async function fillPerson(page: Page, index: number, p: { name: string; day: string; month: string; mbti: string }) {
  const form = page.locator("div.rounded-2xl:has(input[placeholder='Name'])").nth(index);
  await form.locator("input[placeholder='Name']").fill(p.name);
  await form.locator("input[placeholder='Day']").fill(p.day);
  await form.locator("input[placeholder='Mo']").fill(p.month);
  await form.locator("button", { hasText: /MBTI type|^[EI][NS][TF][JP]$/ }).first().click();
  await form.locator("li button", { hasText: p.mbti }).first().click();
}

/** Fill a SimpleForm (name/day/month only). The name input's placeholder is the form's label. */
export async function fillSimple(page: Page, index: number, p: { name: string; day: string; month: string }) {
  const form = page.locator("div.rounded-card:has(input[placeholder='Day'])").nth(index);
  await form.locator("input").nth(0).fill(p.name);
  await form.locator("input[placeholder='Day']").fill(p.day);
  await form.locator("input[placeholder='Mo']").fill(p.month);
}

export async function expectNoPageErrors(errors: string[]) {
  expect(errors, `uncaught page errors:\n${errors.join("\n")}`).toEqual([]);
}

/** True when a real backend answers /health (set E2E_BACKEND, or run one on :8000). */
export async function backendUp(): Promise<boolean> {
  try {
    const r = await fetch(`${API}/health`);
    return r.ok;
  } catch {
    return false;
  }
}

/** Navigate and wait until the client has hydrated (keyboard handlers exist only after that). */
export async function hydrated(page: Page, path: string) {
  await page.goto(path);
  await page.locator('html[data-hydrated="true"]').waitFor({ state: "attached" });
}
