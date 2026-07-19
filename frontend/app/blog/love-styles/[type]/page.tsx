import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Flame, Leaf, Scale, Dice5, Wind, Sparkles } from "lucide-react";
import { Star4 } from "@/components/ui/glyphs";
import { Breadcrumb, AmbientGlow, ArticleSection, CtaBand } from "@/components/blog/editorial";

export const revalidate = false;

const STYLES: Record<string, { label: string; icon: typeof Flame; color: string }> = {
  eros:   { label: "Eros",   icon: Flame,    color: "#f87171" },
  storge: { label: "Storge", icon: Leaf,     color: "#34d399" },
  pragma: { label: "Pragma", icon: Scale,    color: "#60a5fa" },
  ludus:  { label: "Ludus",  icon: Dice5,    color: "#edcb7e" },
  mania:  { label: "Mania",  icon: Wind,     color: "#a78bfa" },
  agape:  { label: "Agape",  icon: Sparkles, color: "#fb923c" },
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
  const Icon = meta.icon;

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={c} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { href: "/blog/love-styles", label: "Love Styles" }, { label: meta.label }]} />

      <header className="mb-10">
        <div className="flex items-center gap-5">
          <span className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border" style={{ color: c, borderColor: `${c}40`, background: `${c}12` }}>
            <Icon className="size-8" />
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{meta.label}</h1>
            <p className="text-ink-secondary mt-1.5">Love Style</p>
          </div>
        </div>
      </header>

      {article ? (
        <div className="space-y-9">
          <ArticleSection title="Overview" text={article.overview} />

          <div className="rounded-card border p-5" style={{ borderColor: `${c}30`, background: `${c}0a` }}>
            <p className="flex items-center gap-2 font-display font-extrabold text-[12px] tracking-[0.18em] uppercase mb-3" style={{ color: c }}>
              <Star4 size={9} />
              Key characteristics
            </p>
            <ul className="space-y-2">
              {(article.characteristics ?? []).map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[14.5px] text-ink-secondary leading-relaxed">
                  <span style={{ color: c }} className="shrink-0">→</span>{s}
                </li>
              ))}
            </ul>
          </div>

          <ArticleSection title="In relationships" text={article.in_relationships} />
          <ArticleSection title="Shadow side" text={article.shadow_side} />
          <ArticleSection title="Compatibility with other styles" text={article.compatibility} />
          <ArticleSection title="Growth path" text={article.growth_path} />
          <ArticleSection title="How to recognize this style" text={article.recognizing_this_style} />
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Article unavailable — please try again later.</p>
      )}

      <CtaBand
        text="Discover your love style through analysis"
        actions={[{ href: "/analyze/love-style", label: "Find Your Love Style", primary: true }]}
      />
    </main>
  );
}
