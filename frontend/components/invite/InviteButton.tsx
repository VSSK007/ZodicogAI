"use client";

/**
 * InviteButton - "Invite your partner". Creates a one-time link; the partner
 * adds their own details and both get the full synastry report.
 *
 *   variant="card"    explanatory panel (profile page, end of a report)
 *   variant="button"  compact button
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createInvite, getInvite, myInviteTokens, type InviteInfo } from "@/lib/invites";
import { isProfileComplete, useProfile } from "@/lib/profile";
import { capture } from "@/lib/posthog";
import { haptic } from "@/lib/haptics";
import { MBTI_TYPES } from "@/lib/api";

function InviteSheet({ onClose }: { onClose: () => void }) {
  const profile = useProfile();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [past, setPast] = useState<{ token: string; info: InviteInfo }[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Earlier invites from this browser: who is still pending, whose report is ready.
  useEffect(() => {
    let cancelled = false;
    const tokens = myInviteTokens().slice(0, 5);
    Promise.all(tokens.map((t) => getInvite(t).then((info) => (info ? { token: t, info } : null)).catch(() => null)))
      .then((rows) => !cancelled && setPast(rows.filter((r): r is { token: string; info: InviteInfo } => !!r)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function create() {
    if (!profile) return;
    haptic();
    setBusy(true);
    setError("");
    try {
      const made = await createInvite(profile);
      setUrl(made.url.replace(/^https?:\/\/[^/]+/, window.location.origin)); // always this site's origin
      capture("invite_created");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create the link.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy - select the link and copy it manually.");
    }
  }

  async function share() {
    capture("invite_shared");
    try {
      await navigator.share({
        title: "Check our compatibility",
        text: `${profile?.name ?? "I"} wants to check your compatibility on ZodicogAI.`,
        url,
      });
    } catch {
      // Share sheet dismissed.
    }
  }

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-card border border-hairline-strong bg-surface-overlay p-6 shadow-panel"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 size-9 rounded-full flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <Heart className="size-6 text-gold-bright" aria-hidden="true" />
        <h2 id="invite-title" className="mt-3 font-display font-extrabold text-xl tracking-[-0.02em] text-ink pr-8">
          Invite your partner
        </h2>
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          Send this link. They add their own birthday and type - nothing about you beyond your first name and sign is shown -
          and you both get the full report.
        </p>

        {!url ? (
          <Button onClick={() => void create()} loading={busy} size="lg" className="mt-5 w-full">
            Create my invite link
          </Button>
        ) : (
          <div className="mt-5 space-y-3">
            <input
              readOnly
              value={url}
              aria-label="Invite link"
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg bg-white/[0.04] border border-hairline-strong px-3 py-3 text-sm text-ink font-mono min-h-[44px]"
            />
            <div className="flex gap-2">
              <Button onClick={() => void copy()} variant="secondary" className="flex-1">
                {copied ? <><Check className="size-4" aria-hidden="true" /> Copied</> : <><Copy className="size-4" aria-hidden="true" /> Copy link</>}
              </Button>
              {canShare && (
                <Button onClick={() => void share()} className="flex-1">
                  <Send className="size-4" aria-hidden="true" /> Share
                </Button>
              )}
            </div>
            <p className="text-xs text-ink-muted">The link works for 14 days.</p>
          </div>
        )}

        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

        {past.length > 0 && (
          <div className="mt-6 border-t border-hairline pt-4">
            <p className="text-micro font-display font-extrabold uppercase tracking-[0.22em] text-ink-muted">Your invites</p>
            <ul className="mt-2 space-y-2">
              {past.map(({ token, info }) => (
                <li key={token} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-secondary truncate">
                    {info.status === "accepted"
                      ? "Ready"
                      : info.status === "expired"
                        ? "Expired"
                        : "Waiting for your partner"}
                  </span>
                  {info.status === "accepted" && info.result_id ? (
                    <Link href={`/r/${info.result_id}`} onClick={onClose} className="font-semibold text-accent-bright hover:text-gold-bright shrink-0">
                      View report →
                    </Link>
                  ) : (
                    <Link href={`/i/${token}`} onClick={onClose} className="text-ink-muted hover:text-ink-secondary shrink-0">
                      Open
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function InviteButton({
  variant = "card",
  className = "",
}: {
  variant?: "card" | "button";
  className?: string;
}) {
  const profile = useProfile();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const close = useCallback(() => setOpen(false), []);

  // An invite needs the inviter's MBTI (the report is a pair analysis).
  const ready = !!profile && isProfileComplete(profile) && MBTI_TYPES.includes(profile.mbti.toUpperCase());
  const setupHref = `/welcome?next=${encodeURIComponent(pathname)}`;

  if (!mounted) return null; // depends on the saved profile (client only): render nothing until then

  const trigger = ready ? (
    <Button
      onClick={() => { setOpen(true); capture("invite_opened"); }}
      variant={variant === "card" ? "gold" : "secondary"}
      size={variant === "card" ? "md" : "sm"}
      data-testid="invite-open"
    >
      <Heart className="size-4" aria-hidden="true" /> Invite your partner
    </Button>
  ) : (
    <Link
      href={setupHref}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-bright hover:text-gold-bright transition-colors"
    >
      Set up your profile to invite your partner →
    </Link>
  );

  return (
    <>
      {variant === "card" ? (
        <Card variant="gold" className={`p-5 ${className}`} data-testid="invite-card" data-print-hide>
          <p className="flex items-center gap-2 font-display font-extrabold text-base tracking-[-0.01em] text-ink">
            <Heart className="size-4 text-gold-bright" aria-hidden="true" /> Check it together
          </p>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
            Send your partner a link. They add their own details and you both get the full report.
          </p>
          <div className="mt-3">{trigger}</div>
        </Card>
      ) : (
        <span className={className} data-print-hide>{trigger}</span>
      )}
      <AnimatePresence>{open && <InviteSheet onClose={close} />}</AnimatePresence>
    </>
  );
}
