"use client";

/**
 * Accounts (passwordless): request an emailed link, exchange it for a session,
 * and keep local data (profile, reading history) in step with the server.
 *
 * Anonymous use is unchanged: everything works without an account and stays in
 * localStorage. Signing in adds cross-device sync on top.
 */
import { useSyncExternalStore } from "react";
import { API } from "@/lib/api";
import { authHeaders, clearToken, getToken, SESSION_EVENT, setToken } from "@/lib/session-token";
import { getHistory, type ReadingEntry } from "@/lib/history";
import { getStoredProfile, saveProfile } from "@/lib/profile";
import { identify, resetIdentity } from "@/lib/posthog";

export interface User {
  id: string;
  email: string;
}

export type Session =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in"; user: User };

const SERVER_SNAPSHOT: Session = { status: "loading", user: null };
const SIGNED_OUT: Session = { status: "signed-out", user: null };

let snapshot: Session = SERVER_SNAPSHOT;
let started = false;
const listeners = new Set<() => void>();

function publish(next: Session) {
  snapshot = next;
  listeners.forEach((l) => l());
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err as { detail?: unknown }).detail;
    throw new Error(typeof detail === "string" ? detail : `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function refresh() {
  if (!getToken()) {
    publish(SIGNED_OUT);
    return;
  }
  try {
    const { user } = await api<{ user: User }>("/me");
    publish({ status: "signed-in", user });
  } catch {
    // Expired or revoked: drop it quietly and fall back to anonymous use.
    clearToken();
  }
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener(SESSION_EVENT, () => void refresh());
  window.addEventListener("storage", (e) => {
    if (e.key === "zodicog.session") void refresh();
  });
  void refresh();
}

function subscribe(cb: () => void) {
  ensureStarted();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSession(): Session {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
}

// ── Sign in / out ───────────────────────────────────────────────────────────

/** Ask for a sign-in link. `dev_link` is only present when the server runs with AUTH_DEV_LINKS=1. */
export function requestLink(email: string) {
  return api<{ ok: true; dev_link?: string }>("/auth/request-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Exchange the emailed token for a session, then sync local data up/down. */
export async function completeSignIn(loginToken: string): Promise<User> {
  const { session_token, user } = await api<{ session_token: string; user: User }>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ token: loginToken }),
  });
  setToken(session_token);
  publish({ status: "signed-in", user });
  identify(user.id);
  await syncAfterSignIn().catch(() => {});
  return user;
}

export async function signOut() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    /* the token is dropped locally either way */
  }
  resetIdentity();
  clearToken();
}

export async function deleteAccount() {
  await api("/me", { method: "DELETE" });
  resetIdentity();
  clearToken();
}

// ── Sync ────────────────────────────────────────────────────────────────────

/**
 * On sign-in: adopt this device's anonymous readings into the account, and
 * reconcile the profile - the server copy wins if it exists (so a second device
 * picks up your details); otherwise this device's profile is uploaded.
 */
export async function syncAfterSignIn() {
  const ids = getHistory().map((h) => h.id);
  if (ids.length) await api("/me/claim", { method: "POST", body: JSON.stringify({ ids }) }).catch(() => {});

  const { profile } = await api<{ profile: Parameters<typeof saveProfile>[0] | null }>("/me/profile");
  if (profile) {
    saveProfile(profile, { sync: false });
  } else {
    const local = getStoredProfile();
    if (local && local.name && local.day && local.month) {
      await api("/me/profile", { method: "PUT", body: JSON.stringify(local) }).catch(() => {});
    }
  }
}

/** The signed-in user's readings from the server (empty when signed out or on error). */
export async function fetchServerReadings(): Promise<ReadingEntry[]> {
  if (!getToken()) return [];
  try {
    const { readings } = await api<{ readings: ReadingEntry[] }>("/me/readings");
    return readings;
  } catch {
    return [];
  }
}
