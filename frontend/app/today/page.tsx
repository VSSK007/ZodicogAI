"use client";

/**
 * /today - the personal daily card. With a saved profile it is the reason to
 * open the app every day; without one it pitches the 3-step setup.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DailyCard, { DailySkeleton } from "@/components/today/DailyCard";
import PullToRefresh from "@/components/PullToRefresh";
import CelebrityMatches from "@/components/CelebrityMatches";
import LazyZodiacWheel from "@/components/LazyZodiacWheel";
import DailyNudge from "@/components/DailyNudge";
import { getSign } from "@/lib/zodiac";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isProfileComplete, useProfile } from "@/lib/profile";

export default function TodayPage() {
  const profile = useProfile();
  const [reloadKey, setReloadKey] = useState(0);
  // The profile lives in localStorage: wait for the client before choosing between
  // the card and the setup pitch, so a returning visitor never sees the pitch flash.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pull-to-refresh (installed app): ask the card to re-fetch, and let it settle.
  const refresh = useCallback(async () => {
    setReloadKey((k) => k + 1);
    await new Promise((r) => setTimeout(r, 600));
  }, []);

  const ready = !!profile && isProfileComplete(profile);

  return (
    <PullToRefresh onRefresh={refresh}>
      <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-xl mx-auto">
        <header className="mb-6">
          <Eyebrow>Today</Eyebrow>
          <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.08] text-ink text-balance">
            Your day
          </h1>
        </header>

        {!mounted ? (
          <DailySkeleton />
        ) : ready && profile ? (
          <DailyCard profile={profile} reloadKey={reloadKey} />
        ) : (
          <NoProfile />
        )}

        <DailyNudge className="mt-6" />

        {mounted && ready && profile && (
          <section aria-label="Your sign on the wheel" className="mt-10">
            <LazyZodiacWheel signs={[getSign(profile.day, profile.month)]} />
          </section>
        )}

        <CelebrityMatches className="mt-10" />

        <p className="mt-8 text-sm text-ink-muted">
          Want the whole sky?{" "}
          <Link href="/horoscope" className="font-semibold text-accent-bright hover:text-gold-bright">
            See every sign&apos;s horoscope →
          </Link>
        </p>
      </main>
    </PullToRefresh>
  );
}

function NoProfile() {
  return (
    <Card variant="gold" className="p-6" data-testid="today-no-profile">
      <p className="font-display font-extrabold text-xl tracking-[-0.02em] text-ink">Make this day yours</p>
      <p className="mt-2 text-ink-secondary leading-relaxed">
        Tell us your name and birthday once and every morning you get a card written for your sign
        and type: today&apos;s horoscope, a tip, your lucky colour and number, and what to do and avoid.
      </p>
      <ButtonLink href="/welcome?next=/today" size="lg" className="mt-5">
        Set up in 30 seconds
      </ButtonLink>
    </Card>
  );
}
