"use client";

/**
 * Reading history + share permalinks.
 *
 * saveReading() persists the result server-side (POST /results → short id,
 * no AI cost) and records {id, type, title, date} in localStorage so the
 * homepage can show "Your recent readings". Capped at 10 entries.
 */
import { useSyncExternalStore } from "react";
import { API } from "@/lib/api";
import { authHeaders } from "@/lib/session-token";

export interface ReadingEntry {
  id: string;
  type: string;
  title: string;
  date: string;
}

const KEY = "zodicog.readings";
const CAP = 10;

export function getHistory(): ReadingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReadingEntry[]) : [];
  } catch {
    return [];
  }
}

/** Add a reading made elsewhere (e.g. via an invite) to this device's history. */
export function rememberReading(entry: ReadingEntry) {
  pushHistory(entry);
}

function pushHistory(entry: ReadingEntry) {
  try {
    const next = [entry, ...getHistory().filter((e) => e.id !== entry.id)].slice(0, CAP);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — history is best-effort.
  }
}

/**
 * The reading most recently saved in this page session. Share buttons use it to
 * offer the story card; `seq` lets a button ignore an id saved before it
 * mounted (a different reading).
 */
interface CurrentReading {
  id: string | null;
  seq: number;
}
let current: CurrentReading = { id: null, seq: 0 };
const currentListeners = new Set<() => void>();

function setCurrent(id: string | null) {
  current = { id, seq: current.seq + 1 };
  currentListeners.forEach((l) => l());
}

export function useCurrentReading(): CurrentReading {
  return useSyncExternalStore(
    (cb) => {
      currentListeners.add(cb);
      return () => currentListeners.delete(cb);
    },
    () => current,
    () => current,
  );
}

/**
 * Persist a finished reading; returns its permalink id (or null on failure —
 * sharing is an enhancement, never a blocker).
 */
export async function saveReading(
  analysisType: string,
  title: string,
  payload: unknown,
): Promise<string | null> {
  setCurrent(null);
  try {
    const res = await fetch(`${API}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ analysis_type: analysisType, title, payload }),
    });
    if (!res.ok) return null;
    const { id } = (await res.json()) as { id: string };
    pushHistory({ id, type: analysisType, title, date: new Date().toISOString() });
    setCurrent(id);
    return id;
  } catch {
    return null;
  }
}
