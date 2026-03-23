import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

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
  const c = isMaster ? "#a78bfa" : "#f59e0b";

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <Link href="/blog/numerology" className="hover:text-white transition-colors">Numerology</Link>
        <span>/</span>
        <span className="text-zinc-300">{isMaster ? "Master Number" : "Life Path"} {number}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black"
            style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
            {number}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{meta.label}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">{isMaster ? "Master Number" : "Life Path"} {number} · {meta.theme}</p>
          </div>
        </div>
        {isMaster && (
          <div className="inline-block text-xs px-3 py-1 rounded-full border"
            style={{ borderColor: `${c}40`, background: `${c}10`, color: c }}>
            ✦ Master Number — amplified energy, higher calling
          </div>
        )}
      </div>

      {article ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: c }}>Overview</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{article.overview}</p>
          </section>

          <div className="rounded-xl border bg-white/[0.02] p-5" style={{ borderColor: `${c}25` }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: c }}>Core Themes</h2>
            <ul className="space-y-2">
              {(article.core_themes ?? []).map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-300">
                  <span style={{ color: c }} className="shrink-0">→</span>{t}
                </li>
              ))}
            </ul>
          </div>

          {[
            ["Personality", article.personality],
            ["Love & Relationships", article.love_and_relationships],
            ["Career & Purpose", article.career_and_purpose],
            ["Shadow & Challenges", article.shadow_and_challenges],
            ["Spiritual Meaning", article.spiritual_meaning],
          ].map(([title, text]) => (
            <section key={title as string}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: c }}>{title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
            </section>
          ))}

          {article.famous_people?.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Famous Life Path {number}s</h2>
              <div className="flex flex-wrap gap-2">
                {article.famous_people.map(p => (
                  <span key={p} className="text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">{p}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
            <p className="text-zinc-300 mb-4 text-sm">Calculate your exact life path number</p>
            <Link href="/analyze/numerology"
              className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
              Numerology Analysis
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">Article unavailable — please try again later.</p>
      )}
    </main>
  );
}
