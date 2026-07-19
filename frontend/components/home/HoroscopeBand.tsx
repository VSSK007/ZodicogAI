"use client";

/**
 * HoroscopeBand — homepage teaser for the daily horoscope section.
 * Zero API calls (just today's date + static sign glyphs) so it stays fast;
 * clicking through hits the real per-sign readings.
 */
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Glyph, ZODIAC_GLYPHS } from "@/components/ui/glyphs";

export default function HoroscopeBand() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <section className="max-w-6xl mx-auto px-6 pt-24">
      <RevealOnScroll>
        <div className="rounded-card border border-hairline-gold bg-gold/[0.04] p-7 md:p-10">
          <div className="md:flex md:items-end md:justify-between gap-8">
            <SectionHeader
              eyebrow={`Today · ${today}`}
              title="Your daily horoscope."
              sub="Love, career, energy, and luck — computed fresh every day for all 12 signs."
            />
            <Link
              href="/horoscope"
              className="mt-6 md:mt-0 shrink-0 inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105 transition-all tap-highlight-none"
            >
              See today&apos;s readings
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {ZODIAC_GLYPHS.map((sign) => (
              <Link
                key={sign}
                href={`/horoscope/${sign}`}
                className="flex size-11 items-center justify-center rounded-full border border-hairline bg-white/[0.03] text-ink-secondary hover:border-hairline-gold hover:text-gold-bright transition-colors tap-highlight-none"
                aria-label={`${sign} horoscope today`}
              >
                <Glyph name={sign} size={17} strokeWidth={1.6} />
              </Link>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
