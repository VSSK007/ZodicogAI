import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 2592000; // revalidate every 30 days

// ── Static sign data ──────────────────────────────────────────────────────────

const SIGN_META: Record<string, {
  symbol: string; dates: string; ruling: string; element: string;
  archetype: string; polarity: string; keywords: string[];
  day: number; month: number;
}> = {
  aries:       { symbol: "♈", dates: "Mar 21 – Apr 19", ruling: "Mars",             element: "Fire",  archetype: "The Pioneer",     polarity: "Yang", keywords: ["Bold","Driven","Courageous","Impulsive"],     day: 5,  month: 4  },
  taurus:      { symbol: "♉", dates: "Apr 20 – May 20", ruling: "Venus",            element: "Earth", archetype: "The Sensualist",  polarity: "Yin",  keywords: ["Grounded","Loyal","Patient","Stubborn"],     day: 5,  month: 5  },
  gemini:      { symbol: "♊", dates: "May 21 – Jun 20", ruling: "Mercury",          element: "Air",   archetype: "The Messenger",   polarity: "Yang", keywords: ["Curious","Witty","Adaptable","Restless"],    day: 5,  month: 6  },
  cancer:      { symbol: "♋", dates: "Jun 21 – Jul 22", ruling: "Moon",             element: "Water", archetype: "The Nurturer",    polarity: "Yin",  keywords: ["Empathic","Protective","Intuitive","Moody"], day: 5,  month: 7  },
  leo:         { symbol: "♌", dates: "Jul 23 – Aug 22", ruling: "Sun",              element: "Fire",  archetype: "The Sovereign",   polarity: "Yang", keywords: ["Charismatic","Generous","Proud","Creative"], day: 5,  month: 8  },
  virgo:       { symbol: "♍", dates: "Aug 23 – Sep 22", ruling: "Mercury",          element: "Earth", archetype: "The Analyst",     polarity: "Yin",  keywords: ["Precise","Reliable","Critical","Devoted"],   day: 5,  month: 9  },
  libra:       { symbol: "♎", dates: "Sep 23 – Oct 22", ruling: "Venus",            element: "Air",   archetype: "The Diplomat",    polarity: "Yang", keywords: ["Harmonious","Aesthetic","Fair","Indecisive"],day: 5,  month: 10 },
  scorpio:     { symbol: "♏", dates: "Oct 23 – Nov 21", ruling: "Pluto · Mars",     element: "Water", archetype: "The Alchemist",   polarity: "Yin",  keywords: ["Intense","Perceptive","Private","Magnetic"], day: 5,  month: 11 },
  sagittarius: { symbol: "♐", dates: "Nov 22 – Dec 21", ruling: "Jupiter",          element: "Fire",  archetype: "The Philosopher", polarity: "Yang", keywords: ["Adventurous","Optimistic","Direct","Free"],  day: 5,  month: 12 },
  capricorn:   { symbol: "♑", dates: "Dec 22 – Jan 19", ruling: "Saturn",           element: "Earth", archetype: "The Architect",   polarity: "Yin",  keywords: ["Disciplined","Ambitious","Resilient","Reserved"],day:5,month:1},
  aquarius:    { symbol: "♒", dates: "Jan 20 – Feb 18", ruling: "Uranus · Saturn",  element: "Air",   archetype: "The Visionary",   polarity: "Yang", keywords: ["Unconventional","Humanitarian","Detached","Original"],day:5,month:2},
  pisces:      { symbol: "♓", dates: "Feb 19 – Mar 20", ruling: "Neptune · Jupiter",element: "Water", archetype: "The Dreamer",     polarity: "Yin",  keywords: ["Compassionate","Mystical","Dreamy","Selfless"],day:5,month:3},
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
  const elColor = ELEMENT_COLOR[meta.element] ?? "#f59e0b";

  return (
    <main className="min-h-screen px-4 md:px-8 py-10 md:py-20 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        <span>/</span>
        <span className="text-zinc-300">{name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{meta.symbol}</span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
            <p className="text-zinc-400 text-sm mt-0.5">{meta.dates} · {meta.archetype}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">{meta.element}</span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">{meta.ruling}</span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">{meta.polarity}</span>
          {meta.keywords.map(k => (
            <span key={k} className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${elColor}18`, color: elColor, border: `1px solid ${elColor}30` }}>{k}</span>
          ))}
        </div>
      </div>

      {article ? (
        <div className="space-y-8">
          {/* Overview */}
          <Section title="Overview" text={article.overview} />

          {/* Personality */}
          <Section title="Personality" text={article.personality} />

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard title="Strengths" items={article.strengths} color="#22c55e" />
            <ListCard title="Weaknesses" items={article.weaknesses} color="#f87171" />
          </div>

          {/* Highest & Shadow */}
          <Section title="Highest Expression" text={article.highest_expression} />
          <Section title="Shadow Expression" text={article.shadow_expression} />

          {/* In Love */}
          <Section title="In Love" text={article.in_love} />

          {/* As a Friend */}
          <Section title="As a Friend" text={article.as_a_friend} />

          {/* Career */}
          <Section title="Career & Ambition" text={article.career_and_ambition} />

          {/* Tips */}
          <Section title="Tips for Relating" text={article.tips_for_relating} />

          {/* Best Matches */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Best Matches</h2>
            <div className="flex flex-wrap gap-2">
              {article.best_matches.map(m => (
                <Link key={m} href={`/blog/zodiac/${m.toLowerCase()}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors">
                  {m}
                </Link>
              ))}
            </div>
          </div>

          {/* Famous People */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">Famous {name} Natives</h2>
            <div className="flex flex-wrap gap-2">
              {article.famous_people.map(p => (
                <span key={p} className="text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300">{p}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-zinc-500 text-sm">Could not load article. Please try again later.</div>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-center">
        <p className="text-zinc-300 mb-4">Get a personalized {name} analysis with your exact birth date</p>
        <Link href={`/analyze/zodiac?name=${name}&day=${meta.day}&month=${meta.month}`}
          className="inline-block px-6 py-2.5 rounded-full bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors">
          Try Full {name} Analysis →
        </Link>
      </div>

      {/* Other signs */}
      <div className="mt-10">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Other Signs</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIGNS.filter(s => s !== key).map(s => (
            <Link key={s} href={`/blog/zodiac/${s}`}
              className="text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-colors capitalize">
              {SIGN_META[s].symbol} {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-l-2 border-amber-500/40 pl-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">{title}</h2>
      <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function ListCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">{title}</h2>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
            <span style={{ color }} className="mt-0.5 shrink-0">✦</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
