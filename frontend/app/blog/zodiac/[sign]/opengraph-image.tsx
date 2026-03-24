import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const SIGN_META: Record<string, { symbol: string; element: string; modality: string; archetype: string; ruling: string; dates: string }> = {
  aries:       { symbol: "♈", element: "Fire",  modality: "Cardinal", archetype: "The Pioneer",     ruling: "Mars",             dates: "Mar 21 – Apr 19" },
  taurus:      { symbol: "♉", element: "Earth", modality: "Fixed",    archetype: "The Sensualist",  ruling: "Venus",            dates: "Apr 20 – May 20" },
  gemini:      { symbol: "♊", element: "Air",   modality: "Mutable",  archetype: "The Messenger",   ruling: "Mercury",          dates: "May 21 – Jun 20" },
  cancer:      { symbol: "♋", element: "Water", modality: "Cardinal", archetype: "The Nurturer",    ruling: "Moon",             dates: "Jun 21 – Jul 22" },
  leo:         { symbol: "♌", element: "Fire",  modality: "Fixed",    archetype: "The Sovereign",   ruling: "Sun",              dates: "Jul 23 – Aug 22" },
  virgo:       { symbol: "♍", element: "Earth", modality: "Mutable",  archetype: "The Analyst",     ruling: "Mercury",          dates: "Aug 23 – Sep 22" },
  libra:       { symbol: "♎", element: "Air",   modality: "Cardinal", archetype: "The Diplomat",    ruling: "Venus",            dates: "Sep 23 – Oct 22" },
  scorpio:     { symbol: "♏", element: "Water", modality: "Fixed",    archetype: "The Alchemist",   ruling: "Pluto · Mars",     dates: "Oct 23 – Nov 21" },
  sagittarius: { symbol: "♐", element: "Fire",  modality: "Mutable",  archetype: "The Philosopher", ruling: "Jupiter",          dates: "Nov 22 – Dec 21" },
  capricorn:   { symbol: "♑", element: "Earth", modality: "Cardinal", archetype: "The Architect",   ruling: "Saturn",           dates: "Dec 22 – Jan 19" },
  aquarius:    { symbol: "♒", element: "Air",   modality: "Fixed",    archetype: "The Visionary",   ruling: "Uranus · Saturn",  dates: "Jan 20 – Feb 18" },
  pisces:      { symbol: "♓", element: "Water", modality: "Mutable",  archetype: "The Dreamer",     ruling: "Neptune · Jupiter",dates: "Feb 19 – Mar 20" },
}

const ELEMENT_HEX: Record<string, string> = {
  Fire: "#f59e0b", Earth: "#a3a37a", Air: "#7dd3fc", Water: "#818cf8",
}
const MODALITY_HEX: Record<string, string> = {
  Cardinal: "#ef4444", Fixed: "#22c55e", Mutable: "#818cf8",
}

export default async function Image({ params }: { params: Promise<{ sign: string }> }) {
  const { sign } = await params
  const meta = SIGN_META[sign.toLowerCase()]

  if (!meta) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#080810", color: "#ffffff", fontSize: 32, fontFamily: "sans-serif" }}>
        ZodicogAI
      </div>,
      { ...size }
    )
  }

  const name     = sign.charAt(0).toUpperCase() + sign.slice(1)
  const elColor  = ELEMENT_HEX[meta.element]   ?? "#f59e0b"
  const modColor = MODALITY_HEX[meta.modality] ?? "#a1a1aa"

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#080810", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Element glow */}
        <div style={{ position: "absolute", top: -100, left: "50%", width: 600, height: 380, borderRadius: "50%", background: `radial-gradient(ellipse, ${elColor}30 0%, transparent 68%)`, transform: "translateX(-50%)", display: "flex" }} />

        {/* Sign symbol */}
        <div style={{ fontSize: 100, color: elColor, marginBottom: 12, display: "flex" }}>{meta.symbol}</div>

        {/* Sign name */}
        <div style={{ fontSize: 80, fontWeight: 700, color: "#ffffff", marginBottom: 6, display: "flex" }}>{name}</div>

        {/* Archetype + dates */}
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", marginBottom: 30, display: "flex" }}>
          {meta.archetype} · {meta.dates}
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ padding: "8px 22px", borderRadius: 999, backgroundColor: `${elColor}22`, border: `1.5px solid ${elColor}50`, color: elColor, fontSize: 20, fontWeight: 600, display: "flex" }}>
            {meta.element}
          </div>
          <div style={{ padding: "8px 22px", borderRadius: 999, backgroundColor: `${modColor}22`, border: `1.5px solid ${modColor}50`, color: modColor, fontSize: 20, fontWeight: 600, display: "flex" }}>
            {meta.modality}
          </div>
          <div style={{ padding: "8px 22px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)", fontSize: 20, display: "flex" }}>
            {meta.ruling}
          </div>
        </div>

        {/* Watermark */}
        <div style={{ position: "absolute", bottom: 32, display: "flex", color: "rgba(255,255,255,0.2)", fontSize: 16, letterSpacing: "0.12em" }}>
          zodicogai.com
        </div>
      </div>
    ),
    { ...size }
  )
}
