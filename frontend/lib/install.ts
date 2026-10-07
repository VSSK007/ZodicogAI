"use client";

/**
 * "Install app" support.
 *
 * Chrome/Edge/Android fire `beforeinstallprompt` once, early, when the site
 * becomes installable; if nobody is listening it is lost. So the listener is
 * registered at the app root (InstallProvider) and the event is kept here until
 * a button asks for it. Browsers that never fire it (iOS Safari, Firefox, a
 * private window...) get step-by-step instructions instead - there is always
 * an option unless the app is already installed.
 */
import { useSyncExternalStore } from "react";
import { capture } from "@/lib/posthog";

type Outcome = "accepted" | "dismissed";
interface DeferredPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: Outcome }>;
}

export type Platform =
  | "ios-safari"
  | "ios-other"
  | "android"
  | "desktop-chromium"
  | "mac-safari"
  | "firefox-desktop"
  | "other";

export interface InstallState {
  /** "loading" until the first client render, so server and client markup match. */
  status: "loading" | "installed" | "prompt" | "manual";
  platform: Platform;
  dialogOpen: boolean;
}

let deferred: DeferredPrompt | null = null;
let started = false;
const listeners = new Set<() => void>();

const SERVER: InstallState = { status: "loading", platform: "other", dialogOpen: false };
let snapshot: InstallState = SERVER;

function set(patch: Partial<InstallState>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

export function detectPlatform(ua: string = navigator.userAgent, maxTouchPoints = navigator.maxTouchPoints): Platform {
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  if (iOS) return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? "ios-other" : "ios-safari";
  if (/Android/.test(ua)) return "android";
  if (/Firefox\//.test(ua)) return "firefox-desktop";
  if (/Chrome\/|Edg\/|OPR\//.test(ua)) return "desktop-chromium";
  if (/Safari\//.test(ua)) return "mac-safari";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Start listening (idempotent). Called once from InstallProvider. */
export function startInstallTracking() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we show our own button instead of Chrome's mini-infobar
    deferred = e as DeferredPrompt;
    if (snapshot.status !== "installed") set({ status: "prompt" });
    capture("pwa_install_available");
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    set({ status: "installed", dialogOpen: false });
    capture("pwa_installed");
  });

  const mq = window.matchMedia?.("(display-mode: standalone)");
  mq?.addEventListener?.("change", () => {
    if (isStandalone()) set({ status: "installed" });
  });

  set({ status: isStandalone() ? "installed" : deferred ? "prompt" : "manual", platform: detectPlatform() });
}

export function openInstallDialog() {
  set({ dialogOpen: true });
}
export function closeInstallDialog() {
  set({ dialogOpen: false });
}

/**
 * The visitor asked to install. Uses the browser's real prompt when it
 * offered one; otherwise opens the instructions dialog.
 */
export async function requestInstall(): Promise<"accepted" | "dismissed" | "instructions"> {
  if (deferred) {
    const prompt = deferred;
    deferred = null; // a prompt can only be used once
    capture("pwa_install_prompted");
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    capture("pwa_install_choice", { outcome });
    // Declined: keep offering instructions; accepted: appinstalled flips us to "installed".
    if (outcome === "dismissed") set({ status: "manual" });
    return outcome;
  }
  capture("pwa_install_instructions");
  openInstallDialog();
  return "instructions";
}

export function useInstall(): InstallState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => SERVER,
  );
}
