"use client";

/**
 * Daily nudge (web push) in the browser.
 *
 * Permission is asked only when the visitor flips the switch. What the server
 * keeps is the push subscription plus sun sign, optional MBTI type, time zone
 * and the chosen hour; no name, birth date or account.
 */
import { API } from "@/lib/api";

export type PushState =
  | "loading"
  | "unsupported" //   this browser can't do web push (or no service worker yet)
  | "unconfigured" //  the server has no VAPID keys: hide the feature entirely
  | "needs-install" // iPhone/iPad: push only works for the installed app
  | "denied" //        the visitor blocked notifications in the browser
  | "off"
  | "on";

export const DEFAULT_HOUR = 8;
const HOUR_KEY = "zodicog.push.hour";

let cachedKey: string | null | undefined; // undefined = not asked yet, null = server has none

export function pushCapable(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function savedHour(): number {
  try {
    const raw = window.localStorage.getItem(HOUR_KEY);
    if (raw === null || raw.trim() === "") return DEFAULT_HOUR; // Number(null) is 0: midnight is not the default
    const h = Number(raw);
    return Number.isInteger(h) && h >= 0 && h <= 23 ? h : DEFAULT_HOUR;
  } catch {
    return DEFAULT_HOUR;
  }
}

function rememberHour(h: number) {
  try {
    window.localStorage.setItem(HOUR_KEY, String(h));
  } catch {
    /* best effort */
  }
}

async function serverKey(): Promise<string | null> {
  if (cachedKey !== undefined) return cachedKey;
  try {
    const res = await fetch(`${API}/push/public-key`);
    cachedKey = res.ok ? ((await res.json()) as { public_key: string }).public_key : null;
  } catch {
    cachedKey = null;
  }
  return cachedKey;
}

/** The service worker registration, without hanging when none is registered (dev, ?nosw). */
async function registration(): Promise<ServiceWorkerRegistration | null> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
  ]);
}

function keyBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const raw = atob((base64Url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** What the switch should show right now. `ios` and `installed` come from lib/install. */
export async function pushState({ ios, installed }: { ios: boolean; installed: boolean }): Promise<PushState> {
  if (ios && !installed) return "needs-install";
  if (!pushCapable()) return "unsupported";
  if ((await serverKey()) === null) return "unconfigured";
  if (Notification.permission === "denied") return "denied";
  const reg = await registration();
  if (!reg) return "unsupported";
  const sub = await reg.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

export interface NudgeProfile {
  sign: string; // "pisces" or "Pisces"
  mbti?: string;
}

function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

async function register(sub: PushSubscription, profile: NudgeProfile, hour: number) {
  const json = sub.toJSON();
  const res = await fetch(`${API}/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
      sign: profile.sign.toLowerCase(),
      mbti: profile.mbti ?? "",
      tz: timeZone(),
      hour,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err as { detail?: unknown }).detail;
    throw new Error(typeof detail === "string" ? detail : `HTTP ${res.status}`);
  }
}

/** Ask permission (the caller must be inside a click), subscribe, tell the server. */
export async function enablePush(profile: NudgeProfile, hour: number): Promise<"on" | "denied"> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const key = await serverKey();
  const reg = await registration();
  if (!key || !reg) throw new Error("Notifications aren't available here right now.");

  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  try {
    await register(sub, profile, hour);
  } catch (e) {
    await sub.unsubscribe().catch(() => {}); // don't leave a subscription the server doesn't know about
    throw e;
  }
  rememberHour(hour);
  return "on";
}

export async function disablePush(): Promise<void> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  await fetch(`${API}/push/subscribe`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {}); // the server also drops dead subscriptions on its own
}

/** Change the hour of an existing subscription. */
export async function setPushHour(profile: NudgeProfile, hour: number): Promise<void> {
  const reg = await registration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) throw new Error("Notifications are off.");
  await register(sub, profile, hour);
  rememberHour(hour);
}
