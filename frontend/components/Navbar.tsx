"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ZodicogMark from "./ZodicogMark";
import ZodicognacMark from "./ZodicognacMark";

const LINKS = [
  { href: "/discover",           label: "✦ Discover" },
  { href: "/celebrities",        label: "⭐ Celebrities" },
  { href: "/analyze/zodiac",     label: "Zodiac" },
  { href: "/analyze/emotional",  label: "Emotional" },
  { href: "/analyze/romantic",   label: "Romantic" },
  { href: "/analyze/sextrology", label: "Sextrology" },
  { href: "/analyze/color",      label: "Aura Colors" },
  { href: "/analyze/numerology", label: "Numerology" },
];

const MORE_LINKS = [
  { href: "/dashboard", label: "Synastry" },
  { href: "/blog",      label: "Blog" },
  { href: "/about",     label: "About" },
];

const LOVE_LINKS = [
  { href: "/analyze/love-style",    label: "Love Style" },
  { href: "/analyze/love-language", label: "Love Language" },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();

  const chatActive = path.startsWith("/chat");
  const loveActive = path.startsWith("/analyze/love-style") || path.startsWith("/analyze/love-language");
  const moreActive = MORE_LINKS.some(l => path.startsWith(l.href));

  const [loveOpen, setLoveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const allMobileLinks = [...LINKS, ...MORE_LINKS, ...LOVE_LINKS];

  function DesktopDropdown({
    label, links, open, active,
    onEnter, onLeave,
  }: {
    label: string
    links: { href: string; label: string }[]
    open: boolean
    active: boolean
    onEnter: () => void
    onLeave: () => void
  }) {
    return (
      <div
        className="hidden md:flex relative shrink-0 items-stretch"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <button
          className={`flex items-center gap-1 px-3 text-sm border-b-2 transition-all duration-200 ${
            active
              ? "text-white font-medium border-[#4285f4]"
              : "text-zinc-500 hover:text-zinc-200 border-transparent"
          }`}
        >
          {label}
          <ChevronIcon open={open} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full right-0 w-36 rounded-b-xl bg-[#0a0a12]/95 backdrop-blur-md border border-white/[0.08] border-t-0 overflow-hidden shadow-xl z-50"
            >
              {links.map(({ href, label: lbl }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    path.startsWith(href)
                      ? "text-white bg-white/[0.06]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {lbl}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 flex items-stretch">

          {/* Brand */}
          <Link href="/" className="flex items-center mr-4 md:mr-5 shrink-0" onClick={() => setMenuOpen(false)}>
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ opacity: 0.75 }}
              transition={{ duration: 0.15 }}
            >
              <ZodicogMark size={18} />
              <span className={`text-sm font-semibold tracking-tight ${path === "/" ? "text-white" : "text-zinc-400 hover:text-white transition-colors"}`}>
                ZodicogAI
              </span>
            </motion.div>
          </Link>

          {/* Mobile pinned links — always visible (Discover + Celebrities) */}
          <div className="md:hidden flex items-stretch">
            {LINKS.slice(0, 2).map(({ href, label }) => {
              const active = path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`shrink-0 flex items-center px-2.5 text-xs border-b-2 transition-all duration-200 ${
                    active
                      ? "text-white font-medium border-[#4285f4]"
                      : "text-zinc-500 hover:text-zinc-200 border-transparent"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-stretch flex-1 overflow-x-auto scrollbar-none">
            {LINKS.map(({ href, label }) => {
              const active = path.startsWith(href);
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
          </div>

          {/* Desktop dropdowns: Love + More */}
          <DesktopDropdown
            label="Love"
            links={LOVE_LINKS}
            open={loveOpen}
            active={loveActive}
            onEnter={() => setLoveOpen(true)}
            onLeave={() => setLoveOpen(false)}
          />
          <DesktopDropdown
            label="More"
            links={MORE_LINKS}
            open={moreOpen}
            active={moreActive}
            onEnter={() => setMoreOpen(true)}
            onLeave={() => setMoreOpen(false)}
          />

          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 ml-auto shrink-0">
            {/* Zodicognac */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link
                href="/chat"
                onClick={(e) => {
                  setMenuOpen(false);
                  if (path === "/") {
                    e.preventDefault();
                    router.push("/?zn=1");
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border transition-all duration-200 ${
                  chatActive
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "border-amber-500/20 text-amber-500/70 hover:bg-amber-500/10 hover:border-amber-500/35 hover:text-amber-400"
                }`}
              >
                <ZodicognacMark size={14} active={chatActive} />
                <span className="hidden sm:inline">Zodicognac</span>
              </Link>
            </motion.div>

            {/* GitHub + Email — desktop only */}
            <a
              href="https://github.com/VSSK007/ZodicogAI"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
              title="VSSK007/ZodicogAI"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>

            <a
              href="mailto:kar1mr@zodicogai.com"
              className="hidden md:block text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
              title="kar1mr@zodicogai.com"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden flex flex-col justify-center gap-1 w-8 h-8 shrink-0"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
                className="block h-px w-5 bg-zinc-400 origin-center"
              />
              <motion.span
                animate={{ opacity: menuOpen ? 0 : 1 }}
                className="block h-px w-5 bg-zinc-400"
              />
              <motion.span
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
                className="block h-px w-5 bg-zinc-400 origin-center"
              />
            </button>
          </div>
        </div>

        <div className="h-px bg-white/[0.07]" />

        {/* Mobile menu panel */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-[#0a0a12]/98 border-b border-white/[0.07]"
            >
              <div className="px-4 py-3 grid grid-cols-2 gap-1">
                {allMobileLinks.map(({ href, label }) => {
                  const active = path.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-white/[0.08] text-white font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>

              <div className="px-4 pb-4 flex gap-4 border-t border-white/[0.05] pt-3 mt-1">
                <a href="https://github.com/VSSK007/ZodicogAI" target="_blank" rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1.5 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </a>
                <a href="mailto:kar1mr@zodicogai.com"
                  className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1.5 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Contact
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
