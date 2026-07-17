"use client";

/**
 * Site footer — multi-column, all viewports.
 * Hidden on /chat and during the ?zn=1 Zodicognac ritual.
 */
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ZodicogMark from "./ZodicogMark";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Analyze",
    links: [
      { href: "/analyze/hybrid",     label: "Behavioral Profile" },
      { href: "/analyze/romantic",   label: "Romantic" },
      { href: "/analyze/emotional",  label: "Emotional" },
      { href: "/analyze/sextrology", label: "Sextrology" },
      { href: "/dashboard",          label: "Full Report" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/discover",    label: "Discover" },
      { href: "/celebrities", label: "Celebrities" },
      { href: "/blog",        label: "Blog" },
      { href: "/chat",        label: "Zodicognac" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about",    label: "About" },
      { href: "/blog/faq", label: "FAQ" },
    ],
  },
];

function FooterInner() {
  const path = usePathname();
  const params = useSearchParams();

  if (path.startsWith("/chat")) return null;
  if (params.get("zn") === "1") return null;

  return (
    <footer className="border-t border-hairline mb-nav md:mb-0">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <ZodicogMark size={20} />
              <span
                className="text-sm font-extrabold tracking-tight text-ink"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Zodicog<span className="text-accent-bright">AI</span>
              </span>
            </Link>
            <p className="mt-3.5 text-[13px] text-ink-muted max-w-[260px] leading-relaxed">
              Explainable compatibility and relationship intelligence — deterministic
              engines score every framework, AI explains the result.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href="https://github.com/VSSK007/ZodicogAI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-ink-muted hover:text-ink-secondary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a
                href="mailto:kar1mr@zodicogai.com"
                aria-label="Email"
                className="text-ink-muted hover:text-ink-secondary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-display font-extrabold text-[10.5px] tracking-[0.22em] uppercase text-ink-muted mb-4">
                {col.title}
              </p>
              {col.links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-[13.5px] text-ink-secondary hover:text-accent-bright transition-colors mb-2.5"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Base bar */}
        <div className="mt-10 pt-5 border-t border-hairline flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between text-xs text-ink-muted">
          <span>© {new Date().getFullYear()} ZodicogAI</span>
          <span>For reflection &amp; entertainment purposes</span>
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
