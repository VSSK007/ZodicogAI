"use client";

/**
 * /welcome - three-step first-run setup. `?next=/path` says where to go
 * afterwards (same-site paths only); the default is the daily page.
 */
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SignGlyph } from "@/components/ui/glyphs";
import { getSign } from "@/lib/zodiac";
import { useProfile } from "@/lib/profile";

const DEFAULT_NEXT = "/today";

/** Only same-site, absolute paths: never an open redirect. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_NEXT;
  return raw;
}

function Welcome() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const saved = useProfile();
  const [editing, setEditing] = useState(false);

  const showSummary = !!saved && !editing;
  const sign = saved?.day && saved?.month ? getSign(saved.day, saved.month) : null;

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-xl mx-auto">
      <header className="mb-8">
        <Eyebrow>Welcome</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.08] text-ink text-balance">
          {showSummary ? "You're all set up" : "Tell us once"}
        </h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          {showSummary
            ? "Your details pre-fill every reading on this device."
            : "Three quick questions, then every form is filled in for you. Your details stay on this device."}
        </p>
      </header>

      {showSummary && saved ? (
        <Card variant="gold" className="p-5" data-testid="onboarding-summary">
          <div className="flex items-center gap-3">
            {sign && (
              <span className="size-10 rounded-card border border-hairline-gold bg-gold/10 flex items-center justify-center text-gold-bright">
                <SignGlyph sign={sign} size={20} strokeWidth={1.6} />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-ink truncate">{saved.name}</p>
              <p className="text-xs text-ink-muted">
                {sign}{saved.mbti ? ` · ${saved.mbti}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <Button onClick={() => setEditing(true)} variant="secondary">Edit profile</Button>
            <Link href={next} className="text-sm font-semibold text-accent-bright hover:text-gold-bright">
              Continue →
            </Link>
          </div>
        </Card>
      ) : (
        <OnboardingWizard
          initial={saved}
          onDone={() => router.push(next)}
        />
      )}

      {!showSummary && (
        <p className="mt-6 text-center text-sm">
          <Link href={next} className="text-ink-muted hover:text-ink-secondary transition-colors">
            Skip for now
          </Link>
        </p>
      )}
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense>
      <Welcome />
    </Suspense>
  );
}
