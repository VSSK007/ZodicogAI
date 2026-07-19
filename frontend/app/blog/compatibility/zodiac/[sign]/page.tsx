import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { renderMd } from "@/lib/renderMd";
import { SIGN_COLOR } from "@/lib/celebrities";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { Breadcrumb, AmbientGlow, ArticleSection, CtaBand } from "@/components/blog/editorial";

export const revalidate = false;

const SIGN_META: Record<string, { element: string }> = {
  aries:       { element: "Fire" },
  taurus:      { element: "Earth" },
  gemini:      { element: "Air" },
  cancer:      { element: "Water" },
  leo:         { element: "Fire" },
  virgo:       { element: "Earth" },
  libra:       { element: "Air" },
  scorpio:     { element: "Water" },
  sagittarius: { element: "Fire" },
  capricorn:   { element: "Earth" },
  aquarius:    { element: "Air" },
  pisces:      { element: "Water" },
};

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

const EL_GLYPH: Record<string, GlyphName> = { Fire: "aries", Earth: "taurus", Air: "gemini", Water: "cancer" };
const EL_COLOR: Record<string, string> = { Fire: "#f97316", Earth: "#10b981", Air: "#38bdf8", Water: "#6366f1" };

export default async function ZodiacCompatPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  const meta = SIGN_META[sign];
  if (!meta) notFound();

  const name = sign.charAt(0).toUpperCase() + sign.slice(1);
  const c = SIGN_COLOR[sign] ?? EL_COLOR[meta.element];
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  let article: ZodiacCompatArticle | null = null;
  try {
    const res = await fetch(`${API}/blog/compatibility/zodiac/${sign}`, { cache: "force-cache" });
    if (res.ok) { const d = await res.json(); article = d.article ?? null; }
  } catch {}

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={c} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { href: "/blog/compatibility", label: "Compatibility" }, { label: name }]} />

      <header className="mb-10">
        <div className="flex items-center gap-5">
          <span className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border" style={{ color: c, borderColor: `${c}40`, background: `${c}12` }}>
            <Glyph name={sign as GlyphName} size={34} strokeWidth={1.4} />
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{name} Compatibility</h1>
            <p className="text-ink-secondary mt-1.5">{meta.element} Sign <span className="text-ink-faint mx-1">·</span> Who {name} connects with</p>
          </div>
        </div>
      </header>

      {article ? (
        <div className="space-y-9">
          <ArticleSection title="Overview" text={article.overview} />
          <ArticleSection title="Relationship style" text={article.relationship_style} />

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-card border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
              <h2 className="font-display font-extrabold text-[11px] uppercase tracking-[0.16em] text-emerald-400 mb-3">Best Matches</h2>
              {(article.best_matches ?? []).map((m) => (
                <div key={m} className="flex gap-2 items-center text-sm text-ink-secondary mb-1.5">
                  <span className="text-emerald-500">✓</span>
                  <Link href={`/blog/compatibility/zodiac/${m.toLowerCase()}`} className="hover:text-ink transition-colors">{m}</Link>
                </div>
              ))}
            </div>
            <div className="rounded-card border border-red-500/20 bg-red-500/[0.04] p-4">
              <h2 className="font-display font-extrabold text-[11px] uppercase tracking-[0.16em] text-red-400 mb-3">Challenging Matches</h2>
              {(article.challenging_matches ?? []).map((m) => (
                <div key={m} className="flex gap-2 items-center text-sm text-ink-secondary mb-1.5">
                  <span className="text-red-500">✗</span>
                  <Link href={`/blog/compatibility/zodiac/${m.toLowerCase()}`} className="hover:text-ink transition-colors">{m}</Link>
                </div>
              ))}
            </div>
          </div>

          <ArticleSection title="By element">
            <div className="space-y-4 mt-1">
              {(
                [
                  ["Fire Signs", article.fire_compatibility, "Fire"],
                  ["Earth Signs", article.earth_compatibility, "Earth"],
                  ["Air Signs", article.air_compatibility, "Air"],
                  ["Water Signs", article.water_compatibility, "Water"],
                ] as [string, string, string][]
              ).map(([label, text, el]) => (
                <div key={label} className="flex items-start gap-3 border-l-2 pl-4" style={{ borderColor: `${EL_COLOR[el]}60` }}>
                  <Glyph name={EL_GLYPH[el]} size={14} className="mt-1 shrink-0" style={{ color: EL_COLOR[el] }} />
                  <div>
                    <p className="font-display font-extrabold text-[11px] uppercase tracking-[0.16em] mb-1" style={{ color: EL_COLOR[el] }}>{label}</p>
                    <p className="text-[14.5px] text-ink-secondary leading-relaxed">{renderMd(text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection title="Dealbreakers" text={article.dealbreakers} />
          <ArticleSection title="What they need" text={article.what_they_need} />
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Article unavailable — please try again later.</p>
      )}

      <CtaBand
        text="Run a full compatibility analysis"
        actions={[{ href: "/analyze/romantic", label: "Compatibility Analysis", primary: true }]}
      />
    </main>
  );
}
