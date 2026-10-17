import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { expect, test } from "@playwright/test";

/**
 * The service worker's push handlers, run in a sandbox with a fake `self`
 * (no browser): what notification a push produces and what a tap does.
 */

const SOURCE = readFileSync(join(fileURLToPath(new URL(".", import.meta.url)), "..", "public", "sw.js"), "utf-8");
const ORIGIN = "https://zodicogai.com";

interface Win { url: string; focused: number; navigated: string[] }

function loadWorker(windows: Win[] = []) {
  const listeners: Record<string, (e: unknown) => void> = {};
  const shown: { title: string; options: Record<string, unknown> }[] = [];
  const opened: string[] = [];
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, fn: (e: unknown) => void) => { listeners[type] = fn; },
    skipWaiting: () => {},
    registration: {
      showNotification: async (title: string, options: Record<string, unknown>) => { shown.push({ title, options }); },
    },
    clients: {
      claim: async () => {},
      matchAll: async () => windows.map((w) => ({
        url: w.url,
        focus: async () => { w.focused++; },
        navigate: async (u: string) => { w.navigated.push(u); },
      })),
      openWindow: async (u: string) => { opened.push(u); },
    },
  };
  runInNewContext(SOURCE, { self, URL, console, Promise });
  return { listeners, shown, opened };
}

async function push(listeners: Record<string, (e: unknown) => void>, data: unknown) {
  const pending: Promise<unknown>[] = [];
  listeners.push({
    data: data === undefined ? null : { json: () => { if (data === "BAD") throw new Error("not json"); return data; } },
    waitUntil: (p: Promise<unknown>) => pending.push(p),
  });
  await Promise.all(pending);
}

async function click(listeners: Record<string, (e: unknown) => void>, url?: string) {
  const pending: Promise<unknown>[] = [];
  let closed = 0;
  listeners.notificationclick({
    notification: { close: () => closed++, data: url === undefined ? undefined : { url } },
    waitUntil: (p: Promise<unknown>) => pending.push(p),
  });
  await Promise.all(pending);
  return closed;
}

test("a push becomes a notification with the title, body, icon and a replace-in-place tag", async () => {
  const { listeners, shown } = loadWorker();
  await push(listeners, { title: "Your day, Pisces", body: "A steady day.", url: "/today" });
  expect(shown).toHaveLength(1);
  expect(shown[0].title).toBe("Your day, Pisces");
  expect(shown[0].options).toMatchObject({ body: "A steady day.", icon: "/pwa-icon-192", tag: "daily", data: { url: "/today" } });
});

test("a malformed or empty payload still shows something sensible", async () => {
  const bad = loadWorker();
  await push(bad.listeners, "BAD");
  expect(bad.shown[0].title).toBe("ZodicogAI");
  expect(bad.shown[0].options).toMatchObject({ body: "", data: { url: "/today" } });

  const empty = loadWorker();
  await push(empty.listeners, undefined);
  expect(empty.shown[0].title).toBe("ZodicogAI");

  const wrongTypes = loadWorker();
  await push(wrongTypes.listeners, { title: 42, body: { x: 1 }, url: 7 });
  expect(wrongTypes.shown[0].title).toBe("ZodicogAI");
  expect(wrongTypes.shown[0].options).toMatchObject({ body: "", data: { url: "/today" } });
});

test("a push can never point the tap at another site", async () => {
  for (const url of ["https://evil.example/x", "//evil.example/x", "/\\evil.example", "javascript:alert(1)"]) {
    const { listeners, shown } = loadWorker();
    await push(listeners, { title: "t", body: "b", url });
    expect(shown[0].options.data).toEqual({ url: "/today" });
  }
  const ok = loadWorker();
  await push(ok.listeners, { title: "t", body: "b", url: "/horoscope/leo" });
  expect(ok.shown[0].options.data).toEqual({ url: "/horoscope/leo" });
});

test("tapping focuses an open ZodicogAI window and takes it to /today", async () => {
  const other: Win = { url: "https://example.org/", focused: 0, navigated: [] };
  const mine: Win = { url: `${ORIGIN}/blog`, focused: 0, navigated: [] };
  const { listeners, opened } = loadWorker([other, mine]);
  const closed = await click(listeners, "/today");
  expect(closed).toBe(1);
  expect(mine.focused).toBe(1);
  expect(mine.navigated).toEqual([`${ORIGIN}/today`]);
  expect(other.focused).toBe(0);
  expect(opened).toEqual([]);
});

test("tapping with no window open opens one at /today", async () => {
  const { listeners, opened } = loadWorker([]);
  await click(listeners, "/today");
  expect(opened).toEqual([`${ORIGIN}/today`]);
});

test("a tampered notification url falls back to /today", async () => {
  const { listeners, opened } = loadWorker([]);
  await click(listeners, "https://evil.example/phish");
  expect(opened).toEqual([`${ORIGIN}/today`]);
  const none = loadWorker([]);
  await click(none.listeners, undefined);
  expect(none.opened).toEqual([`${ORIGIN}/today`]);
});
