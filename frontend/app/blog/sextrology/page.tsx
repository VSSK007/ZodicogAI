import Link from "next/link";
import type { Metadata } from "next";
import { renderMd } from "@/lib/renderMd";

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

export default async function SextrologyGuidePage() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: SextrologyGuideArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/sextrology`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  const DIMENSIONS = [
    "Sexual Character", "Erogenous Zones", "Fantasies",
    "Positions & Dynamics", "Emotional Needs", "Long-Term Fire",
  ];

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">Sextrology</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Intimacy Guide</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Sextrology</h1>
        <p className="text-zinc-400 text-sm">How zodiac signs and MBTI types shape intimacy, desire, and long-term passion</p>
      </div>

      {article ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-rose-400">What Is Sextrology?</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(article.what_is_sextrology)}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-rose-400">Zodiac &amp; Intimacy</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(article.zodiac_and_intimacy)}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3 text-rose-400">MBTI &amp; Intimacy</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(article.mbti_and_intimacy)}</p>
          </section>

          {article.the_6_dimensions?.length > 0 && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 mb-4">The 6 Dimensions</h2>
              <div className="space-y-3">
                {article.the_6_dimensions.map((dim, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-rose-500 shrink-0 font-bold">{i + 1}.</span>
                    <div>
                      <span className="text-sm font-semibold text-zinc-200">{DIMENSIONS[i]}</span>
                      <p className="text-xs text-zinc-500 mt-0.5">{dim}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-3 text-rose-400">How to Use Sextrology</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{renderMd(article.how_to_use)}</p>
          </section>

          {article.faq?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-rose-400">FAQ</h2>
              {article.faq.map((item, i) => {
                const [q, ...rest] = item.split("A:");
                return (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-zinc-200 mb-2">{q.replace("Q:", "").trim()}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{rest.join("A:").trim()}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-6 text-center">
            <p className="text-zinc-300 mb-4 text-sm">Get your personal sextrology analysis</p>
            <Link href="/analyze/sextrology"
              className="px-5 py-2 rounded-full bg-rose-500 text-white font-semibold text-sm hover:bg-rose-400 transition-colors">
              Sextrology Analysis
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">Article unavailable — please try again later.</p>
      )}
    </main>
  );
}
