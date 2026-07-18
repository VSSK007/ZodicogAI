"use client";

/**
 * CelebrityExplorer — searchable, sign-filterable index of all 360 charts.
 * All data is client-side (lib/celebrities.ts); no API calls.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, Star4, type GlyphName } from "@/components/ui/glyphs";
import {
  CELEBRITIES,
  SIGN_ORDER,
  SIGN_LABEL,
  SIGN_COLOR,
  getCelebritiesBySign,
  type Celebrity,
} from "@/lib/celebrities";

const CATEGORY_COLORS: Record<string, string> = {
  Actor: "text-gold-bright",
  Actress: "text-pink-400",
  Musician: "text-violet-400",
  Athlete: "text-green-400",
  Entrepreneur: "text-blue-400",
  Politician: "text-red-400",
  Director: "text-orange-400",
  Artist: "text-yellow-400",
  Author: "text-teal-400",
  Comedian: "text-lime-400",
  Model: "text-rose-400",
  Scientist: "text-cyan-400",
  default: "text-ink-secondary",
};

function categoryColor(cat: string) {
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (cat.includes(key)) return CATEGORY_COLORS[key];
  }
  return CATEGORY_COLORS.default;
}

function CelebCard({ celeb }: { celeb: Celebrity }) {
  const color = SIGN_COLOR[celeb.sign];
  return (
    <Link
      href={`/celebrities/${celeb.slug}`}
      className="group relative rounded-card bg-white/[0.03] border border-hairline p-4 transition-all duration-200 hover:border-hairline-accent hover:bg-white/[0.05] hover:-translate-y-0.5 tap-highlight-none overflow-hidden"
    >
      {/* Sign glyph watermark */}
      <span
        className="absolute -top-1.5 -right-1.5 opacity-[0.16] transition-opacity duration-200 group-hover:opacity-40"
        style={{ color }}
        aria-hidden="true"
      >
        <Glyph name={celeb.sign as GlyphName} size={44} strokeWidth={1.2} />
      </span>

      <p className="relative font-display font-extrabold text-[14.5px] tracking-[-0.01em] text-ink leading-snug pr-6">
        {celeb.name}
      </p>
      <p className={`relative text-xs mt-1.5 font-medium ${categoryColor(celeb.category)}`}>
        {celeb.category}
      </p>
      <p className="relative text-[11px] text-ink-muted mt-0.5 truncate">
        {SIGN_LABEL[celeb.sign]} · {celeb.nationality}
      </p>
    </Link>
  );
}

const GRID = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3";

export default function CelebrityExplorer() {
  const [query, setQuery] = useState("");
  const [sign, setSign] = useState<string>("all");

  const filtering = query.trim().length > 0 || sign !== "all";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CELEBRITIES.filter(
      (c) =>
        (sign === "all" || c.sign === sign) &&
        (!q ||
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.nationality.toLowerCase().includes(q)),
    );
  }, [query, sign]);

  return (
    <main className="min-h-screen pt-10 md:pt-16 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-10 text-center">
        <Eyebrow className="justify-center">Celebrity charts</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink text-balance">
          The stars, studied.
        </h1>
        <p className="mt-4 text-ink-secondary text-lg max-w-2xl mx-auto">
          360 global celebrities — their zodiac energy, life path number, aura
          colour, and full astrological profile.
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-6 mb-10 space-y-4">
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink-muted" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 360 stars — name, craft, or country"
            aria-label="Search celebrities"
            className="w-full bg-surface-raised border border-hairline rounded-full pl-11 pr-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-hairline-accent transition-colors"
          />
        </div>

        {/* Sign filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none justify-start md:justify-center md:flex-wrap px-0.5 py-1">
          <button
            onClick={() => setSign("all")}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors tap-highlight-none ${
              sign === "all"
                ? "border-hairline-gold bg-gold/10 text-gold-bright"
                : "border-hairline text-ink-muted hover:text-ink-secondary hover:border-hairline-strong"
            }`}
          >
            <Star4 size={9} />
            All signs
          </button>
          {SIGN_ORDER.map((s) => {
            const active = sign === s;
            const color = SIGN_COLOR[s];
            return (
              <button
                key={s}
                onClick={() => setSign(active ? "all" : s)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors tap-highlight-none ${
                  active
                    ? "text-ink"
                    : "border-hairline text-ink-muted hover:text-ink-secondary hover:border-hairline-strong"
                }`}
                style={active ? { borderColor: `${color}66`, backgroundColor: `${color}1f`, color } : undefined}
              >
                <Glyph name={s as GlyphName} size={12} strokeWidth={1.8} />
                {SIGN_LABEL[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {filtering ? (
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs text-ink-muted mb-4 tracking-[0.08em] uppercase font-semibold">
            {results.length} {results.length === 1 ? "star" : "stars"} found
          </p>
          {results.length > 0 ? (
            <div className={GRID}>
              {results.map((c) => (
                <CelebCard key={c.slug} celeb={c} />
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-hairline py-16 text-center">
              <Star4 size={14} className="text-ink-faint mx-auto" />
              <p className="mt-3 text-sm text-ink-muted">
                No stars match &ldquo;{query}&rdquo;
                {sign !== "all" && ` in ${SIGN_LABEL[sign]}`}.
              </p>
              <button
                onClick={() => { setQuery(""); setSign("all"); }}
                className="mt-4 text-sm font-semibold text-accent-bright hover:text-gold-bright transition-colors tap-highlight-none"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 space-y-14">
          {SIGN_ORDER.map((s) => {
            const celebs = getCelebritiesBySign(s);
            const color = SIGN_COLOR[s];
            return (
              <section key={s} id={s}>
                {/* Sign header */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className="size-10 rounded-card flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${color}1a`, borderColor: `${color}40`, color }}
                  >
                    <Glyph name={s as GlyphName} size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-lg tracking-[-0.02em]" style={{ color }}>
                      {SIGN_LABEL[s]}
                    </h2>
                    <p className="text-[11px] text-ink-muted">{celebs.length} celebrities</p>
                  </div>
                  <div
                    className="flex-1 h-px ml-2"
                    style={{ background: `linear-gradient(to right, ${color}30, transparent)` }}
                  />
                </div>

                <div className={GRID}>
                  {celebs.map((c) => (
                    <CelebCard key={c.slug} celeb={c} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
