import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle, Wrench, Gift, Clock, Hand } from "lucide-react";
import { Star4 } from "@/components/ui/glyphs";
import { Breadcrumb, AmbientGlow, ArticleSection, CtaBand } from "@/components/blog/editorial";

export const revalidate = false;

const LOVE_LANGS: Record<string, { label: string; icon: typeof MessageCircle; color: string }> = {
  "words-of-affirmation": { label: "Words of Affirmation", icon: MessageCircle, color: "#a78bfa" },
  "acts-of-service":      { label: "Acts of Service",       icon: Wrench,       color: "#34d399" },
  "receiving-gifts":      { label: "Receiving Gifts",       icon: Gift,         color: "#f472b6" },
  "quality-time":         { label: "Quality Time",          icon: Clock,        color: "#60a5fa" },
  "physical-touch":       { label: "Physical Touch",        icon: Hand,         color: "#fb923c" },
};

export async function generateStaticParams() {
  return Object.keys(LOVE_LANGS).map(slug => ({ type: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const meta = LOVE_LANGS[type];
  if (!meta) return {};
  return {
    title: `${meta.label} — Love Language Guide | ZodicogAI`,
    description: `Complete guide to ${meta.label}: how to express it, how to receive it, signs you need it, and how it pairs with other love languages.`,
    keywords: `${meta.label.toLowerCase()}, love language guide, relationship advice, ${meta.label.toLowerCase()} in relationships`,
  };
}

interface LoveLangArticle {
  overview: string; how_to_express: string; how_to_receive: string;
  signs_you_need_this: string[]; common_mistakes: string;
  in_relationships: string; compatibility_notes: string; growth_tips: string;
}

export default async function LoveLangArticlePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const meta = LOVE_LANGS[type];
  if (!meta) notFound();

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: LoveLangArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/love-language/${type}`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  const c = meta.color;
  const Icon = meta.icon;

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={c} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { href: "/blog/love-languages", label: "Love Languages" }, { label: meta.label }]} />

      <header className="mb-10">
        <div className="flex items-center gap-5">
          <span className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border" style={{ color: c, borderColor: `${c}40`, background: `${c}12` }}>
            <Icon className="size-8" />
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{meta.label}</h1>
            <p className="text-ink-secondary mt-1.5">Love Language</p>
          </div>
        </div>
      </header>

      {article ? (
        <div className="space-y-9">
          <ArticleSection title="Overview" text={article.overview} />
          <ArticleSection title="How to express it" text={article.how_to_express} />
          <ArticleSection title="How to receive it" text={article.how_to_receive} />

          <div className="rounded-card border p-5" style={{ borderColor: `${c}30`, background: `${c}0a` }}>
            <p className="flex items-center gap-2 font-display font-extrabold text-[12px] tracking-[0.18em] uppercase mb-3" style={{ color: c }}>
              <Star4 size={9} />
              Signs you need this
            </p>
            <ul className="space-y-2">
              {(article.signs_you_need_this ?? []).map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[14.5px] text-ink-secondary leading-relaxed">
                  <span style={{ color: c }} className="shrink-0 mt-0.5">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>

          <ArticleSection title="Common mistakes" text={article.common_mistakes} />
          <ArticleSection title="In relationships" text={article.in_relationships} />
          <ArticleSection title="Compatibility with other languages" text={article.compatibility_notes} />
          <ArticleSection title="Growth tips" text={article.growth_tips} />
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Article unavailable — please try again later.</p>
      )}

      <CtaBand
        text="Discover your love language through analysis"
        actions={[{ href: "/analyze/love-language", label: "Find Your Love Language", primary: true }]}
      />
    </main>
  );
}
