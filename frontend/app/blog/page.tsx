import type { Metadata } from "next";
import Link from "next/link";
import { Hash, MessageCircle } from "lucide-react";
import { ALL_TYPES, MBTI_DATA, ROLE_COLOR } from "@/lib/mbti-data";
import { SIGN_COLOR } from "@/lib/celebrities";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, Star4, type GlyphName } from "@/components/ui/glyphs";

export const metadata: Metadata = {
  title: "The Almanac — Zodiac, MBTI & Relationship Guides | ZodicogAI",
  description: "Explore in-depth guides on all 12 zodiac signs, 16 MBTI personality types, love languages, compatibility, and relationship intelligence.",
  keywords: "zodiac guide, MBTI personality guide, relationship blog, astrology articles, compatibility blog",
  openGraph: {
    title: "The Almanac | ZodicogAI",
    description: "In-depth guides on zodiac signs, MBTI types, and relationship intelligence.",
    url: "https://zodicogai.com/blog",
    siteName: "ZodicogAI",
    type: "website",
  },
};

const SIGNS: { slug: GlyphName; name: string; dates: string; element: string }[] = [
  { slug: "aries", name: "Aries", dates: "Mar 21 – Apr 19", element: "Fire" },
  { slug: "taurus", name: "Taurus", dates: "Apr 20 – May 20", element: "Earth" },
  { slug: "gemini", name: "Gemini", dates: "May 21 – Jun 20", element: "Air" },
  { slug: "cancer", name: "Cancer", dates: "Jun 21 – Jul 22", element: "Water" },
  { slug: "leo", name: "Leo", dates: "Jul 23 – Aug 22", element: "Fire" },
  { slug: "virgo", name: "Virgo", dates: "Aug 23 – Sep 22", element: "Earth" },
  { slug: "libra", name: "Libra", dates: "Sep 23 – Oct 22", element: "Air" },
  { slug: "scorpio", name: "Scorpio", dates: "Oct 23 – Nov 21", element: "Water" },
  { slug: "sagittarius", name: "Sagittarius", dates: "Nov 22 – Dec 21", element: "Fire" },
  { slug: "capricorn", name: "Capricorn", dates: "Dec 22 – Jan 19", element: "Earth" },
  { slug: "aquarius", name: "Aquarius", dates: "Jan 20 – Feb 18", element: "Air" },
  { slug: "pisces", name: "Pisces", dates: "Feb 19 – Mar 20", element: "Water" },
];

const ANCHORS = [
  { href: "#zodiac", label: "Zodiac" },
  { href: "#mbti", label: "MBTI" },
  { href: "#guides", label: "Guides" },
  { href: "#faq", label: "FAQ" },
];

const GUIDES = [
  { href: "/blog/love-languages", title: "The 5 Love Languages", desc: "Words, Acts, Gifts, Time, Touch — a deep guide on each channel and how gaps between partners play out.", icon: <MessageCircle className="size-[18px]" /> },
  { href: "/blog/love-styles", title: "The 6 Love Styles", desc: "Eros, Storge, Pragma, Ludus, Mania, Agape — Lee's typology of how people actually love.", icon: <Glyph name="heart" size={18} /> },
  { href: "/blog/numerology", title: "Numerology Life Paths", desc: "Life path numbers 1–9 plus the master numbers 11, 22, and 33 — meanings, matches, shadows.", icon: <Hash className="size-[18px]" /> },
  { href: "/blog/sextrology", title: "The Sextrology Guide", desc: "How zodiac and MBTI shape intimacy, desire, pacing, and long-term fire.", icon: <Glyph name="mars" size={18} /> },
  { href: "/blog/compatibility", title: "Compatibility Guides", desc: "Zodiac × Zodiac and MBTI × MBTI deep-dives — every pairing, scored and explained.", icon: <Glyph name="venus" size={18} /> },
];

function SectionLabel({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28 mb-5 flex items-center gap-3.5">
      <span className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase text-ink-muted">
        <Star4 size={9} className="text-gold" />
        {children}
      </span>
      <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
    </div>
  );
}

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto">
      {/* Masthead */}
      <div className="mb-8 text-center">
        <Eyebrow className="justify-center">The Almanac</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink">
          Field notes on human nature.
        </h1>
        <p className="mt-4 text-ink-secondary text-lg max-w-xl mx-auto">
          Twelve signs, sixteen types, five languages, six styles — the frameworks
          behind every reading, written out in full.
        </p>
      </div>

      {/* Anchor chips */}
      <div className="sticky top-0 md:top-16 z-20 -mx-4 px-4 py-3 mb-10 bg-surface/85 backdrop-blur-md">
        <div className="flex justify-center gap-2">
          {ANCHORS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink-secondary hover:text-ink hover:border-hairline-accent transition-colors tap-highlight-none"
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>

      {/* Zodiac Signs */}
      <section className="mb-14">
        <SectionLabel id="zodiac">The 12 signs</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SIGNS.map((s) => {
            const c = SIGN_COLOR[s.slug];
            return (
              <Link
                key={s.slug}
                href={`/blog/zodiac/${s.slug}`}
                className="group relative rounded-card border border-hairline bg-white/[0.02] p-4 overflow-hidden transition-all duration-200 hover:border-hairline-accent hover:-translate-y-0.5 tap-highlight-none"
              >
                <span
                  className="absolute -top-2 -right-2 opacity-[0.16] transition-opacity duration-200 group-hover:opacity-40"
                  style={{ color: c }}
                  aria-hidden="true"
                >
                  <Glyph name={s.slug} size={52} strokeWidth={1.2} />
                </span>
                <p className="relative font-display font-extrabold text-[15.5px] tracking-[-0.01em] text-ink">
                  {s.name}
                </p>
                <p className="relative text-[11px] text-ink-muted mt-1">{s.dates}</p>
                <span
                  className="relative inline-block mt-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${c}16`, color: c, border: `1px solid ${c}30` }}
                >
                  {s.element}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MBTI Types */}
      <section className="mb-14">
        <SectionLabel id="mbti">The 16 types</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_TYPES.map((type) => {
            const d = MBTI_DATA[type];
            const c = ROLE_COLOR[d.role];
            return (
              <Link
                key={type}
                href={`/blog/mbti/${type.toLowerCase()}`}
                className="group relative rounded-card border border-hairline bg-white/[0.02] p-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 tap-highlight-none"
                style={{ borderColor: `${c}26` }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ background: `linear-gradient(90deg, ${c}90, transparent)` }}
                  aria-hidden="true"
                />
                <p className="font-mono font-bold text-lg tracking-tight" style={{ color: c }}>
                  {type}
                </p>
                <p className="text-xs text-ink-secondary mt-0.5 group-hover:text-ink transition-colors">
                  {d.nickname}
                </p>
                <p className="text-[10px] text-ink-muted mt-1">{d.role}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Relationship Guides */}
      <section className="mb-14">
        <SectionLabel id="guides">Relationship guides</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group rounded-card border border-hairline bg-white/[0.02] p-5 transition-all duration-200 hover:border-hairline-gold hover:-translate-y-0.5 flex items-start gap-4 tap-highlight-none"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-hairline bg-gold/5 text-gold-bright transition-colors group-hover:border-hairline-gold">
                {g.icon}
              </span>
              <span>
                <span className="block font-display font-extrabold text-[15px] tracking-[-0.01em] text-ink">
                  {g.title}
                </span>
                <span className="mt-1 block text-[13px] text-ink-secondary leading-relaxed">{g.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <SectionLabel id="faq">Questions</SectionLabel>
        <Link
          href="/blog/faq"
          className="group block rounded-card border border-hairline-gold bg-gold/[0.04] p-6 transition-colors hover:bg-gold/[0.07] tap-highlight-none"
        >
          <p className="font-display font-extrabold text-[16px] tracking-[-0.01em] text-ink mb-1">
            Frequently asked questions
          </p>
          <p className="text-[13.5px] text-ink-secondary">
            How the engines score, what the frameworks mean, and what happens to your
            data — answered plainly <span aria-hidden="true">→</span>
          </p>
        </Link>
      </section>
    </main>
  );
}
