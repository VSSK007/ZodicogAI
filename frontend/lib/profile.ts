"use client";

/**
 * The visitor's saved profile — entered once, pre-filled into "Person A" on
 * every analysis form. Lives in localStorage only (no account required).
 */
import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { emptyPerson, type PersonData } from "@/lib/api";
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

export function saveProfile(next: PersonData) {
  // Forms without an MBTI field (color, numerology…) must not erase a saved type.
  const prev = read();
  const merged: PersonData = { ...next, mbti: next.mbti || prev?.mbti || "" };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Storage unavailable — profile memory is best-effort.
  }
  window.dispatchEvent(new Event(EVENT));
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
 * Person A state, pre-filled from the saved profile the first time it's
 * available — but never overwriting anything the visitor has already typed.
 */
export function usePrefilledPerson(): [PersonData, (p: PersonData) => void] {
  const profile = useProfile();
  const [person, setPerson] = useState<PersonData>(emptyPerson());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (profile && !touched) setPerson(profile);
  }, [profile, touched]);

  const set = useCallback((p: PersonData) => {
    setTouched(true);
    setPerson(p);
  }, []);
  return [person, set];
}

/** Same as usePrefilledPerson, for the name/day/month-only SimpleForm shape. */
export function usePrefilledSimple(): [SimplePersonState, (p: SimplePersonState) => void] {
  const profile = useProfile();
  const [person, setPerson] = useState<SimplePersonState>(emptySimple());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (profile && !touched) {
      setPerson({
        name: profile.name,
        day: profile.day ? String(profile.day) : "",
        month: profile.month ? String(profile.month) : "",
        gender: profile.gender,
      });
    }
  }, [profile, touched]);

  const set = useCallback((p: SimplePersonState) => {
    setTouched(true);
    setPerson(p);
  }, []);
  return [person, set];
}
