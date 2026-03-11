"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",                      label: "Home" },
  { href: "/dashboard",             label: "Full Report" },
  { href: "/analyze/emotional",     label: "Emotional" },
  { href: "/analyze/romantic",      label: "Romantic" },
  { href: "/analyze/sextrology",    label: "Sextrology" },
  { href: "/analyze/love-style",    label: "Love Style" },
  { href: "/analyze/love-language", label: "Love Language" },
  { href: "/chat",                  label: "Chat" },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-black/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <span className="text-sm font-semibold text-white mr-4 shrink-0">ZodicogAI</span>
        {LINKS.map(({ href, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 px-3 py-1 rounded-full text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
