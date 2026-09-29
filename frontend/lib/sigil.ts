/**
 * Sigil — a deterministic constellation "seal" generated from a seed string
 * (a reading's title). The same seed always produces the same drawing, so a
 * reading looks identical on its result card, share image and OG card.
 *
 * Geometry is computed in unit space (-1..1) and rendered by three drawers:
 * the <Sigil> React/SVG component, drawSigil() for canvas, and (via the same
 * component) next/og ImageResponse.
 */

export interface SigilStar { x: number; y: number; r: number; anchor: boolean }
export interface SigilGeometry {
  stars: SigilStar[];
  edges: [number, number][];
  ticks: { angle: number; lit: boolean }[];
  ringRadius: number;
}

/** FNV-1a 32-bit string hash. */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — tiny seeded PRNG. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sigilFor(seed: string): SigilGeometry {
  const rand = rng(hash(seed.trim().toLowerCase() || "zodicogai"));
  const n = 6 + Math.floor(rand() * 3); // 6-8 outer stars
  const base = rand() * Math.PI * 2;

  const stars: SigilStar[] = Array.from({ length: n }, (_, i) => {
    const angle = base + (i * Math.PI * 2) / n + (rand() - 0.5) * 0.7;
    const radius = 0.32 + rand() * 0.42;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      r: 0.035 + rand() * 0.035,
      anchor: false,
    };
  });
  // A central star gives every sigil a heart to draw toward.
  stars.push({ x: (rand() - 0.5) * 0.14, y: (rand() - 0.5) * 0.14, r: 0.05, anchor: false });
  const centre = stars.length - 1;

  // The largest outer star is the "anchor" - the one drawn in gold.
  let anchor = 0;
  for (let i = 1; i < n; i++) if (stars[i].r > stars[anchor].r) anchor = i;
  stars[anchor].anchor = true;
  stars[anchor].r += 0.02;

  const edges: [number, number][] = [];
  const gap = Math.floor(rand() * n); // one missing link keeps the ring from closing
  for (let i = 0; i < n; i++) if (i !== gap) edges.push([i, (i + 1) % n]);
  const spokes = 1 + Math.floor(rand() * 2);
  for (let s = 0; s < spokes; s++) edges.push([Math.floor(rand() * n), centre]);
  const chord = Math.floor(rand() * n);
  edges.push([chord, (chord + 2 + Math.floor(rand() * 2)) % n]);

  const ticks = Array.from({ length: 12 }, (_, i) => ({
    angle: (i * Math.PI * 2) / 12,
    lit: rand() > 0.55,
  }));

  return { stars, edges, ticks, ringRadius: 0.92 };
}

export interface SigilPalette { line: string; star: string; anchor: string; ring: string }
export const SIGIL_PALETTE: SigilPalette = {
  line: "#a99bff",
  star: "#f0eff6",
  anchor: "#edcb7e",
  ring: "#8b7cf6",
};

/** Canvas drawer for the share-image renderers. (cx, cy) is the centre, radius in px. */
export function drawSigil(
  ctx: CanvasRenderingContext2D,
  seed: string,
  cx: number,
  cy: number,
  radius: number,
  palette: SigilPalette = SIGIL_PALETTE,
  alpha = 1,
) {
  const g = sigilFor(seed);
  const px = (v: number) => cx + v * radius;
  const py = (v: number) => cy + v * radius;
  ctx.save();
  ctx.lineCap = "round";

  ctx.strokeStyle = palette.ring;
  ctx.lineWidth = Math.max(1, radius * 0.018);
  ctx.globalAlpha = alpha * 0.45;
  ctx.beginPath();
  ctx.arc(cx, cy, g.ringRadius * radius, 0, Math.PI * 2);
  ctx.stroke();
  for (const t of g.ticks) {
    const r1 = g.ringRadius * radius;
    const r2 = r1 + radius * (t.lit ? 0.09 : 0.045);
    ctx.globalAlpha = alpha * (t.lit ? 0.9 : 0.35);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(t.angle) * r1, cy + Math.sin(t.angle) * r1);
    ctx.lineTo(cx + Math.cos(t.angle) * r2, cy + Math.sin(t.angle) * r2);
    ctx.stroke();
  }

  ctx.globalAlpha = alpha * 0.8;
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = Math.max(1, radius * 0.02);
  for (const [a, b] of g.edges) {
    ctx.beginPath();
    ctx.moveTo(px(g.stars[a].x), py(g.stars[a].y));
    ctx.lineTo(px(g.stars[b].x), py(g.stars[b].y));
    ctx.stroke();
  }

  for (const s of g.stars) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.anchor ? palette.anchor : palette.star;
    ctx.beginPath();
    ctx.arc(px(s.x), py(s.y), s.r * radius, 0, Math.PI * 2);
    ctx.fill();
    if (s.anchor) {
      ctx.globalAlpha = alpha * 0.25;
      ctx.beginPath();
      ctx.arc(px(s.x), py(s.y), s.r * radius * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * The sigil seed of the reading currently on screen. ResultActions publishes
 * it (it knows the reading's title) and ShareImageButton reads it at click
 * time, so the share image carries the same seal as the result card without
 * every analyze page threading the title through twice.
 */
let currentSeed = "";
export function setCurrentSigilSeed(seed: string) { currentSeed = seed; }
export function getCurrentSigilSeed() { return currentSeed; }
