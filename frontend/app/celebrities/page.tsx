import Link from "next/link"
import { CELEBRITIES, SIGN_ORDER, SIGN_SYMBOL, SIGN_LABEL, SIGN_COLOR, getCelebritiesBySign } from "@/lib/celebrities"

export const metadata = {
  title: "Celebrity Zodiac Database | ZodicogAI",
  description: "Explore zodiac signs, life paths, and astrological profiles of 360 global celebrities — from Bollywood to Hollywood.",
}

const CATEGORY_COLORS: Record<string, string> = {
  Actor: "text-amber-400",
  Actress: "text-pink-400",
  Musician: "text-violet-400",
  Athlete: "text-green-400",
  Entrepreneur: "text-blue-400",
  Politician: "text-red-400",
  Director: "text-orange-400",
  Artist: "text-yellow-400",
  Author: "text-teal-400",
  Comedian: "text-lime-400",
  Model: "text-rose-400",
  Scientist: "text-cyan-400",
  default: "text-zinc-400",
}

function categoryColor(cat: string) {
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (cat.includes(key)) return CATEGORY_COLORS[key]
  }
  return CATEGORY_COLORS.default
}

export default function CelebritiesPage() {
  return (
    <main className="min-h-screen bg-[#080810] text-white pt-20 pb-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-14 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Celebrity Zodiac Database
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          360 global celebrities — discover their zodiac energy, life path number, aura colour, and astrological profile.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">360 profiles</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">12 signs</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">30 per sign</span>
        </div>
      </div>

      {/* Sign sections */}
      <div className="max-w-6xl mx-auto px-6 space-y-16">
        {SIGN_ORDER.map((sign) => {
          const celebs = getCelebritiesBySign(sign)
          const color = SIGN_COLOR[sign]
          const symbol = SIGN_SYMBOL[sign]
          const label = SIGN_LABEL[sign]

          return (
            <section key={sign}>
              {/* Sign header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                  style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44`, color }}
                >
                  {symbol}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight" style={{ color }}>
                    {label}
                  </h2>
                  <p className="text-xs text-zinc-500">{celebs.length} celebrities</p>
                </div>
                <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
              </div>

              {/* Celebrity grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {celebs.map((celeb) => (
                  <Link
                    key={celeb.slug}
                    href={`/celebrities/${celeb.slug}`}
                    className="group relative rounded-xl bg-white/[0.03] border border-white/[0.07] p-3.5 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-200"
                  >
                    {/* Sign dot */}
                    <div
                      className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-60"
                      style={{ backgroundColor: color }}
                    />

                    <p className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors leading-snug pr-3">
                      {celeb.name}
                    </p>
                    <p className={`text-xs mt-1 ${categoryColor(celeb.category)}`}>
                      {celeb.category}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 truncate">{celeb.nationality}</p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
