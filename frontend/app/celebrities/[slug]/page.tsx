import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { renderMd } from "@/lib/renderMd"
import {
  CELEBRITIES, getCelebrityBySlug,
  SIGN_SYMBOL, SIGN_LABEL, SIGN_COLOR,
} from "@/lib/celebrities"

export const revalidate = false // cached forever at build time

// ── Static params — all 360 slugs ────────────────────────────────────────────

export async function generateStaticParams() {
  return CELEBRITIES.map((c) => ({ slug: c.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const celeb = getCelebrityBySlug(slug)
  if (!celeb) return {}
  const signLabel = SIGN_LABEL[celeb.sign]
  return {
    title: `${celeb.name} — ${signLabel} Zodiac Profile | ZodicogAI`,
    description: `Explore ${celeb.name}'s zodiac sign (${signLabel}), life path number, aura color, and astrological personality profile on ZodicogAI.`,
    openGraph: {
      title: `${celeb.name} ${SIGN_SYMBOL[celeb.sign]} ${signLabel} | ZodicogAI`,
      description: `${celeb.nationality} ${celeb.category} born ${celeb.born}. ${signLabel} zodiac profile with life path and astrological insights.`,
      url: `https://zodicogai.com/celebrities/${slug}`,
      siteName: "ZodicogAI",
      type: "article",
    },
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CelebrityArticle {
  famous_for: string
  personality_snapshot: string
  love_style: string
  compatibility_note: string
  fun_fact: string
}

// ── Aura color names per sign (from color engine data) ───────────────────────

const AURA_NAME: Record<string, string> = {
  aries: "Aura Red", taurus: "Emerald Aura", gemini: "Solar Yellow",
  cancer: "Moonstone Blue", leo: "Gold Aura", virgo: "Sage Green",
  libra: "Rose Aura", scorpio: "Deep Indigo", sagittarius: "Electric Purple",
  capricorn: "Forest Aura", aquarius: "Electric Blue", pisces: "Lavender Mist",
}

// ── Section card ──────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">{label}</p>
      <div className="text-zinc-300 text-sm leading-relaxed">{children}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CelebrityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const celeb = getCelebrityBySlug(slug)
  if (!celeb) notFound()

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
  const color = SIGN_COLOR[celeb.sign]
  const symbol = SIGN_SYMBOL[celeb.sign]
  const signLabel = SIGN_LABEL[celeb.sign]
  const auraName = AURA_NAME[celeb.sign] ?? "Aura"

  // Build query string for the backend endpoint
  const qs = new URLSearchParams({
    name:        celeb.name,
    sign:        signLabel,
    born:        celeb.born,
    nationality: celeb.nationality,
    category:    celeb.category,
    day:         String(celeb.birthDay),
    month:       String(celeb.birthMonth),
  }).toString()

  let article: CelebrityArticle | null = null
  let lifePathNum: number | null = null

  try {
    const res = await fetch(`${API}/celebrities/${slug}?${qs}`, {
      cache: "force-cache",
    })
    if (res.ok) {
      const data = await res.json()
      article = data.article ?? null
      lifePathNum = data.life_path ?? null
    }
  } catch { /* fallback to null */ }

  return (
    <main className="min-h-screen bg-[#080810] text-white pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-6">

        {/* Back link */}
        <Link
          href="/celebrities"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All Celebrities
        </Link>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] mb-8"
          style={{ background: `radial-gradient(ellipse at top, ${color}18 0%, transparent 70%)` }}>
          <div className="p-8">
            {/* Sign symbol */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5"
              style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40`, color }}
            >
              {symbol}
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {celeb.name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                {symbol} {signLabel}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                {celeb.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                {celeb.nationality}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-500">
                Born {celeb.born}
              </span>
            </div>

            {/* Life path + aura row */}
            <div className="flex flex-wrap gap-4">
              {lifePathNum !== null && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-400">
                    {lifePathNum}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Life Path</p>
                    <p className="text-xs text-zinc-300 font-medium">{lifePathNum}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20`, borderColor: `${color}50` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Aura</p>
                  <p className="text-xs text-zinc-300 font-medium">{auraName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article sections */}
        {article ? (
          <div className="space-y-4">
            <Section label="Famous For">
              {renderMd(article.famous_for)}
            </Section>
            <Section label={`${signLabel} Personality`}>
              {renderMd(article.personality_snapshot)}
            </Section>
            <Section label="Love Style">
              {renderMd(article.love_style)}
            </Section>
            <Section label="Best Matches">
              {renderMd(article.compatibility_note)}
            </Section>
            <Section label="Fun Fact">
              {renderMd(article.fun_fact)}
            </Section>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-8 text-center">
            <p className="text-zinc-500 text-sm">Profile unavailable — please try again later.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-xl bg-white/[0.03] border border-white/[0.07] p-6 text-center">
          <p className="text-zinc-400 text-sm mb-4">
            Curious about your own {signLabel} energy? Run a personalised analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/analyze/zodiac"
              className="px-4 py-2 rounded-full text-sm font-medium border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Zodiac Analysis
            </Link>
            <Link
              href="/analyze/hybrid"
              className="px-4 py-2 rounded-full text-sm font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              Full Hybrid Analysis
            </Link>
          </div>
        </div>

        {/* Sign index link */}
        <div className="mt-6 text-center">
          <Link
            href="/celebrities"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            View all {signLabel} celebrities →
          </Link>
        </div>
      </div>
    </main>
  )
}
