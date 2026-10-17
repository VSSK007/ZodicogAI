import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import LazyZodiacWheel from "@/components/LazyZodiacWheel";
import ScoreRing from "@/components/ScoreRing";
import { AmbientGlow, Breadcrumb } from "@/components/blog/editorial";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { API } from "@/lib/api";
import { getCelebrityBySlug, SIGN_COLOR, SIGN_LABEL } from "@/lib/celebrities";
import { compareRobots, comparePath, listedCouple } from "@/lib/couples";

/**
 * /celebrities/compare/<a>/<b>: how two public figures' sun signs and numerology line up.
 *
 * Framed strictly as a zodiac comparison: it never says the two people are, were or might be a
 * couple, and never assigns either a personality type. Arbitrary pairs are `noindex`; only pairs
 * on the owner-approved list in lib/couples.ts are indexable (and listed in the sitemap).
 */
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

const SITE = "https://zodicogai.com";

interface Side {
  slug: string; name: string; sign: string; category: string; element: string; modality: string; life_path: number;
}
interface Compared {
  a: Side; b: Side; score: number; zodiac_score: number; numerology_score: number; why: string;
}

async function fetchCompare(a: string, b: string): Promise<Compared | null> {
  try {
    const res = await fetch(`${API}/celebrities/compare/${a}/${b}`, { next: { revalidate: 86400 } });
    return res.ok ? ((await res.json()) as Compared) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ a: string; b: string }> }): Promise<Metadata> {
  const { a, b } = await params;
  const ca = getCelebrityBySlug(a);
  const cb = getCelebrityBySlug(b);
  if (!ca || !cb || a === b) return {};
  const title = `Zodiac compatibility: ${ca.name} & ${cb.name}`;
  const description = `How ${ca.name}'s ${SIGN_LABEL[ca.sign]} and ${cb.name}'s ${SIGN_LABEL[cb.sign]} sun signs and numerology numbers line up. A zodiac comparison from public birth dates.`;
  return {
    title: `${title} | ZodicogAI`,
    description,
    // Only the owner's documented-couples list may be indexed; every other pair stays out of search.
    robots: compareRobots(a, b),
    alternates: { canonical: `${SITE}${comparePath(a, b)}` },
    openGraph: { title, description, url: `${SITE}${comparePath(a, b)}`, siteName: "ZodicogAI", type: "article" },
    twitter: { card: "summary", title },
  };
}

function PersonCard({ side }: { side: Side }) {
  const color = SIGN_COLOR[side.sign] ?? "#a99bff";
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-card border"
          style={{ color, borderColor: `${color}40`, background: `${color}12` }}
        >
          <Glyph name={side.sign as GlyphName} size={22} strokeWidth={1.5} />
        </span>
        <div className="min-w-0">
          <Link href={`/celebrities/${side.slug}`} className="font-display font-extrabold text-ink hover:text-gold-bright transition-colors truncate block">
            {side.name}
          </Link>
          <p className="text-xs text-ink-muted">{side.category}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div><dt className="text-micro uppercase tracking-wider text-ink-muted">Sign</dt><dd className="mt-0.5 text-sm font-semibold text-ink">{SIGN_LABEL[side.sign]}</dd></div>
        <div><dt className="text-micro uppercase tracking-wider text-ink-muted">Element</dt><dd className="mt-0.5 text-sm font-semibold text-ink">{side.element}</dd></div>
        <div><dt className="text-micro uppercase tracking-wider text-ink-muted">Life path</dt><dd className="mt-0.5 text-sm font-semibold text-ink tabular-nums">{side.life_path}</dd></div>
      </dl>
    </Card>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-ink-secondary">{label}</span>
        <span className="font-mono tabular-nums text-ink-muted">{Math.round(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-gold" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export default async function CompareResult({ params }: { params: Promise<{ a: string; b: string }> }) {
  const { a, b } = await params;
  const ca = getCelebrityBySlug(a);
  const cb = getCelebrityBySlug(b);
  if (!ca || !cb || a === b) notFound();

  const data = await fetchCompare(a, b);
  const couple = listedCouple(a, b);
  const color = SIGN_COLOR[ca.sign] ?? "#a99bff";

  return (
    <main className="relative min-h-screen px-4 md:px-6 py-10 md:py-14 max-w-3xl mx-auto">
      <AmbientGlow hex={color} />
      <Breadcrumb
        trail={[
          { href: "/", label: "Home" },
          { href: "/celebrities", label: "Celebrities" },
          { href: "/celebrities/compare", label: "Compare" },
          { label: `${ca.name} & ${cb.name}` },
        ]}
      />

      <header className="mb-8">
        <Eyebrow>Zodiac comparison</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-5xl leading-[1.08] text-ink text-balance">
          Zodiac compatibility: {ca.name} &amp; {cb.name}
        </h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          Two sun signs and two sets of numbers, compared. This says nothing about how the two people relate to each other.
        </p>
      </header>

      {data ? (
        <div className="space-y-6">
          <Card variant="gold" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="shrink-0 self-center">
                <ScoreRing score={data.score} size={150} strokeWidth={11} color="var(--color-accent-bright)" />
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <p className="text-ink leading-relaxed" data-testid="compare-why">{data.why}</p>
                <Bar label="Zodiac (element, modality, sign traits)" value={data.zodiac_score} />
                <Bar label="Numerology (life path and name numbers)" value={data.numerology_score} />
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <PersonCard side={data.a} />
            <PersonCard side={data.b} />
          </div>

          <Card className="p-5">
            <LazyZodiacWheel signs={[data.a.sign, data.b.sign]} neutral />
          </Card>

          {couple && (
            <p className="text-xs text-ink-muted" data-testid="compare-source">
              Publicly documented:{" "}
              <a href={couple.source} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-ink-secondary">
                source
              </a>
              .
            </p>
          )}
        </div>
      ) : (
        <div role="status" className="rounded-card border border-hairline p-6 text-ink-secondary" data-testid="compare-unavailable">
          Couldn&apos;t load this comparison right now. Please try again in a moment.
        </div>
      )}

      <p className="mt-8 text-xs text-ink-muted leading-relaxed" data-testid="compare-disclaimer">
        Based only on public birth dates and names: sun signs and numerology, for entertainment. Astrology and numerology
        are not facts about anyone&apos;s life, and nothing here implies a relationship between the people compared.
      </p>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={`/celebrities/compare?a=${a}`} className="font-semibold text-accent-bright hover:text-gold-bright">
          Compare {ca.name} with someone else →
        </Link>
        <Link href={`/celebrities/compare?a=${b}`} className="font-semibold text-accent-bright hover:text-gold-bright">
          Compare {cb.name} with someone else →
        </Link>
      </div>
    </main>
  );
}
