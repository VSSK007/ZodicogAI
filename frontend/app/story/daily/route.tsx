import { SITE, StoryFrame, storyFallback, storyResponse } from "@/lib/storyCard";

/**
 * GET /story/daily?sign=&day=&month=&mbti=&name=
 * A 1080x1920 story card of the visitor's daily card. The text comes from the
 * API (never from the query), so the card can't be made to say anything else;
 * `name` is shown as a greeting only, capped at 24 characters.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

interface Daily {
  date: string;
  horoscope: string;
  scores: { overall: number };
  do: string;
  avoid: string;
  lucky_color: { name: string; hex: string };
  lucky_number: number;
}

function clip(s: string, max: number) {
  const t = s.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const sign = (q.get("sign") ?? "").toLowerCase();
  if (!SIGNS.includes(sign)) return storyFallback();

  const upstream = new URLSearchParams();
  for (const k of ["day", "month"]) {
    const v = q.get(k);
    if (v && /^\d{1,2}$/.test(v)) upstream.set(k, v);
  }
  const mbti = (q.get("mbti") ?? "").toUpperCase();
  if (/^[EI][SN][TF][JP]$/.test(mbti)) upstream.set("mbti", mbti);
  const name = (q.get("name") ?? "").replace(/[^\p{L}\p{N} .'-]/gu, "").slice(0, 24).trim();

  let d: Daily;
  try {
    const res = await fetch(`${API}/daily/${sign}?${upstream}`, { cache: "no-store" });
    if (!res.ok) return storyFallback();
    d = (await res.json()) as Daily;
  } catch {
    return storyFallback();
  }

  const date = new Date(`${d.date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
  });
  const pretty = sign.charAt(0).toUpperCase() + sign.slice(1);
  // "—" is the API's placeholder when the AI was unavailable: show nothing rather than a stray dash.
  const horoscope = d.horoscope.trim() === "—" ? "" : clip(d.horoscope, 240);

  return storyResponse(
    <StoryFrame footer={`${SITE}/today`}>
      <div style={{
        display: "flex", marginTop: 130, fontSize: 30, fontWeight: 700, letterSpacing: "0.26em",
        textTransform: "uppercase", color: "#d8a63c",
      }}>
        {date}
      </div>

      <div style={{
        display: "flex", marginTop: 30, padding: "0 90px", textAlign: "center", justifyContent: "center",
        fontSize: 92, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
      }}>
        {name ? `${name}'s ${pretty} day` : `Your ${pretty} day`}
      </div>

      {horoscope.length > 2 && (
        <div style={{
          display: "flex", marginTop: 70, padding: "0 90px", textAlign: "center", justifyContent: "center",
          fontSize: 46, lineHeight: 1.4, color: "rgba(240,239,246,0.88)",
        }}>
          {horoscope}
        </div>
      )}

      {/* Lucky colour + number */}
      <div style={{ display: "flex", marginTop: 90, gap: 70, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", width: 92, height: 92, borderRadius: 46, backgroundColor: d.lucky_color.hex, border: "3px solid rgba(255,255,255,0.35)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,239,246,0.5)" }}>Lucky colour</div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{d.lucky_color.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(240,239,246,0.5)" }}>Lucky number</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, color: "#edcb7e", lineHeight: 1 }}>{d.lucky_number}</div>
        </div>
      </div>

      {/* Do / Avoid */}
      <div style={{ display: "flex", marginTop: 90, gap: 36, padding: "0 70px", width: "100%" }}>
        {[
          { label: "Do", text: d.do, color: "#34d399" },
          { label: "Avoid", text: d.avoid, color: "#f87171" },
        ].map((c) => (
          <div key={c.label} style={{
            display: "flex", flexDirection: "column", flex: 1, padding: 34, borderRadius: 28,
            border: "2px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.04)",
          }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: c.color }}>{c.label}</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 36, lineHeight: 1.3, color: "rgba(240,239,246,0.88)" }}>{clip(c.text, 90)}</div>
          </div>
        ))}
      </div>
    </StoryFrame>,
  );
}
