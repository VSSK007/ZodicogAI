"use client";

/**
 * ResultActions — the action row above every finished reading:
 * copy a permanent share link, and take the reading to Zodicognac.
 *
 * On mount it saves the result once (POST /results) which also records it
 * in the localStorage reading history.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Link as LinkIcon } from "lucide-react";
import ZodicognacMark from "@/components/ZodicognacMark";
import { saveReading } from "@/lib/history";
import { trackAnalysisCompleted, trackShareLinkCopied } from "@/lib/analytics";
import Sigil from "@/components/Sigil";
import { setCurrentSigilSeed } from "@/lib/sigil";

export default function ResultActions({
  analysisType,
  title,
  payload,
  onSaved,
  showSigil = true,
}: {
  analysisType: string;
  title: string;
  payload: unknown;
  /** Called once the reading is saved, with its permalink id (null if saving failed). */
  onSaved?: (id: string | null) => void;
  /** Hide the inline sigil when the page already shows a larger one. */
  showSigil?: boolean;
}) {
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    setCurrentSigilSeed(title);
  }, [title]);

  useEffect(() => {
    if (saved.current || !payload) return;
    saved.current = true;
    trackAnalysisCompleted(analysisType);
    saveReading(analysisType, title, payload).then((id) => {
      setShareId(id);
      onSaved?.(id);
    });
  }, [analysisType, title, payload]);

  async function copy() {
    if (!shareId) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${shareId}`);
      setCopied(true);
      trackShareLinkCopied(analysisType);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — leave the button as-is.
    }
  }

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors tap-highlight-none";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showSigil && <Sigil seed={title} size={56} className="shrink-0 mr-1" />}
      {shareId && (
        <button
          onClick={copy}
          className={`${chip} border-hairline text-ink-secondary hover:text-ink hover:border-hairline-strong`}
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <LinkIcon className="size-3.5" />}
          {copied ? "Link copied" : "Copy link"}
        </button>
      )}
      <Link
        href={`/chat?ask=${encodeURIComponent(`I just got my ${title} reading — can you go deeper on it?`)}`}
        className={`${chip} border-gold/25 text-gold/90 hover:text-gold-bright hover:border-hairline-gold`}
      >
        <ZodicognacMark size={12} active />
        Ask Zodicognac about this
      </Link>
    </div>
  );
}
