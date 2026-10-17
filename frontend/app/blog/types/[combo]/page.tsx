import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ComboLinks from "@/components/blog/ComboLinks";
import { AmbientGlow, ArticleSection, Breadcrumb, ChipColumns, CtaBand } from "@/components/blog/editorial";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { API } from "@/lib/api";
import { SIGN_COLOR } from "@/lib/celebrities";
import { comboPath, parseCombo, signName, type ComboResponse } from "@/lib/combos";
import { MBTI_DATA } from "@/lib/mbti-data";
import { SIGN_META } from "@/lib/zodiac";

/**
 * /blog/types/<sign>-<type>: one of 192 guides. Nothing is generated at build time:
 * each page is produced the first time it is requested (the backend stores the
 * article permanently) and then served from the cache. The page itself is
 * regenerated hourly so a guide that wasn't ready yet fills in soon after.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const SITE = "https://zodicogai.com";

/** The article, or null when the backend can't produce it right now (never cached in that case). */
async function fetchCombo(sign: string, mbti: string): Promise<ComboResponse | null> {
  try {
    const res = await fetch(`${API}/blog/combo/${sign}/${mbti}`, { next: { revalidate: 2592000 } });
    return res.ok ? ((await res.json()) as ComboResponse) : null;
  } catch {
    return null;
  }
}

function describe(sign: string, mbti: string, nickname: string) {
  return `What it means to be a ${signName(sign)} with the ${mbti} (${nickname}) personality type: strengths, blind spots, how they love and how they work.`;
}

export async function generateMetadata({ params }: { params: Promise<{ combo: string }> }): Promise<Metadata> {
  const { combo } = await params;
  const c = parseCombo(combo);
  if (!c) return {};
  const name = signName(c.sign);
  const nickname = MBTI_DATA[c.mbti]?.nickname ?? c.mbti;
  const data = await fetchCombo(c.sign, c.mbti); // same request as the page: fetched once
  const title = `${name} ${c.mbti}: Personality, Love & Work | ZodicogAI`;
  return {
    title,
    description: describe(c.sign, c.mbti, nickname),
    alternates: { canonical: `${SITE}${comboPath(c.sign, c.mbti)}` },
    // Don't let a "not ready yet" page into the index; the hourly refresh will replace it.
    robots: data ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${name} ${c.mbti}: ${nickname} | ZodicogAI`,
      description: describe(c.sign, c.mbti, nickname),
      url: `${SITE}${comboPath(c.sign, c.mbti)}`,
      siteName: "ZodicogAI",
      type: "article",
    },
    twitter: { card: "summary_large_image", title },
  };
}

function alignmentLabel(a: number) {
  if (a >= 80) return "Very closely aligned";
  if (a >= 65) return "Closely aligned";
  if (a >= 50) return "A mixed pairing";
  return "Pulls in different directions";
}

const AXIS: Record<string, string> = {
  intensity: "intensity", stability: "stability", expressiveness: "expressiveness",
  dominance: "dominance", adaptability: "adaptability",
};

export default async function ComboPage({ params }: { params: Promise<{ combo: string }> }) {
  const { combo } = await params;
  const c = parseCombo(combo);
  if (!c) notFound();

  const name = signName(c.sign);
  const meta = SIGN_META[name];
  const type = MBTI_DATA[c.mbti];
  const color = SIGN_COLOR[c.sign] ?? "#a99bff";
  const data = await fetchCombo(c.sign, c.mbti);
  const article = data?.article;
  const url = `${SITE}${comboPath(c.sign, c.mbti)}`;

  const jsonLd = article && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${name} ${c.mbti}: personality, love and work`,
    description: describe(c.sign, c.mbti, type.nickname),
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "ZodicogAI", url: SITE },
    publisher: { "@type": "Organization", name: "ZodicogAI", url: SITE },
  };

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-4xl mx-auto">
      <AmbientGlow hex={color} />
      {jsonLd && (
        <script
          type="application/ld+json"
          // `<` is escaped so no field can close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <Breadcrumb
        trail={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Almanac" },
          { href: "/blog/types", label: "Sign × type" },
          { label: `${name} ${c.mbti}` },
        ]}
      />

      <header className="mb-10">
        <div className="flex items-center gap-5 mb-5">
          <span
            className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border"
            style={{ color, borderColor: `${color}40`, background: `${color}12` }}
          >
            <Glyph name={c.sign as GlyphName} size={38} strokeWidth={1.4} />
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">
              {name} <span className="text-gold-bright">×</span> {c.mbti}
            </h1>
            <p className="text-ink-secondary mt-1.5">
              The {name} {type.nickname.replace(/^The /, "")} <span className="text-ink-faint mx-1">·</span> {meta.element} {meta.modality}
            </p>
          </div>
        </div>

        {data && (
          <div className="rounded-card border border-hairline bg-white/[0.02] p-5" data-testid="combo-facts">
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="font-display font-extrabold text-3xl tracking-[-0.03em] text-gold-bright tabular-nums">
                {Math.round(data.alignment)}%
              </p>
              <p className="text-sm text-ink-secondary">{alignmentLabel(data.alignment)}: how closely {name}&apos;s and {c.mbti}&apos;s trait profiles line up.</p>
            </div>
            {data.gaps[0] && (
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                They pull apart most on{" "}
                <b className="text-ink-secondary font-medium">{AXIS[data.gaps[0].axis] ?? data.gaps[0].axis}</b>: {name} reads{" "}
                {data.gaps[0].sign}/10, {c.mbti} reads {data.gaps[0].type}/10.
                {data.gaps[1] && (
                  <> Then <b className="text-ink-secondary font-medium">{AXIS[data.gaps[1].axis] ?? data.gaps[1].axis}</b>
                  {" "}({data.gaps[1].sign} vs {data.gaps[1].type}).</>
                )}
              </p>
            )}
          </div>
        )}
      </header>

      {article ? (
        <div className="max-w-prose space-y-9">
          <ArticleSection id="overview" title="Overview" text={article.overview} />
          <div id="strengths" className="scroll-mt-24">
            <ChipColumns
              columns={[
                { title: "Strengths", items: article.strengths, color: "#4ade80" },
                { title: "Blind spots", items: article.blind_spots, color: "#f87171" },
              ]}
            />
          </div>
          <ArticleSection id="love" title="In love" text={article.in_love} />
          <ArticleSection id="work" title="At work" text={article.at_work} />

          {article.best_matches.length > 0 && (
            <ArticleSection id="matches" title="Best matches">
              <ul className="mt-1 space-y-2.5" data-testid="combo-matches">
                {article.best_matches.map((m) => (
                  <li key={`${m.sign}-${m.mbti}`}>
                    <Link
                      href={comboPath(m.sign, m.mbti)}
                      className="group flex items-start gap-3 rounded-card border border-hairline bg-white/[0.02] px-4 py-3 hover:border-hairline-gold transition-colors tap-highlight-none"
                    >
                      <span className="mt-0.5 shrink-0" style={{ color: SIGN_COLOR[m.sign] }}>
                        <Glyph name={m.sign as GlyphName} size={18} strokeWidth={1.6} />
                      </span>
                      <span>
                        <span className="font-semibold text-ink group-hover:text-gold-bright transition-colors">
                          {signName(m.sign)} {m.mbti}
                        </span>
                        {m.why && <span className="block text-sm text-ink-secondary leading-relaxed">{m.why}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ArticleSection>
          )}

          {/* Famous people are by sign only: we never assign a personality type to a real person. */}
          <ArticleSection id="famous" title={`Famous ${name} natives`}>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Public figures are listed by sun sign only; we don&apos;t assign personality types to real people.{" "}
              <Link href={`/blog/zodiac/${c.sign}#famous`} className="font-semibold text-accent-bright hover:text-gold-bright">
                See famous {name}s →
              </Link>
            </p>
          </ArticleSection>
        </div>
      ) : (
        <div role="status" className="rounded-card border border-hairline p-6 text-ink-secondary" data-testid="combo-pending">
          <p className="font-display font-extrabold text-ink">This guide is being written.</p>
          <p className="mt-1 text-sm">
            Check back in a few minutes, or read the{" "}
            <Link href={`/blog/zodiac/${c.sign}`} className="font-semibold text-accent-bright hover:text-gold-bright">{name} guide</Link>{" "}
            and the{" "}
            <Link href={`/blog/mbti/${c.mbti.toLowerCase()}`} className="font-semibold text-accent-bright hover:text-gold-bright">{c.mbti} guide</Link>{" "}
            in the meantime.
          </p>
        </div>
      )}

      <CtaBand
        text={`Curious how you read? Get a behavioral profile built from your own sign and type.`}
        actions={[
          { href: "/analyze/hybrid", label: "Your behavioral profile →", primary: true },
          { href: `/blog/zodiac/${c.sign}`, label: `The ${name} guide` },
          { href: `/blog/mbti/${c.mbti.toLowerCase()}`, label: `The ${c.mbti} guide` },
        ]}
      />

      <div className="mt-12 space-y-8">
        <ComboLinks sign={c.sign} current={`${c.sign}-${c.mbti}`} />
        <ComboLinks mbti={c.mbti} current={`${c.sign}-${c.mbti}`} />
      </div>
    </main>
  );
}
