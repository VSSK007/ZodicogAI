"use client";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  name: string;
  signLabel: string;
  symbol: string;
  slug: string;
  signColor: string;
  lifePathNum: number | null;
  auraName: string;
  wikiImage?: string | null;
}

// ── Canvas utilities ──────────────────────────────────────────────────────────

const W = 1080;
const H = 1080;

function darken(hex: string, amt: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amt)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amt)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amt)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, gap = 5) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const chars = text.split("");
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += widths[i] + gap;
  }
  ctx.restore();
}

function brand(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "700 27px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  spaced(ctx, "ZODICOGAI", W / 2, H - 58, 5);
  ctx.restore();
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin  = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ── Image loader ──────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── Card renderer ─────────────────────────────────────────────────────────────

async function renderCelebCard(p: Props): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, p.signColor);
  g.addColorStop(1, darken(p.signColor, 0.72));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Try to load and draw celebrity photo
  let hasPhoto = false;
  if (p.wikiImage) {
    try {
      const img = await loadImage(p.wikiImage);
      const r = 110;
      const cx = W / 2, cy = 300;
      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      // object-top: align image top to circle top so faces aren't cut off
      ctx.drawImage(img, cx - sw / 2, cy - r, sw, sh);
      ctx.restore();
      // Ring border
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
      hasPhoto = true;
    } catch {
      // Image failed (CORS / network) — fall back to text-only layout
    }
  }

  const nameY  = hasPhoto ? 498 : 400;
  const auraY  = hasPhoto ? 624 : 540;
  const lpY    = hasPhoto ? 708 : 624;
  const labelY = hasPhoto ? 115 : 140;

  // Top label — sign symbol + label
  ctx.save();
  ctx.font = "700 26px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  spaced(ctx, `${p.symbol}  ${p.signLabel.toUpperCase()}`, W / 2, labelY, 4);
  ctx.restore();

  // HERO — celebrity name
  const heroSize = p.name.length > 16 ? 80 : p.name.length > 12 ? 100 : 130;
  ctx.font = `900 ${heroSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.name, W / 2, nameY);

  // Aura name
  const auraSize = p.auraName.length > 14 ? 52 : 66;
  ctx.font = `700 ${auraSize}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.auraName.toUpperCase(), W / 2, auraY);

  // Life path if present
  if (p.lifePathNum != null) {
    ctx.save();
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.50)";
    spaced(ctx, `LIFE PATH ${p.lifePathNum}`, W / 2, lpY, 4);
    ctx.restore();
  }

  brand(ctx);
  return canvas.toDataURL("image/png");
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareCelebButton(props: Props) {
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");
  const isMobile = useIsMobile();

  async function handleShare() {
    if (state === "capturing") return;
    setState("capturing");

    let dataUrl: string;
    try {
      dataUrl = await renderCelebCard(props);
    } catch {
      setState("idle");
      return;
    }

    const blob = dataUrlToBlob(dataUrl);

    if (isMobile) {
      // Mobile: always download so user can share from gallery
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "zodicogai-celeb.png";
      a.click();
    } else {
      const file = new File([blob], "zodicogai-celeb.png", { type: "image/png" });
      try {
        if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${props.name} — ZodicogAI` });
        } else if (typeof navigator.clipboard?.write === "function" && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        } else {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "zodicogai-celeb.png";
          a.click();
        }
      } catch {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "zodicogai-celeb.png";
        a.click();
      }
    }

    setState("done");
    setTimeout(() => setState("idle"), 2500);
  }

  return (
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
          Saved!
        </>
      ) : (
        <>
          {isMobile ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
          {isMobile ? "Save & Share" : "Share"}
        </>
      )}
    </button>
  );
}
