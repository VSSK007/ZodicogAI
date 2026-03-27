"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";

interface InsightCardProps {
  hook: string;
  shareText?: string;
  name?: string;
  tags?: string[];
  /** 0–100 confidence or pattern score */
  score?: number;
  hookType?: string;
}

// ── Canvas capture ────────────────────────────────────────────────────────────

const W = 1080;
const H = 1080;

function hexRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tagPillRow(ctx: CanvasRenderingContext2D, tags: string[], cy: number) {
  const PH = 50, PAD = 26, GAP = 14;
  ctx.save();
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  const widths = tags.map(t => ctx.measureText(t).width + PAD * 2);
  const total  = widths.reduce((a, b) => a + b, 0) + GAP * (tags.length - 1);
  let x = (W - total) / 2;
  for (let i = 0; i < tags.length; i++) {
    const pw = widths[i];
    rrect(ctx, x, cy, pw, PH, PH / 2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "left";
    ctx.fillText(tags[i], x + PAD, cy + PH / 2);
    x += pw + GAP;
  }
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin  = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

let _cachedFont: string | null = null;
async function getFont(): Promise<string> {
  if (_cachedFont) return _cachedFont;
  await document.fonts.ready;
  _cachedFont = window.getComputedStyle(document.documentElement).fontFamily;
  return _cachedFont;
}

async function captureInsightCard(
  hook: string,
  name: string | undefined,
  tags: string[],
  score: number | undefined,
  hookType: string | undefined,
): Promise<string> {
  const appFont = await getFont();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#080810";
  ctx.fillRect(0, 0, W, H);

  // Amber radial glow
  const grd = ctx.createRadialGradient(W / 2, -120, 0, W / 2, -120, 520);
  grd.addColorStop(0, "rgba(245,158,11,0.22)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  const primary  = tags[0];
  const rest     = tags.slice(1);
  const hookFs   = hook.length > 120 ? 30 : 36;
  const hookLineH = hookFs * 1.55;

  // Pre-measure hook lines for vertical centering
  ctx.font = `600 ${hookFs}px system-ui, sans-serif`;
  const hookLines = wrapText(ctx, `\u201C${hook}\u201D`, 880);
  const hookH = hookLines.length * hookLineH;

  let totalH = hookH;
  if (name)              totalH += 52;
  if (primary)           totalH += 80;
  if (score !== undefined) totalH += 52;
  if (rest.length > 0)   totalH += 70;

  let y = (H - totalH) / 2;

  ctx.textAlign = "center";

  if (name) {
    ctx.font = "28px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.textBaseline = "middle";
    ctx.fillText(name, W / 2, y + 14);
    y += 52;
  }

  if (primary) {
    ctx.font = "bold 54px system-ui, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.textBaseline = "middle";
    ctx.fillText(primary, W / 2, y + 27);
    y += 80;
  }

  ctx.font = `600 ${hookFs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  for (let i = 0; i < hookLines.length; i++) {
    ctx.fillText(hookLines[i], W / 2, y + i * hookLineH + hookLineH / 2);
  }
  y += hookH + 36;

  if (score !== undefined) {
    const label = (hookType ?? "confidence").toUpperCase();
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.textBaseline = "middle";
    ctx.fillText(`${label}  ·  ${Math.round(score)}%`, W / 2, y + 14);
    y += 52;
  }

  if (rest.length > 0) {
    tagPillRow(ctx, rest, y + 10);
  }

  // ── ZodicogMark — bottom-right stamp ──
  {
    const font    = appFont;
    const markSz  = 40;
    const scale   = markSz / 28;
    const txSz    = 24;
    const urlSz   = 15;
    const lsGap   = 3;
    const marg    = 60;
    const rowGap  = 28;
    const urlY    = H - marg;
    const markY   = urlY - rowGap;

    ctx.save();

    // Measure wordmark width
    ctx.font = `800 ${txSz}px ${font}`;
    const chars = "ZodicogAI".split("");
    const cW    = chars.map((c) => ctx.measureText(c).width);
    const textW = cW.reduce((a, b) => a + b, 0) + lsGap * (chars.length - 1);
    const gap   = 12;
    const blockW = markSz + gap + textW;
    const startX = W - marg - blockW;

    // Z signet (circle + Z letterform)
    ctx.save();
    ctx.translate(startX, markY - markSz / 2);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(14, 14, 12.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.42)";
    ctx.lineWidth   = 1.8 / scale;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(14, 1.5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.50)";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(7.5, 10.5); ctx.lineTo(20.5, 10.5);
    ctx.lineTo(7.5, 17.5); ctx.lineTo(20.5, 17.5);
    ctx.strokeStyle = "rgba(255,255,255,0.50)";
    ctx.lineWidth   = 2.2 / scale;
    ctx.lineCap     = "square";
    ctx.lineJoin    = "miter";
    ctx.stroke();

    ctx.restore();

    // Wordmark — "ZODICOG" white, "AI" cosmic purple
    ctx.font         = `800 ${txSz}px ${font}`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    let bx = startX + markSz + gap;
    for (let i = 0; i < chars.length; i++) {
      ctx.fillStyle = i >= 7 ? "rgba(167,139,250,0.82)" : "rgba(255,255,255,0.52)";
      ctx.fillText(chars[i], bx, markY);
      bx += cW[i] + lsGap;
    }

    // URL below wordmark
    ctx.font         = `400 ${urlSz}px ${font}`;
    ctx.fillStyle    = "rgba(255,255,255,0.28)";
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("zodicogai.com", W - marg, urlY);

    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");
  const isMobile = useIsMobile();

  async function handleShare() {
    if (state === "capturing") return;
    setState("capturing");

    let dataUrl: string;
    try {
      dataUrl = await captureInsightCard(hook, name, tags, score, hookType);
    } catch {
      setState("idle");
      return;
    }

    const blob = dataUrlToBlob(dataUrl);

    if (isMobile) {
      // Mobile: always download so user can share from gallery
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "zodicogai.png";
      a.click();
    } else {
      const file = new File([blob], "zodicogai.png", { type: "image/png" });
      try {
        if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "ZodicogAI" });
        } else if (typeof navigator.clipboard?.write === "function" && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        } else {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "zodicogai.png";
          a.click();
        }
      } catch {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "zodicogai.png";
        a.click();
      }
    }

    setState("done");
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-5 md:p-6 space-y-4"
    >
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
            {isMobile ? "Saved!" : "Done!"}
          </>
        ) : (
          <>
            {isMobile ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )}
            {isMobile ? "Save & Share" : "Share Image"}
          </>
        )}
      </button>
    </motion.div>
  );
}
