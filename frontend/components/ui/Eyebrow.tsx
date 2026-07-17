/**
 * Eyebrow — small-caps section label led by the four-point star brand marker.
 * Replaces the per-page inline Eyebrow copies.
 */
import { Star4 } from "@/components/ui/glyphs";
import type { ReactNode } from "react";

export function Eyebrow({
  children,
  gold = true,
  className = "",
}: {
  children: ReactNode;
  /** false → violet marker (used inside already-gold contexts) */
  gold?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 font-display font-extrabold text-[11px] tracking-[0.24em] uppercase ${
        gold ? "text-gold" : "text-accent-bright"
      } ${className}`}
    >
      <Star4 size={11} />
      <span>{children}</span>
    </div>
  );
}
