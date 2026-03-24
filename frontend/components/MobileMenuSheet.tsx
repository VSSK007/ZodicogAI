"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bottom sheet menu for mobile "More" navigation.
 * Displays all analysis page links in a 3-column grid.
 */
export default function MobileMenuSheet({ isOpen, onClose }: MobileMenuSheetProps) {
  const discoverLinks = [
    { label: "✦ Love Archetype", href: "/discover/archetype" },
    { label: "✦ Pattern",        href: "/discover/pattern" },
    { label: "✦ Attraction",     href: "/discover/attraction" },
    { label: "✦ Taste Profile",  href: "/discover/recommendations" },
  ];

  const analyzeLinks = [
    { label: "Emotional", href: "/analyze/emotional" },
    { label: "Romantic", href: "/analyze/romantic" },
    { label: "Love Style", href: "/analyze/love-style" },
    { label: "Love Language", href: "/analyze/love-language" },
    { label: "Sextrology", href: "/analyze/sextrology" },
    { label: "Zodiac", href: "/analyze/zodiac" },
    { label: "Aura Colors", href: "/analyze/color" },
    { label: "Numerology", href: "/analyze/numerology" },
    { label: "Full Intelligence", href: "/dashboard" },
  ];

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
            className="fixed inset-x-0 bottom-20 z-50 max-h-[75vh] rounded-t-3xl bg-[#0d0d1f] border-t border-white/[0.09] overflow-y-auto scrollbar-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            {/* Discover section */}
            <div className="px-5 pb-1">
              <p className="text-[10px] font-semibold text-amber-500/60 uppercase tracking-widest mb-2">Discover</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {discoverLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="rounded-xl bg-amber-500/[0.07] border border-amber-500/20 p-3 text-center text-xs font-medium text-amber-300/80 hover:bg-amber-500/[0.12] hover:text-amber-300 transition-all tap-highlight-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Celebrities */}
            <div className="px-5 pb-4">
              <Link
                href="/celebrities"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.09] px-4 py-3 hover:bg-white/[0.07] transition-all tap-highlight-none"
              >
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">Celebrities</p>
                  <p className="text-[10px] text-zinc-500">360 zodiac profiles</p>
                </div>
              </Link>
            </div>

            {/* Analyze section */}
            <div className="px-5 pb-1">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Analyze</p>
            </div>
            <div className="grid grid-cols-3 gap-3 px-5 pb-12">
              {analyzeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 text-center text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white transition-all tap-highlight-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
