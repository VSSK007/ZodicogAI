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

export type ShareData =
  | HybridShareData
  | CompatShareData
  | ZodiacShareData
  | NumerologyShareData
  | NumerologyPairShareData
  | ColorSingleShareData
  | ColorPairShareData;

// ── Canvas utilities ──────────────────────────────────────────────────────────

const W = 1080;
const H = 1080;

function darken(hex: string, amt: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amt)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amt)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amt)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function bgGrad(ctx: CanvasRenderingContext2D, c1: string, c2: string, horiz = false) {
  const g = horiz
    ? ctx.createLinearGradient(0, 0, W, 0)
    : ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/** Draw text with manual letter spacing, centered at (cx, y). */
function spaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  gap = 5,
) {
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

// ── Renderers ─────────────────────────────────────────────────────────────────

function renderHybrid(ctx: CanvasRenderingContext2D, d: HybridShareData) {
  bgGrad(ctx, d.signColor, darken(d.signColor, 0.72));

  // Top label — sign
  ctx.save();
  ctx.font = "700 26px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  spaced(ctx, `${d.symbol}  ${d.sign.toUpperCase()}`, W / 2, 140, 4);
  ctx.restore();

  // HERO — MBTI type
  ctx.font = "900 220px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.mbtiType, W / 2, 390);

  // Name
  const nfs = d.name.length > 14 ? 50 : 66;
  ctx.font = `700 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 560);

  // Modality / life path
  const sub: string[] = [];
  if (d.modality) sub.push(d.modality.toUpperCase());
  if (d.lifePathNum != null) sub.push(`LIFE PATH ${d.lifePathNum}`);
  if (sub.length) {
    ctx.save();
    ctx.font = "600 25px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    spaced(ctx, sub.join("  ·  "), W / 2, 642, 3);
    ctx.restore();
  }

  brand(ctx);
}

function renderCompat(ctx: CanvasRenderingContext2D, d: CompatShareData) {
  bgGrad(ctx, d.colorA, d.colorB);

  // Top label
  ctx.save();
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  spaced(ctx, "COMPATIBILITY", W / 2, 136, 6);
  ctx.restore();

  // Score
  ctx.save();
  ctx.textBaseline = "middle";
  const scoreStr = String(Math.round(d.score));
  ctx.font = "900 230px system-ui, sans-serif";
  const sw = ctx.measureText(scoreStr).width;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(scoreStr, W / 2 - 30, 400);
  ctx.font = "900 100px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "left";
  ctx.fillText("%", W / 2 - 30 + sw / 2 + 8, 370);
  ctx.restore();

  // Names
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 12 ? 40 : 52;
  ctx.font = `700 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${d.nameA}  ×  ${d.nameB}`, W / 2, 578);

  // Signs
  ctx.save();
  ctx.font = "600 25px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  spaced(
    ctx,
    `${d.symbolA} ${d.signA.toUpperCase()}  ×  ${d.symbolB} ${d.signB.toUpperCase()}`,
    W / 2, 652, 3,
  );
  ctx.restore();

  brand(ctx);
}

function renderZodiac(ctx: CanvasRenderingContext2D, d: ZodiacShareData) {
  bgGrad(ctx, d.signColor, darken(d.signColor, 0.70));

  // Symbol
  ctx.font = "180px system-ui, 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.symbol, W / 2, 300);

  // Sign name
  const signSize = d.sign.length > 9 ? 88 : 112;
  ctx.font = `900 ${signSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.sign.toUpperCase(), W / 2, 462);

  // Person name
  const nfs = d.name.length > 14 ? 48 : 62;
  ctx.font = `700 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  ctx.fillText(d.name, W / 2, 576);

  // Element · Modality
  ctx.save();
  ctx.font = "600 25px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  spaced(ctx, `${d.element.toUpperCase()}  ·  ${d.modality.toUpperCase()}`, W / 2, 650, 4);
  ctx.restore();

  brand(ctx);
}

function renderNumerology(ctx: CanvasRenderingContext2D, d: NumerologyShareData) {
  bgGrad(ctx, "#d97706", darken("#d97706", 0.82));

  // Top label
  ctx.save();
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  spaced(ctx, "LIFE PATH", W / 2, 196, 7);
  ctx.restore();

  // HUGE number
  ctx.font = "900 300px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(d.lifePath), W / 2, 430);

  // Name
  const nfs = d.name.length > 14 ? 48 : 64;
  ctx.font = `700 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 618);

  // Number title
  const tfs = d.numberTitle.length > 22 ? 22 : 26;
  ctx.save();
  ctx.font = `600 ${tfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  spaced(ctx, d.numberTitle.toUpperCase(), W / 2, 696, 3);
  ctx.restore();

  brand(ctx);
}

function renderNumerologyPair(ctx: CanvasRenderingContext2D, d: NumerologyPairShareData) {
  bgGrad(ctx, "#b45309", "#4338ca");

  // Names
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 12 ? 38 : 50;
  ctx.font = `700 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${d.nameA}  ×  ${d.nameB}`, W / 2, 190);

  // Score
  ctx.save();
  ctx.textBaseline = "middle";
  const scoreStr = String(Math.round(d.score));
  ctx.font = "900 230px system-ui, sans-serif";
  const sw = ctx.measureText(scoreStr).width;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(scoreStr, W / 2 - 30, 418);
  ctx.font = "900 100px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "left";
  ctx.fillText("%", W / 2 - 30 + sw / 2 + 8, 390);
  ctx.restore();

  // Label
  ctx.save();
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  spaced(ctx, "NUMEROLOGY MATCH", W / 2, 570, 5);
  ctx.restore();

  // Life paths
  ctx.save();
  ctx.font = "600 25px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.46)";
  spaced(ctx, `LP ${d.lifePathA}  ·  LP ${d.lifePathB}`, W / 2, 638, 3);
  ctx.restore();

  brand(ctx);
}

function renderColorSingle(ctx: CanvasRenderingContext2D, d: ColorSingleShareData) {
  bgGrad(ctx, d.auraHex, darken(d.auraHex, 0.72));

  // Person name small top
  ctx.save();
  ctx.font = "600 27px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  spaced(ctx, d.name.toUpperCase(), W / 2, 140, 4);
  ctx.restore();

  // HERO — aura name
  const auraSize = d.auraName.length > 14 ? 76 : d.auraName.length > 10 ? 96 : 124;
  ctx.font = `900 ${auraSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraName.toUpperCase(), W / 2, 420);

  // Hex
  ctx.font = "500 34px system-ui, 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.fillText(d.auraHex.toUpperCase(), W / 2, 528);

  // Sign · power color
  ctx.save();
  ctx.font = "600 25px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.46)";
  spaced(ctx, `${d.sign.toUpperCase()}  ·  ${d.powerName.toUpperCase()}`, W / 2, 608, 3);
  ctx.restore();

  brand(ctx);
}

function renderColorPair(ctx: CanvasRenderingContext2D, d: ColorPairShareData) {
  bgGrad(ctx, d.hexA, d.hexB, true);

  // Names
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 12 ? 38 : 50;
  ctx.font = `700 ${nfs}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${d.nameA}  ×  ${d.nameB}`, W / 2, 196);

  // Label
  ctx.save();
  ctx.font = "700 24px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.50)";
  spaced(ctx, "COLOR HARMONY", W / 2, 308, 5);
  ctx.restore();

  // Aura names stacked
  const sizeA = d.auraNameA.length > 12 ? 68 : d.auraNameA.length > 9 ? 84 : 100;
  ctx.font = `900 ${sizeA}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraNameA.toUpperCase(), W / 2, 430);

  ctx.font = "500 38px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("×", W / 2, 524);

  const sizeB = d.auraNameB.length > 12 ? 68 : d.auraNameB.length > 9 ? 84 : 100;
  ctx.font = `900 ${sizeB}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(d.auraNameB.toUpperCase(), W / 2, 616);

  brand(ctx);
}

// ── Blob helper ───────────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin  = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ── Card dispatcher ───────────────────────────────────────────────────────────

async function renderCard(data: ShareData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  if      (data.type === "hybrid")          renderHybrid(ctx, data);
  else if (data.type === "compat")          renderCompat(ctx, data);
  else if (data.type === "zodiac")          renderZodiac(ctx, data);
  else if (data.type === "numerology")      renderNumerology(ctx, data);
  else if (data.type === "numerology-pair") renderNumerologyPair(ctx, data);
  else if (data.type === "color-single")    renderColorSingle(ctx, data);
  else if (data.type === "color-pair")      renderColorPair(ctx, data);

  return canvas.toDataURL("image/png");
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareImageButton({ data }: { data: ShareData }) {
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");

  async function handleShare() {
    if (state === "capturing") return;
    setState("capturing");

    let dataUrl: string;
    try {
      dataUrl = await renderCard(data);
    } catch {
      setState("idle");
      return;
    }

    const blob = dataUrlToBlob(dataUrl);
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
      // share/clipboard failed — fall back to download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "zodicogai.png";
      a.click();
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
