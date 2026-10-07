"use client";

/**
 * Mounted once at the root: starts listening for the browser's install prompt
 * (it fires early and only once) and renders the shared instructions dialog.
 */
import { useEffect, useRef } from "react";
import { Download, EllipsisVertical, MonitorSmartphone, Share, SquarePlus, X } from "lucide-react";
import { closeInstallDialog, startInstallTracking, useInstall, type Platform } from "@/lib/install";

const STEPS: Record<Platform, { title: string; steps: React.ReactNode[]; note?: string }> = {
  "ios-safari": {
    title: "Add ZodicogAI to your Home Screen",
    steps: [
      <>Tap the <Share className="inline size-4 -mt-0.5 text-accent-bright" aria-label="Share" /> <strong>Share</strong> button in Safari&apos;s toolbar.</>,
      <>Scroll down and tap <SquarePlus className="inline size-4 -mt-0.5 text-accent-bright" aria-hidden="true" /> <strong>Add to Home Screen</strong>.</>,
      <>Tap <strong>Add</strong>. The ZodicogAI icon appears on your Home Screen.</>,
    ],
  },
  "ios-other": {
    title: "Open in Safari to install",
    steps: [
      <>On iPhone and iPad, apps can only be added from <strong>Safari</strong>. Open <strong>zodicogai.com</strong> there.</>,
      <>Tap <Share className="inline size-4 -mt-0.5 text-accent-bright" aria-label="Share" /> <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</>,
    ],
  },
  android: {
    title: "Install ZodicogAI",
    steps: [
      <>Tap the <EllipsisVertical className="inline size-4 -mt-0.5 text-accent-bright" aria-label="Menu" /> <strong>menu</strong> at the top right of your browser.</>,
      <>Choose <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</>,
    ],
    note: "Don't see it? Reload the page once and wait a few seconds - the browser offers it after the site has loaded.",
  },
  "desktop-chromium": {
    title: "Install ZodicogAI",
    steps: [
      <>Look for the <Download className="inline size-4 -mt-0.5 text-accent-bright" aria-label="Install" /> <strong>install icon</strong> at the right end of the address bar and click it.</>,
      <>Or open the <EllipsisVertical className="inline size-4 -mt-0.5 text-accent-bright" aria-label="Menu" /> <strong>menu</strong> and choose <strong>Install ZodicogAI</strong>.</>,
    ],
    note: "Don't see it? Reload once and wait a few seconds. It isn't offered in private/incognito windows.",
  },
  "mac-safari": {
    title: "Add ZodicogAI to your Dock",
    steps: [<>In Safari&apos;s menu bar choose <strong>File → Add to Dock</strong>.</>],
  },
  "firefox-desktop": {
    title: "Firefox can't install web apps",
    steps: [
      <>Firefox on desktop doesn&apos;t support installing sites as apps. Open ZodicogAI in <strong>Chrome</strong> or <strong>Edge</strong> to install it, or bookmark this page.</>,
    ],
  },
  other: {
    title: "Install ZodicogAI",
    steps: [
      <>Open your browser&apos;s menu and look for <strong>Install app</strong>, <strong>Add to Home screen</strong> or <strong>Add to Dock</strong>.</>,
    ],
    note: "Installing isn't available in private/incognito windows.",
  },
};

export default function InstallProvider() {
  const { dialogOpen, platform } = useInstall();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startInstallTracking();
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeInstallDialog();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

  if (!dialogOpen) return null;
  const content = STEPS[platform];

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeInstallDialog} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="relative w-full max-w-md rounded-card border border-hairline-strong bg-surface-overlay p-6 shadow-panel"
      >
        <button
          ref={closeRef}
          onClick={closeInstallDialog}
          aria-label="Close"
          className="absolute right-3 top-3 size-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <MonitorSmartphone className="size-6 text-gold-bright" aria-hidden="true" />
        <h2 id="install-title" className="mt-3 font-display font-extrabold text-xl tracking-[-0.02em] text-ink pr-8">
          {content.title}
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-secondary leading-relaxed">
          {content.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 size-6 rounded-full border border-hairline-gold bg-gold/10 text-gold-bright text-xs font-bold flex items-center justify-center tabular-nums">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {content.note && <p className="mt-4 text-xs text-ink-muted leading-relaxed">{content.note}</p>}
        <p className="mt-4 text-xs text-ink-muted leading-relaxed">
          Once installed, ZodicogAI opens full-screen with its own icon and keeps your saved profile and readings.
        </p>
      </div>
    </div>
  );
}
