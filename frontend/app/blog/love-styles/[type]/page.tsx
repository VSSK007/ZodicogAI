import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { renderMd } from "@/lib/renderMd";

export const revalidate = false;

const STYLES: Record<string, { label: string; emoji: string; color: string }> = {
  eros:   { label: "Eros",   emoji: "🔥", color: "#f87171" },
  storge: { label: "Storge", emoji: "🌿", color: "#34d399" },
  pragma: { label: "Pragma", emoji: "⚖️", color: "#60a5fa" },
  ludus:  { label: "Ludus",  emoji: "🎲", color: "#fbbf24" },
  mania:  { label: "Mania",  emoji: "🌪", color: "#a78bfa" },
  agape:  { label: "Agape",  emoji: "✨", color: "#fb923c" },
};

export async function generateStaticParams() {
  return Object.keys(STYLES).map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const meta = STYLES[type];
  if (!meta) return {};
  return {
    title: `${meta.label} Love Style — Complete Guide | ZodicogAI`,
    description: `Everything about the ${meta.label} love style: characteristics, shadow side, compatibility with other styles, and growth path.`,
    keywords: `${meta.label.toLowerCase()} love style, love styles guide, ${meta.label.toLowerCase()} relationships`,
  };
}

interface LoveStyleArticle {
  overview: string; characteristics: string[]; in_relationships: string;
  shadow_side: string; compatibility: string; growth_path: string; recognizing_this_style: string;
}

export default async function LoveStyleArticlePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const meta = STYLES[type];
  if (!meta) notFound();

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: LoveStyleArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/love-style/${type}`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  const c = meta.color;

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <Link href="/blog/love-styles" className="hover:text-white transition-colors">Love Styles</Link>
        <span>/</span>
        <span className="text-zinc-300">{meta.label}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{meta.emoji}</span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{meta.label}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Love Style</p>
          </div>
        </div>
      </div>

      {article ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: c }}>Overview</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(article.overview)}</p>
          </section>

          <div className="rounded-xl border bg-white/[0.02] p-5" style={{ borderColor: `${c}25` }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: c }}>Key Characteristics</h2>
            <ul className="space-y-2">
              {(article.characteristics ?? []).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300">
                  <span style={{ color: c }} className="shrink-0">→</span>{s}
                </li>
              ))}
            </ul>
          </div>

          {[
            ["In Relationships", article.in_relationships],
            ["Shadow Side", article.shadow_side],
            ["Compatibility with Other Styles", article.compatibility],
            ["Growth Path", article.growth_path],
            ["How to Recognize This Style", article.recognizing_this_style],
          ].map(([title, text]) => (
            <section key={title as string}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: c }}>{title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(text as string)}</p>
            </section>
          ))}

          <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
            <p className="text-zinc-300 mb-4 text-sm">Discover your love style through analysis</p>
            <Link href="/analyze/love-style"
              className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
              Find Your Love Style
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">Article unavailable — please try again later.</p>
      )}
    </main>
  );
}
