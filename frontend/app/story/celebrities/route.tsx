import { SITE, StoryFrame, storyFallback, storyResponse } from "@/lib/storyCard";

/**
 * GET /story/celebrities?name=&day=&month=
 * A 1080x1920 story card of the visitor's five closest celebrities. The
 * ranking and the "why" come from the API, never from the query string.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

interface Match {
  name: string;
  sign: string;
  category: string;
  score: number;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const day = q.get("day") ?? "";
  const month = q.get("month") ?? "";
  const name = (q.get("name") ?? "").replace(/[^\p{L}\p{N} .'-]/gu, "").slice(0, 24).trim();
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !name) return storyFallback();

  let matches: Match[];
  try {
    const upstream = new URLSearchParams({ name, day, month, limit: "5" });
    const res = await fetch(`${API}/celebrities/matches?${upstream}`, { cache: "no-store" });
    if (!res.ok) return storyFallback();
    matches = ((await res.json()) as { matches: Match[] }).matches;
  } catch {
    return storyFallback();
  }

  return storyResponse(
    <StoryFrame footer={`${SITE}/celebrities`}>
      <div style={{
        display: "flex", marginTop: 130, fontSize: 30, fontWeight: 700, letterSpacing: "0.26em",
        textTransform: "uppercase", color: "#d8a63c",
      }}>
        Celebrity matches
      </div>

      <div style={{
        display: "flex", marginTop: 30, padding: "0 90px", textAlign: "center", justifyContent: "center",
        fontSize: 84, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
      }}>
        {`${name}'s five closest`}
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 80, width: "100%", padding: "0 70px", gap: 22 }}>
        {matches.map((m, i) => (
          <div key={m.name} style={{
            display: "flex", alignItems: "center", padding: "26px 34px", borderRadius: 28,
            border: "2px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)",
          }}>
            <div style={{ display: "flex", width: 56, fontSize: 36, color: "rgba(240,239,246,0.4)" }}>{i + 1}</div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", fontSize: 42, fontWeight: 800 }}>{m.name}</div>
              <div style={{ display: "flex", fontSize: 26, color: "rgba(240,239,246,0.55)", marginTop: 4 }}>
                {m.sign.charAt(0).toUpperCase() + m.sign.slice(1)} · {m.category}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "#edcb7e" }}>{Math.round(m.score)}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", marginTop: 56, padding: "0 90px", textAlign: "center", justifyContent: "center",
        fontSize: 28, color: "rgba(240,239,246,0.5)",
      }}>
        By sun sign and numerology
      </div>
    </StoryFrame>,
  );
}
