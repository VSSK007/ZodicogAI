import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { renderMd } from "@/lib/renderMd"
import {
  CELEBRITIES, getCelebrityBySlug,
  SIGN_SYMBOL, SIGN_LABEL, SIGN_COLOR,
} from "@/lib/celebrities"
import CELEB_BIOS from "@/lib/celeb-bios.json"
import ShareCelebButton from "@/components/ShareCelebButton"

export const revalidate = false  // fully static — data comes from celeb-bios.json

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

interface BioEntry {
  article: CelebrityArticle
  life_path: number
  wiki_url?: string
  wiki_image?: string
}

// ── Aura color names + their actual hex (separate from sign color) ───────────

const AURA_NAME: Record<string, string> = {
  aries: "Aura Red", taurus: "Emerald Aura", gemini: "Solar Yellow",
  cancer: "Moonstone Blue", leo: "Gold Aura", virgo: "Sage Green",
  libra: "Rose Aura", scorpio: "Deep Indigo", sagittarius: "Electric Purple",
  capricorn: "Forest Aura", aquarius: "Electric Blue", pisces: "Lavender Mist",
}

// Actual hex that matches each aura name — used for the dot indicator
const AURA_COLOR: Record<string, string> = {
  aries:       "#EF4444", // Aura Red
  taurus:      "#22C55E", // Emerald Aura
  gemini:      "#EAB308", // Solar Yellow
  cancer:      "#93C5FD", // Moonstone Blue
  leo:         "#FBBF24", // Gold Aura
  virgo:       "#84CC16", // Sage Green
  libra:       "#F472B6", // Rose Aura
  scorpio:     "#6D28D9", // Deep Indigo
  sagittarius: "#A855F7", // Electric Purple
  capricorn:   "#16A34A", // Forest Aura
  aquarius:    "#38BDF8", // Electric Blue
  pisces:      "#C4B5FD", // Lavender Mist
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

  const color     = SIGN_COLOR[celeb.sign]
  const symbol    = SIGN_SYMBOL[celeb.sign]
  const signLabel = SIGN_LABEL[celeb.sign]
  const auraName  = AURA_NAME[celeb.sign]  ?? "Aura"
  const auraColor = AURA_COLOR[celeb.sign] ?? color

  const bioEntry = (CELEB_BIOS as Record<string, BioEntry>)[slug]
  const article: CelebrityArticle | null = bioEntry?.article ?? null
  const lifePathNum: number | null       = bioEntry?.life_path ?? null
  const wikiUrl: string | null           = bioEntry?.wiki_url ?? null
  const wikiImage: string | null         = bioEntry?.wiki_image ?? null

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
        <div
          className="relative rounded-2xl overflow-hidden border border-white/[0.07] mb-8 pt-10 pb-7 px-7"
          style={{ background: `radial-gradient(ellipse at top, ${color}18 0%, transparent 65%)` }}
        >
          {/* Avatar — centered circle with sign-color glow */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {wikiImage ? (
                <div
                  className="w-32 h-32 rounded-full overflow-hidden"
                  style={{
                    border: `3px solid ${color}80`,
                    boxShadow: `0 0 0 6px ${color}18, 0 0 32px ${color}40`,
                  }}
                >
                  <Image
                    src={wikiImage}
                    alt={celeb.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover object-top"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold"
                  style={{
                    backgroundColor: `${color}18`,
                    border: `3px solid ${color}60`,
                    boxShadow: `0 0 0 6px ${color}10, 0 0 28px ${color}30`,
                    color,
                  }}
                >
                  {symbol}
                </div>
              )}
              {/* Sign badge — bottom-right of circle */}
              <div
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
                style={{ backgroundColor: `${color}30`, border: `2px solid ${color}70`, color, backdropFilter: "blur(4px)" }}
              >
                {symbol}
              </div>
            </div>
          </div>

          {/* Name — centered */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {celeb.name}
            </h1>

            {/* Meta pills — centered */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
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
              {wikiUrl && (
                <a
                  href={wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-colors"
                >
                  Wikipedia ↗
                </a>
              )}
            </div>

            {/* Share button */}
            <div className="flex justify-center mb-5">
              <ShareCelebButton
                name={celeb.name}
                signLabel={signLabel}
                symbol={symbol}
                slug={slug}
                lifePathNum={lifePathNum}
                auraName={auraName}
              />
            </div>

            {/* Life path + aura — centered */}
            <div className="flex flex-wrap justify-center gap-6">
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
                  style={{ backgroundColor: `${auraColor}20`, borderColor: `${auraColor}50` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: auraColor }} />
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
            href={`/celebrities#${celeb.sign}`}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            View all {signLabel} celebrities →
          </Link>
        </div>
      </div>
    </main>
  )
}
