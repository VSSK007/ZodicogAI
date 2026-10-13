import { extractKeyLine, extractScore, TYPE_LABELS } from "@/lib/shareCard";
import { ringSrc, SITE, StoryFrame, storyFallback, storyResponse } from "@/lib/storyCard";

/** GET /r/{id}/story-image: a 1080x1920 story card for a saved reading. */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: { title?: string; analysis_type?: string; payload?: unknown } | null = null;
  try {
    const res = await fetch(`${API}/results/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return storyFallback();
    data = await res.json();
  } catch {
    return storyFallback();
  }

  const title = (data?.title || "Shared reading").replace(/ Synastry Report$/, "");
  const label = TYPE_LABELS[data?.analysis_type ?? ""] ?? "Reading";
  const score = extractScore(data?.payload);
  const line = extractKeyLine(data?.payload, 190);

  return storyResponse(
    <StoryFrame footer={`${SITE}/r/${id}`}>
      <div style={{
        display: "flex", marginTop: 150, fontSize: 30, fontWeight: 700, letterSpacing: "0.26em",
        textTransform: "uppercase", color: "#d8a63c",
      }}>
        {label}
      </div>

      <div style={{
        display: "flex", marginTop: 34, padding: "0 90px", textAlign: "center", justifyContent: "center",
        fontSize: title.length > 26 ? 78 : 96, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
      }}>
        {title}
      </div>

      {score !== null && (
        <div style={{
          display: "flex", position: "relative", marginTop: 90,
          width: 560, height: 560, alignItems: "center", justifyContent: "center",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ringSrc(score)} width={560} height={560} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 190, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ display: "flex", fontSize: 40, color: "rgba(240,239,246,0.5)", marginTop: 6 }}>/ 100</div>
          </div>
        </div>
      )}

      {line && (
        <div style={{
          display: "flex", marginTop: score !== null ? 90 : 120, padding: "0 100px",
          textAlign: "center", justifyContent: "center",
          fontSize: 44, lineHeight: 1.35, color: "rgba(240,239,246,0.82)",
        }}>
          {line}
        </div>
      )}
    </StoryFrame>,
  );
}
