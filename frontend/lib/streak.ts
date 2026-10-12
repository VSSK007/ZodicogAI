/**
 * Daily streak: consecutive local calendar days on which the visitor opened
 * their daily card. Stored on this device only: { last: "YYYY-MM-DD", count }.
 */
const KEY = "zodicog.streak";

interface Streak {
  last: string;
  count: number;
}

/** Local calendar day as YYYY-MM-DD. */
export function localDay(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

function read(): Streak | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Streak;
    return typeof s.last === "string" && Number.isFinite(s.count) ? s : null;
  } catch {
    return null;
  }
}

/** The current streak without recording a visit (0 if it has lapsed or never started). */
export function currentStreak(now: Date = new Date()): number {
  const s = read();
  if (!s) return 0;
  const gap = dayNumber(localDay(now)) - dayNumber(s.last);
  return gap <= 1 ? s.count : 0;
}

/**
 * Record a visit today. Increments once per local day, continues a streak
 * from yesterday, and starts over at 1 after a gap. Returns the new count.
 */
export function recordVisit(now: Date = new Date()): number {
  const today = localDay(now);
  const s = read();
  let count = 1;
  if (s) {
    const gap = dayNumber(today) - dayNumber(s.last);
    if (gap === 0) return s.count;
    if (gap === 1) count = s.count + 1;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ last: today, count } satisfies Streak));
  } catch {
    // Storage unavailable: the streak is best-effort.
  }
  return count;
}
