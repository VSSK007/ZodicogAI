import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { API } from "@/lib/api";
import { SIGN_META, ELEMENT_COLOR } from "@/lib/zodiac";
import { renderMd } from "@/lib/renderMd";
import { Glyph, Star4, type GlyphName } from "@/components/ui/glyphs";
import { Breadcrumb, AmbientGlow, CtaBand } from "@/components/blog/editorial";

export const revalidate = 3600;

const SIGNS = Object.keys(SIGN_META);

export async function generateStaticParams() {
  return SIGNS.map((s) => ({ sign: s.toLowerCase() }));
}

interface HoroscopeResult {
  sign: string;
  date: string;
  lucky_number: number;
  scores: { love: number; career: number; energy: number; luck: number; overall: number };
  article: { reading: string; focus_area: string; advice: string };
}

async function fetchHoroscope(sign: string): Promise<HoroscopeResult | null> {
  try {
    const res = await fetch(`${API}/horoscope/${sign}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as HoroscopeResult;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign } = await params;
  const name = sign.charAt(0).toUpperCase() + sign.slice(1);
  if (!SIGN_META[name]) return {};
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return {
    title: `${name} Horoscope Today — ${today} | ZodicogAI`,
    description: `Today's ${name} horoscope: love, career, energy, and luck scores, updated daily.`,
    keywords: `${name} horoscope, ${name} horoscope today, daily ${name} horoscope`,
  };
}

const SCORE_ROWS: { key: "love" | "career" | "energy" | "luck"; label: string }[] = [
  { key: "love",   label: "Love" },
  { key: "career", label: "Career" },
  { key: "energy", label: "Energy" },
  { key: "luck",   label: "Luck" },
];

export default async function HoroscopeDetailPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params;
  const key = sign.toLowerCase();
  const name = key.charAt(0).toUpperCase() + key.slice(1);
  const meta = SIGN_META[name];
  if (!meta) notFound();

  const result = await fetchHoroscope(key);
  const color = ELEMENT_COLOR[meta.element];

  const order = SIGNS.map((s) => s.toLowerCase());
  const i = order.indexOf(key);
  const prev = order[(i + order.length - 1) % order.length];
  const next = order[(i + 1) % order.length];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <main className="relative min-h-screen px-4 md:px-8 py-10 md:py-16 max-w-3xl mx-auto">
      <AmbientGlow hex={color} />
      <Breadcrumb trail={[{ href: "/", label: "Home" }, { href: "/horoscope", label: "Horoscope" }, { label: name }]} />

      <header className="mb-9">
        <div className="flex items-center gap-5 mb-2">
          <span className="flex size-16 md:size-20 shrink-0 items-center justify-center rounded-card border" style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
            <Glyph name={meta.glyph as GlyphName} size={34} strokeWidth={1.4} />
          </span>
          <div>
            <h1 className="font-display font-extrabold tracking-[-0.03em] text-4xl md:text-5xl leading-[1.05] text-ink">{name} Horoscope</h1>
            <p className="text-ink-secondary mt-1.5">{today}</p>
          </div>
        </div>
      </header>

      {result ? (
        <div className="space-y-8">
          {/* Reading */}
          <div className="rounded-card border border-hairline-gold bg-gold/[0.04] p-6">
            <p className="flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-gold-bright mb-3">
              <Star4 size={9} />
              Today&apos;s reading
            </p>
            <p className="text-[16px] text-ink leading-[1.75]">{renderMd(result.article.reading)}</p>
          </div>

          {/* Scores */}
          <div className="rounded-card border border-hairline bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-ink-muted">Today&apos;s energy</p>
              <span className="font-display font-extrabold text-2xl text-gold-bright">{result.scores.overall}<span className="text-sm text-ink-muted font-semibold">/100</span></span>
            </div>
            <div className="space-y-3.5">
              {SCORE_ROWS.map((row) => (
                <div key={row.key} className="grid grid-cols-[80px_1fr_34px] items-center gap-3">
                  <span className="text-[13px] font-medium text-ink-secondary">{row.label}</span>
                  <div className="h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${result.scores[row.key]}%`, background: "linear-gradient(90deg, var(--color-accent), var(--color-gold-bright))" }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs text-gold-bright tabular-nums">{result.scores[row.key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus + advice + lucky number */}
          <div className="grid md:grid-cols-3 gap-3.5">
            <div className="rounded-card border border-hairline bg-white/[0.02] p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1.5">Focus area</p>
              <p className="text-sm font-semibold text-ink">{result.article.focus_area}</p>
            </div>
            <div className="rounded-card border border-hairline bg-white/[0.02] p-4 md:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-1.5">Today&apos;s advice</p>
              <p className="text-sm text-ink-secondary leading-relaxed">{renderMd(result.article.advice)}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-hairline-gold bg-gold/10 px-4 py-2 text-sm text-gold-bright">
            <Star4 size={10} />
            Lucky number: <span className="font-mono font-bold">{result.lucky_number}</span>
          </div>
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Today&apos;s reading is unavailable — please try again shortly.</p>
      )}

      <CtaBand
        text={`Get a full ${name} reading with your exact birth date`}
        actions={[{ href: "/analyze/zodiac", label: `Full ${name} Analysis`, primary: true }]}
      />

      <nav className="mt-10 grid grid-cols-2 gap-4">
        {[{ s: prev, dir: "prev" }, { s: next, dir: "next" }].map(({ s, dir }) => (
          <Link
            key={s}
            href={`/horoscope/${s}`}
            className={`group flex items-center gap-3 rounded-card border border-hairline bg-white/[0.02] px-4 py-3 transition-colors hover:border-hairline-accent tap-highlight-none ${dir === "next" ? "flex-row-reverse text-right justify-start" : ""}`}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline">
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
