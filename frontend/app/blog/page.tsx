import type { Metadata } from "next";
import Link from "next/link";
import { ALL_TYPES, MBTI_DATA, ROLE_COLOR } from "@/lib/mbti-data";

export const metadata: Metadata = {
  title: "Blog — Zodiac, MBTI & Relationship Guides | ZodicogAI",
  description: "Explore in-depth guides on all 12 zodiac signs, 16 MBTI personality types, love languages, compatibility, and relationship intelligence.",
  keywords: "zodiac guide, MBTI personality guide, relationship blog, astrology articles, compatibility blog",
  openGraph: {
    title: "Blog | ZodicogAI",
    description: "In-depth guides on zodiac signs, MBTI types, and relationship intelligence.",
    url: "https://zodicogai.com/blog",
    siteName: "ZodicogAI",
    type: "website",
  },
};

const SIGNS = [
  { slug: "aries", symbol: "♈", name: "Aries", dates: "Mar 21 – Apr 19", element: "Fire" },
  { slug: "taurus", symbol: "♉", name: "Taurus", dates: "Apr 20 – May 20", element: "Earth" },
  { slug: "gemini", symbol: "♊", name: "Gemini", dates: "May 21 – Jun 20", element: "Air" },
  { slug: "cancer", symbol: "♋", name: "Cancer", dates: "Jun 21 – Jul 22", element: "Water" },
  { slug: "leo", symbol: "♌", name: "Leo", dates: "Jul 23 – Aug 22", element: "Fire" },
  { slug: "virgo", symbol: "♍", name: "Virgo", dates: "Aug 23 – Sep 22", element: "Earth" },
  { slug: "libra", symbol: "♎", name: "Libra", dates: "Sep 23 – Oct 22", element: "Air" },
  { slug: "scorpio", symbol: "♏", name: "Scorpio", dates: "Oct 23 – Nov 21", element: "Water" },
  { slug: "sagittarius", symbol: "♐", name: "Sagittarius", dates: "Nov 22 – Dec 21", element: "Fire" },
  { slug: "capricorn", symbol: "♑", name: "Capricorn", dates: "Dec 22 – Jan 19", element: "Earth" },
  { slug: "aquarius", symbol: "♒", name: "Aquarius", dates: "Jan 20 – Feb 18", element: "Air" },
  { slug: "pisces", symbol: "♓", name: "Pisces", dates: "Feb 19 – Mar 20", element: "Water" },
];

const EL_COLOR: Record<string, string> = {
  Fire: "#f59e0b", Earth: "#a3a37a", Air: "#7dd3fc", Water: "#818cf8",
};

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Guides & Articles</h1>
        <p className="text-zinc-400 mt-1 text-sm">Zodiac profiles, MBTI deep-dives, and relationship intelligence</p>
      </div>

      {/* Zodiac Signs */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">12 Zodiac Signs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SIGNS.map(s => {
            const c = EL_COLOR[s.element];
            return (
              <Link key={s.slug} href={`/blog/zodiac/${s.slug}`}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{s.symbol}</span>
                  <span className="font-semibold text-sm group-hover:text-white transition-colors">{s.name}</span>
                </div>
                <p className="text-[11px] text-zinc-500">{s.dates}</p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}25` }}>{s.element}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MBTI Types */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">16 MBTI Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_TYPES.map(type => {
            const d = MBTI_DATA[type];
            const c = ROLE_COLOR[d.role];
            return (
              <Link key={type} href={`/blog/mbti/${type.toLowerCase()}`}
                className="rounded-xl border p-4 hover:opacity-100 transition-opacity group"
                style={{ borderColor: `${c}20`, background: `${c}08` }}>
                <div className="font-mono font-black text-lg mb-0.5" style={{ color: c }}>{type}</div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">{d.nickname}</div>
                <div className="text-[10px] text-zinc-600 mt-1">{d.role}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* New guide sections */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Relationship Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { href: "/blog/love-languages", title: "The 5 Love Languages", desc: "Words, Acts, Gifts, Time, Touch — deep guides on each", emoji: "💬" },
            { href: "/blog/love-styles",    title: "The 6 Love Styles",    desc: "Eros, Storge, Pragma, Ludus, Mania, Agape explained", emoji: "🎭" },
            { href: "/blog/numerology",     title: "Numerology Life Paths", desc: "Life path numbers 1–9 + master numbers 11, 22, 33",  emoji: "🔢" },
            { href: "/blog/sextrology",     title: "Sextrology Guide",      desc: "How zodiac & MBTI shape intimacy and desire",        emoji: "✦" },
            { href: "/blog/compatibility",  title: "Compatibility Guides",  desc: "Zodiac × Zodiac and MBTI × MBTI deep-dives",         emoji: "♥" },
          ].map(g => (
            <Link key={g.href} href={g.href}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-colors group flex items-start gap-3">
              <span className="text-xl mt-0.5">{g.emoji}</span>
              <div>
                <p className="font-semibold text-sm group-hover:text-white transition-colors">{g.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">FAQ</h2>
        <Link href="/blog/faq"
          className="block rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-5 hover:bg-amber-500/[0.07] transition-colors">
          <p className="font-semibold text-sm text-white mb-1">Frequently Asked Questions</p>
          <p className="text-xs text-zinc-400">Answers about zodiac compatibility, MBTI, love languages, numerology, sextrology, and more →</p>
        </Link>
      </section>
    </main>
  );
}
