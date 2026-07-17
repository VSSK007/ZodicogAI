/**
 * Card — the only content-surface styling in the app.
 *
 * variant:
 *   default     — translucent panel + hairline (the standard result card)
 *   interactive — hover lift for link tiles and clickable cards
 *   featured    — violet hairline + panel glow, for the page's hero surface
 *   gold        — gold hairline tint, reserved for Zodicognac surfaces
 */
import type { ComponentProps } from "react";

type Variant = "default" | "interactive" | "featured" | "gold";

const VARIANTS: Record<Variant, string> = {
  default:
    "bg-white/[0.03] border border-hairline rounded-card",
  interactive:
    "bg-white/[0.03] border border-hairline rounded-card transition-all duration-200 " +
    "hover:border-hairline-accent hover:bg-accent/5 hover:-translate-y-0.5",
  featured:
    "bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-hairline-accent rounded-card shadow-panel",
  gold:
    "bg-gold/[0.04] border border-hairline-gold rounded-card",
};

export function Card({
  variant = "default",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<"div">) {
  return <div className={`${VARIANTS[variant]} ${className}`} {...props} />;
}

/** Class string export for places that need the recipe on another element. */
export const CARD_CLASS = VARIANTS.default;
