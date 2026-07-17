"use client";

/**
 * Desktop navigation. (Mobile nav lives in MobileNavbar + MobileMenuSheet —
 * layout.tsx renders this component inside a `hidden md:block` wrapper.)
 *
 * IA: Analyze ▾ (two-column dropdown: You / Together) · Discover ·
 * Celebrities · Blog, then Zodicognac (gold pill, keeps the ?zn=1 easter egg
 * on the homepage) and the primary "Get your reading" CTA.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ZodicogMark from "./ZodicogMark";
import ZodicognacMark from "./ZodicognacMark";
import { Glyph } from "@/components/ui/glyphs";
import { ANALYZE_YOU, ANALYZE_TOGETHER, type AnalyzeLink } from "@/lib/analyses";

const TOP_LINKS = [
  { href: "/discover",    label: "Discover" },
  { href: "/celebrities", label: "Celebrities" },
  { href: "/blog",        label: "Blog" },
];

function RowIcon({ link }: { link: AnalyzeLink }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-control border border-hairline bg-gold/5 text-gold-bright">
      {link.glyph ? (
        <Glyph name={link.glyph} size={15} />
      ) : link.icon ? (
        <link.icon className="size-[15px]" />
      ) : null}
    </span>
  );
}

function AnalyzeColumn({
  title,
  links,
  path,
  onNavigate,
}: {
  title: string;
  links: AnalyzeLink[];
  path: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="px-3 pb-1.5 font-display font-extrabold text-[10px] tracking-[0.22em] uppercase text-ink-muted">
        {title}
      </p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-control px-3 py-2 transition-colors ${
            path.startsWith(link.href)
              ? "bg-white/[0.06]"
              : "hover:bg-white/[0.04]"
          }`}
        >
          <RowIcon link={link} />
          <span className="min-w-0">
            <span className="block text-[13.5px] font-semibold text-ink leading-tight">{link.label}</span>
            <span className="block text-xs text-ink-muted truncate">{link.desc}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();

  const chatActive = path.startsWith("/chat");
  const analyzeActive = path.startsWith("/analyze") || path.startsWith("/dashboard");
  const [analyzeOpen, setAnalyzeOpen] = useState(false);

  const topItem = (active: boolean) =>
    `flex items-center gap-1 px-3.5 h-full text-sm border-b-2 transition-all duration-200 ${
      active
        ? "text-ink font-medium border-accent"
        : "text-ink-muted hover:text-ink-secondary border-transparent"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-overlay/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-stretch">

        {/* Brand */}
        <Link href="/" className="flex items-center mr-6 shrink-0">
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <ZodicogMark size={22} />
            <span
              className="text-[15px] font-extrabold tracking-tight text-ink"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Zodicog<span className="text-accent-bright">AI</span>
            </span>
          </motion.div>
        </Link>

        {/* Analyze dropdown */}
        <div
          className="relative flex items-stretch shrink-0"
          onMouseEnter={() => setAnalyzeOpen(true)}
          onMouseLeave={() => setAnalyzeOpen(false)}
        >
          <button
            className={topItem(analyzeActive)}
            aria-expanded={analyzeOpen}
            aria-haspopup="true"
            onClick={() => setAnalyzeOpen((o) => !o)}
          >
            Analyze
            <ChevronDown
              className={`size-3.5 transition-transform duration-150 ${analyzeOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence>
            {analyzeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
                className="absolute top-full left-0 w-[480px] rounded-b-card bg-surface-overlay/95 backdrop-blur-md border border-hairline border-t-0 shadow-panel z-50 p-3 flex gap-2"
              >
                <AnalyzeColumn title="You" links={ANALYZE_YOU} path={path} onNavigate={() => setAnalyzeOpen(false)} />
                <div className="w-px bg-hairline my-1" />
                <AnalyzeColumn title="Together" links={ANALYZE_TOGETHER} path={path} onNavigate={() => setAnalyzeOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top-level links */}
        {TOP_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className={`${topItem(path.startsWith(href))} shrink-0`}>
            {label}
          </Link>
        ))}

        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Zodicognac — gold sub-brand pill; on the homepage it plays the ?zn=1 ritual first */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                chatActive
                  ? "bg-gold/15 border-hairline-gold text-gold-bright"
                  : "border-gold/25 text-gold/80 hover:bg-gold/10 hover:border-hairline-gold hover:text-gold-bright"
              }`}
            >
              <ZodicognacMark size={14} active={chatActive} />
              Zodicognac
            </Link>
          </motion.div>

          {/* Primary CTA */}
          <Link
            href="/analyze/hybrid"
            className="flex items-center rounded-control px-4 py-1.5 text-sm font-semibold text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110 transition-all duration-200"
          >
            Get your reading
          </Link>
        </div>
      </div>

      <div className="h-px bg-hairline" />
    </nav>
  );
}
