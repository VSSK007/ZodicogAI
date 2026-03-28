"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FooterInner() {
  const path = usePathname();
  const params = useSearchParams();

  if (path.startsWith("/chat")) return null;
  if (params.get("zn") === "1") return null;

  return (
    <footer className="hidden md:block border-t border-white/[0.05] py-5 px-6">
      <div className="flex max-w-7xl mx-auto items-center justify-between">
        <p className="text-xs text-zinc-600">
          <span className="text-zinc-500 font-medium">ZodicogAI</span>
          <span className="mx-2 text-zinc-700">·</span>
          <span className="text-amber-700/70">The world&apos;s first Astrological Intelligence platform</span>
        </p>
        <div className="flex items-center gap-5 text-xs text-zinc-600">
          <a href="/about" className="hover:text-zinc-400 transition-colors">About</a>
          <a href="/blog" className="hover:text-zinc-400 transition-colors">Blog</a>
          <a href="/blog/faq" className="hover:text-zinc-400 transition-colors">FAQ</a>
          <a href="mailto:kar1mr@zodicogai.com" className="hover:text-zinc-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <Suspense>
      <FooterInner />
    </Suspense>
  );
}
