import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Numerology Life Path Numbers — Complete Guide | ZodicogAI",
  description: "Explore all numerology life path numbers 1-9 plus master numbers 11, 22, 33. Discover what your life path number reveals about your personality, love, and purpose.",
  keywords: "numerology life path, life path number meanings, master numbers, numerology guide",
};

const NUMBERS = [
  { n: "1", label: "The Leader",       theme: "Independence & Ambition" },
  { n: "2", label: "The Mediator",     theme: "Harmony & Partnership" },
  { n: "3", label: "The Communicator", theme: "Creativity & Expression" },
  { n: "4", label: "The Builder",      theme: "Discipline & Foundation" },
  { n: "5", label: "The Explorer",     theme: "Freedom & Change" },
  { n: "6", label: "The Nurturer",     theme: "Responsibility & Love" },
  { n: "7", label: "The Seeker",       theme: "Wisdom & Introspection" },
  { n: "8", label: "The Powerhouse",   theme: "Ambition & Material Mastery" },
  { n: "9", label: "The Humanitarian", theme: "Compassion & Completion" },
  { n: "11", label: "Master Intuitive", theme: "Spiritual Illumination", master: true },
  { n: "22", label: "Master Builder",   theme: "Manifesting the Impossible", master: true },
  { n: "33", label: "Master Teacher",   theme: "Healing & Unconditional Love", master: true },
];

export default function NumerologyBlogIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-4xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">Numerology</span>
      </nav>
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Numerology Guides</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Life Path Numbers</h1>
        <p className="text-zinc-400 mt-1 text-sm">9 core numbers + 3 master numbers — what your life path reveals</p>
      </div>

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Core Numbers (1–9)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NUMBERS.filter(n => !n.master).map(n => (
            <Link key={n.n} href={`/blog/numerology/${n.n}`}
              className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 hover:bg-amber-500/[0.07] transition-colors group">
              <div className="text-3xl font-black text-amber-400 mb-1">{n.n}</div>
              <div className="font-semibold text-sm group-hover:text-white transition-colors">{n.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{n.theme}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Master Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NUMBERS.filter(n => n.master).map(n => (
            <Link key={n.n} href={`/blog/numerology/${n.n}`}
              className="rounded-xl border border-purple-500/25 bg-purple-500/[0.05] p-4 hover:bg-purple-500/[0.09] transition-colors group">
              <div className="text-3xl font-black text-purple-400 mb-1">{n.n}</div>
              <div className="font-semibold text-sm text-purple-300 group-hover:text-white transition-colors">{n.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{n.theme}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
