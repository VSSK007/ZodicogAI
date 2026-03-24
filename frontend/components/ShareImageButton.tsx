"use client";
import { useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HybridShareData {
  type: "hybrid";
  name: string;
  sign: string;
  symbol: string;
  signColor: string;
  mbtiType: string;
  modality?: string;
  lifePathNum?: number | null;
}

export interface CompatShareData {
  type: "compat";
  nameA: string;
  nameB: string;
  signA: string;
  symbolA: string;
  colorA: string;
  signB: string;
  symbolB: string;
  colorB: string;
  score: number;
}

export type ShareData = HybridShareData | CompatShareData;

const MODALITY_HEX: Record<string, string> = {
  Cardinal: "#ef4444", Fixed: "#22c55e", Mutable: "#818cf8",
};

const CARD = 1080; // square share card size

// ── Hidden capture cards ──────────────────────────────────────────────────────

function HybridCard({ name, sign, symbol, signColor, mbtiType, modality, lifePathNum }: HybridShareData) {
  const modColor = modality ? (MODALITY_HEX[modality] ?? "#a1a1aa") : null;
  return (
    <div style={{ width: CARD, height: CARD, backgroundColor: "#080810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif", padding: 80 }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: -140, left: "50%", width: 720, height: 500, borderRadius: "50%", background: `radial-gradient(ellipse, ${signColor}32 0%, transparent 65%)`, transform: "translateX(-50%)" }} />
      {/* Symbol */}
      <div style={{ fontSize: 120, color: signColor, marginBottom: 28, lineHeight: 1 }}>{symbol}</div>
      {/* Name */}
      <div style={{ fontSize: name.length > 14 ? 60 : 72, fontWeight: 700, color: "#ffffff", marginBottom: 16, textAlign: "center", lineHeight: 1.1 }}>{name}</div>
      {/* Pills */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
        <div style={{ padding: "12px 28px", borderRadius: 999, backgroundColor: `${signColor}22`, border: `2px solid ${signColor}50`, color: signColor, fontSize: 26, fontWeight: 600 }}>
          {symbol} {sign}
        </div>
        <div style={{ padding: "12px 28px", borderRadius: 999, backgroundColor: "rgba(99,102,241,0.2)", border: "2px solid rgba(99,102,241,0.45)", color: "#a5b4fc", fontSize: 26, fontWeight: 600 }}>
          {mbtiType}
        </div>
        {modColor && modality && (
          <div style={{ padding: "12px 28px", borderRadius: 999, backgroundColor: `${modColor}20`, border: `2px solid ${modColor}45`, color: modColor, fontSize: 26, fontWeight: 600 }}>
            {modality}
          </div>
        )}
        {lifePathNum != null && (
          <div style={{ padding: "12px 28px", borderRadius: 999, backgroundColor: "rgba(245,158,11,0.15)", border: "2px solid rgba(245,158,11,0.4)", color: "#fbbf24", fontSize: 26, fontWeight: 600 }}>
            Life Path {lifePathNum}
          </div>
        )}
      </div>
      {/* Watermark */}
      <div style={{ position: "absolute", bottom: 52, color: "rgba(255,255,255,0.18)", fontSize: 26, letterSpacing: "0.14em" }}>ZODICOGAI.COM</div>
    </div>
  );
}

function CompatCard({ nameA, nameB, signA, symbolA, colorA, signB, symbolB, colorB, score }: CompatShareData) {
  return (
    <div style={{ width: CARD, height: CARD, backgroundColor: "#080810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif", padding: 80 }}>
      {/* Dual glow */}
      <div style={{ position: "absolute", top: -80, left: "5%", width: 480, height: 360, borderRadius: "50%", background: `radial-gradient(ellipse, ${colorA}28 0%, transparent 70%)` }} />
      <div style={{ position: "absolute", top: -80, right: "5%", width: 480, height: 360, borderRadius: "50%", background: `radial-gradient(ellipse, ${colorB}28 0%, transparent 70%)` }} />
      {/* Symbols */}
      <div style={{ display: "flex", alignItems: "center", gap: 36, marginBottom: 20 }}>
        <div style={{ fontSize: 100, color: colorA }}>{symbolA}</div>
        <div style={{ fontSize: 52, color: "rgba(255,255,255,0.18)" }}>×</div>
        <div style={{ fontSize: 100, color: colorB }}>{symbolB}</div>
      </div>
      {/* Names */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
        <div style={{ fontSize: nameA.length > 10 ? 44 : 52, fontWeight: 700, color: "#ffffff" }}>{nameA}</div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.22)" }}>×</div>
        <div style={{ fontSize: nameB.length > 10 ? 44 : 52, fontWeight: 700, color: "#ffffff" }}>{nameB}</div>
      </div>
      {/* Sign pills */}
      <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
        <div style={{ padding: "10px 26px", borderRadius: 999, backgroundColor: `${colorA}22`, border: `2px solid ${colorA}50`, color: colorA, fontSize: 22, fontWeight: 600 }}>
          {symbolA} {signA}
        </div>
        <div style={{ padding: "10px 26px", borderRadius: 999, backgroundColor: `${colorB}22`, border: `2px solid ${colorB}50`, color: colorB, fontSize: 22, fontWeight: 600 }}>
          {symbolB} {signB}
        </div>
      </div>
      {/* Score */}
      <div style={{ fontSize: 108, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>
        {Math.round(score)}<span style={{ fontSize: 60, color: "rgba(255,255,255,0.45)" }}>%</span>
      </div>
      {/* Watermark */}
      <div style={{ position: "absolute", bottom: 52, color: "rgba(255,255,255,0.18)", fontSize: 26, letterSpacing: "0.14em" }}>ZODICOGAI.COM</div>
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareImageButton({ data }: { data: ShareData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");

  async function handleShare() {
    if (!cardRef.current || state === "capturing") return;
    setState("capturing");
    try {
      // Lazy-load html-to-image to keep initial bundle small
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const blob    = await (await fetch(dataUrl)).blob();
      const file    = new File([blob], "zodicogai.png", { type: "image/png" });

      const shareText =
        data.type === "hybrid"
          ? `${data.name} · ${data.sign} ${data.mbtiType} — my ZodicogAI profile`
          : `${data.nameA} × ${data.nameB} · ${Math.round(data.score)}% compatibility — ZodicogAI`;

      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "ZodicogAI", text: shareText });
      } else {
        // Fallback: download the image
        const a = document.createElement("a");
        a.href  = dataUrl;
        a.download = "zodicogai.png";
        a.click();
      }
      setState("done");
    } catch {
      setState("idle");
      return;
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <div className="relative">
      {/* Off-screen capture card — never visible to the user */}
      <div
        ref={cardRef}
        aria-hidden="true"
        style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1 }}
      >
        {data.type === "hybrid" ? <HybridCard {...data} /> : <CompatCard {...data} />}
      </div>

      {/* Visible button */}
      <button
        onClick={handleShare}
        disabled={state === "capturing"}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        {state === "capturing" ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Generating…
          </>
        ) : state === "done" ? (
          <>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Done!
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share Image
          </>
        )}
      </button>
    </div>
  );
}
