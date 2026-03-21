import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MBTI_DATA, ALL_TYPES, ROLE_COLOR } from "@/lib/mbti-data";

export async function generateStaticParams() {
  return ALL_TYPES.map((type) => ({ type: type.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const key = type.toUpperCase();
  const data = MBTI_DATA[key];
  if (!data) return {};
  return {
    title: `${key} ${data.nickname} — Personality, Love & Career | ZodicogAI`,
    description: `Complete ${key} profile: personality traits, strengths, weaknesses, love style, best matches, and career fit. ${data.description.slice(0, 120)}...`,
    keywords: `${key} personality, ${key} MBTI, ${key} in love, ${key} relationships, ${key} career, ${data.nickname}`,
    openGraph: {
      title: `${key} — ${data.nickname} | ZodicogAI`,
      description: data.description.slice(0, 160),
      url: `https://zodicogai.com/blog/mbti/${type}`,
      siteName: "ZodicogAI",
      type: "article",
    },
  };
}

export default async function MbtiBlogPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const key = type.toUpperCase();
  const data = MBTI_DATA[key];
  if (!data) notFound();

  const color = ROLE_COLOR[data.role] ?? "#f59e0b";

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">{key}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {key}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{data.nickname}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">{data.role} · {key}</p>
          </div>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{data.description}</p>
      </div>

      <div className="space-y-8">
        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ListCard title="Strengths" items={data.strengths} color="#22c55e" />
          <ListCard title="Weaknesses" items={data.weaknesses} color="#f87171" />
        </div>

        {/* In Love */}
        <Section title="In Love" text={data.in_love} />

        {/* As a Friend */}
        <Section title="As a Friend" text={data.as_a_friend} />

        {/* Career */}
        <Section title="Career & Fit" text={data.career} />

        {/* Best Matches */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Best MBTI Matches</h2>
          <div className="flex flex-wrap gap-2">
            {data.best_matches.map(m => (
              <Link key={m} href={`/blog/mbti/${m.toLowerCase()}`}
                className="text-sm px-3 py-1.5 rounded-full font-mono font-semibold transition-colors"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {m}
              </Link>
            ))}
          </div>
        </div>

        {/* Famous */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Famous {key}s</h2>
          <div className="flex flex-wrap gap-2">
            {data.famous.map(p => (
              <span key={p} className="text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
        <p className="text-zinc-300 mb-4">Get your full {key} behavioral analysis combined with your zodiac sign</p>
        <Link href="/analyze/hybrid"
          className="inline-block px-6 py-2.5 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
          Try Your Full Self Analysis →
        </Link>
      </div>

      {/* All types grid */}
      <div className="mt-10">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">All 16 Types</p>
        <div className="grid grid-cols-4 gap-2">
          {ALL_TYPES.map(t => {
            const c = ROLE_COLOR[MBTI_DATA[t].role];
            return (
              <Link key={t} href={`/blog/mbti/${t.toLowerCase()}`}
                className={`text-center py-2 rounded-lg text-xs font-mono font-semibold transition-colors ${t === key ? "ring-1" : "opacity-60 hover:opacity-100"}`}
                style={{ background: `${c}12`, color: c, border: `1px solid ${c}25` }}>
                {t}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-l-2 border-amber-500/40 pl-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">{title}</h2>
      <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function ListCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">{title}</h2>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
            <span style={{ color }} className="mt-0.5 shrink-0">✦</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
