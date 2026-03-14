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
            className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] rounded-t-3xl bg-[#0d0d1f] border-t border-white/[0.09] overflow-y-auto scrollbar-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-3 gap-3 p-5 pb-12">
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
