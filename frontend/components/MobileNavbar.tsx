"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ZodicogMark from "./ZodicogMark";
import ZodicognacMark from "./ZodicognacMark";
import MobileMenuSheet from "./MobileMenuSheet";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Go home"
      className="w-12 h-12 rounded-full flex items-center justify-center tap-highlight-none active:scale-90 transition-transform"
      style={{
        background: "radial-gradient(circle at 40% 40%, rgba(99,102,241,0.18), rgba(10,10,24,0.85))",
        border: "1px solid rgba(129,140,248,0.35)",
        boxShadow: "0 0 14px rgba(99,102,241,0.25), inset 0 0 8px rgba(129,140,248,0.08)",
      }}
    >
      {/* Cosmic back arrow */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 4L7 10L13 16"
          stroke="rgba(165,180,252,0.9)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="10" r="1.5" fill="rgba(165,180,252,0.7)" />
      </svg>
    </button>
  );
}

export default function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const inChat = pathname.startsWith("/chat");
  const inBlog = pathname.startsWith("/blog");
  const inAbout = pathname === "/about";
  const inAnalyze = pathname.startsWith("/analyze");
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  // On blog/about/analyze pages: only show when scrolled near the bottom
  const scrollControlled = inBlog || inAbout || inAnalyze;
  const [scrollVisible, setScrollVisible] = useState(false);
  useEffect(() => {
    if (!scrollControlled) return;
    setScrollVisible(false);
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 200;
      setScrollVisible(nearBottom);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollControlled, pathname]);

  if (scrollControlled && !scrollVisible) return null;

  return (
    <>
      <MobileMenuSheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <nav
      className="mobile-fab block md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-center"
      style={{ background: "transparent" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Menu button — floats left of FAB */}
        {!inChat && (
          <div className="absolute right-full mr-5">
            {isHome ? (
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="w-12 h-12 rounded-full flex items-center justify-center tap-highlight-none active:scale-90 transition-transform bg-white/[0.05] border border-white/[0.12]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            ) : (
              <BackButton onClick={() => router.push("/")} />
            )}
          </div>
        )}

        {/* Menu button — floats right of FAB, only on non-home pages (left side is back button there) */}
        {!inChat && !isHome && (
          <div className="absolute left-full ml-5">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="w-12 h-12 rounded-full flex items-center justify-center tap-highlight-none active:scale-90 transition-transform bg-amber-500/10 border border-amber-500/25"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {inChat ? (
          /* In chat → ZodicogAI mark goes home */
          <button
            onClick={() => router.push("/")}
            className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center tap-highlight-none"
            aria-label="Go home"
          >
            <ZodicogMark size={26} />
          </button>
        ) : (
          /* Everywhere else → amber Zodicognac FAB */
          <button
            onClick={() => {
              if (isHome) router.push("/?zn=1");
              else router.push("/chat");
            }}
            className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center tap-highlight-none"
            style={{ animation: "pulse-amber 3s ease-in-out infinite" }}
            aria-label="Open Zodicognac"
          >
            <ZodicognacMark size={26} active />
          </button>
        )}
      </div>
    </nav>
    </>
  );
}
