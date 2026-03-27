"use client";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

// ── Props ──────────────────────────────────────────────────────────────────────

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

// ── Constants ──────────────────────────────────────────────────────────────────

const W = 1080;
const H = 1080;

// ── Font loader (cached) ───────────────────────────────────────────────────────

let _cachedFont: string | null = null;
async function getFont(): Promise<string> {
  if (_cachedFont) return _cachedFont;
  await document.fonts.ready;
  _cachedFont = window.getComputedStyle(document.documentElement).fontFamily;
  return _cachedFont;
}

// ── Color utilities ────────────────────────────────────────────────────────────

function hexRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Structural helpers ─────────────────────────────────────────────────────────

function hRule(
  ctx: CanvasRenderingContext2D,
  y: number,
  width = 220,
  opacity = 0.11,
) {
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - width / 2, y);
  ctx.lineTo(W / 2 + width / 2, y);
  ctx.stroke();
  ctx.restore();
}

function spaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  gap = 4,
) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const chars  = text.split("");
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total  = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += widths[i] + gap;
  }
  ctx.restore();
}

// ── Brand mark — bottom-right stamp ───────────────────────────────────────────

function brand(ctx: CanvasRenderingContext2D, font: string) {
  const markSz  = 32;
  const scale   = markSz / 28;
  const txSz    = 18;
  const urlSz   = 14;
  const lsGap   = 3;
  const marg    = 60;
  const rowGap  = 22;
  const urlY    = H - marg;
  const markY   = urlY - rowGap;

  ctx.save();

  ctx.font = `600 ${txSz}px ${font}`;
  const chars  = "ZODICOGAI".split("");
  const cW     = chars.map((c) => ctx.measureText(c).width);
  const textW  = cW.reduce((a, b) => a + b, 0) + lsGap * (chars.length - 1);
  const gap    = 10;
  const startX = W - marg - textW - gap - markSz;

  // ZodicogMark signet
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

  // Wordmark — "ZODICOG" white, "AI" brand blue
  ctx.font         = `600 ${txSz}px ${font}`;
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  let x = startX + markSz + gap;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillStyle = i >= 7 ? "rgba(66,133,244,0.80)" : "rgba(255,255,255,0.52)";
    ctx.fillText(chars[i], x, markY);
    x += cW[i] + lsGap;
  }

  // URL
  ctx.font         = `400 ${urlSz}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.28)";
  ctx.textAlign    = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("zodicogai.com", W - marg, urlY);

  ctx.restore();
}

// ── Image loader ───────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = src;
  });
}

// ── Blob helper ────────────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin  = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ── Card renderer ──────────────────────────────────────────────────────────────

async function renderCelebCard(p: Props): Promise<string> {
  const font   = await getFont();
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ──
  ctx.fillStyle = "#06060f";
  ctx.fillRect(0, 0, W, H);

  // Radial glow — sign color at top-center
  const g1 = ctx.createRadialGradient(W / 2, -80, 0, W / 2, -80, H * 0.82);
  g1.addColorStop(0,   hexRgba(p.signColor, 0.22));
  g1.addColorStop(0.5, hexRgba(p.signColor, 0.06));
  g1.addColorStop(1,   "transparent");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.84);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.54)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Faint background sign symbol — bottom-right, rotated slightly
  ctx.save();
  ctx.font         = `400 540px ${font}, 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif`;
  ctx.fillStyle    = "rgba(255,255,255,0.022)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.symbol, W * 0.74, H * 0.60);
  ctx.restore();

  // ── Top label — sign ──
  ctx.save();
  ctx.font      = `500 20px ${font}, 'Segoe UI Symbol', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, `${p.symbol}  ${p.signLabel.toUpperCase()}`, W / 2, 120, 4);
  ctx.restore();

  hRule(ctx, 166, 200);

  // ── Photo circle ──
  let hasPhoto = false;
  const photoY = 384;
  const photoR = 145;

  if (p.wikiImage) {
    try {
      const img = await loadImage(p.wikiImage);
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, photoY, photoR, 0, Math.PI * 2);
      ctx.clip();
      const sc = Math.max((photoR * 2) / img.width, (photoR * 2) / img.height);
      const sw = img.width * sc, sh = img.height * sc;
      // object-top: align image top to circle top — keeps faces visible
      ctx.drawImage(img, W / 2 - sw / 2, photoY - photoR, sw, sh);
      ctx.restore();
      // Ring
      ctx.beginPath();
      ctx.arc(W / 2, photoY, photoR, 0, Math.PI * 2);
      ctx.strokeStyle = hexRgba(p.signColor, 0.55);
      ctx.lineWidth   = 3;
      ctx.stroke();
      hasPhoto = true;
    } catch {
      // CORS / network failure — fall through to text-only
    }
  }

  // Layout shifts based on whether photo loaded
  const nameY = hasPhoto ? 610 : 360;
  const metaY = hasPhoto ? 706 : 458;
  const lpY   = hasPhoto ? 772 : 524;

  // ── Celebrity name ──
  const heroSz = p.name.length > 18 ? 70
               : p.name.length > 14 ? 84
               : p.name.length > 10 ? 100
               : 118;
  ctx.save();
  ctx.font         = `700 ${heroSz}px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.name, W / 2, nameY);
  ctx.restore();

  hRule(ctx, nameY + heroSz / 2 + 28, 320, 0.10);

  // ── Aura name ──
  const auraSz = p.auraName.length > 14 ? 36
               : p.auraName.length > 10 ? 44
               : 52;
  ctx.save();
  ctx.font         = `500 ${auraSz}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.52)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.auraName.toUpperCase(), W / 2, metaY);
  ctx.restore();

  // ── Life path ──
  if (p.lifePathNum != null) {
    ctx.save();
    ctx.font      = `400 22px ${font}`;
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    spaced(ctx, `LIFE PATH ${p.lifePathNum}`, W / 2, lpY, 4);
    ctx.restore();
  }

  brand(ctx, font);
  return canvas.toDataURL("image/png");
}

// ── Button ─────────────────────────────────────────────────────────────────────

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
