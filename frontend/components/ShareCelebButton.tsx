"use client";
import { useState } from "react";

interface Props {
  name: string;
  signLabel: string;
  symbol: string;
  slug: string;
  signColor: string;
  lifePathNum: number | null;
  auraName: string;
}

// ── Canvas utilities ──────────────────────────────────────────────────────────

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

function pillRow(ctx: CanvasRenderingContext2D, pills: { text: string; color: string }[], cy: number) {
  const PH = 54, PAD = 28, GAP = 14;
  ctx.save();
  ctx.font = "600 24px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  const widths = pills.map(p => ctx.measureText(p.text).width + PAD * 2);
  const total  = widths.reduce((a, b) => a + b, 0) + GAP * (pills.length - 1);
  let x = (W - total) / 2;
  for (let i = 0; i < pills.length; i++) {
    const { text, color } = pills[i];
    const pw = widths[i];
    rrect(ctx, x, cy, pw, PH, PH / 2);
    ctx.fillStyle = hexRgba(color, 0.13);
    ctx.fill();
    ctx.strokeStyle = hexRgba(color, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.fillText(text, x + PAD, cy + PH / 2);
    x += pw + GAP;
  }
  ctx.restore();
}

function glow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, a: number) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, hexRgba(color, a));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function wmk(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ZODICOGAI.COM", W / 2, H - 52);
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

// ── Card renderer ─────────────────────────────────────────────────────────────

async function renderCelebCard(props: Props): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#080810";
  ctx.fillRect(0, 0, W, H);

  // Sign-color glow at top
  glow(ctx, W / 2, 0, 420, props.signColor, 0.28);

  // Symbol
  ctx.font = "120px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillStyle = props.signColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(props.symbol, W / 2, 240);

  // Name
  const nfs = props.name.length > 14 ? 54 : 66;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(props.name, W / 2, 390);

  // Pills
  const pills: { text: string; color: string }[] = [
    { text: `${props.symbol} ${props.signLabel}`, color: props.signColor },
  ];
  if (props.lifePathNum != null) {
    pills.push({ text: `Life Path ${props.lifePathNum}`, color: "#f59e0b" });
  }
  pills.push({ text: props.auraName, color: "#a1a1aa" });
  pillRow(ctx, pills, 490);

  wmk(ctx);
  return canvas.toDataURL("image/png");
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareCelebButton(props: Props) {
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");

  async function handleShare() {
    if (state === "capturing") return;
    setState("capturing");
    try {
      const dataUrl = await renderCelebCard(props);
      const blob    = dataUrlToBlob(dataUrl);
      const file    = new File([blob], "zodicogai-celeb.png", { type: "image/png" });
      const text    = `${props.name} ${props.symbol} ${props.signLabel}${props.lifePathNum ? ` · Life Path ${props.lifePathNum}` : ""} · ${props.auraName} — ZodicogAI`;

      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${props.name} — ZodicogAI` });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "zodicogai-celeb.png";
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
          Share
        </>
      )}
    </button>
  );
}
