import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MBTI_DATA, ALL_TYPES, ROLE_COLOR } from "@/lib/mbti-data";
import { renderMd } from "@/lib/renderMd";
import { Breadcrumb, AmbientGlow, ArticleSection, ChipColumns, CtaBand } from "@/components/blog/editorial";

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
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={color} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: key }]} />

      {/* Editorial header */}
      <header className="mb-11">
        <div className="flex items-center gap-5 mb-5">
          <div className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card font-mono font-bold text-xl md:text-2xl"
            style={{ background: `${color}14`, color, border: `1px solid ${color}38` }}>
            {key}
          </div>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{data.nickname}</h1>
            <p className="text-ink-secondary mt-1.5">{data.role} <span className="text-ink-faint mx-1">·</span> {key}</p>
          </div>
        </div>
        <p className="text-ink-secondary text-[16px] leading-[1.75] max-w-prose">{renderMd(data.description)}</p>
      </header>

      <div className="space-y-8">
        {/* Strengths & Weaknesses */}
        <ChipColumns columns={[
          { title: "Strengths", items: data.strengths, color: "#4ade80" },
          { title: "Weaknesses", items: data.weaknesses, color: "#f87171" },
        ]} />

        {/* In Love */}
        <ArticleSection title="In love" text={data.in_love} />

        {/* As a Friend */}
        <ArticleSection title="As a friend" text={data.as_a_friend} />

        {/* Career */}
        <ArticleSection title="Career & fit" text={data.career} />

        {/* Best Matches */}
        <div className="rounded-card border border-hairline bg-white/[0.02] p-5">
          <h2 className="font-display font-extrabold text-[12px] tracking-[0.18em] uppercase text-gold mb-3">Best MBTI matches</h2>
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
        <div className="rounded-card border border-hairline bg-white/[0.02] p-5">
          <h2 className="font-display font-extrabold text-[12px] tracking-[0.18em] uppercase text-gold mb-3">Famous {key}s</h2>
          <div className="flex flex-wrap gap-2">
            {data.famous.map(p => (
              <a key={p} href={`https://en.wikipedia.org/wiki/${p.replace(/\s+/g, "_")}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm px-3 py-1 rounded-full border border-hairline bg-white/5 text-ink-secondary hover:border-hairline-gold hover:text-gold-bright transition-colors">
                {p}
              </a>
            ))}
          </div>
        </div>
      </div>

      <CtaBand
        text={`Get your full ${key} behavioral analysis combined with your zodiac sign`}
        actions={[{ href: "/analyze/hybrid", label: "Try Your Full Self Analysis →", primary: true }]}
      />

      {/* All types grid */}
      <div className="mt-10">
        <p className="font-display font-extrabold text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-4">All 16 types</p>
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
