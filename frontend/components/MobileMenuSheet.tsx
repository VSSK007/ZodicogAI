"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Star4, ZODIAC_GLYPHS, Glyph } from "@/components/ui/glyphs";

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bottom sheet menu for mobile navigation.
 * Mirrors the desktop IA: You / Together / Discover / Celebrities / More.
 */
export default function MobileMenuSheet({ isOpen, onClose }: MobileMenuSheetProps) {
  const youLinks = [
    { label: "Behavioral Profile", href: "/analyze/hybrid" },
    { label: "Zodiac", href: "/analyze/zodiac" },
    { label: "Aura Colors", href: "/analyze/color" },
    { label: "Numerology", href: "/analyze/numerology" },
  ];

  const togetherLinks = [
    { label: "Romantic", href: "/analyze/romantic" },
    { label: "Emotional", href: "/analyze/emotional" },
    { label: "Sextrology", href: "/analyze/sextrology" },
    { label: "Love Style", href: "/analyze/love-style" },
    { label: "Love Language", href: "/analyze/love-language" },
    { label: "Full Report", href: "/dashboard" },
  ];

  const discoverLinks = [
    { label: "Love Archetype", href: "/discover/archetype" },
    { label: "Pattern", href: "/discover/pattern" },
    { label: "Attraction", href: "/discover/attraction" },
    { label: "Taste Profile", href: "/discover/recommendations" },
  ];

  const sectionLabel =
    "flex items-center gap-1.5 font-display font-extrabold text-[10px] uppercase tracking-[0.22em] mb-2";
  const tile =
    "rounded-card bg-white/[0.04] border border-hairline p-3 text-center text-xs font-medium text-ink-secondary hover:bg-white/[0.08] hover:text-ink transition-all tap-highlight-none";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-20 z-50 max-h-[75vh] rounded-t-3xl bg-surface-overlay border-t border-hairline-strong overflow-y-auto scrollbar-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            {/* You */}
            <div className="px-5 pb-4">
              <p className={`${sectionLabel} text-ink-muted`}><Star4 size={9} className="text-gold" /> You</p>
              <div className="grid grid-cols-2 gap-2">
                {youLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={onClose} className={tile}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Together */}
            <div className="px-5 pb-4">
              <p className={`${sectionLabel} text-ink-muted`}><Star4 size={9} className="text-gold" /> Together</p>
              <div className="grid grid-cols-3 gap-2">
                {togetherLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={onClose} className={tile}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Discover */}
            <div className="px-5 pb-4">
              <p className={`${sectionLabel} text-gold/80`}><Star4 size={9} /> Discover</p>
              <div className="grid grid-cols-2 gap-2">
                {discoverLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="rounded-card bg-gold/[0.07] border border-gold/20 p-3 text-center text-xs font-medium text-gold-bright/80 hover:bg-gold/[0.12] hover:text-gold-bright transition-all tap-highlight-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Celebrities banner */}
            <div className="px-5 pb-4">
              <Link
                href="/celebrities"
                onClick={onClose}
                className="relative block rounded-card overflow-hidden border border-hairline-gold tap-highlight-none active:scale-[0.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg, rgba(216,166,60,0.16) 0%, rgba(216,166,60,0.05) 45%, rgba(139,124,246,0.06) 100%)",
                }}
              >
                <div
                  className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(237,203,126,0.18) 0%, transparent 70%)" }}
                />
                <div className="relative px-4 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink mb-0.5">Zodiac Celebrities</p>
                    <p className="text-[11px] text-ink-muted">360 profiles across all 12 signs</p>
                    <div className="flex gap-1.5 mt-2.5 text-gold/50">
                      {ZODIAC_GLYPHS.slice(0, 6).map((g) => (
                        <Glyph key={g} name={g} size={11} strokeWidth={1.8} />
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 ml-3 size-11 rounded-full flex items-center justify-center bg-gold/10 border border-hairline-gold text-gold-bright">
                    <Star4 size={16} />
                  </div>
                </div>
              </Link>
            </div>

            {/* More */}
            <div className="px-5 pb-12">
              <p className={`${sectionLabel} text-ink-faint`}><Star4 size={9} /> More</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Blog", href: "/blog" },
                  { label: "About", href: "/about" },
                  { label: "FAQ", href: "/blog/faq" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} onClick={onClose} className={tile}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
