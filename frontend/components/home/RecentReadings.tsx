"use client";

/**
 * RecentReadings — quiet homepage row of the visitor's saved readings
 * (localStorage). Renders nothing for first-time visitors.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { getHistory, type ReadingEntry } from "@/lib/history";

export default function RecentReadings() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 pt-12">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-ink-muted">
          <History className="size-3.5" aria-hidden="true" />
          <span className="font-display font-extrabold text-[10.5px] tracking-[0.22em] uppercase">
            Your recent readings
          </span>
        </div>
        {entries.length > 5 && (
          <Link href="/readings" className="text-xs font-semibold text-ink-muted hover:text-accent-bright transition-colors">
            View all →
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.slice(0, 5).map((e) => (
          <Link
            key={e.id}
            href={`/r/${e.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-ink-secondary hover:text-ink hover:border-hairline-accent transition-colors tap-highlight-none"
          >
            {e.title}
            <span className="text-[11px] text-ink-faint">
              {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
