/**
 * The analyses registry — single source for every analysis link, used by the
 * Navbar dropdown, the homepage showcase grid, and the footer.
 */
import { Hash, MessageCircle, Palette } from "lucide-react";
import type { GlyphName } from "@/components/ui/glyphs";

export type AnalyzeLink = {
  href: string;
  label: string;
  desc: string;
  glyph?: GlyphName;
  icon?: React.ComponentType<{ className?: string }>;
};

export const ANALYZE_YOU: AnalyzeLink[] = [
  { href: "/analyze/hybrid",     label: "Behavioral Profile", desc: "Zodiac × MBTI fused into one behavioral portrait",  glyph: "sun" },
  { href: "/analyze/zodiac",     label: "Zodiac Deep-Dive",   desc: "Your sign, decan, and ruling planet — in full",     glyph: "aries" },
  { href: "/analyze/color",      label: "Aura Colors",        desc: "The palette your chart casts, and what it attracts", icon: Palette },
  { href: "/analyze/numerology", label: "Numerology",         desc: "Life path, expression, and lucky numbers",           icon: Hash },
];

export const ANALYZE_TOGETHER: AnalyzeLink[] = [
  { href: "/analyze/romantic",      label: "Romantic",      desc: "Attachment pacing, polarity, and long-term fire", glyph: "venus" },
  { href: "/analyze/emotional",     label: "Emotional",     desc: "How your emotional signatures resonate or clash", glyph: "crescent" },
  { href: "/analyze/sextrology",    label: "Sextrology",    desc: "Chemistry, candidly — solo or as a pair",          glyph: "mars" },
  { href: "/analyze/love-style",    label: "Love Style",    desc: "Six ways of loving, mapped and matched",           glyph: "heart" },
  { href: "/analyze/love-language", label: "Love Language", desc: "Five languages, two people — compared",            icon: MessageCircle },
  { href: "/dashboard",             label: "Full Report",   desc: "Every engine, one verdict — complete synastry",    glyph: "infinity" },
];
