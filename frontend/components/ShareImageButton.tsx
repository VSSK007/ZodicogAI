"use client";
import { useState } from "react";

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

export interface ZodiacShareData {
  type: "zodiac";
  name: string;
  sign: string;
  symbol: string;
  signColor: string;
  element: string;
  modality: string;
}

export interface NumerologyShareData {
  type: "numerology";
  name: string;
  lifePath: number;
  expression: number;
  lucky: number;
  numberTitle: string;
}

export interface NumerologyPairShareData {
  type: "numerology-pair";
  nameA: string;
  nameB: string;
  lifePathA: number;
  lifePathB: number;
  score: number;
}

export interface ColorSingleShareData {
  type: "color-single";
  name: string;
  sign: string;
  auraHex: string;
  auraName: string;
  powerName: string;
}

export interface ColorPairShareData {
  type: "color-pair";
  nameA: string;
  nameB: string;
  hexA: string;
  hexB: string;
  auraNameA: string;
  auraNameB: string;
}

export type ShareData = HybridShareData | CompatShareData | ZodiacShareData | NumerologyShareData | NumerologyPairShareData | ColorSingleShareData | ColorPairShareData;

// ── Canvas utilities ──────────────────────────────────────────────────────────

const W = 1080;
const H = 1080;

const MODALITY_HEX: Record<string, string> = {
  Cardinal: "#ef4444", Fixed: "#22c55e", Mutable: "#818cf8",
};

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

// ── Card renderers ────────────────────────────────────────────────────────────

function renderHybrid(ctx: CanvasRenderingContext2D, d: HybridShareData) {
  glow(ctx, W / 2, 0, 400, d.signColor, 0.28);

  ctx.font = "120px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillStyle = d.signColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.symbol, W / 2, 240);

  const nfs = d.name.length > 14 ? 58 : 70;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 390);

  const pills: { text: string; color: string }[] = [
    { text: `${d.symbol} ${d.sign}`, color: d.signColor },
    { text: d.mbtiType, color: "#a5b4fc" },
  ];
  if (d.modality) pills.push({ text: d.modality, color: MODALITY_HEX[d.modality] ?? "#a1a1aa" });
  if (d.lifePathNum != null) pills.push({ text: `Life Path ${d.lifePathNum}`, color: "#f59e0b" });
  pillRow(ctx, pills, 490);
}

function renderCompat(ctx: CanvasRenderingContext2D, d: CompatShareData) {
  glow(ctx, W * 0.28, -60, 340, d.colorA, 0.18);
  glow(ctx, W * 0.72, -60, 340, d.colorB, 0.18);

  ctx.font = "100px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = d.colorA;
  ctx.fillText(d.symbolA, W / 2 - 155, 215);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.font = "50px system-ui, sans-serif";
  ctx.fillText("×", W / 2, 215);
  ctx.fillStyle = d.colorB;
  ctx.font = "100px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillText(d.symbolB, W / 2 + 155, 215);

  const nfs = Math.max(d.nameA.length, d.nameB.length) > 10 ? 44 : 54;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillText(d.nameA, W / 2 - 22, 365);
  ctx.font = "30px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.textAlign = "center";
  ctx.fillText("×", W / 2, 365);
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(d.nameB, W / 2 + 22, 365);

  pillRow(ctx, [
    { text: `${d.symbolA} ${d.signA}`, color: d.colorA },
    { text: `${d.symbolB} ${d.signB}`, color: d.colorB },
  ], 455);

  // Score — measure numerals to position % correctly
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const scoreStr = String(Math.round(d.score));
  ctx.font = "900 108px system-ui, sans-serif";
  const sw = ctx.measureText(scoreStr).width;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(scoreStr, W / 2 - 22, 632);
  ctx.font = "900 60px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.textAlign = "left";
  ctx.fillText("%", W / 2 - 22 + sw / 2 + 4, 632);
  ctx.restore();
}

function renderZodiac(ctx: CanvasRenderingContext2D, d: ZodiacShareData) {
  glow(ctx, W / 2, 0, 400, d.signColor, 0.28);
  ctx.font = "120px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillStyle = d.signColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.symbol, W / 2, 240);
  const nfs = d.name.length > 14 ? 58 : 70;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 390);
  pillRow(ctx, [
    { text: `${d.symbol} ${d.sign}`, color: d.signColor },
    { text: d.element, color: d.signColor },
    { text: d.modality, color: "#a1a1aa" },
  ], 490);
}

const GOLD = "#f59e0b";

function renderNumerology(ctx: CanvasRenderingContext2D, d: NumerologyShareData) {
  glow(ctx, W / 2, 0, 420, GOLD, 0.24);
  ctx.font = "900 160px system-ui, sans-serif";
  ctx.fillStyle = GOLD;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(d.lifePath), W / 2, 240);
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText("LIFE PATH", W / 2, 340);
  const nfs = d.name.length > 14 ? 52 : 64;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(d.name, W / 2, 430);
  ctx.font = "26px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText(d.numberTitle, W / 2, 498);
  pillRow(ctx, [
    { text: `LP ${d.lifePath}`, color: GOLD },
    { text: `Exp ${d.expression}`, color: "#a5b4fc" },
    { text: `Lucky ${d.lucky}`, color: "#34d399" },
  ], 560);
}

function renderNumerologyPair(ctx: CanvasRenderingContext2D, d: NumerologyPairShareData) {
  glow(ctx, W * 0.28, -60, 340, GOLD, 0.18);
  glow(ctx, W * 0.72, -60, 340, "#a5b4fc", 0.18);
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 10 ? 44 : 54;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillText(d.nameA, W / 2 - 22, 180);
  ctx.font = "30px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.textAlign = "center";
  ctx.fillText("×", W / 2, 180);
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(d.nameB, W / 2 + 22, 180);
  ctx.font = "900 90px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.fillText(String(d.lifePathA), W / 2 - 150, 320);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "44px system-ui, sans-serif";
  ctx.fillText("×", W / 2, 320);
  ctx.fillStyle = "#a5b4fc";
  ctx.font = "900 90px system-ui, sans-serif";
  ctx.fillText(String(d.lifePathB), W / 2 + 150, 320);
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillText("LIFE PATHS", W / 2, 390);
  pillRow(ctx, [
    { text: `LP ${d.lifePathA}`, color: GOLD },
    { text: `LP ${d.lifePathB}`, color: "#a5b4fc" },
  ], 440);
  ctx.save();
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const scoreStr = String(Math.round(d.score));
  ctx.font = "900 108px system-ui, sans-serif";
  const sw = ctx.measureText(scoreStr).width;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(scoreStr, W / 2 - 22, 618);
  ctx.font = "900 60px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.textAlign = "left";
  ctx.fillText("%", W / 2 - 22 + sw / 2 + 4, 618);
  ctx.restore();
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NUMEROLOGY COMPATIBILITY", W / 2, 700);
}

function renderColorSingle(ctx: CanvasRenderingContext2D, d: ColorSingleShareData) {
  glow(ctx, W / 2, H * 0.25, 480, d.auraHex, 0.40);
  ctx.beginPath();
  ctx.arc(W / 2, 240, 115, 0, Math.PI * 2);
  ctx.fillStyle = d.auraHex;
  ctx.fill();
  const auraNfs = d.auraName.length > 16 ? 44 : 56;
  ctx.font = `bold ${auraNfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraName, W / 2, 420);
  const nfs = d.name.length > 14 ? 44 : 54;
  ctx.font = `${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(d.name, W / 2, 498);
  pillRow(ctx, [
    { text: d.sign, color: d.auraHex },
    { text: d.powerName, color: "#a1a1aa" },
  ], 560);
}

function renderColorPair(ctx: CanvasRenderingContext2D, d: ColorPairShareData) {
  glow(ctx, W * 0.28, -60, 340, d.hexA, 0.24);
  glow(ctx, W * 0.72, -60, 340, d.hexB, 0.24);
  ctx.beginPath();
  ctx.arc(W / 2 - 150, 215, 78, 0, Math.PI * 2);
  ctx.fillStyle = d.hexA;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W / 2 + 150, 215, 78, 0, Math.PI * 2);
  ctx.fillStyle = d.hexB;
  ctx.fill();
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 10 ? 44 : 54;
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  ctx.fillText(d.nameA, W / 2 - 22, 365);
  ctx.font = "30px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.textAlign = "center";
  ctx.fillText("×", W / 2, 365);
  ctx.font = `bold ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(d.nameB, W / 2 + 22, 365);
  // Gradient bar
  const grad = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
  grad.addColorStop(0, d.hexA);
  grad.addColorStop(1, d.hexB);
  ctx.fillStyle = grad;
  rrect(ctx, W * 0.1, 430, W * 0.8, 20, 10);
  ctx.fill();
  pillRow(ctx, [
    { text: d.auraNameA, color: d.hexA },
    { text: d.auraNameB, color: d.hexB },
  ], 480);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin  = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function renderCard(data: ShareData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#080810";
  ctx.fillRect(0, 0, W, H);
  if      (data.type === "hybrid")          renderHybrid(ctx, data);
  else if (data.type === "compat")          renderCompat(ctx, data);
  else if (data.type === "zodiac")          renderZodiac(ctx, data);
  else if (data.type === "numerology")      renderNumerology(ctx, data);
  else if (data.type === "numerology-pair") renderNumerologyPair(ctx, data);
  else if (data.type === "color-single")    renderColorSingle(ctx, data);
  else if (data.type === "color-pair")      renderColorPair(ctx, data);
  wmk(ctx);
  return canvas.toDataURL("image/png");
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareImageButton({ data }: { data: ShareData }) {
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");

  async function handleShare() {
    if (state === "capturing") return;
    setState("capturing");
    try {
      const dataUrl  = await renderCard(data);
      const blob     = dataUrlToBlob(dataUrl);
      const file     = new File([blob], "zodicogai.png", { type: "image/png" });
      const shareText =
        data.type === "hybrid"          ? `${data.name} · ${data.sign} ${data.mbtiType} — my ZodicogAI profile` :
        data.type === "compat"          ? `${data.nameA} × ${data.nameB} · ${Math.round(data.score)}% compatibility — ZodicogAI` :
        data.type === "zodiac"          ? `${data.name} · ${data.sign} ${data.element} ${data.modality} — ZodicogAI` :
        data.type === "numerology"      ? `${data.name} · Life Path ${data.lifePath} · ${data.numberTitle} — ZodicogAI` :
        data.type === "numerology-pair" ? `${data.nameA} × ${data.nameB} · ${Math.round(data.score)}% numerology match — ZodicogAI` :
        data.type === "color-single"    ? `${data.name} · ${data.auraName} aura · ${data.sign} — ZodicogAI` :
                                          `${data.nameA} × ${data.nameB} · ${data.auraNameA} & ${data.auraNameB} — ZodicogAI`;

      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "ZodicogAI" });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
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
  );
}
