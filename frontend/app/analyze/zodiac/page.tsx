"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import TraitRadar from "@/components/TraitRadar";
import RevealOnScroll from "@/components/RevealOnScroll";
import { ZODIAC_COLORS } from "@/lib/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DecanProfile {
  number: number;
  sub_sign: string;
  sub_ruler: string;
  keywords: string[];
  description_short: string;
  description_rich: string;
}

interface ZodiacProfile {
  sign: string;
  element: string;
  modality: string;
  trait_vector: { intensity: number; stability: number; expressiveness: number; dominance: number; adaptability: number };
  decan?: DecanProfile;
}

interface ZodiacArticle {
  overview: string;
  the_symbol: string;
  personality: string;
  highest_expression: string;
  shadow_expression: string;
  strengths: string[];
  weaknesses: string[];
  in_love: string;
  as_a_friend: string;
  career_and_ambition: string;
  tips_for_relating: string;
  best_matches: string[];
  famous_people: string[];
}

interface ZodiacResult {
  name: string;
  zodiac_profile: ZodiacProfile;
  article: ZodiacArticle;
}

// ---------------------------------------------------------------------------
// Static metadata per sign
// ---------------------------------------------------------------------------

const SIGN_META: Record<string, { symbol: string; dates: string; ruling: string; element: string; archetype: string; polarity: string; keywords: string[] }> = {
  Aries:       { symbol: "♈", dates: "Mar 21 – Apr 19", ruling: "Mars",            element: "Fire",  archetype: "The Pioneer",     polarity: "Yang", keywords: ["Bold", "Driven", "Courageous", "Impulsive"] },
  Taurus:      { symbol: "♉", dates: "Apr 20 – May 20", ruling: "Venus",           element: "Earth", archetype: "The Sensualist",  polarity: "Yin",  keywords: ["Grounded", "Loyal", "Patient", "Stubborn"]   },
  Gemini:      { symbol: "♊", dates: "May 21 – Jun 20", ruling: "Mercury",         element: "Air",   archetype: "The Messenger",   polarity: "Yang", keywords: ["Curious", "Witty", "Adaptable", "Restless"]  },
  Cancer:      { symbol: "♋", dates: "Jun 21 – Jul 22", ruling: "Moon",            element: "Water", archetype: "The Nurturer",    polarity: "Yin",  keywords: ["Empathic", "Protective", "Intuitive", "Moody"]},
  Leo:         { symbol: "♌", dates: "Jul 23 – Aug 22", ruling: "Sun",             element: "Fire",  archetype: "The Sovereign",   polarity: "Yang", keywords: ["Charismatic", "Generous", "Proud", "Creative"]},
  Virgo:       { symbol: "♍", dates: "Aug 23 – Sep 22", ruling: "Mercury",         element: "Earth", archetype: "The Analyst",     polarity: "Yin",  keywords: ["Precise", "Reliable", "Critical", "Devoted"]  },
  Libra:       { symbol: "♎", dates: "Sep 23 – Oct 22", ruling: "Venus",           element: "Air",   archetype: "The Diplomat",    polarity: "Yang", keywords: ["Harmonious", "Aesthetic", "Fair", "Indecisive"]},
  Scorpio:     { symbol: "♏", dates: "Oct 23 – Nov 21", ruling: "Pluto · Mars",    element: "Water", archetype: "The Alchemist",   polarity: "Yin",  keywords: ["Intense", "Perceptive", "Private", "Magnetic"] },
  Sagittarius: { symbol: "♐", dates: "Nov 22 – Dec 21", ruling: "Jupiter",         element: "Fire",  archetype: "The Philosopher", polarity: "Yang", keywords: ["Adventurous", "Optimistic", "Direct", "Free"]  },
  Capricorn:   { symbol: "♑", dates: "Dec 22 – Jan 19", ruling: "Saturn",          element: "Earth", archetype: "The Architect",   polarity: "Yin",  keywords: ["Disciplined", "Ambitious", "Resilient", "Reserved"]},
  Aquarius:    { symbol: "♒", dates: "Jan 20 – Feb 18", ruling: "Uranus · Saturn", element: "Air",   archetype: "The Visionary",   polarity: "Yang", keywords: ["Unconventional", "Humanitarian", "Detached", "Original"]},
  Pisces:      { symbol: "♓", dates: "Feb 19 – Mar 20", ruling: "Neptune · Jupiter",element:"Water", archetype: "The Dreamer",     polarity: "Yin",  keywords: ["Compassionate", "Mystical", "Dreamy", "Selfless"]},
};

// Representative date (day, month) that falls solidly within each sign
const SIGN_DATES: Record<string, { day: number; month: number }> = {
  Aries:       { day: 5,  month: 4  },
  Taurus:      { day: 5,  month: 5  },
  Gemini:      { day: 5,  month: 6  },
  Cancer:      { day: 5,  month: 7  },
  Leo:         { day: 5,  month: 8  },
  Virgo:       { day: 5,  month: 9  },
  Libra:       { day: 5,  month: 10 },
  Scorpio:     { day: 5,  month: 11 },
  Sagittarius: { day: 5,  month: 12 },
  Capricorn:   { day: 5,  month: 1  },
  Aquarius:    { day: 5,  month: 2  },
  Pisces:      { day: 5,  month: 3  },
};

const ELEMENT_THEME: Record<string, { accent: string; bg: string; border: string; text: string; badge: string }> = {
  Fire:  { accent: "#f97316", bg: "bg-orange-500/8",  border: "border-orange-500/20", text: "text-orange-400", badge: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  Earth: { accent: "#10b981", bg: "bg-emerald-500/8", border: "border-emerald-500/20",text: "text-emerald-400",badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"},
  Air:   { accent: "#38bdf8", bg: "bg-sky-500/8",     border: "border-sky-500/20",    text: "text-sky-400",    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30"          },
  Water: { accent: "#6366f1", bg: "bg-indigo-500/8",  border: "border-indigo-500/20", text: "text-indigo-400", badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
};

const ALL_SIGN_SYMBOLS: Record<string, string> = {
  Aries:"♈", Taurus:"♉", Gemini:"♊", Cancer:"♋", Leo:"♌", Virgo:"♍",
  Libra:"♎", Scorpio:"♏", Sagittarius:"♐", Capricorn:"♑", Aquarius:"♒", Pisces:"♓",
};

const INPUT = "rounded-lg bg-zinc-900 border border-white/10 px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors font-[inherit]";

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>{title}</h2>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner page (uses useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------

function ZodiacPageInner() {
  const searchParams = useSearchParams();

  const [name, setName]   = useState("");
  const [day, setDay]     = useState("");
  const [month, setMonth] = useState("");
  const [result, setResult] = useState<ZodiacResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  // Hide form when arriving from a best-match link (params present)
  const [showForm, setShowForm] = useState(!searchParams.get("name"));

  async function fetchZodiac(n: string, d: number, m: number) {
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiFetch<ZodiacResult>("/analyze/zodiac", {
        name: n, day: d, month: m,
      });
      setResult(data);
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  }

  // Auto-submit when URL params are present (e.g. arriving from a best-match link)
  // Extract primitive values so the dep array is always a fixed size
  const paramName  = searchParams.get("name");
  const paramDay   = searchParams.get("day");
  const paramMonth = searchParams.get("month");

  useEffect(() => {
    if (paramName && paramDay && paramMonth) {
      setShowForm(false);
      fetchZodiac(paramName, Number(paramDay), Number(paramMonth));
    } else {
      setShowForm(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramName, paramDay, paramMonth]);

  async function handleSubmit() {
    const d = Number(day), m = Number(month);
    if (!name.trim())                          return setError("Enter a name.");
    if (!day || d < 1 || d > 31)               return setError("Day must be 1–31.");
    if (!month || m < 1 || m > 12)             return setError("Month must be 1–12.");
    await fetchZodiac(name.trim(), d, m);
  }

  const z      = result?.zodiac_profile;
  const art    = result?.article;
  const meta   = z ? SIGN_META[z.sign] : null;
  const theme  = z ? (ELEMENT_THEME[z.element] ?? ELEMENT_THEME.Air) : null;

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-16 max-w-3xl mx-auto">
      {/* Header — shown only when form is visible */}
      {showForm && (
        <div className="mb-10">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 md:bg-[#4285f4]" />
            <span className="text-[10px] font-semibold tracking-[0.13em] uppercase text-zinc-500">Analysis</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Zodiac Profile</h1>
          <p className="text-zinc-500 mt-1 text-sm">Enter a birthday — get a deep astrological read of the sign.</p>
        </div>
      )}

      {/* "New search" toggle — shown when form is hidden (best-match mode) */}
      {!showForm && (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Zodiac Profile</h1>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            + New search
          </button>
        </div>
      )}

      {/* Input card */}
      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <input className={`${INPUT} col-span-3 md:col-span-1`} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={INPUT} placeholder="Day (1–31)" type="number" min={1} max={31} value={day} onChange={(e) => setDay(e.target.value)} />
            <input className={INPUT} placeholder="Month (1–12)" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 md:py-3 rounded-full bg-white text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition min-h-[48px]"
          >
            {loading ? "Reading the stars…" : "Generate Zodiac Profile"}
          </button>
        </div>
      )}

      {/* Loading state when form is hidden */}
      {loading && !showForm && (
        <div className="text-center py-12 text-zinc-500 text-sm">Reading the stars…</div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && z && meta && theme && art && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* ── Hero ── */}
            <RevealOnScroll delay={0.05}>
            <div className={`rounded-2xl border ${theme.border} ${theme.bg} overflow-hidden`}>
              {/* Top bar with sign symbol + name */}
              <div className="flex items-center gap-5 px-8 pt-8 pb-6 border-b border-white/8">
                <div className="text-5xl md:text-8xl leading-none select-none shrink-0" style={{ color: theme.accent }}>
                  {meta.symbol}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{result.name}&rsquo;s Sun Sign</p>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-none" style={{ color: theme.accent }}>{z.sign}</h2>
                  <p className="text-zinc-400 text-sm mt-1 italic">{meta.archetype}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{meta.dates}</p>
                </div>
              </div>

              {/* Attribute row */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8 border-b border-white/8">
                {[
                  { label: "Element",  value: z.element },
                  { label: "Modality", value: z.modality },
                  { label: "Ruled by", value: meta.ruling },
                  { label: "Polarity", value: meta.polarity === "Yang" ? "Yang ☀" : "Yin ☽" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-5 py-3">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-zinc-200">{value}</p>
                  </div>
                ))}
              </div>

              {/* Aura Color */}
              {(() => {
                const ac = ZODIAC_COLORS[z.sign];
                return ac ? (
                  <div className="px-8 py-3 border-b border-white/8 flex items-center gap-3">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest shrink-0">Aura Color</span>
                    <div className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: ac.hex }} />
                    <span className="text-sm font-medium text-zinc-200">{ac.name}</span>
                    <div className="flex flex-wrap gap-1 ml-1">
                      {ac.keywords.map((kw) => (
                        <span key={kw} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/8">{kw}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Keywords */}
              <div className="px-8 py-4 border-b border-white/8 flex flex-wrap gap-2">
                {meta.keywords.map((kw) => (
                  <span key={kw} className={`text-xs font-medium px-3 py-1 rounded-full border ${theme.badge}`}>{kw}</span>
                ))}
              </div>

              {/* Decan */}
              {z.decan && (
                <div className="px-8 py-5 border-b border-white/8 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest shrink-0">Decan</span>
                    <span className="text-sm font-semibold text-zinc-200">
                      {z.sign} Decan {z.decan.number} ({z.decan.sub_sign})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-500">
                      Sub-ruler: {z.decan.sub_ruler}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {z.decan.keywords.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-zinc-400">{t}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-white/[0.02] border border-white/8 p-3">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">Overview</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">{z.decan.description_short}</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] border border-white/8 p-3">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">In Depth</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">{z.decan.description_rich}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Overview */}
              <div className="px-8 py-6">
                <p className="text-zinc-300 leading-relaxed text-sm">{art.overview}</p>
              </div>
            </div>
            </RevealOnScroll>

            {/* ── The Symbol & Mythology ── */}
            <RevealOnScroll>
              <Section title="The Symbol & Mythology" accent={theme.accent}>
                <p className="text-zinc-300 text-sm leading-relaxed">{art.the_symbol}</p>
              </Section>
            </RevealOnScroll>

            {/* ── Personality ── */}
            <RevealOnScroll>
              <Section title="Personality" accent={theme.accent}>
                <p className="text-zinc-300 text-sm leading-relaxed">{art.personality}</p>
                <div className="pt-2">
                  <TraitRadar a={z.trait_vector} nameA={result.name || z.sign} />
                </div>
              </Section>
            </RevealOnScroll>

            {/* ── Highest & Shadow Expression ── */}
            <RevealOnScroll>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-5`}>
                  <p className={`text-xs uppercase tracking-widest mb-2 font-semibold ${theme.text}`}>✦ Highest Expression</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{art.highest_expression}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-widest mb-2 font-semibold text-zinc-500">☽ Shadow Expression</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{art.shadow_expression}</p>
                </div>
              </div>
            </RevealOnScroll>

            {/* ── Strengths & Weaknesses ── */}
            <RevealOnScroll>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-5`}>
                  <p className={`text-xs uppercase tracking-widest mb-3 font-semibold ${theme.text}`}>Strengths</p>
                  <ul className="space-y-2">
                    {art.strengths.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-zinc-300">
                        <span style={{ color: theme.accent }}>✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-widest mb-3 font-semibold text-zinc-500">Challenges</p>
                  <ul className="space-y-2">
                    {art.weaknesses.map((w) => (
                      <li key={w} className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="text-zinc-600">→</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            {/* ── In Love ── */}
            <RevealOnScroll>
              <Section title="In Love & Relationships" accent={theme.accent}>
                <p className="text-zinc-300 text-sm leading-relaxed">{art.in_love}</p>
              </Section>
            </RevealOnScroll>

            {/* ── As a Friend ── */}
            <RevealOnScroll>
              <Section title="As a Friend" accent={theme.accent}>
                <p className="text-zinc-300 text-sm leading-relaxed">{art.as_a_friend}</p>
              </Section>
            </RevealOnScroll>

            {/* ── Career ── */}
            <RevealOnScroll>
              <Section title="Career & Ambition" accent={theme.accent}>
                <p className="text-zinc-300 text-sm leading-relaxed">{art.career_and_ambition}</p>
              </Section>
            </RevealOnScroll>

            {/* ── Tips for Relating ── */}
            <RevealOnScroll>
              <Section title={`How to Relate to a ${z.sign}`} accent={theme.accent}>
                <div className={`rounded-xl border ${theme.border} ${theme.bg} p-4`}>
                  <p className="text-zinc-300 text-sm leading-relaxed">{art.tips_for_relating}</p>
                </div>
              </Section>
            </RevealOnScroll>

            {/* ── Best Matches ── */}
            <RevealOnScroll>
              <Section title="Best Matches" accent={theme.accent}>
                <div className="flex flex-wrap gap-3">
                  {art.best_matches.map((sign) => {
                    const dates = SIGN_DATES[sign];
                    const card = (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${theme.border} ${theme.bg} transition-opacity hover:opacity-80`}>
                        <span className="text-lg leading-none" style={{ color: theme.accent }}>
                          {ALL_SIGN_SYMBOLS[sign] ?? "★"}
                        </span>
                        <span className="text-sm font-medium text-zinc-200">{sign}</span>
                        {dates && (
                          <span className="text-[10px] text-zinc-500 ml-1">↗</span>
                        )}
                      </div>
                    );
                    return dates ? (
                      <Link
                        key={sign}
                        href={`/analyze/zodiac?name=${encodeURIComponent(sign)}&day=${dates.day}&month=${dates.month}`}
                      >
                        {card}
                      </Link>
                    ) : (
                      <div key={sign}>{card}</div>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-600 mt-1">Click a sign to explore its full profile.</p>
              </Section>
            </RevealOnScroll>

            {/* ── Famous People ── */}
            <RevealOnScroll>
              <Section title="Famous People" accent={theme.accent}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {art.famous_people.map((person) => (
                    <div key={person} className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                      <p className="text-xs text-zinc-300 leading-snug">{person}</p>
                    </div>
                  ))}
                </div>
              </Section>
            </RevealOnScroll>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps inner page in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------

export default function ZodiacPage() {
  return (
    <Suspense fallback={null}>
      <ZodiacPageInner />
    </Suspense>
  );
}
