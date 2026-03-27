"use client";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

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

// ── Canvas constants ───────────────────────────────────────────────────────────

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

// ── Background: dark base + radial glow(s) + vignette ────────────────────────

function drawBg(
  ctx: CanvasRenderingContext2D,
  c1: string,
  c2?: string,
) {
  ctx.fillStyle = "#06060f";
  ctx.fillRect(0, 0, W, H);

  // Primary glow — top-center
  const g1 = ctx.createRadialGradient(W / 2, -80, 0, W / 2, -80, H * 0.82);
  g1.addColorStop(0,   hexRgba(c1, 0.22));
  g1.addColorStop(0.5, hexRgba(c1, 0.06));
  g1.addColorStop(1,   "transparent");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Secondary glow — bottom-right (optional, for pair cards)
  if (c2 && c2 !== c1) {
    const g2 = ctx.createRadialGradient(W * 0.85, H * 0.80, 0, W * 0.85, H * 0.80, H * 0.58);
    g2.addColorStop(0,   hexRgba(c2, 0.18));
    g2.addColorStop(1,   "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  // Vignette — edges darker
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.82);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.52)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

// ── Structural helpers ─────────────────────────────────────────────────────────

/** Centered horizontal rule. */
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

/** Centered letter-spaced text. Sets font + fillStyle before calling. */
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
// Two rows: [signet] ZODICOGAI  /  zodicogai.com

function brand(ctx: CanvasRenderingContext2D, font: string) {
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

  // ── Measure wordmark width ──
  ctx.font = `800 ${txSz}px ${font}`;
  const chars  = "ZODICOGAI".split("");
  const cW     = chars.map((c) => ctx.measureText(c).width);
  const textW  = cW.reduce((a, b) => a + b, 0) + lsGap * (chars.length - 1);
  const gap    = 12;
  // Right-align: startX such that mark+gap+text ends at W-marg
  const blockW = markSz + gap + textW;
  const startX = W - marg - blockW;

  // ── ZodicogMark signet ──
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

  // ── Wordmark — "ZODICOG" white, "AI" cosmic purple ──
  ctx.font         = `800 ${txSz}px ${font}`;
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  let x = startX + markSz + gap;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillStyle = i >= 7 ? "rgba(167,139,250,0.82)" : "rgba(255,255,255,0.52)";
    ctx.fillText(chars[i], x, markY);
    x += cW[i] + lsGap;
  }

  // ── URL — right-aligned below wordmark ──
  ctx.font         = `400 ${urlSz}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.28)";
  ctx.textAlign    = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("zodicogai.com", W - marg, urlY);

  ctx.restore();
}

// ── Faint background symbol ────────────────────────────────────────────────────

function bgSymbol(ctx: CanvasRenderingContext2D, symbol: string, font: string) {
  ctx.save();
  ctx.font         = `400 560px ${font}, 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif`;
  ctx.fillStyle    = "rgba(255,255,255,0.024)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, W * 0.74, H * 0.58);
  ctx.restore();
}

// ── Renderers ─────────────────────────────────────────────────────────────────

function renderHybrid(ctx: CanvasRenderingContext2D, d: HybridShareData, font: string) {
  drawBg(ctx, d.signColor);
  bgSymbol(ctx, d.symbol, font);

  // Label — sign
  ctx.save();
  ctx.font      = `500 20px ${font}, 'Segoe UI Symbol', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, `${d.symbol}  ${d.sign.toUpperCase()}`, W / 2, 120, 4);
  ctx.restore();

  hRule(ctx, 166, 200);

  // MBTI hero
  ctx.save();
  ctx.font         = `700 162px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.mbtiType, W / 2, 390);
  ctx.restore();

  hRule(ctx, 510, 300);

  // Name
  const nfs = d.name.length > 16 ? 52 : d.name.length > 12 ? 64 : 74;
  ctx.save();
  ctx.font         = `600 ${nfs}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.90)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 606);
  ctx.restore();

  // Metadata
  const meta: string[] = [];
  if (d.modality) meta.push(d.modality.toUpperCase());
  if (d.lifePathNum != null) meta.push(`LIFE PATH ${d.lifePathNum}`);
  if (meta.length) {
    ctx.save();
    ctx.font      = `400 22px ${font}`;
    ctx.fillStyle = "rgba(255,255,255,0.36)";
    spaced(ctx, meta.join("  ·  "), W / 2, 682, 3);
    ctx.restore();
  }

  brand(ctx, font);
}

function renderCompat(ctx: CanvasRenderingContext2D, d: CompatShareData, font: string) {
  drawBg(ctx, d.colorA, d.colorB);

  // Label
  ctx.save();
  ctx.font      = `500 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, "COMPATIBILITY", W / 2, 120, 6);
  ctx.restore();

  hRule(ctx, 166, 200);

  // Score
  const scoreStr = String(Math.round(d.score));
  ctx.save();
  ctx.font         = `700 188px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const sw = ctx.measureText(scoreStr).width;
  ctx.fillText(scoreStr, W / 2 - 24, 390);
  ctx.font      = `600 76px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.textAlign = "left";
  ctx.fillText("%", W / 2 - 24 + sw / 2 + 6, 360);
  ctx.restore();

  hRule(ctx, 510, 300);

  // Names
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 12 ? 44 : 58;
  ctx.save();
  ctx.font         = `600 ${nfs}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.88)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${d.nameA}  ×  ${d.nameB}`, W / 2, 604);
  ctx.restore();

  // Signs
  ctx.save();
  ctx.font      = `400 22px ${font}, 'Segoe UI Symbol', sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  spaced(ctx, `${d.symbolA} ${d.signA.toUpperCase()}  ×  ${d.symbolB} ${d.signB.toUpperCase()}`, W / 2, 672, 3);
  ctx.restore();

  brand(ctx, font);
}

function renderZodiac(ctx: CanvasRenderingContext2D, d: ZodiacShareData, font: string) {
  drawBg(ctx, d.signColor);
  bgSymbol(ctx, d.symbol, font);

  // Label — person name
  ctx.save();
  ctx.font      = `500 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, d.name.toUpperCase(), W / 2, 120, 4);
  ctx.restore();

  hRule(ctx, 166, 200);

  // Sign symbol (medium — legible)
  ctx.save();
  ctx.font         = `400 154px ${font}, 'Segoe UI Symbol', 'Apple Color Emoji', sans-serif`;
  ctx.fillStyle    = "rgba(255,255,255,0.88)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.symbol, W / 2, 336);
  ctx.restore();

  // Sign name
  const signSz = d.sign.length > 9 ? 88 : 112;
  ctx.save();
  ctx.font         = `700 ${signSz}px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.sign.toUpperCase(), W / 2, 494);
  ctx.restore();

  hRule(ctx, 568, 300);

  // Element · Modality
  ctx.save();
  ctx.font      = `400 22px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  spaced(ctx, `${d.element.toUpperCase()}  ·  ${d.modality.toUpperCase()}`, W / 2, 636, 4);
  ctx.restore();

  brand(ctx, font);
}

function renderNumerology(ctx: CanvasRenderingContext2D, d: NumerologyShareData, font: string) {
  drawBg(ctx, "#d97706");

  // Label
  ctx.save();
  ctx.font      = `500 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, "NUMEROLOGY", W / 2, 120, 6);
  ctx.restore();

  hRule(ctx, 166, 200);

  // Life path number
  ctx.save();
  ctx.font         = `700 270px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(d.lifePath), W / 2, 416);
  ctx.restore();

  hRule(ctx, 558, 300);

  // Name
  const nfs = d.name.length > 16 ? 48 : d.name.length > 12 ? 58 : 68;
  ctx.save();
  ctx.font         = `600 ${nfs}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.88)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 646);
  ctx.restore();

  // Number title
  const tfs = d.numberTitle.length > 22 ? 20 : 24;
  ctx.save();
  ctx.font      = `400 ${tfs}px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  spaced(ctx, d.numberTitle.toUpperCase(), W / 2, 714, 3);
  ctx.restore();

  brand(ctx, font);
}

function renderNumerologyPair(ctx: CanvasRenderingContext2D, d: NumerologyPairShareData, font: string) {
  drawBg(ctx, "#b45309", "#4338ca");

  // Label
  ctx.save();
  ctx.font      = `500 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, "NUMEROLOGY MATCH", W / 2, 120, 6);
  ctx.restore();

  hRule(ctx, 166, 200);

  // Names
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 12 ? 40 : 52;
  ctx.save();
  ctx.font         = `600 ${nfs}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.72)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${d.nameA}  ×  ${d.nameB}`, W / 2, 262);
  ctx.restore();

  // Score
  const scoreStr = String(Math.round(d.score));
  ctx.save();
  ctx.font         = `700 188px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const sw = ctx.measureText(scoreStr).width;
  ctx.fillText(scoreStr, W / 2 - 24, 448);
  ctx.font      = `600 76px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.textAlign = "left";
  ctx.fillText("%", W / 2 - 24 + sw / 2 + 6, 418);
  ctx.restore();

  hRule(ctx, 562, 300);

  // Life paths
  ctx.save();
  ctx.font      = `400 22px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.36)";
  spaced(ctx, `LP ${d.lifePathA}  ·  LP ${d.lifePathB}`, W / 2, 630, 3);
  ctx.restore();

  brand(ctx, font);
}

function renderColorSingle(ctx: CanvasRenderingContext2D, d: ColorSingleShareData, font: string) {
  drawBg(ctx, d.auraHex);

  // Label
  ctx.save();
  ctx.font      = `500 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, `${d.sign.toUpperCase()}  ·  AURA`, W / 2, 120, 4);
  ctx.restore();

  hRule(ctx, 166, 200);

  // Color swatch circle
  const swatchY = 366;
  const swatchR = 115;
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, swatchY, swatchR, 0, Math.PI * 2);
  ctx.fillStyle = hexRgba(d.auraHex, 0.30);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W / 2, swatchY, swatchR, 0, Math.PI * 2);
  ctx.strokeStyle = hexRgba(d.auraHex, 0.55);
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.font         = `500 26px 'Courier New', 'Menlo', monospace`;
  ctx.fillStyle    = "rgba(255,255,255,0.65)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraHex.toUpperCase(), W / 2, swatchY);
  ctx.restore();

  // Aura name
  const auraSz = d.auraName.length > 14 ? 60 : d.auraName.length > 10 ? 76 : 96;
  ctx.save();
  ctx.font         = `700 ${auraSz}px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraName.toUpperCase(), W / 2, 574);
  ctx.restore();

  hRule(ctx, 644, 300);

  // Name
  const nfs = d.name.length > 16 ? 38 : 50;
  ctx.save();
  ctx.font         = `600 ${nfs}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.82)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.name, W / 2, 714);
  ctx.restore();

  ctx.save();
  ctx.font      = `400 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, d.powerName.toUpperCase(), W / 2, 774, 4);
  ctx.restore();

  brand(ctx, font);
}

function renderColorPair(ctx: CanvasRenderingContext2D, d: ColorPairShareData, font: string) {
  // Custom split-glow background
  ctx.fillStyle = "#06060f";
  ctx.fillRect(0, 0, W, H);

  const gA = ctx.createRadialGradient(W * 0.16, H * 0.44, 0, W * 0.16, H * 0.44, H * 0.66);
  gA.addColorStop(0, hexRgba(d.hexA, 0.28));
  gA.addColorStop(1, "transparent");
  ctx.fillStyle = gA;
  ctx.fillRect(0, 0, W, H);

  const gB = ctx.createRadialGradient(W * 0.84, H * 0.44, 0, W * 0.84, H * 0.44, H * 0.66);
  gB.addColorStop(0, hexRgba(d.hexB, 0.28));
  gB.addColorStop(1, "transparent");
  ctx.fillStyle = gB;
  ctx.fillRect(0, 0, W, H);

  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.26, W / 2, H / 2, H * 0.82);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.52)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Label
  ctx.save();
  ctx.font      = `500 20px ${font}`;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  spaced(ctx, "COLOR HARMONY", W / 2, 120, 6);
  ctx.restore();

  hRule(ctx, 166, 200);

  // Names
  const nfs = Math.max(d.nameA.length, d.nameB.length) > 12 ? 42 : 54;
  ctx.save();
  ctx.font         = `600 ${nfs}px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.80)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${d.nameA}  ×  ${d.nameB}`, W / 2, 262);
  ctx.restore();

  hRule(ctx, 318, 260);

  // Aura name A
  const szA = d.auraNameA.length > 12 ? 60 : d.auraNameA.length > 9 ? 76 : 94;
  ctx.save();
  ctx.font         = `700 ${szA}px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraNameA.toUpperCase(), W / 2, 438);
  ctx.restore();

  ctx.save();
  ctx.font         = `400 34px ${font}`;
  ctx.fillStyle    = "rgba(255,255,255,0.28)";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("×", W / 2, 534);
  ctx.restore();

  const szB = d.auraNameB.length > 12 ? 60 : d.auraNameB.length > 9 ? 76 : 94;
  ctx.save();
  ctx.font         = `700 ${szB}px ${font}`;
  ctx.fillStyle    = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(d.auraNameB.toUpperCase(), W / 2, 630);
  ctx.restore();

  brand(ctx, font);
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
  const font   = await getFont();
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  if      (data.type === "hybrid")          renderHybrid(ctx, data, font);
  else if (data.type === "compat")          renderCompat(ctx, data, font);
  else if (data.type === "zodiac")          renderZodiac(ctx, data, font);
  else if (data.type === "numerology")      renderNumerology(ctx, data, font);
  else if (data.type === "numerology-pair") renderNumerologyPair(ctx, data, font);
  else if (data.type === "color-single")    renderColorSingle(ctx, data, font);
  else if (data.type === "color-pair")      renderColorPair(ctx, data, font);

  return canvas.toDataURL("image/png");
}

// ── Button ────────────────────────────────────────────────────────────────────

export default function ShareImageButton({ data }: { data: ShareData }) {
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");
  const isMobile = useIsMobile();

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

    if (isMobile) {
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
