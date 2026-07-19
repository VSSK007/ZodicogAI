import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Star4 } from "@/components/ui/glyphs";
import { Breadcrumb, AmbientGlow, ArticleSection, CtaBand } from "@/components/blog/editorial";

export const revalidate = false;

const LP_META: Record<string, { label: string; theme: string; master?: boolean }> = {
  "1":  { label: "The Leader",       theme: "Independence & Ambition" },
  "2":  { label: "The Mediator",     theme: "Harmony & Partnership" },
  "3":  { label: "The Communicator", theme: "Creativity & Expression" },
  "4":  { label: "The Builder",      theme: "Discipline & Foundation" },
  "5":  { label: "The Explorer",     theme: "Freedom & Change" },
  "6":  { label: "The Nurturer",     theme: "Responsibility & Love" },
  "7":  { label: "The Seeker",       theme: "Wisdom & Introspection" },
  "8":  { label: "The Powerhouse",   theme: "Ambition & Material Mastery" },
  "9":  { label: "The Humanitarian", theme: "Compassion & Completion" },
  "11": { label: "Master Intuitive", theme: "Spiritual Illumination", master: true },
  "22": { label: "Master Builder",   theme: "Manifesting the Impossible", master: true },
  "33": { label: "Master Teacher",   theme: "Healing & Unconditional Love", master: true },
};

export async function generateStaticParams() {
  return Object.keys(LP_META).map(n => ({ number: n }));
}

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params;
  const meta = LP_META[number];
  if (!meta) return {};
  const isMaster = meta.master;
  return {
    title: `${isMaster ? "Master Number" : "Life Path"} ${number} — ${meta.label} | ZodicogAI`,
    description: `Complete numerology profile for ${isMaster ? "Master Number" : "Life Path"} ${number}: personality, love, career, spiritual meaning, and shadow side.`,
    keywords: `life path ${number}, numerology ${number}, ${meta.label.toLowerCase()}, ${isMaster ? "master number" : "life path number"} ${number}`,
  };
}

interface NumerologyLifePathArticle {
  overview: string; core_themes: string[]; personality: string;
  love_and_relationships: string; career_and_purpose: string;
  shadow_and_challenges: string; spiritual_meaning: string; famous_people: string[];
}

export default async function NumerologyLPPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const meta = LP_META[number];
  if (!meta) notFound();

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: NumerologyLifePathArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/numerology/${number}`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  const isMaster = meta.master;
  const c = isMaster ? "#a78bfa" : "#edcb7e";

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={c} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { href: "/blog/numerology", label: "Numerology" }, { label: `${isMaster ? "Master Number" : "Life Path"} ${number}` }]} />

      <header className="mb-10">
        <div className="flex items-center gap-5 mb-4">
          <span className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border font-display font-extrabold text-2xl md:text-3xl" style={{ color: c, borderColor: `${c}40`, background: `${c}12` }}>
            {number}
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{meta.label}</h1>
            <p className="text-ink-secondary mt-1.5">{isMaster ? "Master Number" : "Life Path"} {number} <span className="text-ink-faint mx-1">·</span> {meta.theme}</p>
          </div>
        </div>
        {isMaster && (
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: `${c}40`, background: `${c}10`, color: c }}>
            <Star4 size={9} />
            Master Number — amplified energy, higher calling
          </div>
        )}
      </header>

      {article ? (
        <div className="space-y-9">
          <ArticleSection title="Overview" text={article.overview} />

          <div className="rounded-card border p-5" style={{ borderColor: `${c}30`, background: `${c}0a` }}>
            <p className="flex items-center gap-2 font-display font-extrabold text-[12px] tracking-[0.18em] uppercase mb-3" style={{ color: c }}>
              <Star4 size={9} />
              Core themes
            </p>
            <ul className="space-y-2">
              {(article.core_themes ?? []).map((t, i) => (
                <li key={i} className="flex gap-2.5 text-[14.5px] text-ink-secondary leading-relaxed">
                  <span style={{ color: c }} className="shrink-0">→</span>{t}
                </li>
              ))}
            </ul>
          </div>

          <ArticleSection title="Personality" text={article.personality} />
          <ArticleSection title="Love & relationships" text={article.love_and_relationships} />
          <ArticleSection title="Career & purpose" text={article.career_and_purpose} />
          <ArticleSection title="Shadow & challenges" text={article.shadow_and_challenges} />
          <ArticleSection title="Spiritual meaning" text={article.spiritual_meaning} />

          {article.famous_people?.length > 0 && (
            <ArticleSection title={`Famous Life Path ${number}s`}>
              <div className="flex flex-wrap gap-2 mt-1">
                {article.famous_people.map((p) => {
                  const celebName = p.replace(/\s*\(.*?\)\s*/g, "").trim();
                  return (
                    <a key={p} href={`https://en.wikipedia.org/wiki/${celebName.replace(/\s+/g, "_")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm px-3 py-1 rounded-full border border-hairline bg-white/5 text-ink-secondary hover:border-hairline-gold hover:text-gold-bright transition-colors">
                      {p}
                    </a>
                  );
                })}
              </div>
            </ArticleSection>
          )}
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Article unavailable — please try again later.</p>
      )}

      <CtaBand
        text="Calculate your exact life path number"
        actions={[{ href: "/analyze/numerology", label: "Numerology Analysis", primary: true }]}
      />
    </main>
  );
}
