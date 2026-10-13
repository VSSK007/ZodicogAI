"use client";

/**
 * StoryMode - the synastry report as full-screen cards you swipe through
 * (phones/tablets). One idea per card: score reveal, verdict, each of the
 * eight frameworks, strengths, watch-outs, the AI reading, a share card and an
 * invite. Swipe, tap the edges, use the arrow keys or the Back/Next buttons;
 * Escape or the X closes it. Reduced motion swaps the slide for a crossfade.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Link as LinkIcon, Send, X } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";
import InviteButton from "@/components/invite/InviteButton";
import { Button } from "@/components/ui/Button";
import { SignGlyph } from "@/components/ui/glyphs";
import { DIM_COLORS, STABILITY, dimensions, verdictFor } from "@/components/report/data";
import type { FullResult, ReportPersonas } from "@/components/report/types";
import { renderMd } from "@/lib/renderMd";
import { shareImageUrl } from "@/lib/shareImage";
import { haptic } from "@/lib/haptics";
import { capture } from "@/lib/posthog";

const SWIPE_PX = 60;

/** What each engine measures, in one line (the numbers come from the engines, not from here). */
const BLURB: Record<string, string> = {
  Emotional: "How well your emotional expression, intensity and steadiness fit together.",
  Romantic: "Attachment pacing, affection style and romantic polarity.",
  Behavioral: "How closely your five behavioural trait vectors point the same way.",
  Intimacy: "Physical chemistry: intensity, pacing and who leads.",
  "Love Style": "Whether the way you each love is the way the other wants to be loved.",
  "Love Language": "How you each give and receive care, and how well those meet.",
  Numerology: "Life-path and expression numbers, compared pairwise.",
  Zodiac: "Element, modality and sign-pair dynamics.",
};

const READING_LABELS: Record<string, string> = {
  relationship_dynamic: "Relationship dynamic",
  communication_pattern: "Communication",
  conflict_risk: "Conflict",
  long_term_viability: "Long-term",
};

type CardSpec = { key: string; label: string; body: ReactNode };

function Big({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display font-extrabold tracking-[-0.03em] leading-[1.08] text-3xl text-ink text-balance">
      {children}
    </h2>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <p className="text-micro font-display font-extrabold uppercase tracking-[0.24em] text-gold mb-4">{children}</p>;
}

export default function StoryMode({
  result,
  personas,
  shareId,
  onClose,
}: {
  result: FullResult;
  personas: ReportPersonas;
  shareId: string | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  // Finger-follow offset while swiping. The decision is made from raw pointer
  // down/up deltas (not framer's drag or pan, which are frame-batched and fight
  // the enter animation), so a swipe is read correctly even mid-transition.
  const panX = useMotionValue(0);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const ri = result.relationship_intelligence;
  const nc = result.numerology_compat;
  const stab = STABILITY[ri.stability_prediction] ?? STABILITY.moderate;
  const [copied, setCopied] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "busy" | "error">("idle");

  const cards = useMemo<CardSpec[]>(() => {
    const out: CardSpec[] = [];

    out.push({
      key: "score",
      label: "Overall",
      body: (
        <div className="flex flex-col items-center text-center">
          <Tag>Your compatibility</Tag>
          <Big>
            {personas.a.name} <span className="text-gold-bright">×</span> {personas.b.name}
          </Big>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {[personas.a, personas.b].map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-xs text-ink-secondary">
                {p.sign && <SignGlyph sign={p.sign} size={13} className="text-gold-bright" />}
                {p.sign || p.name}
                {p.mbti && <span className="font-mono text-ink-muted">· {p.mbti}</span>}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <ScoreRing score={ri.overall_score} size={220} strokeWidth={13} color="var(--color-accent-bright)" />
          </div>
          <p className="mt-6 font-display font-extrabold text-2xl tracking-[-0.02em] text-ink">{verdictFor(ri.overall_score)}.</p>
        </div>
      ),
    });

    out.push({
      key: "verdict",
      label: "Verdict",
      body: (
        <div>
          <Tag>The verdict</Tag>
          <Big>Predicted stability: <span style={{ color: stab.color }}>{stab.label.toLowerCase()}</span></Big>
          <dl className="mt-8 space-y-5">
            <div>
              <dt className="text-xs text-ink-muted uppercase tracking-wider">Conflict risk</dt>
              <dd className="font-display font-extrabold text-4xl text-ink tabular-nums">{ri.conflict_probability.toFixed(0)}%</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted uppercase tracking-wider">Elements</dt>
              <dd className="text-lg text-ink">{result.element_compatibility}</dd>
              <dd className="text-sm text-ink-muted">{result.modality_interaction}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted uppercase tracking-wider">Numerology</dt>
              <dd className="text-lg text-ink capitalize">{nc.pursue_signal}</dd>
            </div>
          </dl>
        </div>
      ),
    });

    for (const d of dimensions(result)) {
      out.push({
        key: `dim-${d.name}`,
        label: d.name,
        body: (
          <div>
            <Tag>{d.name}</Tag>
            <p className="font-display font-extrabold text-8xl tracking-[-0.04em] tabular-nums" style={{ color: DIM_COLORS[d.name] }}>
              {d.score.toFixed(0)}
            </p>
            <div className="mt-5 h-2.5 rounded-full bg-white/[0.07] overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, d.score))}%`, backgroundColor: DIM_COLORS[d.name] }} />
            </div>
            <p className="mt-6 text-lg text-ink-secondary leading-relaxed">{BLURB[d.name]}</p>
          </div>
        ),
      });
    }

    out.push({
      key: "strengths",
      label: "Strengths",
      body: (
        <div>
          <Tag>What it has going for it</Tag>
          <Big>Strengths</Big>
          <ol className="mt-6 space-y-4">
            {ri.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-base text-ink-secondary leading-relaxed">
                <span className="font-mono font-bold text-success shrink-0">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
    });

    out.push({
      key: "risks",
      label: "Watch-outs",
      body: (
        <div>
          <Tag>What to watch</Tag>
          <Big>Watch-outs</Big>
          <ol className="mt-6 space-y-4">
            {ri.risks.map((s, i) => (
              <li key={i} className="flex gap-3 text-base text-ink-secondary leading-relaxed">
                <span className="font-mono font-bold text-danger shrink-0">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
    });

    for (const key of Object.keys(READING_LABELS) as (keyof typeof READING_LABELS)[]) {
      const text = result.analysis[key as keyof FullResult["analysis"]];
      if (!text || text === "—") continue;
      out.push({
        key: `reading-${key}`,
        label: READING_LABELS[key],
        body: (
          <div>
            <Tag>The reading</Tag>
            <Big>{READING_LABELS[key]}</Big>
            <p className="mt-6 text-lg text-ink-secondary leading-[1.7]">{renderMd(text)}</p>
          </div>
        ),
      });
    }

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, personas]);

  // Share + invite are the last two cards.
  const total = cards.length + 2;
  const [[index, direction], setPos] = useState<[number, number]>([0, 0]);

  const go = useCallback(
    (delta: number) => {
      setPos(([i]) => {
        const next = Math.min(total - 1, Math.max(0, i + delta));
        if (next !== i) haptic(8);
        return [next, next === i ? 0 : delta];
      });
    },
    [total],
  );

  // Escape closes, arrows move, the page behind doesn't scroll.
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    capture("report_story_mode_opened");
    return () => {
      html.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, go]);

  function onPointerDown(e: ReactPointerEvent) {
    if ((e.target as HTMLElement).closest("button, a, input, [data-no-swipe]")) return; // let controls work
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    // Keep receiving move/up even if the finger ends over the edge tap zones (siblings of the card).
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Not capturable (synthetic event): the card still gets events that start and end on it.
    }
  }

  function onPointerMove(e: ReactPointerEvent) {
    const s0 = swipe.current;
    if (!s0 || s0.id !== e.pointerId || reduced) return;
    const dx = e.clientX - s0.x;
    if (Math.abs(dx) > Math.abs(e.clientY - s0.y)) panX.set(dx * 0.35);
  }

  function endSwipe(e: ReactPointerEvent, cancelled = false) {
    const s0 = swipe.current;
    if (!s0 || s0.id !== e.pointerId) return;
    swipe.current = null;
    panX.set(0);
    if (cancelled) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    if (Math.abs(dx) < Math.abs(dy)) return; // a vertical scroll, not a swipe
    if (dx <= -SWIPE_PX) go(1);
    else if (dx >= SWIPE_PX) go(-1);
  }

  async function copyLink() {
    if (!shareId) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${shareId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is also on the address bar of the report page.
    }
  }

  async function shareStory() {
    if (!shareId) return;
    haptic();
    setShareState("busy");
    try {
      await shareImageUrl(`/r/${shareId}/story-image`, "zodicogai-story.png");
      setShareState("idle");
    } catch {
      setShareState("error");
    }
  }

  const isShare = index === cards.length;
  const isInvite = index === cards.length + 1;
  const label = isShare ? "Share" : isInvite ? "Invite" : cards[index].label;

  // Enter-only transition: with an exit phase (AnimatePresence mode="wait") a burst of
  // quick taps can leave the incoming card unmounted. Reduced motion crossfades.
  const enter = reduced
    ? { opacity: 0 }
    : { opacity: 0, x: direction >= 0 ? 40 : -40 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story mode"
      data-testid="story-mode"
      className="fixed inset-0 z-[80] flex flex-col bg-surface"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Progress + close */}
      <div className="px-4 pt-3 flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Story progress"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          aria-valuetext={`Card ${index + 1} of ${total}: ${label}`}
          className="flex flex-1 gap-1"
        >
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= index ? "bg-gold" : "bg-white/[0.12]"}`} />
          ))}
        </div>
        <button
          onClick={onClose}
          aria-label="Close story mode"
          className="size-10 -mr-2 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink tap-highlight-none"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <p className="px-4 mt-2 text-xs text-ink-muted tabular-nums" aria-hidden="true">
        {index + 1} / {total} · {label}
      </p>

      {/* Card */}
      <div className="relative flex-1 min-h-0">
        {/* Edge tap zones */}
        <button
          aria-label="Previous card"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="absolute inset-y-0 left-0 w-[18%] z-10 tap-highlight-none disabled:pointer-events-none"
        />
        <button
          aria-label="Next card"
          onClick={() => go(1)}
          disabled={index === total - 1}
          className="absolute inset-y-0 right-0 w-[18%] z-10 tap-highlight-none disabled:pointer-events-none"
        />

          <motion.div
            key={index}
            initial={index === 0 && direction === 0 ? false : enter}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.22 }}
            style={{ x: panX, touchAction: "pan-y" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endSwipe(e)}
            onPointerCancel={(e) => endSwipe(e, true)}
            data-testid="story-card"
            className="absolute inset-0 overflow-y-auto overscroll-contain px-7 py-8 flex"
          >
            <div className="m-auto w-full max-w-md">
              {index < cards.length && cards[index].body}

              {isShare && (
                <div>
                  <Tag>Take it with you</Tag>
                  <Big>Share your result</Big>
                  <p className="mt-4 text-ink-secondary leading-relaxed">
                    A 9:16 card for your story, or the link to the full report.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 relative z-20">
                    <Button onClick={() => void shareStory()} loading={shareState === "busy"} disabled={!shareId} size="lg">
                      <Send className="size-4" aria-hidden="true" /> Share story card
                    </Button>
                    <Button onClick={() => void copyLink()} variant="secondary" disabled={!shareId}>
                      {copied ? <><Check className="size-4" aria-hidden="true" /> Copied</> : <><LinkIcon className="size-4" aria-hidden="true" /> Copy link</>}
                    </Button>
                    {!shareId && <p className="text-xs text-ink-muted">Saving your link…</p>}
                    {shareState === "error" && <p role="alert" className="text-sm text-danger">Couldn&apos;t make the card. Try again.</p>}
                  </div>
                </div>
              )}

              {isInvite && (
                <div className="relative z-20">
                  <Tag>Not just you two</Tag>
                  <Big>Check it with someone else</Big>
                  <p className="mt-4 text-ink-secondary leading-relaxed">
                    Invite a partner, a crush or a friend. They add their own details; you both see the report.
                  </p>
                  <InviteButton className="block mt-6" />
                </div>
              )}
            </div>
          </motion.div>

      </div>

      {/* Back / Next */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => go(-1)} disabled={index === 0}>
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Button>
        {index === total - 1 ? (
          <Button size="sm" onClick={onClose}>Done</Button>
        ) : (
          <Button size="sm" onClick={() => go(1)}>
            Next <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
