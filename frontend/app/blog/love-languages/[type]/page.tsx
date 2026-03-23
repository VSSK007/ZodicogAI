import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { renderMd } from "@/lib/renderMd";

export const revalidate = false;

const LOVE_LANGS: Record<string, { label: string; emoji: string; color: string }> = {
  "words-of-affirmation": { label: "Words of Affirmation", emoji: "💬", color: "#a78bfa" },
  "acts-of-service":      { label: "Acts of Service",       emoji: "🛠", color: "#34d399" },
  "receiving-gifts":      { label: "Receiving Gifts",       emoji: "🎁", color: "#f472b6" },
  "quality-time":         { label: "Quality Time",          emoji: "⏳", color: "#60a5fa" },
  "physical-touch":       { label: "Physical Touch",        emoji: "🤝", color: "#fb923c" },
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

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <Link href="/blog/love-languages" className="hover:text-white transition-colors">Love Languages</Link>
        <span>/</span>
        <span className="text-zinc-300">{meta.label}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{meta.emoji}</span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{meta.label}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Love Language</p>
          </div>
        </div>
      </div>

      {article ? (
        <div className="space-y-8">
          <Section title="Overview" text={article.overview} color={c} />
          <Section title="How to Express It" text={article.how_to_express} color={c} />
          <Section title="How to Receive It" text={article.how_to_receive} color={c} />

          <div className="rounded-xl border bg-white/[0.02] p-5" style={{ borderColor: `${c}25` }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: c }}>Signs You Need This</h2>
            <ul className="space-y-2">
              {(article.signs_you_need_this ?? []).map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300">
                  <span style={{ color: c }} className="shrink-0 mt-0.5">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>

          <Section title="Common Mistakes" text={article.common_mistakes} color={c} />
          <Section title="In Relationships" text={article.in_relationships} color={c} />
          <Section title="Compatibility with Other Languages" text={article.compatibility_notes} color={c} />
          <Section title="Growth Tips" text={article.growth_tips} color={c} />

          <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
            <p className="text-zinc-300 mb-4 text-sm">Discover your love language through analysis</p>
            <Link href="/analyze/love-language"
              className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
              Find Your Love Language
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">Article unavailable — please try again later.</p>
      )}
    </main>
  );
}

function Section({ title, text, color }: { title: string; text: string; color: string }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3" style={{ color }}>{title}</h2>
      <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(text)}</p>
    </section>
  );
}
