"use client";
import { usePathname, useRouter } from "next/navigation";
import ZodicogMark from "./ZodicogMark";
import ZodicognacMark from "./ZodicognacMark";

export default function MobileNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const inChat = pathname.startsWith("/chat");

  return (
    <nav
      className="mobile-fab block md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-center"
      style={{ background: "transparent" }}
    >
      {inChat ? (
        /* In chat → show ZodicogAI mark, tap goes home */
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
            if (pathname === "/") router.push("/?zn=1");
            else router.push("/chat");
          }}
          className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center tap-highlight-none"
          style={{ animation: "pulse-amber 3s ease-in-out infinite" }}
          aria-label="Open Zodicognac"
        >
          <ZodicognacMark size={26} active />
        </button>
      )}
    </nav>
  );
}
