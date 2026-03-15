"use client";
import { usePathname, useRouter } from "next/navigation";
import ZodicognacMark from "./ZodicognacMark";

/**
 * Mobile bottom bar — only the Zodicognac FAB, centered.
 * On homepage: triggers the ZodicogAI → Zodicognac slow-burn transition.
 * On other pages: navigates directly to /chat.
 * Desktop: hidden via md:hidden.
 */
export default function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      className="block md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-center"
      style={{ background: "transparent" }}
    >
      <button
        onClick={() => {
          if (pathname === "/") router.push("/?zn=1");
          else router.push("/chat");
        }}
        className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center tap-highlight-none"
        style={{ animation: "pulse-amber 3s ease-in-out infinite" }}
        aria-label="Open Zodicognac"
      >
        <ZodicognacMark size={26} active />
      </button>
    </nav>
  );
}
