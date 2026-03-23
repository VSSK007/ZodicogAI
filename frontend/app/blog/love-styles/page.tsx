import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The 6 Love Styles Explained — Guide | ZodicogAI",
  description: "Explore all 6 love styles from John Lee's color wheel of love: Eros, Storge, Pragma, Ludus, Mania, and Agape.",
  keywords: "love styles, eros, storge, pragma, ludus, mania, agape, color wheel of love",
};

const STYLES = [
  { slug: "eros",   label: "Eros",   emoji: "🔥", desc: "Passionate, romantic, attraction-driven love", color: "#f87171" },
  { slug: "storge", label: "Storge", emoji: "🌿", desc: "Friendship-based, slow-growing love",          color: "#34d399" },
  { slug: "pragma", label: "Pragma", emoji: "⚖️", desc: "Practical, compatible, long-term love",        color: "#60a5fa" },
  { slug: "ludus",  label: "Ludus",  emoji: "🎲", desc: "Playful, flirtatious, non-committal love",     color: "#fbbf24" },
  { slug: "mania",  label: "Mania",  emoji: "🌪", desc: "Obsessive, intense, jealousy-driven love",     color: "#a78bfa" },
  { slug: "agape",  label: "Agape",  emoji: "✨", desc: "Selfless, unconditional, giving love",          color: "#fb923c" },
];

export default function LoveStyleIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-4xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">Love Styles</span>
      </nav>
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Relationship Guides</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">The 6 Love Styles</h1>
        <p className="text-zinc-400 mt-1 text-sm">John Alan Lee&apos;s color wheel theory of love (1973)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STYLES.map(s => (
          <Link key={s.slug} href={`/blog/love-styles/${s.slug}`}
            className="rounded-xl border p-5 hover:opacity-90 transition-opacity group"
            style={{ borderColor: `${s.color}25`, background: `${s.color}06` }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{s.emoji}</span>
              <span className="font-semibold text-sm group-hover:text-white transition-colors" style={{ color: s.color }}>{s.label}</span>
            </div>
            <p className="text-xs text-zinc-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
