"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ZodicogMark from "./ZodicogMark";
import ZodicognacMark from "./ZodicognacMark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze/zodiac", label: "Zodiac" },
  { href: "/analyze/emotional", label: "Emotional" },
  { href: "/analyze/romantic", label: "Romantic" },
  { href: "/analyze/sextrology", label: "Sextrology" },
  { href: "/analyze/love-style", label: "Love Style" },
  { href: "/analyze/love-language", label: "Love Language" },
  { href: "/analyze/color", label: "Aura Colors" },
  { href: "/analyze/numerology", label: "Numerology" },
  { href: "/dashboard", label: "Synastry" },
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
          <span className="text-sm font-semibold text-white tracking-tight">
            ZodicogAI
          </span>
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

        {/* Right section — Zodicognac pill + GitHub + email */}
        <div className="ml-auto flex items-center gap-3 pl-4 shrink-0">
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

          {/* GitHub — always visible, before email */}
          <a
            href="https://github.com/VSSK007/ZodicogAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
            title="VSSK007/ZodicogAI"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>

          {/* Email — hides at smaller desktop widths to keep GitHub visible */}
          <a
            href="mailto:kar1mr@zodicogai.com"
            className="hidden xl:block text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
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
