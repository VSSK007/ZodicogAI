import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const TYPE_LABELS: Record<string, string> = {
  hybrid_analysis: "Behavioral Profile",
  compatibility_analysis: "Compatibility",
  emotional_compatibility: "Emotional Compatibility",
  romantic_compatibility: "Romantic Compatibility",
  sextrology_analysis: "Sextrology",
  sextrology_solo_analysis: "Sextrology",
  love_style_analysis: "Love Style",
  love_language_analysis: "Love Language",
  full_relationship_intelligence: "Full Synastry Report",
  zodiac_article: "Zodiac Deep-Dive",
  color_analysis: "Aura Colors",
  color_pair_analysis: "Aura Colors",
  numerology_analysis: "Numerology",
  numerology_pair_analysis: "Numerology",
};

// Known score fields across analysis types, checked in order — flat first,
// then one level into a nested "compatibility" object (numerology pairs).
const SCORE_KEYS = [
  "sexual_compatibility_score",
  "romantic_compatibility_score",
  "emotional_compatibility_score",
  "love_style_compatibility_score",
  "love_language_compatibility_score",
  "overall_score",
  "overall",
];

function findScore(payload: Record<string, unknown>): number | null {
  for (const key of SCORE_KEYS) {
    const v = payload[key];
    if (typeof v === "number") return Math.round(v);
  }
  const nested = payload["compatibility"];
  if (nested && typeof nested === "object") {
    const v = (nested as Record<string, unknown>)["compatibility_score"];
    if (typeof v === "number") return Math.round(v);
  }
  return null;
}

function fallbackImage(label = "ZodicogAI") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center",
          backgroundColor: "#0b0a14", color: "#f0eff6", fontSize: 40, fontFamily: "sans-serif",
        }}
      >
        {label}
      </div>
    ),
    { ...size },
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let title = "Shared reading";
  let analysisType = "";
  let score: number | null = null;

  try {
    const res = await fetch(`${API}/results/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      title = data.title || title;
      analysisType = data.analysis_type || "";
      score = findScore(data.payload ?? {});
    } else {
      return fallbackImage();
    }
  } catch {
    return fallbackImage();
  }

  const typeLabel = TYPE_LABELS[analysisType] ?? "Reading";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          backgroundColor: "#0b0a14",
          fontFamily: "sans-serif",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Violet + gold ambient glow */}
        <div style={{
          position: "absolute", top: -140, left: "50%",
          width: 760, height: 460, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(139,124,246,0.28) 0%, transparent 70%)",
          transform: "translateX(-50%)", display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: -180, left: "50%",
          width: 900, height: 400, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(216,166,60,0.14) 0%, transparent 70%)",
          transform: "translateX(-50%)", display: "flex",
        }} />

        {/* Eyebrow */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 20, fontWeight: 700, letterSpacing: "0.22em",
          color: "#d8a63c", marginBottom: 26, textTransform: "uppercase",
        }}>
          ✦ {typeLabel}
        </div>

        {/* Title */}
        <div style={{
          fontSize: title.length > 34 ? 46 : 58,
          fontWeight: 800, color: "#f0eff6",
          marginBottom: score !== null ? 36 : 44,
          textAlign: "center", lineHeight: 1.15,
          display: "flex", maxWidth: 940,
        }}>
          {title}
        </div>

        {/* Score ring (simplified as a circular badge — next/og has no SVG stroke-dasharray support) */}
        {score !== null && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            width: 170, height: 170, borderRadius: "50%",
            border: "8px solid rgba(139,124,246,0.9)",
            marginBottom: 40,
          }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#f0eff6", display: "flex" }}>{score}</div>
            <div style={{ fontSize: 18, color: "rgba(240,239,246,0.5)", display: "flex" }}>/ 100</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, color: "rgba(240,239,246,0.6)" }}>
          <span style={{ fontWeight: 800, display: "flex" }}>
            Zodicog<span style={{ color: "#a99bff" }}>AI</span>
          </span>
          <span style={{ color: "rgba(240,239,246,0.25)", display: "flex" }}>·</span>
          <span style={{ display: "flex" }}>Explainable relationship intelligence</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
