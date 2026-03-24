import { ImageResponse } from "next/og"
import { getCelebrityBySlug, SIGN_SYMBOL, SIGN_LABEL, SIGN_COLOR } from "@/lib/celebrities"
import CELEB_BIOS from "@/lib/celeb-bios.json"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const MODALITY: Record<string, string> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed",   leo: "Fixed",       scorpio: "Fixed",  aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable",   sagittarius: "Mutable", pisces: "Mutable",
}
const MODALITY_HEX: Record<string, string> = {
  Cardinal: "#ef4444", Fixed: "#22c55e", Mutable: "#818cf8",
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const celeb = getCelebrityBySlug(slug)

  if (!celeb) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#080810", color: "#ffffff", fontSize: 32, fontFamily: "sans-serif" }}>
        ZodicogAI
      </div>,
      { ...size }
    )
  }

  const color     = SIGN_COLOR[celeb.sign]
  const symbol    = SIGN_SYMBOL[celeb.sign]
  const signLabel = SIGN_LABEL[celeb.sign]
  const bioEntry  = (CELEB_BIOS as Record<string, { life_path?: number }>)[slug]
  const lifePathNum: number | null = bioEntry?.life_path ?? null
  const modality  = MODALITY[celeb.sign] ?? ""
  const modColor  = MODALITY_HEX[modality] ?? "#a1a1aa"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          backgroundColor: "#080810",
          fontFamily: "sans-serif",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Sign-color radial glow at top */}
        <div style={{
          position: "absolute", top: -120, left: "50%",
          width: 680, height: 440, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}35 0%, transparent 70%)`,
          transform: "translateX(-50%)", display: "flex",
        }} />

        {/* Sign symbol */}
        <div style={{ fontSize: 80, color, marginBottom: 16, display: "flex" }}>{symbol}</div>

        {/* Celebrity name */}
        <div style={{
          fontSize: celeb.name.length > 18 ? 52 : 64,
          fontWeight: 700, color: "#ffffff",
          marginBottom: 20, textAlign: "center",
          lineHeight: 1.1, display: "flex", maxWidth: 900,
        }}>
          {celeb.name}
        </div>

        {/* Pills row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
          <div style={{ padding: "8px 20px", borderRadius: 999, backgroundColor: `${color}22`, border: `1.5px solid ${color}55`, color, fontSize: 20, fontWeight: 600, display: "flex" }}>
            {symbol} {signLabel}
          </div>
          {modality && (
            <div style={{ padding: "8px 20px", borderRadius: 999, backgroundColor: `${modColor}22`, border: `1.5px solid ${modColor}55`, color: modColor, fontSize: 20, fontWeight: 600, display: "flex" }}>
              {modality}
            </div>
          )}
          {lifePathNum !== null && (
            <div style={{ padding: "8px 20px", borderRadius: 999, backgroundColor: "rgba(245,158,11,0.15)", border: "1.5px solid rgba(245,158,11,0.4)", color: "#fbbf24", fontSize: 20, fontWeight: 600, display: "flex" }}>
              Life Path {lifePathNum}
            </div>
          )}
          <div style={{ padding: "8px 20px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 18, display: "flex" }}>
            {celeb.nationality} {celeb.category}
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
