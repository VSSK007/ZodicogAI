"use client";

/**
 * The visitor's saved profile — entered once, pre-filled into "Person A" on
 * every analysis form. Lives in localStorage only (no account required).
 */
import { useCallback, useMemo, useSyncExternalStore, useState } from "react";
import { API, emptyPerson, type PersonData } from "@/lib/api";
import { authHeaders, getToken } from "@/lib/session-token";
import { emptySimple, type SimplePersonState } from "@/components/ui/SimpleForm";

const KEY = "zodicog.profile";
const EVENT = "zodicog:profile";

let cache: { raw: string | null; value: PersonData | null } = { raw: null, value: null };

function read(): PersonData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    let value: PersonData | null = null;
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p.name === "string") {
        value = { ...emptyPerson(), ...p, day: Number(p.day) || 0, month: Number(p.month) || 0 };
      }
    }
    cache = { raw, value };
    return value;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The saved profile, read straight from storage (for non-React callers). */
export function getStoredProfile(): PersonData | null {
  return read();
}

/**
 * Save the profile on this device and, when signed in, to the account.
 * Pass { sync: false } when the data just came *from* the server.
 */
export function saveProfile(next: PersonData, { sync = true }: { sync?: boolean } = {}) {
  // Forms without an MBTI field (color, numerology…) must not erase a saved type.
  const prev = read();
  const merged: PersonData = { ...next, mbti: next.mbti || prev?.mbti || "" };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Storage unavailable — profile memory is best-effort.
  }
  window.dispatchEvent(new Event(EVENT));

  if (sync && getToken() && isProfileComplete(merged)) {
    // Fire and forget: the local copy is already saved, sync is best-effort.
    void fetch(`${API}/me/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(merged),
    }).catch(() => {});
  }
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function isProfileComplete(p: { name: string; day: number | string; month: number | string }) {
  const d = Number(p.day), m = Number(p.month);
  return !!p.name.trim() && d >= 1 && d <= 31 && m >= 1 && m <= 12;
}

/** The saved profile (null until saved, and during server render). */
export function useProfile(): PersonData | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

/**
 * Person A state: what the visitor has typed if anything, otherwise the saved
 * profile, otherwise empty. Derived rather than synced, so a profile that
 * loads late never overwrites typing and there is no effect to cascade renders.
 */
export function usePrefilledPerson(): [PersonData, (p: PersonData) => void] {
  const profile = useProfile();
  const [edited, setEdited] = useState<PersonData | null>(null);
  const set = useCallback((p: PersonData) => setEdited(p), []);
  return [edited ?? profile ?? emptyPerson(), set];
}

/** Same as usePrefilledPerson, for the name/day/month-only SimpleForm shape. */
export function usePrefilledSimple(): [SimplePersonState, (p: SimplePersonState) => void] {
  const profile = useProfile();
  const [edited, setEdited] = useState<SimplePersonState | null>(null);
  const set = useCallback((p: SimplePersonState) => setEdited(p), []);
  const fromProfile = useMemo<SimplePersonState | null>(
    () =>
      profile && {
        name: profile.name,
        day: profile.day ? String(profile.day) : "",
        month: profile.month ? String(profile.month) : "",
        gender: profile.gender,
      },
    [profile],
  );
  return [edited ?? fromProfile ?? emptySimple(), set];
}
