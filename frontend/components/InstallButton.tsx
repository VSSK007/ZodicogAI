"use client";

/**
 * InstallButton - "Install app". Renders nothing until the client has mounted
 * and nothing once the app is installed or already running installed.
 *
 *   variant="link"  footer-style text link
 *   variant="tile"  grid tile (mobile menu)
 *   variant="card"  panel with an explanation (profile page)
 */
import { Download } from "lucide-react";
import { requestInstall, useInstall } from "@/lib/install";

export default function InstallButton({
  variant = "link",
  onActivate,
  className = "",
}: {
  variant?: "link" | "tile" | "card";
  /** Called when the button is pressed (e.g. to close a menu first). */
  onActivate?: () => void;
  className?: string;
}) {
  const { status } = useInstall();
  if (status === "loading" || status === "installed") return null;

  const press = () => {
    onActivate?.();
    void requestInstall();
  };

  if (variant === "card") {
    return (
      <div className={`rounded-card border border-hairline-gold bg-gold/[0.04] p-5 ${className}`} data-testid="install-card">
        <p className="flex items-center gap-2 font-display font-extrabold text-base tracking-[-0.01em] text-ink">
          <Download className="size-4 text-gold-bright" aria-hidden="true" /> Use ZodicogAI like an app
        </p>
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          Install it for a home-screen icon, full-screen mode and instant launches.
        </p>
        <button
          onClick={press}
          className="mt-3 inline-flex items-center gap-1.5 rounded-control px-4 py-2 text-sm font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold glow-gold hover:brightness-105 transition-all tap-highlight-none"
        >
          <Download className="size-4" aria-hidden="true" /> Install app
        </button>
      </div>
    );
  }

  if (variant === "tile") {
    return (
      <button
        onClick={press}
        className={`rounded-card bg-gold/[0.08] border border-hairline-gold p-3 text-center text-xs font-semibold text-gold-bright hover:bg-gold/[0.14] transition-all tap-highlight-none ${className}`}
      >
        Install app
      </button>
    );
  }

  return (
    <button
      onClick={press}
      className={`inline-flex items-center gap-1.5 text-sm text-gold-bright hover:text-gold transition-colors ${className}`}
    >
      <Download className="size-3.5" aria-hidden="true" /> Install app
    </button>
  );
}
