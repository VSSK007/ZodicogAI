import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MBTI_DATA, ALL_TYPES, ROLE_COLOR } from "@/lib/mbti-data";
import { Breadcrumb, AmbientGlow, ArticleSection, CtaBand } from "@/components/blog/editorial";

export const revalidate = false;

export async function generateStaticParams() {
  return ALL_TYPES.map(type => ({ type: type.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const key = type.toUpperCase();
  const data = MBTI_DATA[key];
  if (!data) return {};
  return {
    title: `${key} Compatibility — Best Matches & Relationship Guide | ZodicogAI`,
    description: `Complete ${key} compatibility guide: best MBTI matches, relationship style, what ${key} needs in a partner, and growth in love.`,
    keywords: `${key} compatibility, ${key} best match, ${key} relationships, ${key} love, ${key} MBTI partner`,
  };
}

interface MbtiCompatArticle {
  overview: string; relationship_style: string; best_matches: string[];
  challenging_matches: string[]; what_they_need: string;
  communication_in_love: string; dealbreakers: string; growth_in_relationships: string;
}

export default async function MbtiCompatPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const key = type.toUpperCase();
  const data = MBTI_DATA[key];
  if (!data) notFound();

  const color = ROLE_COLOR[data.role] ?? "#f59e0b";
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: MbtiCompatArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/compatibility/mbti/${key}`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={color} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { href: "/blog/compatibility", label: "Compatibility" }, { label: key }]} />

      <header className="mb-10">
        <div className="flex items-center gap-5">
          <div className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card font-mono font-bold text-xl md:text-2xl"
            style={{ background: `${color}14`, color, border: `1px solid ${color}38` }}>
            {key}
          </div>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{key} Compatibility</h1>
            <p className="text-ink-secondary mt-1.5">{data.nickname} <span className="text-ink-faint mx-1">·</span> {data.role}</p>
          </div>
        </div>
      </header>

      {article ? (
        <div className="space-y-9">
          <ArticleSection title="Overview" text={article.overview} />
          <ArticleSection title="Relationship style" text={article.relationship_style} />

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-card border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
              <h2 className="font-display font-extrabold text-[11px] uppercase tracking-[0.16em] text-emerald-400 mb-3">Best Matches</h2>
              {(article.best_matches ?? []).map((m) => (
                <div key={m} className="flex gap-2 items-center text-sm text-ink-secondary mb-1.5">
                  <span className="text-emerald-500">✓</span>
                  <Link href={`/blog/compatibility/mbti/${m.toLowerCase()}`} className="hover:text-ink transition-colors font-mono">{m}</Link>
                </div>
              ))}
            </div>
            <div className="rounded-card border border-red-500/20 bg-red-500/[0.04] p-4">
              <h2 className="font-display font-extrabold text-[11px] uppercase tracking-[0.16em] text-red-400 mb-3">Challenging Matches</h2>
              {(article.challenging_matches ?? []).map((m) => (
                <div key={m} className="flex gap-2 items-center text-sm text-ink-secondary mb-1.5">
                  <span className="text-red-500">✗</span>
                  <Link href={`/blog/compatibility/mbti/${m.toLowerCase()}`} className="hover:text-ink transition-colors font-mono">{m}</Link>
                </div>
              ))}
            </div>
          </div>

          <ArticleSection title="What they need" text={article.what_they_need} />
          <ArticleSection title="Communication in love" text={article.communication_in_love} />
          <ArticleSection title="Dealbreakers" text={article.dealbreakers} />
          <ArticleSection title="Growth in relationships" text={article.growth_in_relationships} />
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Article unavailable — please try again later.</p>
      )}

      <CtaBand
        text="Run a full compatibility analysis"
        actions={[{ href: "/analyze/romantic", label: "Compatibility Analysis", primary: true }]}
      />
    </main>
  );
}
