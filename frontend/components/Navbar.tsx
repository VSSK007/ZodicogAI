"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ZodicogMark from "./ZodicogMark";
import ZodicognacMark from "./ZodicognacMark";

const LINKS = [
  { href: "/",                      label: "Home" },
  { href: "/analyze/zodiac",        label: "Zodiac" },
  { href: "/analyze/emotional",     label: "Emotional" },
  { href: "/analyze/romantic",      label: "Romantic" },
  { href: "/analyze/sextrology",    label: "Sextrology" },
  { href: "/analyze/love-style",    label: "Love Style" },
  { href: "/analyze/love-language", label: "Love Language" },
  { href: "/analyze/color",         label: "Aura Colors" },
  { href: "/analyze/numerology",    label: "Numerology" },
  { href: "/dashboard",             label: "Synastry" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const chatActive = path.startsWith("/chat");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-stretch overflow-x-auto scrollbar-none">

        {/* Brand insignia + wordmark — hover dims slightly */}
        <motion.div
          className="flex items-center gap-2.5 mr-5 shrink-0"
          whileHover={{ opacity: 0.75 }}
          transition={{ duration: 0.15 }}
        >
          <ZodicogMark size={18} />
          <span className="text-sm font-semibold text-white tracking-tight">ZodicogAI</span>
        </motion.div>

        {/* Nav links */}
        {LINKS.map(({ href, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 flex items-center px-3 text-sm border-b-2 transition-all duration-200 ${
                active
                  ? "text-white font-medium border-[#4285f4]"
                  : "text-zinc-500 hover:text-zinc-200 border-transparent"
              }`}
            >
              {label}
            </Link>
          );
        })}

        {/* Zodicognac — pill with scale microinteraction */}
        <div className="ml-auto flex items-center gap-6 pl-4 shrink-0">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link
              href="/chat"
              onClick={(e) => {
                if (path === "/") {
                  e.preventDefault();
                  router.push("/?zn=1");
                }
              }}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 ${
                chatActive
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "border-amber-500/20 text-amber-500/70 hover:bg-amber-500/10 hover:border-amber-500/35 hover:text-amber-400"
              }`}
            >
              <ZodicognacMark size={16} active={chatActive} />
              Zodicognac
            </Link>
          </motion.div>

          {/* Contact email — desktop only */}
          <a
            href="mailto:kar1mr@zodicogai.com"
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors truncate"
            title="Contact ZodicogAI"
          >
            kar1mr@zodicogai.com
          </a>
        </div>
      </div>
      <div className="h-px bg-white/[0.07]" />
    </nav>
  );
}
