"use client";

/**
 * TodayStrip - for returning visitors the homepage opens with their own day:
 * greeting, today's one-line horoscope, streak, quick actions and the last
 * three readings. Visitors without a profile see only the marketing page.
 *
 * Layout-shift safety: whether the strip shows is decided before first paint
 * (html[data-has-profile], set by the inline script in app/layout.tsx), and
 * its box has a fixed height, so the content arriving after hydration moves
 * nothing. The default "recent readings" row is hidden by the same attribute
 * because the strip carries the readings itself.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SignGlyph } from "@/components/ui/glyphs";
import { fetchDaily, type DailyResult } from "@/components/today/DailyCard";
import { getSign } from "@/lib/zodiac";
import { getHistory, type ReadingEntry } from "@/lib/history";
import { currentStreak } from "@/lib/streak";
import { isProfileComplete, useProfile } from "@/lib/profile";

function greeting(hour = new Date().getHours()) {
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default function TodayStrip() {
  const profile = useProfile();
  const [daily, setDaily] = useState<DailyResult | null>(null);
  const [readings, setReadings] = useState<ReadingEntry[]>([]);
  const [streak, setStreak] = useState(0);

  const ready = !!profile && isProfileComplete(profile);
  const { name, day, month, mbti } = profile ?? { name: "", day: 0, month: 0, mbti: "" };

  useEffect(() => {
    setReadings(getHistory().slice(0, 3));
    setStreak(currentStreak());
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetchDaily({ name, day, month, mbti, gender: "M" })
      .then((d) => !cancelled && setDaily(d))
      .catch(() => {}); // the strip still works without the one-liner
    return () => {
      cancelled = true;
    };
  }, [ready, name, day, month, mbti]);

  const sign = ready ? getSign(day, month) : "";

  return (
    <section
      aria-label="Your day"
      data-testid="today-strip"
      className="today-strip max-w-6xl mx-auto px-6 pt-5"
    >
      <div className="h-[11.75rem] md:h-[10.25rem] overflow-hidden rounded-card border border-hairline-gold bg-gold/[0.04] p-4 md:p-5 flex flex-col justify-between">
        {ready && (
          <>
            <div className="flex items-center gap-3">
              <span className="shrink-0 size-10 rounded-card border border-hairline-gold bg-gold/10 flex items-center justify-center text-gold-bright">
                <SignGlyph sign={sign} size={20} strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-extrabold text-base md:text-lg tracking-[-0.01em] text-ink truncate">
                  {greeting()}, {name}
                </p>
                <p className="text-xs text-ink-muted truncate">
                  {sign}{mbti ? ` · ${mbti}` : ""}
                </p>
              </div>
              {streak > 1 && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-hairline-gold px-2.5 py-1 text-xs font-semibold text-gold-bright">
                  <Flame className="size-3.5" aria-hidden="true" /> {streak}
                </span>
              )}
            </div>

            <p className="text-sm text-ink-secondary leading-snug line-clamp-2 min-h-[2.5rem]">
              {daily ? daily.horoscope.replace(/\*+/g, "") : " "}
            </p>

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <ButtonLink href="/today" size="sm" variant="gold">Open today</ButtonLink>
                <ButtonLink href="/analyze/hybrid" size="sm" variant="ghost">New reading</ButtonLink>
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden" aria-label="Recent readings">
                {readings.map((e) => (
                  <Link
                    key={e.id}
                    href={`/r/${e.id}`}
                    className="shrink-0 max-w-[11rem] truncate rounded-full border border-hairline bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-secondary hover:text-ink hover:border-hairline-accent transition-colors tap-highlight-none"
                  >
                    {e.title}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
