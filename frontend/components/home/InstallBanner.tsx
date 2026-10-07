"use client";

/**
 * InstallBanner - a slim "Install ZodicogAI" strip at the very top of the
 * homepage, phones and tablets only (the desktop nav layout starts at lg).
 * Dismissible; the dismissal is remembered for 30 days. Hidden once the app is
 * installed or already running installed.
 */
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { requestInstall, useInstall } from "@/lib/install";

const KEY = "zodicog.install.dismissed";
const QUIET_DAYS = 30;

function recentlyDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(KEY));
    return !!at && Date.now() - at < QUIET_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

export default function InstallBanner() {
  const { status } = useInstall();
  const [dismissed, setDismissed] = useState(true); // hidden until we've read storage

  useEffect(() => {
    setDismissed(recentlyDismissed());
  }, []);

  if (status === "loading" || status === "installed" || dismissed) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* the banner just comes back next visit */
    }
    setDismissed(true);
  }

  return (
    <div
      data-testid="install-banner"
      className="lg:hidden flex items-center gap-3 border-b border-hairline-gold bg-gold/[0.07] px-4 py-2.5"
    >
      <Download className="size-4 shrink-0 text-gold-bright" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm text-ink-secondary leading-snug">
        Get ZodicogAI on your <span className="text-ink font-semibold">home screen</span>
      </p>
      <button
        onClick={() => void requestInstall()}
        className="shrink-0 rounded-control px-3.5 py-1.5 text-xs font-semibold text-gold-ink bg-gradient-to-b from-gold-bright to-gold hover:brightness-105 transition-all tap-highlight-none"
      >
        Install
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 size-7 rounded-full flex items-center justify-center text-ink-muted hover:text-ink transition-colors tap-highlight-none"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
