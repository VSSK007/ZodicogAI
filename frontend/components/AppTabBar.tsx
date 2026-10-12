"use client";

/**
 * AppTabBar - the bottom tab bar of the installed app.
 *
 * Always rendered, but visible only when the site runs as an installed app on
 * a phone/tablet: globals.css gates `.app-tabbar` on `html[data-installed]`
 * (set before first paint by the inline script in app/layout.tsx from the
 * standalone display-mode) and below `lg`. In the same mode the floating
 * button cluster and the footer are hidden. A normal browser tab is unchanged.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, LayoutGrid, Search, Sun, UserRound } from "lucide-react";
import ZodicognacMark from "./ZodicognacMark";
import { Glyph } from "@/components/ui/glyphs";
import { openCommandPalette } from "@/components/CommandPalette";
import { ANALYZE_TOGETHER, ANALYZE_YOU, type AnalyzeLink } from "@/lib/analyses";

const EXPLORE: { href: string; label: string }[] = [
  { href: "/horoscope", label: "Horoscope" },
  { href: "/discover", label: "Discover" },
  { href: "/celebrities", label: "Celebrities" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

const ANALYZE_PREFIXES = ["/analyze", "/dashboard", "/discover"];

const TAB =
  "relative flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 text-micro font-medium " +
  "tap-highlight-none transition-colors";

function AnalyzeRow({ link, onNavigate }: { link: AnalyzeLink; onNavigate: () => void }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-card bg-white/[0.04] border border-hairline px-3 py-3 min-h-[44px] text-sm font-medium text-ink-secondary active:bg-white/[0.08] tap-highlight-none"
    >
      <span className="text-gold-bright shrink-0">
        {link.glyph ? <Glyph name={link.glyph} size={16} strokeWidth={1.8} /> : Icon ? <Icon className="size-4" /> : null}
      </span>
      {link.label}
    </Link>
  );
}

export default function AppTabBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Close on navigation (the bar lives in the root layout and survives it).
  useEffect(() => {
    closeSheet();
  }, [pathname, closeSheet]);

  // While the sheet is open the page behind must not scroll; Escape closes it.
  useEffect(() => {
    if (!sheetOpen) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen, closeSheet]);

  const is = (...prefixes: string[]) => prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const active = {
    today: is("/today"),
    analyze: is(...ANALYZE_PREFIXES),
    chat: is("/chat"),
    readings: is("/readings", "/r"),
    me: is("/profile", "/login", "/welcome"),
  };
  const tone = (on: boolean) => (on ? "text-gold-bright" : "text-ink-muted active:text-ink");

  return (
    <>
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="app-tabbar-layer fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Analyze"
              className="app-tabbar-layer fixed inset-x-0 z-[48] max-h-[78dvh] overflow-y-auto overscroll-contain scrollbar-none rounded-t-3xl bg-surface-overlay border-t border-hairline-strong"
              style={{ bottom: "calc(56px + var(--safe-area-bottom))" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
              </div>

              <div className="px-5 pb-4">
                <button
                  onClick={() => { closeSheet(); setTimeout(openCommandPalette, 150); }}
                  className="w-full flex items-center gap-2.5 rounded-card border border-hairline bg-white/[0.04] px-3.5 py-3 text-sm text-ink-muted tap-highlight-none"
                >
                  <Search className="size-4" aria-hidden="true" />
                  Search analyses, signs, celebrities…
                </button>
              </div>

              <div className="px-5 pb-4">
                <p className="font-display font-extrabold text-micro uppercase tracking-[0.22em] text-ink-muted mb-2">You</p>
                <div className="grid grid-cols-2 gap-2">
                  {ANALYZE_YOU.map((l) => <AnalyzeRow key={l.href} link={l} onNavigate={closeSheet} />)}
                </div>
              </div>

              <div className="px-5 pb-4">
                <p className="font-display font-extrabold text-micro uppercase tracking-[0.22em] text-ink-muted mb-2">Together</p>
                <div className="grid grid-cols-2 gap-2">
                  {ANALYZE_TOGETHER.map((l) => <AnalyzeRow key={l.href} link={l} onNavigate={closeSheet} />)}
                </div>
              </div>

              <div className="px-5 pb-5">
                <p className="font-display font-extrabold text-micro uppercase tracking-[0.22em] text-ink-faint mb-2">Explore</p>
                <div className="flex flex-wrap gap-2">
                  {EXPLORE.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={closeSheet}
                      className="rounded-full border border-hairline px-3.5 py-2 text-xs font-medium text-ink-secondary active:bg-white/[0.08] tap-highlight-none"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="App"
        data-testid="app-tabbar"
        className="app-tabbar fixed inset-x-0 bottom-0 z-50 items-stretch border-t border-hairline bg-surface-overlay/95 backdrop-blur-md"
        style={{ paddingBottom: "var(--safe-area-bottom)" }}
      >
        <Link href="/today" aria-current={active.today ? "page" : undefined} className={`${TAB} ${tone(active.today)}`}>
          <Sun className="size-[22px]" aria-hidden="true" />
          Today
        </Link>

        <button
          type="button"
          onClick={() => setSheetOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-current={active.analyze ? "page" : undefined}
          className={`${TAB} ${tone(active.analyze || sheetOpen)}`}
        >
          <LayoutGrid className="size-[22px]" aria-hidden="true" />
          Analyze
        </button>

        <Link href="/chat" aria-current={active.chat ? "page" : undefined} className={`${TAB} ${tone(active.chat)}`}>
          <ZodicognacMark size={22} active={active.chat} />
          Chat
        </Link>

        <Link href="/readings" aria-current={active.readings ? "page" : undefined} className={`${TAB} ${tone(active.readings)}`}>
          <BookOpen className="size-[22px]" aria-hidden="true" />
          Readings
        </Link>

        <Link href="/profile" aria-current={active.me ? "page" : undefined} className={`${TAB} ${tone(active.me)}`}>
          <UserRound className="size-[22px]" aria-hidden="true" />
          Me
        </Link>
      </nav>
    </>
  );
}
