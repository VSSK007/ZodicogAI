/**
 * /r/[id] — read-only view of a shared reading.
 * Renders the stored payload generically: strings become narrative sections,
 * numbers become stat chips, string lists become pills, objects nest.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMd } from "@/lib/renderMd";
import { Star4 } from "@/components/ui/glyphs";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface SharedResult {
  id: string;
  analysis_type: string;
  title: string;
  payload: Record<string, unknown>;
  created_at: string;
}

async function fetchResult(id: string): Promise<SharedResult | null> {
  try {
    const res = await fetch(`${API}/results/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SharedResult;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const result = await fetchResult(id);
  const title = result?.title
    ? `${result.title} — ZodicogAI reading`
    : "Shared reading — ZodicogAI";
  return {
    title,
    description: "An explainable compatibility reading, scored by 18 deterministic engines.",
  };
}

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

function labelize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const SKIP_KEYS = new Set(["rgb", "hex", "power_hex"]);

function Value({ k, v, depth = 0 }: { k: string; v: unknown; depth?: number }) {
  if (v == null || SKIP_KEYS.has(k)) return null;

  if (typeof v === "string") {
    if (!v.trim() || v === "—") return null;
    return (
      <div className="border-l-2 border-accent/50 pl-4">
        <p className="text-xs text-ink-muted uppercase tracking-wider mb-1">{labelize(k)}</p>
        <p className="text-sm text-ink-secondary leading-relaxed">{renderMd(v)}</p>
      </div>
    );
  }

  if (typeof v === "number") {
    return (
      <div className="inline-flex items-baseline gap-2 rounded-control border border-hairline bg-white/[0.03] px-3.5 py-2 mr-2 mb-2">
        <span className="text-xs text-ink-muted">{labelize(k)}</span>
        <span className="font-mono text-sm text-gold-bright tabular-nums">
          {Number.isInteger(v) ? v : v.toFixed(1)}
        </span>
      </div>
    );
  }

  if (Array.isArray(v)) {
    const strings = v.filter((x): x is string => typeof x === "string" && !!x.trim() && x !== "—");
    if (strings.length === 0) return null;
    return (
      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wider mb-2">{labelize(k)}</p>
        <div className="flex flex-wrap gap-1.5">
          {strings.map((s) => (
            <span key={s} className="text-xs px-3 py-1 rounded-full bg-white/8 text-ink-secondary border border-hairline">
              {renderMd(s)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (typeof v === "object" && depth < 2) {
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.length === 0) return null;
    return (
      <div className="rounded-card border border-hairline bg-white/[0.02] p-5 space-y-4">
        <p className="font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-gold">
          {labelize(k)}
        </p>
        {entries.map(([ck, cv]) => (
          <Value key={ck} k={ck} v={cv} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return null;
}

export default async function SharedReadingPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await fetchResult(id);
  if (!result) notFound();

  const typeLabel = TYPE_LABELS[result.analysis_type] ?? labelize(result.analysis_type);
  const date = new Date(result.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main className="min-h-screen px-4 md:px-6 py-10 md:py-16 max-w-3xl mx-auto">
      <header className="mb-9">
        <div className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-gold">
          <Star4 size={11} />
          Shared reading
        </div>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-[38px] leading-[1.1] text-ink text-balance">
          {result.title || typeLabel}
        </h1>
        <p className="mt-2.5 text-sm text-ink-muted">
          {typeLabel} · {date}
        </p>
      </header>

      <div className="space-y-5">
        {Object.entries(result.payload).map(([k, v]) => (
          <Value key={k} k={k} v={v} />
        ))}
      </div>

      <div className="mt-12 rounded-card border border-hairline-accent bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 text-center">
        <p className="font-display font-extrabold text-lg tracking-[-0.02em] text-ink">
          Get your own reading
        </p>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Scored by 18 deterministic engines. Free, no sign-up, instant.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200"
        >
          Start on ZodicogAI
        </Link>
      </div>
    </main>
  );
}
