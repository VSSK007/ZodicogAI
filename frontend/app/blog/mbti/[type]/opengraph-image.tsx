import { ImageResponse } from "next/og"
import { MBTI_DATA, ROLE_COLOR } from "@/lib/mbti-data"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const key  = type.toUpperCase()
  const data = MBTI_DATA[key]

  if (!data) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#080810", color: "#ffffff", fontSize: 32, fontFamily: "sans-serif" }}>
        ZodicogAI
      </div>,
      { ...size }
    )
  }

  const color   = ROLE_COLOR[data.role] ?? "#f59e0b"
  const letters = key.split("")

  // One-word labels for each letter position
  const LABEL: Record<string, string> = {
    E: "Extrovert", I: "Introvert",
    S: "Sensing",   N: "Intuitive",
    T: "Thinking",  F: "Feeling",
    J: "Judging",   P: "Perceiving",
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#080810", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
        {/* Role-color radial glow */}
        <div style={{ position: "absolute", top: -80, left: "50%", width: 580, height: 360, borderRadius: "50%", background: `radial-gradient(ellipse, ${color}30 0%, transparent 70%)`, transform: "translateX(-50%)", display: "flex" }} />

        {/* Type code */}
        <div style={{ fontSize: 100, fontWeight: 900, color, letterSpacing: "0.1em", marginBottom: 10, display: "flex" }}>
          {key}
        </div>

        {/* Nickname */}
        <div style={{ fontSize: 42, fontWeight: 600, color: "#ffffff", marginBottom: 6, display: "flex" }}>
          {data.nickname}
        </div>

        {/* Role group */}
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.38)", marginBottom: 36, display: "flex" }}>
          {data.role}
        </div>

        {/* Letter tiles with labels */}
        <div style={{ display: "flex", gap: 16 }}>
          {letters.map((letter) => (
            <div key={letter} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: `${color}22`, border: `2px solid ${color}45`, color, fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {letter}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", display: "flex" }}>
                {LABEL[letter] ?? letter}
              </div>
            </div>
          ))}
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
