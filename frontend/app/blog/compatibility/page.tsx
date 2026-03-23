import type { Metadata } from "next";
import Link from "next/link";
import { MBTI_DATA, ALL_TYPES, ROLE_COLOR } from "@/lib/mbti-data";

export const metadata: Metadata = {
  title: "Compatibility Guides — Zodiac & MBTI | ZodicogAI",
  description: "In-depth compatibility guides for all 12 zodiac signs and 16 MBTI types. Discover who you connect best with and why.",
  keywords: "zodiac compatibility, MBTI compatibility, relationship compatibility, astrology compatibility",
};

const SIGNS = [
  { slug: "aries",       symbol: "♈", name: "Aries",       element: "Fire" },
  { slug: "taurus",      symbol: "♉", name: "Taurus",      element: "Earth" },
  { slug: "gemini",      symbol: "♊", name: "Gemini",      element: "Air" },
  { slug: "cancer",      symbol: "♋", name: "Cancer",      element: "Water" },
  { slug: "leo",         symbol: "♌", name: "Leo",         element: "Fire" },
  { slug: "virgo",       symbol: "♍", name: "Virgo",       element: "Earth" },
  { slug: "libra",       symbol: "♎", name: "Libra",       element: "Air" },
  { slug: "scorpio",     symbol: "♏", name: "Scorpio",     element: "Water" },
  { slug: "sagittarius", symbol: "♐", name: "Sagittarius", element: "Fire" },
  { slug: "capricorn",   symbol: "♑", name: "Capricorn",   element: "Earth" },
  { slug: "aquarius",    symbol: "♒", name: "Aquarius",    element: "Air" },
  { slug: "pisces",      symbol: "♓", name: "Pisces",      element: "Water" },
];

const EL_COLOR: Record<string, string> = {
  Fire: "#f59e0b", Earth: "#a3a37a", Air: "#7dd3fc", Water: "#818cf8",
};

export default function CompatibilityIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-5xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">Compatibility</span>
      </nav>
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Compatibility Guides</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Compatibility Guides</h1>
        <p className="text-zinc-400 mt-1 text-sm">Zodiac × Zodiac and MBTI × MBTI compatibility deep-dives</p>
      </div>

      <section className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">By Zodiac Sign</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SIGNS.map(s => {
            const c = EL_COLOR[s.element];
            return (
              <Link key={s.slug} href={`/blog/compatibility/zodiac/${s.slug}`}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{s.symbol}</span>
                  <span className="font-semibold text-sm group-hover:text-white transition-colors">{s.name}</span>
                </div>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}25` }}>{s.element}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">By MBTI Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALL_TYPES.map(type => {
            const d = MBTI_DATA[type];
            const c = ROLE_COLOR[d.role];
            return (
              <Link key={type} href={`/blog/compatibility/mbti/${type.toLowerCase()}`}
                className="rounded-xl border p-4 hover:opacity-90 transition-opacity group"
                style={{ borderColor: `${c}20`, background: `${c}08` }}>
                <div className="font-mono font-black text-lg mb-0.5" style={{ color: c }}>{type}</div>
                <div className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">{d.nickname}</div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
