import { ImageResponse } from "next/og";
import { SIGN_COLOR, SIGN_SYMBOL } from "@/lib/celebrities";
import { parseCombo, signName } from "@/lib/combos";
import { MBTI_DATA } from "@/lib/mbti-data";
import { SIGN_META } from "@/lib/zodiac";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Static card from the combination alone (no backend call, so it never waits on the article). */
export default async function Image({ params }: { params: Promise<{ combo: string }> }) {
  const { combo } = await params;
  const c = parseCombo(combo);

  if (!c) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0a14", color: "#f0eff6", fontSize: 40, fontFamily: "sans-serif" }}>
          ZodicogAI
        </div>
      ),
      { ...size },
    );
  }

  const name = signName(c.sign);
  const meta = SIGN_META[name];
  const type = MBTI_DATA[c.mbti];
  const color = SIGN_COLOR[c.sign] ?? "#a99bff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", backgroundColor: "#0b0a14",
          fontFamily: "sans-serif", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: -140, left: "50%", width: 760, height: 460, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}38 0%, transparent 70%)`, transform: "translateX(-50%)", display: "flex",
        }} />
        <div style={{ display: "flex", fontSize: 150, color, lineHeight: 1 }}>{SIGN_SYMBOL[c.sign]}</div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 82, fontWeight: 800, color: "#f0eff6", letterSpacing: "-0.03em" }}>
          {name} × {c.mbti}
        </div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 34, color: "#a8a5bd" }}>
          {type.nickname} · {meta.element} {meta.modality}
        </div>
        <div style={{ display: "flex", position: "absolute", bottom: 44, fontSize: 24, color: "#6f6c85" }}>
          zodicogai.com · personality, love & work
        </div>
      </div>
    ),
    { ...size },
  );
}
