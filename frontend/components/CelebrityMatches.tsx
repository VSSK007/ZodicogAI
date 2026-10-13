"use client";

/**
 * CelebrityMatches - "Your 5 most compatible celebrities", ranked from the 360
 * by GET /celebrities/matches (zodiac + numerology only: a celebrity has a
 * public birth date and name, so we never assign them a personality type).
 *
 * Needs a saved profile. Whether it shows is decided before first paint
 * (`.has-profile-only`, see globals.css) and its box has a fixed height, so the
 * list arriving later moves nothing.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph, type GlyphName } from "@/components/ui/glyphs";
import { API } from "@/lib/api";
import { isProfileComplete, useProfile } from "@/lib/profile";
import { SIGN_COLOR, SIGN_LABEL } from "@/lib/celebrities";
import { shareImageUrl } from "@/lib/shareImage";
import { capture } from "@/lib/posthog";

interface Match {
  slug: string;
  name: string;
  sign: string;
  category: string;
  score: number;
  zodiac_score: number;
  numerology_score: number;
  why: string;
}

export default function CelebrityMatches({ className = "" }: { className?: string }) {
  const profile = useProfile();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const ready = !!profile && isProfileComplete(profile);
  const { name, day, month } = profile ?? { name: "", day: 0, month: 0 };

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const q = new URLSearchParams({ name, day: String(day), month: String(month), limit: "5" });
    setFailed(false);
    fetch(`${API}/celebrities/matches?${q}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { matches: Match[] }) => {
        if (cancelled) return;
        setMatches(d.matches);
        capture("celebrity_matches_viewed");
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [ready, name, day, month]);

  async function shareStory() {
    setBusy(true);
    capture("celebrity_matches_story_shared");
    const q = new URLSearchParams({ name, day: String(day), month: String(month) });
    try {
      await shareImageUrl(`/story/celebrities?${q}`, "zodicogai-celebrity-matches.png", "My celebrity matches");
    } catch {
      // Nothing to show the visitor beyond the button settling back.
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Your celebrity matches"
      data-testid="celebrity-matches"
      className={`has-profile-only ${className}`}
    >
      <div className="h-[31rem] md:h-[29rem]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Eyebrow>Celebrity matches</Eyebrow>
            <h2 className="mt-2 font-display font-extrabold tracking-[-0.02em] text-xl text-ink">
              Your five closest celebrities
            </h2>
          </div>
          {matches && (
            <button
              onClick={() => void shareStory()}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-control border border-hairline px-3 py-2 min-h-[44px] text-xs font-semibold text-ink-secondary hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none disabled:opacity-50"
            >
              <ImageIcon className="size-4" aria-hidden="true" /> Story card
            </button>
          )}
        </div>

        {failed && <p role="status" className="mt-4 text-sm text-ink-muted">Couldn&apos;t load your matches right now.</p>}

        <ol className="mt-4 space-y-2">
          {(matches ?? []).map((m, i) => (
            <li
              key={m.slug}
              className="h-20 rounded-card border border-hairline bg-white/[0.03] px-4 py-2.5 flex items-center gap-3"
            >
              <span className="w-5 shrink-0 text-center font-mono text-xs text-ink-faint tabular-nums">{i + 1}</span>
              <span
                className="shrink-0 size-10 rounded-card border border-hairline flex items-center justify-center"
                style={{ color: SIGN_COLOR[m.sign] }}
              >
                <Glyph name={m.sign as GlyphName} size={20} strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-extrabold text-sm tracking-[-0.01em] text-ink truncate">
                  {m.name}
                  <span className="ml-2 text-xs font-medium text-ink-muted">
                    {SIGN_LABEL[m.sign]} · {m.category}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary leading-snug line-clamp-2">{m.why}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display font-extrabold text-xl text-gold-bright tabular-nums leading-none">
                  {Math.round(m.score)}
                </p>
                <Link
                  href={`/celebrities/${m.slug}#match`}
                  className="mt-1 inline-block text-micro font-semibold text-accent-bright hover:text-gold-bright"
                >
                  Full match →
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
