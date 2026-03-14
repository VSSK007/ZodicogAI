"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import ZodicognacMark from "./ZodicognacMark";
import MobileMenuSheet from "./MobileMenuSheet";

/**
 * Bottom tab navigation for mobile screens.
 * 5 tabs: Home, Zodiac, Zodicognac (raised center FAB), Compatibility, More
 * Desktop: hidden via md:hidden
 */
export default function MobileNavbar() {
  const pathname = usePathname();
  const [showMenuSheet, setShowMenuSheet] = useState(false);

  // Inline SVG icons
  const HomeIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );

  const ZodiacIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  );

  const HeartIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  const GridIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  );

  const isActive = (path: string) => pathname === path;

  const tabs = [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: ZodiacIcon, label: "Zodiac", href: "/analyze/zodiac" },
    { icon: null, label: "Zodicognac", href: "/chat", isFab: true },
    { icon: HeartIcon, label: "Compat", href: "/analyze/romantic" },
    { icon: GridIcon, label: "More", href: null, isMore: true },
  ];

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenuSheet(true);
  };

  return (
    <>
      {/* Mobile footer — email visible above bottom nav */}
      <div className="block md:hidden fixed bottom-16 left-0 right-0 z-40 px-4 py-2 bg-gradient-to-t from-[#07071a]/80 to-transparent pointer-events-none">
        <a
          href="mailto:kar1mr@zodicogai.com"
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors block text-center pointer-events-auto"
          title="Contact ZodicogAI"
        >
          kar1mr@zodicogai.com
        </a>
      </div>

      <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#07071a]/95 backdrop-blur-xl border-t border-white/[0.08]">
        <div className="flex justify-around items-end px-2 pb-3 h-full">
          {tabs.map((tab) => {
            if (tab.isFab) {
              return (
                <Link
                  key="zodicognac"
                  href={tab.href}
                  className="relative"
                >
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-0 w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center tap-highlight-none transition-all hover:bg-amber-500/20"
                    style={{ animation: "pulse-amber 2s infinite" }}
                  >
                    <ZodicognacMark size={24} active />
                  </motion.div>
                </Link>
              );
            }

            if (tab.isMore) {
              return (
                <button
                  key="more"
                  onClick={handleMoreClick}
                  className="flex flex-col items-center gap-1 tap-highlight-none"
                >
                  <div
                    className={`text-[10px] tracking-wide transition-colors ${
                      isActive(tab.href || "")
                        ? "text-amber-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {tab.icon && <tab.icon />}
                  </div>
                  <span
                    className={`text-[10px] tracking-wide transition-colors ${
                      isActive(tab.href || "")
                        ? "text-amber-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-1 tap-highlight-none"
              >
                <div
                  className={`transition-colors ${
                    isActive(tab.href)
                      ? "text-amber-400"
                      : "text-zinc-600"
                  }`}
                >
                  {Icon && <Icon />}
                </div>
                <span
                  className={`text-[10px] tracking-wide transition-colors ${
                    isActive(tab.href)
                      ? "text-amber-400"
                      : "text-zinc-600"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileMenuSheet isOpen={showMenuSheet} onClose={() => setShowMenuSheet(false)} />
    </>
  );
}
