"use client";

/**
 * Button / ButtonLink — the only button styling in the app.
 *
 * variant:
 *   primary   — violet fill, for the page's single main action
 *   gold      — gold fill, reserved for Zodicognac and celebratory actions
 *   secondary — raised surface + hairline
 *   ghost     — hairline only
 *   link      — text-only, no chrome
 */
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "gold" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-control transition-all duration-200 " +
  "tap-highlight-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none " +
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const VARIANTS: Record<Variant, string> = {
  primary:
    "text-accent-ink bg-gradient-to-b from-accent-bright to-accent glow-accent hover:brightness-110",
  gold:
    "text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105",
  secondary:
    "text-ink bg-surface-raised border border-hairline hover:border-hairline-strong",
  ghost:
    "text-ink-secondary border border-hairline hover:text-ink hover:border-hairline-strong",
  link:
    "text-ink-secondary hover:text-accent-bright",
};

const SIZES: Record<Size, string> = {
  sm: "text-[13px] px-4 py-2 min-h-[36px]",
  md: "text-sm px-5 py-2.5 min-h-[44px]",
  lg: "text-[15px] px-7 py-3 min-h-[50px]",
};

type StyleProps = {
  variant?: Variant;
  size?: Size;
};

function classes(variant: Variant, size: Size, className: string) {
  const sizing = variant === "link" ? "" : SIZES[size];
  return `${BASE} ${VARIANTS[variant]} ${sizing} ${className}`;
}

function Spinner() {
  return (
    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  children,
  ...rest
}: StyleProps & { loading?: boolean } & ComponentProps<"button">) {
  return (
    <button
      className={classes(variant, size, className)}
      disabled={loading || disabled}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: StyleProps & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
