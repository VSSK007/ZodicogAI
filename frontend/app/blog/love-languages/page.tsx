import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The 5 Love Languages Explained — Guide | ZodicogAI",
  description: "Understand all 5 love languages: Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, and Physical Touch. Deep guides on each.",
  keywords: "love languages, words of affirmation, acts of service, quality time, physical touch, receiving gifts",
};

const LOVE_LANGS = [
  { slug: "words-of-affirmation", label: "Words of Affirmation", emoji: "💬", desc: "Verbal praise, appreciation, and encouragement" },
  { slug: "acts-of-service",      label: "Acts of Service",       emoji: "🛠", desc: "Actions that show love through helpful deeds" },
  { slug: "receiving-gifts",      label: "Receiving Gifts",       emoji: "🎁", desc: "Thoughtful presents as symbols of love" },
  { slug: "quality-time",         label: "Quality Time",          emoji: "⏳", desc: "Undivided attention and meaningful presence" },
  { slug: "physical-touch",       label: "Physical Touch",        emoji: "🤝", desc: "Physical affection and closeness" },
];

export default function LoveLangIndexPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-4xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">Love Languages</span>
      </nav>
      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Relationship Guides</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">The 5 Love Languages</h1>
        <p className="text-zinc-400 mt-1 text-sm">Dr. Gary Chapman&apos;s framework for how people give and receive love</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LOVE_LANGS.map(l => (
          <Link key={l.slug} href={`/blog/love-languages/${l.slug}`}
            className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 hover:bg-amber-500/[0.07] transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{l.emoji}</span>
              <span className="font-semibold text-sm group-hover:text-amber-300 transition-colors">{l.label}</span>
            </div>
            <p className="text-xs text-zinc-500">{l.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
