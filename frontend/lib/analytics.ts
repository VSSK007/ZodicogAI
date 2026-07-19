"use client";

/**
 * GA4 event helpers for the funnels that actually matter: did a reading
 * finish, did anyone share it, did they follow through to Zodicognac.
 * Safe no-op if analytics hasn't loaded (ad blockers, SSR) or before consent.
 */
import { sendGAEvent } from "@next/third-parties/google";

function track(name: string, params: Record<string, unknown> = {}) {
  try {
    sendGAEvent("event", name, params);
  } catch {
    // Analytics is an enhancement, never a blocker.
  }
}

/** Fired once per finished analysis, right after it's saved/shareable. */
export function trackAnalysisCompleted(analysisType: string) {
  track("analysis_completed", { analysis_type: analysisType });
}

/** Fired when a visitor copies a /r/[id] share link. */
export function trackShareLinkCopied(analysisType: string) {
  track("share_link_copied", { analysis_type: analysisType });
}

/** Fired whenever the Zodicognac chat surface is actually opened. */
export function trackZodicognacOpened(source: string) {
  track("zodicognac_opened", { source });
}
