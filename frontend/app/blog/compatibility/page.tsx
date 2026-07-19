import type { Metadata } from "next";
import Link from "next/link";
import { MBTI_DATA, ALL_TYPES, ROLE_COLOR } from "@/lib/mbti-data";
import { SIGN_COLOR } from "@/lib/celebrities";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, Star4, type GlyphName } from "@/components/ui/glyphs";
import { Breadcrumb } from "@/components/blog/editorial";

export const metadata: Metadata = {
  title: "Compatibility Guides — Zodiac & MBTI | ZodicogAI",
  description: "In-depth compatibility guides for all 12 zodiac signs and 16 MBTI types. Discover who you connect best with and why.",
  keywords: "zodiac compatibility, MBTI compatibility, relationship compatibility, astrology compatibility",
};

const SIGNS: { slug: GlyphName; name: string; element: string }[] = [
  { slug: "aries",       name: "Aries",       element: "Fire" },
  { slug: "taurus",      name: "Taurus",      element: "Earth" },
  { slug: "gemini",      name: "Gemini",      element: "Air" },
  { slug: "cancer",      name: "Cancer",      element: "Water" },
  { slug: "leo",         name: "Leo",         element: "Fire" },
  { slug: "virgo",       name: "Virgo",       element: "Earth" },
  { slug: "libra",       name: "Libra",       element: "Air" },
  { slug: "scorpio",     name: "Scorpio",     element: "Water" },
  { slug: "sagittarius", name: "Sagittarius", element: "Fire" },
  { slug: "capricorn",   name: "Capricorn",   element: "Earth" },
  { slug: "aquarius",    name: "Aquarius",    element: "Air" },
  { slug: "pisces",      name: "Pisces",      element: "Water" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3.5">
      <span className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
        <Star4 size={9} className="text-gold" />
        {children}
      </span>
      <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
    </div>
  );
}

export default function CompatibilityIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "Compatibility" }]} />
      <div className="mb-10">
        <Eyebrow>Compatibility guides</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl leading-[1.08] text-ink">
          Compatibility guides
        </h1>
        <p className="mt-2.5 text-ink-secondary">Zodiac × Zodiac and MBTI × MBTI compatibility deep-dives.</p>
      </div>

      <section className="mb-12">
        <SectionLabel>By zodiac sign</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SIGNS.map((s) => {
            const c = SIGN_COLOR[s.slug];
            return (
              <Link
                key={s.slug}
                href={`/blog/compatibility/zodiac/${s.slug}`}
                className="group relative rounded-card border border-hairline bg-white/[0.02] p-4 overflow-hidden transition-all duration-200 hover:border-hairline-accent hover:-translate-y-0.5 tap-highlight-none"
              >
                <span className="absolute -top-2 -right-2 opacity-[0.16] transition-opacity duration-200 group-hover:opacity-40" style={{ color: c }} aria-hidden="true">
                  <Glyph name={s.slug} size={44} strokeWidth={1.2} />
                </span>
                <p className="relative font-display font-extrabold text-[15px] tracking-[-0.01em] text-ink">{s.name}</p>
                <span className="relative inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${c}16`, color: c, border: `1px solid ${c}30` }}>
                  {s.element}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionLabel>By MBTI type</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_TYPES.map((type) => {
            const d = MBTI_DATA[type];
            const c = ROLE_COLOR[d.role];
            return (
              <Link
                key={type}
                href={`/blog/compatibility/mbti/${type.toLowerCase()}`}
                className="group relative rounded-card border border-hairline bg-white/[0.02] p-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 tap-highlight-none"
                style={{ borderColor: `${c}26` }}
              >
                <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, ${c}90, transparent)` }} aria-hidden="true" />
                <p className="font-mono font-bold text-lg tracking-tight" style={{ color: c }}>{type}</p>
                <p className="text-xs text-ink-secondary mt-0.5 group-hover:text-ink transition-colors">{d.nickname}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
