import { ImageResponse } from "next/og";
import Sigil from "@/components/Sigil";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let who = "Someone";
  let sign = "";
  try {
    const res = await fetch(`${API}/invites/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { first_name: string; sign: string };
      who = data.first_name;
      sign = data.sign;
    }
  } catch {
    // Fall back to the generic card.
  }

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

        <div style={{ display: "flex", marginBottom: 28 }}>
          <Sigil seed={`invite-${token}`} size={150} />
        </div>

        <div style={{
          display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "#edcb7e",
        }}>
          Compatibility invite
        </div>

        <div style={{
          display: "flex", marginTop: 22, padding: "0 90px", textAlign: "center",
          fontSize: 66, fontWeight: 800, color: "#f0eff6", lineHeight: 1.1,
        }}>
          {who} wants to check your compatibility
        </div>

        {sign && (
          <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: "#a8a5bd" }}>
            {sign}
          </div>
        )}

        <div style={{ display: "flex", position: "absolute", bottom: 40, fontSize: 24, color: "#6f6c85" }}>
          zodicogai.com
        </div>
      </div>
    ),
    { ...size },
  );
}
