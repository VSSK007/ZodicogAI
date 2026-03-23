import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MBTI_DATA, ALL_TYPES, ROLE_COLOR } from "@/lib/mbti-data";

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
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <Link href="/blog/compatibility" className="hover:text-white transition-colors">Compatibility</Link>
        <span>/</span>
        <span className="text-zinc-300">{key}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {key}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{key} Compatibility</h1>
            <p className="text-zinc-400 text-sm mt-0.5">{data.nickname} · {data.role}</p>
          </div>
        </div>
      </div>

      {article ? (
        <div className="space-y-8">
          {[["Overview", article.overview], ["Relationship Style", article.relationship_style]].map(([title, text]) => (
            <section key={title as string}>
              <h2 className="text-lg font-semibold mb-3" style={{ color }}>{title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
            </section>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">Best Matches</h2>
              {(article.best_matches ?? []).map(m => (
                <div key={m} className="flex gap-2 items-center text-sm text-zinc-300 mb-1.5">
                  <span className="text-emerald-500">✓</span>
                  <Link href={`/blog/compatibility/mbti/${m.toLowerCase()}`} className="hover:text-white transition-colors font-mono">{m}</Link>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">Challenging Matches</h2>
              {(article.challenging_matches ?? []).map(m => (
                <div key={m} className="flex gap-2 items-center text-sm text-zinc-300 mb-1.5">
                  <span className="text-red-500">✗</span>
                  <Link href={`/blog/compatibility/mbti/${m.toLowerCase()}`} className="hover:text-white transition-colors font-mono">{m}</Link>
                </div>
              ))}
            </div>
          </div>

          {[
            ["What They Need", article.what_they_need],
            ["Communication in Love", article.communication_in_love],
            ["Dealbreakers", article.dealbreakers],
            ["Growth in Relationships", article.growth_in_relationships],
          ].map(([title, text]) => (
            <section key={title as string}>
              <h2 className="text-lg font-semibold mb-3" style={{ color }}>{title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
            </section>
          ))}

          <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
            <p className="text-zinc-300 mb-4 text-sm">Run a full compatibility analysis</p>
            <Link href="/analyze/romantic"
              className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
              Compatibility Analysis
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">Article unavailable — please try again later.</p>
      )}
    </main>
  );
}
