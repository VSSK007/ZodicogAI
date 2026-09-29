/**
 * SignWatermark — a large, near-invisible zodiac glyph tucked into the corner
 * of a card. The parent must be `relative overflow-hidden`.
 */
import { SignGlyph } from "@/components/ui/glyphs";

export function SignWatermark({
  sign,
  side = "right",
  size = 170,
}: {
  sign: string;
  side?: "left" | "right";
  size?: number;
}) {
  if (!sign) return null;
  return (
    <SignGlyph
      sign={sign}
      size={size}
      strokeWidth={1}
      className={`pointer-events-none absolute -bottom-6 text-gold opacity-[0.06] ${
        side === "left" ? "-left-6" : "-right-6"
      }`}
    />
  );
}
