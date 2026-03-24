"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface InsightCardProps {
  hook: string;
  shareText?: string;
  name?: string;
  tags?: string[];
  /** 0–100 confidence or pattern score */
  score?: number;
  hookType?: string;
}

/** Hidden 1080×1080 capture card */
function CaptureCard({ hook, name, tags = [], score, hookType }: InsightCardProps) {
  const primary = tags[0];
  const rest    = tags.slice(1);
  return (
    <div style={{ width: 1080, height: 1080, backgroundColor: "#080810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", padding: 80, position: "relative", overflow: "hidden" }}>
      {/* Amber glow */}
      <div style={{ position: "absolute", top: -140, left: "50%", width: 720, height: 480, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(245,158,11,0.22) 0%, transparent 65%)", transform: "translateX(-50%)" }} />
      {/* Person name */}
      {name && <div style={{ fontSize: 28, color: "rgba(255,255,255,0.35)", marginBottom: 20, letterSpacing: "0.06em" }}>{name}</div>}
      {/* Primary tag — archetype / pattern label */}
      {primary && <div style={{ fontSize: 54, fontWeight: 800, color: "#f59e0b", marginBottom: 28, textAlign: "center", lineHeight: 1.1 }}>{primary}</div>}
      {/* Hook text */}
      <div style={{ fontSize: hook.length > 120 ? 30 : 36, fontWeight: 600, color: "#ffffff", textAlign: "center", lineHeight: 1.45, marginBottom: 44, maxWidth: 880 }}>
        &ldquo;{hook}&rdquo;
      </div>
      {/* Score */}
      {score !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{hookType ?? "confidence"}</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#fbbf24" }}>{Math.round(score)}%</div>
        </div>
      )}
      {/* Remaining tag pills */}
      {rest.length > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {rest.map((tag) => (
            <div key={tag} style={{ padding: "10px 26px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 22, fontWeight: 500 }}>{tag}</div>
          ))}
        </div>
      )}
      {/* Watermark */}
      <div style={{ position: "absolute", bottom: 52, color: "rgba(255,255,255,0.18)", fontSize: 26, letterSpacing: "0.14em" }}>ZODICOGAI.COM</div>
    </div>
  );
}

/**
 * Viral identity card — large hook text, tag pills, optional score bar, share-as-image button.
 * Used across all /discover pages as the hero element.
 */
export default function InsightCard({
  hook,
  shareText,
  name,
  tags = [],
  score,
  hookType,
}: InsightCardProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");

  async function handleShare() {
    if (!captureRef.current || state === "capturing") return;
    setState("capturing");
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, cacheBust: true });
      const blob    = await (await fetch(dataUrl)).blob();
      const file    = new File([blob], "zodicogai.png", { type: "image/png" });
      const text    = shareText ?? hook;
      const url     = typeof window !== "undefined" ? window.location.href : "";

      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "ZodicogAI", text });
      } else {
        const a = document.createElement("a");
        a.href     = dataUrl;
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-5 md:p-6 space-y-4"
    >
      {/* Hidden capture card */}
      <div
        ref={captureRef}
        aria-hidden="true"
        style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1 }}
      >
        <CaptureCard hook={hook} name={name} tags={tags} score={score} hookType={hookType} />
      </div>

      {/* Hook text — the viral hero */}
      <p className="text-xl md:text-2xl font-semibold text-white leading-snug tracking-tight">
        &ldquo;{hook}&rdquo;
      </p>

      {/* Score bar (optional) */}
      {score !== undefined && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              {hookType ? `${hookType} match` : "confidence"}
            </span>
            <span className="text-sm font-semibold text-amber-400">{Math.round(score)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Share CTA */}
      <button
        type="button"
        onClick={handleShare}
        disabled={state === "capturing"}
        className="flex items-center gap-2 text-sm text-amber-500/80 hover:text-amber-400 transition-colors tap-highlight-none disabled:opacity-50"
      >
        {state === "capturing" ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Generating…
          </>
        ) : state === "done" ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Done!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share Image
          </>
        )}
      </button>
    </motion.div>
  );
}
