"use client";

import { getZodiacSign, getAuraColor, blendHex, ColorProfile } from "@/lib/colors";

// ── AuraChip ────────────────────────────────────────────────────────────────
// Small inline pill: colored dot + color name

interface AuraChipProps {
  sign: string;
}

export function AuraChip({ sign }: AuraChipProps) {
  const c = getAuraColor(sign);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
      <span className="text-xs text-zinc-400">{c.name}</span>
    </span>
  );
}

// ── AuraPalette ──────────────────────────────────────────────────────────────
// Three-swatch row: Person A → blend → Person B
// Accepts either a pre-resolved sign, or day/month to auto-compute.

interface AuraPaletteProps {
  dayA: number | string;
  monthA: number | string;
  dayB: number | string;
  monthB: number | string;
  nameA?: string;
  nameB?: string;
}

function Swatch({ color, label, sub }: { color: ColorProfile; label: string; sub?: string }) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-16 rounded-xl" style={{ backgroundColor: color.hex }} />
      <p className="text-[11px] font-medium text-zinc-300 truncate">{label}</p>
      {sub && <p className="text-[10px] text-zinc-600">{sub}</p>}
      <div className="flex flex-wrap gap-1">
        {color.keywords.map((kw) => (
          <span
            key={kw}
            className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#0d0d1a] text-zinc-500 border border-white/[0.07]"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

function BlendSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col gap-2 items-center">
      <div className="w-full h-16 rounded-xl" style={{ backgroundColor: hex }} />
      <p className="text-[11px] font-medium text-zinc-300">{label}</p>
      <p className="text-[10px] text-zinc-600 font-mono">{hex}</p>
    </div>
  );
}

export function AuraPalette({
  dayA, monthA, dayB, monthB,
  nameA = "Person A", nameB = "Person B",
}: AuraPaletteProps) {
  const signA = getZodiacSign(Number(dayA), Number(monthA));
  const signB = getZodiacSign(Number(dayB), Number(monthB));
  const colorA = getAuraColor(signA);
  const colorB = getAuraColor(signB);
  const midHex = blendHex(colorA.hex, colorB.hex);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#16162a] p-5 space-y-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Aura Palette</p>

      <div className="flex gap-3">
        <Swatch color={colorA} label={nameA} sub={colorA.name} />
        <BlendSwatch hex={midHex} label="Middle Ground" />
        <Swatch color={colorB} label={nameB} sub={colorB.name} />
      </div>

      {/* Gradient strip */}
      <div
        className="h-1.5 rounded-full"
        style={{
          background: `linear-gradient(to right, ${colorA.hex}, ${midHex}, ${colorB.hex})`,
        }}
      />
    </div>
  );
}
