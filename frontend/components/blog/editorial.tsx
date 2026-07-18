/**
 * Editorial primitives for "The Almanac" (blog), About, and FAQ pages.
 * Server components — pure markup on the Observatory token system.
 */
import Link from "next/link";
import { renderMd } from "@/lib/renderMd";
import { Star4 } from "@/components/ui/glyphs";
import type { ReactNode } from "react";

/* ── Breadcrumb ────────────────────────────────────────────────────────────── */
export function Breadcrumb({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <nav className="text-xs text-ink-muted mb-8 flex items-center gap-2">
      {trail.map((t, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">/</span>}
          {t.href ? (
            <Link href={t.href} className="hover:text-ink transition-colors">{t.label}</Link>
          ) : (
            <span className="text-ink-secondary">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ── Ambient glow — per-article tint behind the header ─────────────────────── */
export function AmbientGlow({ hex }: { hex: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-[420px] -z-10 pointer-events-none"
      aria-hidden="true"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${hex}1f 0%, ${hex}08 45%, transparent 75%)`,
      }}
    />
  );
}

/* ── Section — star-marked header + prose at reading size ──────────────────── */
export function ArticleSection({
  id,
  title,
  text,
  children,
}: {
  id?: string;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-center gap-2.5 font-display font-extrabold text-[13px] tracking-[0.18em] uppercase text-gold mb-3">
        <Star4 size={10} />
        {title}
      </h2>
      {text && (
        <p className="text-ink-secondary text-[16px] leading-[1.75]">{renderMd(text)}</p>
      )}
      {children}
    </section>
  );
}

/* ── PullQuote — featured passage card ─────────────────────────────────────── */
export function PullQuote({
  id,
  title,
  text,
  tone = "gold",
}: {
  id?: string;
  title: string;
  text: string;
  tone?: "gold" | "violet";
}) {
  const border = tone === "gold" ? "border-hairline-gold" : "border-hairline-accent";
  const bg = tone === "gold" ? "bg-gold/[0.05]" : "bg-accent/[0.06]";
  const label = tone === "gold" ? "text-gold-bright" : "text-accent-bright";
  return (
    <section id={id} className={`scroll-mt-24 rounded-card border ${border} ${bg} p-6 md:p-7`}>
      <p className={`font-display font-extrabold text-[12px] tracking-[0.18em] uppercase ${label} mb-2.5`}>
        {title}
      </p>
      <p className="text-ink text-[16.5px] leading-[1.7]">{renderMd(text)}</p>
    </section>
  );
}

/* ── ChipColumns — paired strengths/weaknesses lists ───────────────────────── */
export function ChipColumns({
  columns,
}: {
  columns: { title: string; items: string[]; color: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {columns.map((col) => (
        <div key={col.title} className="rounded-card border border-hairline bg-white/[0.02] p-5">
          <p className="font-display font-extrabold text-[11px] tracking-[0.18em] uppercase mb-3" style={{ color: col.color }}>
            {col.title}
          </p>
          <ul className="space-y-2">
            {col.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14.5px] text-ink-secondary leading-relaxed">
                <Star4 size={8} className="mt-[7px] shrink-0" style={{ color: col.color }} />
                <span>{renderMd(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── CtaBand — end-of-page conversion band ─────────────────────────────────── */
export function CtaBand({
  text,
  actions,
}: {
  text: string;
  actions: { href: string; label: string; primary?: boolean }[];
}) {
  return (
    <div className="mt-14 rounded-card border border-hairline-gold bg-gold/[0.04] p-7 text-center">
      <p className="text-ink-secondary mb-5">{text}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {actions.map((a) =>
          a.primary ? (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105 transition-all tap-highlight-none"
            >
              {a.label}
            </Link>
          ) : (
            <Link
              key={a.href}
              href={a.href}
              className="inline-flex items-center justify-center rounded-control px-6 py-2.5 min-h-[44px] text-sm font-semibold text-ink-secondary border border-hairline hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"
            >
              {a.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
