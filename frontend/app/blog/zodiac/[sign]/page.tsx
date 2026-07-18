import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ZODIAC_COLORS } from "@/lib/colors";
import { SIGN_COLOR } from "@/lib/celebrities";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import {
  Breadcrumb,
  AmbientGlow,
  ArticleSection,
  PullQuote,
  ChipColumns,
  CtaBand,
} from "@/components/blog/editorial";

export const revalidate = 2592000; // revalidate every 30 days

// ── Static sign data ──────────────────────────────────────────────────────────

const SIGN_META: Record<string, {
  symbol: string; dates: string; ruling: string; element: string; modality: string;
  archetype: string; polarity: string; keywords: string[];
  day: number; month: number;
}> = {
  aries:       { symbol: "♈", dates: "Mar 21 – Apr 19", ruling: "Mars",             element: "Fire",  modality: "Cardinal", archetype: "The Pioneer",     polarity: "Yang", keywords: ["Bold","Driven","Courageous","Impulsive"],     day: 5,  month: 4  },
  taurus:      { symbol: "♉", dates: "Apr 20 – May 20", ruling: "Venus",            element: "Earth", modality: "Fixed",    archetype: "The Sensualist",  polarity: "Yin",  keywords: ["Grounded","Loyal","Patient","Stubborn"],     day: 5,  month: 5  },
  gemini:      { symbol: "♊", dates: "May 21 – Jun 20", ruling: "Mercury",          element: "Air",   modality: "Mutable",  archetype: "The Messenger",   polarity: "Yang", keywords: ["Curious","Witty","Adaptable","Restless"],    day: 5,  month: 6  },
  cancer:      { symbol: "♋", dates: "Jun 21 – Jul 22", ruling: "Moon",             element: "Water", modality: "Cardinal", archetype: "The Nurturer",    polarity: "Yin",  keywords: ["Empathic","Protective","Intuitive","Moody"], day: 5,  month: 7  },
  leo:         { symbol: "♌", dates: "Jul 23 – Aug 22", ruling: "Sun",              element: "Fire",  modality: "Fixed",    archetype: "The Sovereign",   polarity: "Yang", keywords: ["Charismatic","Generous","Proud","Creative"], day: 5,  month: 8  },
  virgo:       { symbol: "♍", dates: "Aug 23 – Sep 22", ruling: "Mercury",          element: "Earth", modality: "Mutable",  archetype: "The Analyst",     polarity: "Yin",  keywords: ["Precise","Reliable","Critical","Devoted"],   day: 5,  month: 9  },
  libra:       { symbol: "♎", dates: "Sep 23 – Oct 22", ruling: "Venus",            element: "Air",   modality: "Cardinal", archetype: "The Diplomat",    polarity: "Yang", keywords: ["Harmonious","Aesthetic","Fair","Indecisive"],day: 5,  month: 10 },
  scorpio:     { symbol: "♏", dates: "Oct 23 – Nov 21", ruling: "Pluto · Mars",     element: "Water", modality: "Fixed",    archetype: "The Alchemist",   polarity: "Yin",  keywords: ["Intense","Perceptive","Private","Magnetic"], day: 5,  month: 11 },
  sagittarius: { symbol: "♐", dates: "Nov 22 – Dec 21", ruling: "Jupiter",          element: "Fire",  modality: "Mutable",  archetype: "The Philosopher", polarity: "Yang", keywords: ["Adventurous","Optimistic","Direct","Free"],  day: 5,  month: 12 },
  capricorn:   { symbol: "♑", dates: "Dec 22 – Jan 19", ruling: "Saturn",           element: "Earth", modality: "Cardinal", archetype: "The Architect",   polarity: "Yin",  keywords: ["Disciplined","Ambitious","Resilient","Reserved"],day:5,month:1},
  aquarius:    { symbol: "♒", dates: "Jan 20 – Feb 18", ruling: "Uranus · Saturn",  element: "Air",   modality: "Fixed",    archetype: "The Visionary",   polarity: "Yang", keywords: ["Unconventional","Humanitarian","Detached","Original"],day:5,month:2},
  pisces:      { symbol: "♓", dates: "Feb 19 – Mar 20", ruling: "Neptune · Jupiter",element: "Water", modality: "Mutable",  archetype: "The Dreamer",     polarity: "Yin",  keywords: ["Compassionate","Mystical","Dreamy","Selfless"],day:5,month:3},
};

const ALL_SIGNS = Object.keys(SIGN_META);

// ── generateStaticParams ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  return ALL_SIGNS.map((sign) => ({ sign }));
}

// ── generateMetadata ───────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign } = await params;
  const meta = SIGN_META[sign.toLowerCase()];
  if (!meta) return {};
  const name = sign.charAt(0).toUpperCase() + sign.slice(1);
  return {
    title: `${name} Zodiac Sign — Personality, Love & Compatibility | ZodicogAI`,
    description: `Complete ${name} profile: personality traits, love style, career, shadow self, best matches, and famous ${name} people. Powered by AI behavioral analysis.`,
    keywords: `${name} zodiac, ${name} personality, ${name} compatibility, ${name} love, ${name} traits, ${name} astrology`,
    openGraph: {
      title: `${name} ${meta.symbol} — Full Zodiac Profile | ZodicogAI`,
      description: `Discover everything about ${name}: ${meta.keywords.join(", ")}. ${meta.archetype}.`,
      url: `https://zodicogai.com/blog/zodiac/${sign}`,
      siteName: "ZodicogAI",
      type: "article",
    },
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ZodiacArticle {
  overview: string; the_symbol: string; personality: string;
  modality_profile?: string;
  highest_expression: string; shadow_expression: string;
  strengths: string[]; weaknesses: string[];
  in_love: string; as_a_friend: string; career_and_ambition: string;
  tips_for_relating: string; best_matches: string[]; famous_people: string[];
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ZodiacBlogPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  const key = sign.toLowerCase();
  const meta = SIGN_META[key];
  if (!meta) notFound();

  const name = key.charAt(0).toUpperCase() + key.slice(1);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

  let article: ZodiacArticle | null = null;
  try {
    const res = await fetch(`${API}/analyze/zodiac`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, day: meta.day, month: meta.month }),
      next: { revalidate: 2592000 },
    });
    if (res.ok) {
      const data = await res.json();
      article = data.article ?? null;
    }
  } catch {}

  const ELEMENT_COLOR: Record<string, string> = {
    Fire: "#f59e0b", Earth: "#a3a37a", Air: "#7dd3fc", Water: "#818cf8",
  };
  const MODALITY_COLOR: Record<string, string> = {
    Cardinal: "#ef4444", Fixed: "#22c55e", Mutable: "#818cf8",
  };
  const elColor  = ELEMENT_COLOR[meta.element]   ?? "#f59e0b";
  const modColor = MODALITY_COLOR[meta.modality] ?? "#a1a1aa";

  const signColor = SIGN_COLOR[key] ?? elColor;
  const auraHex = ZODIAC_COLORS[name]?.hex ?? signColor;
  const glyph = key as GlyphName;

  const order = ALL_SIGNS;
  const i = order.indexOf(key);
  const prev = order[(i + order.length - 1) % order.length];
  const next = order[(i + 1) % order.length];

  const toc: { id: string; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "personality", label: "Personality" },
    ...(article?.modality_profile && article.modality_profile !== "—"
      ? [{ id: "modality", label: `${meta.modality} energy` }]
      : []),
    { id: "strengths", label: "Strengths & weaknesses" },
    { id: "highest", label: "Highest expression" },
    { id: "shadow", label: "Shadow expression" },
    { id: "love", label: "In love" },
    { id: "friend", label: "As a friend" },
    { id: "career", label: "Career & ambition" },
    { id: "relating", label: "Tips for relating" },
    { id: "matches", label: "Best matches" },
    { id: "famous", label: `Famous ${name}s` },
  ];

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto">
      <AmbientGlow hex={auraHex} />

      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/blog", label: "Almanac" }, { label: name }]} />

      {/* Editorial header */}
      <header className="mb-10 md:mb-12">
        <div className="flex items-center gap-5 mb-5">
          <span
            className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border"
            style={{ color: signColor, borderColor: `${signColor}40`, background: `${signColor}12` }}
          >
            <Glyph name={glyph} size={38} strokeWidth={1.4} />
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">
              {name}
            </h1>
            <p className="text-ink-secondary mt-1.5">
              {meta.archetype} <span className="text-ink-faint mx-1">·</span> {meta.dates}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-muted mb-4">
          <span>Ruled by <b className="text-ink-secondary font-medium">{meta.ruling}</b></span>
          <span style={{ color: elColor }}>{meta.element}</span>
          <span style={{ color: modColor }}>{meta.modality}</span>
          <span>{meta.polarity}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {meta.keywords.map(k => (
            <span key={k} className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${elColor}14`, color: elColor, border: `1px solid ${elColor}2e` }}>{k}</span>
          ))}
        </div>
      </header>

      {article ? (
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_190px] lg:gap-12">
          {/* Article body */}
          <div className="max-w-prose space-y-9">
            <ArticleSection id="overview" title="Overview" text={article.overview} />
            <ArticleSection id="personality" title="Personality" text={article.personality} />

            {article.modality_profile && article.modality_profile !== "—" && (
              <PullQuote id="modality" title={`${meta.modality} energy`} text={article.modality_profile} tone="violet" />
            )}

            <div id="strengths" className="scroll-mt-24">
              <ChipColumns columns={[
                { title: "Strengths", items: article.strengths, color: "#4ade80" },
                { title: "Weaknesses", items: article.weaknesses, color: "#f87171" },
              ]} />
            </div>

            <PullQuote id="highest" title="Highest expression" text={article.highest_expression} tone="gold" />
            <PullQuote id="shadow" title="Shadow expression" text={article.shadow_expression} tone="violet" />

            <ArticleSection id="love" title="In love" text={article.in_love} />
            <ArticleSection id="friend" title="As a friend" text={article.as_a_friend} />
            <ArticleSection id="career" title="Career & ambition" text={article.career_and_ambition} />
            <ArticleSection id="relating" title="Tips for relating" text={article.tips_for_relating} />

            <ArticleSection id="matches" title="Best matches">
              <div className="flex flex-wrap gap-2 mt-1">
                {article.best_matches.map(m => (
                  <Link
                    key={m}
                    href={`/blog/zodiac/${m.toLowerCase()}`}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline-gold bg-gold/10 px-3.5 py-1.5 text-sm text-gold-bright hover:bg-gold/20 transition-colors tap-highlight-none"
                  >
                    <Glyph name={m.toLowerCase() as GlyphName} size={13} strokeWidth={1.8} />
                    {m}
                  </Link>
                ))}
              </div>
            </ArticleSection>

            <ArticleSection id="famous" title={`Famous ${name} natives`}>
              <div className="flex flex-wrap gap-2 mt-1">
                {article.famous_people.map(p => {
                  const celebName = p.replace(/\s*\(.*?\)\s*/g, "").trim();
                  const wikiUrl = `https://en.wikipedia.org/wiki/${celebName.replace(/\s+/g, "_")}`;
                  return (
                    <a key={p} href={wikiUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm px-3 py-1 rounded-full border border-hairline bg-white/5 text-ink-secondary hover:border-hairline-gold hover:text-gold-bright transition-colors">
                      {p}
                    </a>
                  );
                })}
              </div>
            </ArticleSection>
          </div>

          {/* TOC rail — desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border-l border-hairline pl-5">
              <p className="font-display font-extrabold text-[10px] tracking-[0.22em] uppercase text-ink-muted mb-3">
                In this profile
              </p>
              <ul className="space-y-2">
                {toc.map(t => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-[12.5px] text-ink-muted hover:text-gold-bright transition-colors">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      ) : (
        <div className="text-ink-muted text-sm">Could not load article. Please try again later.</div>
      )}

      <CtaBand
        text={`Get a personalized ${name} analysis with your exact birth date`}
        actions={[{ href: `/analyze/zodiac?name=${name}&day=${meta.day}&month=${meta.month}`, label: `Full ${name} reading →`, primary: true }]}
      />

      {/* Wheel navigation */}
      <nav className="mt-10 grid grid-cols-2 gap-4">
        {[{ s: prev, dir: "prev" }, { s: next, dir: "next" }].map(({ s, dir }) => (
          <Link
            key={s}
            href={`/blog/zodiac/${s}`}
            className={`group flex items-center gap-3 rounded-card border border-hairline bg-white/[0.02] px-4 py-3 transition-colors hover:border-hairline-accent tap-highlight-none ${dir === "next" ? "flex-row-reverse text-right justify-start" : ""}`}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline" style={{ color: SIGN_COLOR[s] }}>
              <Glyph name={s as GlyphName} size={15} strokeWidth={1.8} />
            </span>
            <span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                {dir === "prev" ? "← Previous sign" : "Next sign →"}
              </span>
              <span className="block text-sm font-semibold text-ink capitalize">{s}</span>
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
