"use client";

/**
 * /readings — full localStorage reading history (the homepage teaser only
 * shows 5). Client-only: nothing here is server-known, it's per-browser.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Star4 } from "@/components/ui/glyphs";
import { getHistory, type ReadingEntry } from "@/lib/history";

const TYPE_LABELS: Record<string, string> = {
  hybrid_analysis: "Behavioral Profile",
  compatibility_analysis: "Compatibility",
  emotional_compatibility: "Emotional Compatibility",
  romantic_compatibility: "Romantic Compatibility",
  sextrology_analysis: "Sextrology",
  sextrology_solo_analysis: "Sextrology",
  love_style_analysis: "Love Style",
  love_language_analysis: "Love Language",
  full_relationship_intelligence: "Full Synastry Report",
  zodiac_article: "Zodiac Deep-Dive",
  color_analysis: "Aura Colors",
  color_pair_analysis: "Aura Colors",
  numerology_analysis: "Numerology",
  numerology_pair_analysis: "Numerology",
};

const HISTORY_KEY = "zodicog.readings";

export default function ReadingsPage() {
  const [entries, setEntries] = useState<ReadingEntry[] | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  function clearAll() {
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Storage unavailable — nothing to clear.
    }
    setEntries([]);
  }

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Eyebrow>Your history</Eyebrow>
          <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink">
            Your readings
          </h1>
          <p className="mt-3 text-ink-secondary max-w-md">
            Saved to this browser only — your last 10 readings.
          </p>
        </div>
        {entries && entries.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-control border border-hairline px-4 py-2 text-sm font-semibold text-ink-muted hover:text-red-400 hover:border-red-500/30 transition-colors tap-highlight-none"
          >
            <Trash2 className="size-3.5" />
            Clear history
          </button>
        )}
      </div>

      {entries === null ? null : entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-hairline py-16 text-center">
          <Star4 size={14} className="text-ink-faint mx-auto" />
          <p className="mt-3 text-sm text-ink-muted">No readings yet.</p>
          <Link
            href="/analyze/hybrid"
            className="mt-4 inline-block text-sm font-semibold text-accent-bright hover:text-gold-bright transition-colors"
          >
            Get your first reading →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((e) => (
            <Link
              key={e.id}
              href={`/r/${e.id}`}
              className="group flex items-center justify-between gap-4 rounded-card border border-hairline bg-white/[0.02] px-5 py-4 transition-colors hover:border-hairline-accent tap-highlight-none"
            >
              <div className="min-w-0">
                <p className="font-display font-extrabold text-[15px] tracking-[-0.01em] text-ink truncate">
                  {e.title}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {TYPE_LABELS[e.type] ?? e.type.replace(/_/g, " ")}
                  <span className="mx-1.5 text-ink-faint">·</span>
                  {new Date(e.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <span className="shrink-0 text-ink-faint transition-all group-hover:text-accent-bright group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
