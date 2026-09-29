"use client";

/**
 * The session token (issued after a magic-link sign-in), kept in localStorage
 * and sent as `Authorization: Bearer`. Dependency-free on purpose so profile.ts
 * and history.ts can attach it without importing the auth store.
 */
const KEY = "zodicog.session";
export const SESSION_EVENT = "zodicog:session";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
