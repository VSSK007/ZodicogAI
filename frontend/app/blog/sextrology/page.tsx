import type { Metadata } from "next";
import { Star4 } from "@/components/ui/glyphs";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Breadcrumb, ArticleSection, CtaBand } from "@/components/blog/editorial";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Sextrology — Zodiac, MBTI & Intimacy Guide | ZodicogAI",
  description: "What is sextrology? A complete guide to how zodiac signs and MBTI types influence intimacy, sexual character, emotional needs, and long-term passion.",
  keywords: "sextrology, zodiac intimacy, MBTI intimacy, sexual astrology, personality and intimacy",
};

interface SextrologyGuideArticle {
  what_is_sextrology: string; zodiac_and_intimacy: string; mbti_and_intimacy: string;
  the_6_dimensions: string[]; how_to_use: string; faq: string[];
}

const DIMENSIONS = [
  "Sexual Character", "Erogenous Zones", "Fantasies",
  "Positions & Dynamics", "Emotional Needs", "Long-Term Fire",
];

export default async function SextrologyGuidePage() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: SextrologyGuideArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/sextrology`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: "Sextrology" }]} />

      <header className="mb-10">
        <Eyebrow>Intimacy guide</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.08] text-ink">
          Sextrology
        </h1>
        <p className="mt-2.5 text-ink-secondary">How zodiac signs and MBTI types shape intimacy, desire, and long-term passion.</p>
      </header>

      {article ? (
        <div className="space-y-9">
          <ArticleSection title="What is sextrology?" text={article.what_is_sextrology} />
          <ArticleSection title="Zodiac & intimacy" text={article.zodiac_and_intimacy} />
          <ArticleSection title="MBTI & intimacy" text={article.mbti_and_intimacy} />

          {article.the_6_dimensions?.length > 0 && (
            <div className="rounded-card border border-hairline-gold bg-gold/[0.04] p-5">
              <p className="flex items-center gap-2 font-display font-extrabold text-[12px] tracking-[0.18em] uppercase text-gold-bright mb-4">
                <Star4 size={9} />
                The 6 dimensions
              </p>
              <div className="space-y-3.5">
                {article.the_6_dimensions.map((dim, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-gold-bright shrink-0 font-mono font-bold">{i + 1}.</span>
                    <div>
                      <span className="text-sm font-semibold text-ink">{DIMENSIONS[i]}</span>
                      <p className="text-[13px] text-ink-secondary mt-0.5 leading-relaxed">{dim}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ArticleSection title="How to use sextrology" text={article.how_to_use} />

          {article.faq?.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2.5 font-display font-extrabold text-[13px] tracking-[0.18em] uppercase text-gold mb-4">
                <Star4 size={10} />
                FAQ
              </h2>
              <div className="space-y-3">
                {article.faq.map((item, i) => {
                  const [q, ...rest] = item.split("A:");
                  return (
                    <div key={i} className="rounded-card border border-hairline bg-white/[0.02] p-4">
                      <p className="text-sm font-semibold text-ink mb-2">{q.replace("Q:", "").trim()}</p>
                      <p className="text-sm text-ink-secondary leading-relaxed">{rest.join("A:").trim()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Article unavailable — please try again later.</p>
      )}

      <CtaBand
        text="Get your personal sextrology analysis"
        actions={[{ href: "/analyze/sextrology", label: "Sextrology Analysis", primary: true }]}
      />
    </main>
  );
}
