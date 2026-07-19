import type { Metadata } from "next";
import Link from "next/link";
import { API } from "@/lib/api";
import { SIGN_META, ELEMENT_COLOR } from "@/lib/zodiac";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Regenerate once per day — the backend cache is already date-scoped, this
// just keeps the static page in step with it.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Daily Horoscope — All 12 Zodiac Signs | ZodicogAI",
  description: "Today's horoscope for every zodiac sign — love, career, energy, and luck scores, computed daily and explained by AI.",
  keywords: "daily horoscope, today's horoscope, zodiac horoscope, daily zodiac reading",
};

const SIGNS = Object.keys(SIGN_META);

interface HoroscopeResult {
  sign: string;
  date: string;
  lucky_number: number;
  scores: { love: number; career: number; energy: number; luck: number; overall: number };
  article: { reading: string; focus_area: string; advice: string };
}

async function fetchHoroscope(sign: string): Promise<HoroscopeResult | null> {
  try {
    const res = await fetch(`${API}/horoscope/${sign}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as HoroscopeResult;
  } catch {
    return null;
  }
}

export default async function HoroscopeIndexPage() {
  const results = await Promise.all(SIGNS.map((s) => fetchHoroscope(s.toLowerCase())));

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <Eyebrow className="justify-center">Today · {today}</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink">
          Daily horoscope
        </h1>
        <p className="mt-3.5 text-ink-secondary max-w-xl mx-auto">
          Love, career, energy, and luck — computed fresh every day for all 12 signs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {SIGNS.map((sign, i) => {
          const meta = SIGN_META[sign];
          const result = results[i];
          const color = ELEMENT_COLOR[meta.element];
          return (
            <Link
              key={sign}
              href={`/horoscope/${sign.toLowerCase()}`}
              className="group relative rounded-card border border-hairline bg-white/[0.02] p-5 overflow-hidden transition-all duration-200 hover:border-hairline-gold hover:-translate-y-0.5 tap-highlight-none"
            >
              <span
                className="absolute -top-2 -right-2 opacity-[0.14] transition-opacity duration-200 group-hover:opacity-35"
                style={{ color }}
                aria-hidden="true"
              >
                <Glyph name={meta.glyph as GlyphName} size={48} strokeWidth={1.2} />
              </span>

              <div className="relative flex items-center justify-between mb-3">
                <p className="font-display font-extrabold text-[16px] tracking-[-0.01em] text-ink">{sign}</p>
                {result && (
                  <span className="font-mono text-lg font-bold text-gold-bright tabular-nums">
                    {result.scores.overall}
                  </span>
                )}
              </div>

              {result ? (
                <p className="relative text-[13px] text-ink-secondary leading-relaxed line-clamp-3">
                  {result.article.reading}
                </p>
              ) : (
                <p className="relative text-[13px] text-ink-muted italic">Reading unavailable — try again shortly.</p>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
