import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = false;

const SIGN_META: Record<string, { symbol: string; element: string }> = {
  aries:       { symbol: "♈", element: "Fire" },
  taurus:      { symbol: "♉", element: "Earth" },
  gemini:      { symbol: "♊", element: "Air" },
  cancer:      { symbol: "♋", element: "Water" },
  leo:         { symbol: "♌", element: "Fire" },
  virgo:       { symbol: "♍", element: "Earth" },
  libra:       { symbol: "♎", element: "Air" },
  scorpio:     { symbol: "♏", element: "Water" },
  sagittarius: { symbol: "♐", element: "Fire" },
  capricorn:   { symbol: "♑", element: "Earth" },
  aquarius:    { symbol: "♒", element: "Air" },
  pisces:      { symbol: "♓", element: "Water" },
};
const EL_COLOR: Record<string, string> = { Fire: "#f59e0b", Earth: "#a3a37a", Air: "#7dd3fc", Water: "#818cf8" };

export async function generateStaticParams() {
  return Object.keys(SIGN_META).map(sign => ({ sign }));
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign } = await params;
  const meta = SIGN_META[sign];
  if (!meta) return {};
  const name = sign.charAt(0).toUpperCase() + sign.slice(1);
  return {
    title: `${name} Compatibility — Best & Worst Matches | ZodicogAI`,
    description: `Complete ${name} compatibility guide: best matches, challenging signs, and how ${name} connects with all four elements.`,
    keywords: `${name} compatibility, ${name} best match, ${name} love compatibility, ${name} relationship`,
  };
}

interface ZodiacCompatArticle {
  overview: string; relationship_style: string; best_matches: string[];
  challenging_matches: string[]; fire_compatibility: string; earth_compatibility: string;
  air_compatibility: string; water_compatibility: string; dealbreakers: string; what_they_need: string;
}

export default async function ZodiacCompatPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  const meta = SIGN_META[sign];
  if (!meta) notFound();

  const name = sign.charAt(0).toUpperCase() + sign.slice(1);
  const c = EL_COLOR[meta.element];
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: ZodiacCompatArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/compatibility/zodiac/${sign}`, { cache: "force-cache" });
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
        <span className="text-zinc-300">{name}</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{meta.symbol}</span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{name} Compatibility</h1>
            <p className="text-zinc-400 text-sm mt-0.5">{meta.element} Sign · Who {name} connects with</p>
          </div>
        </div>
      </div>

      {article ? (
        <div className="space-y-8">
          {[
            ["Overview", article.overview],
            ["Relationship Style", article.relationship_style],
          ].map(([title, text]) => (
            <section key={title as string}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: c }}>{title}</h2>
              <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
            </section>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">Best Matches</h2>
              {(article.best_matches ?? []).map(m => (
                <div key={m} className="flex gap-2 items-center text-sm text-zinc-300 mb-1.5">
                  <span className="text-emerald-500">✓</span>
                  <Link href={`/blog/compatibility/zodiac/${m.toLowerCase()}`} className="hover:text-white transition-colors">{m}</Link>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">Challenging Matches</h2>
              {(article.challenging_matches ?? []).map(m => (
                <div key={m} className="flex gap-2 items-center text-sm text-zinc-300 mb-1.5">
                  <span className="text-red-500">✗</span>
                  <Link href={`/blog/compatibility/zodiac/${m.toLowerCase()}`} className="hover:text-white transition-colors">{m}</Link>
                </div>
              ))}
            </div>
          </div>

          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: c }}>By Element</h2>
            <div className="space-y-4">
              {[
                ["🔥 Fire Signs", article.fire_compatibility, "#f59e0b"],
                ["🌍 Earth Signs", article.earth_compatibility, "#a3a37a"],
                ["💨 Air Signs", article.air_compatibility, "#7dd3fc"],
                ["💧 Water Signs", article.water_compatibility, "#818cf8"],
              ].map(([label, text, ec]) => (
                <div key={label as string} className="border-l-2 pl-4" style={{ borderColor: `${ec}60` }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: ec as string }}>{label}</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {[
            ["Dealbreakers", article.dealbreakers],
            ["What They Need", article.what_they_need],
          ].map(([title, text]) => (
            <section key={title as string}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: c }}>{title}</h2>
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
