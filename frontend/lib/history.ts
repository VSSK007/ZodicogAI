"use client";

/**
 * Reading history + share permalinks.
 *
 * saveReading() persists the result server-side (POST /results → short id,
 * no AI cost) and records {id, type, title, date} in localStorage so the
 * homepage can show "Your recent readings". Capped at 10 entries.
 */
import { API } from "@/lib/api";

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

function pushHistory(entry: ReadingEntry) {
  try {
    const next = [entry, ...getHistory().filter((e) => e.id !== entry.id)].slice(0, CAP);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — history is best-effort.
  }
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
  try {
    const res = await fetch(`${API}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis_type: analysisType, title, payload }),
    });
    if (!res.ok) return null;
    const { id } = (await res.json()) as { id: string };
    pushHistory({ id, type: analysisType, title, date: new Date().toISOString() });
    return id;
  } catch {
    return null;
  }
}
