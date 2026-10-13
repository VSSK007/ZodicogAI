"use client";

/**
 * The partner's side of an invite (and the inviter's "waiting / ready" view).
 * Shows only what the API exposes: the inviter's first name and sun sign.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConstellationLoader from "@/components/ConstellationLoader";
import PersonForm from "@/components/PersonForm";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { SignGlyph } from "@/components/ui/glyphs";
import { validatePerson } from "@/lib/api";
import { acceptInvite, getInvite, myInviteTokens, type InviteInfo } from "@/lib/invites";
import { rememberReading } from "@/lib/history";
import { usePrefilledPerson } from "@/lib/profile";
import { capture } from "@/lib/posthog";
import { haptic } from "@/lib/haptics";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; info: InviteInfo };

export default function InviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [person, setPerson] = usePrefilledPerson();
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [mine, setMine] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMine(myInviteTokens().includes(token));
    getInvite(token)
      .then((info) => {
        if (cancelled) return;
        if (!info) return setState({ kind: "missing" });
        setState({ kind: "ready", info });
        capture("invite_page_viewed", { status: info.status });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ kind: "error", message: e instanceof Error ? e.message : "Couldn't load this invite." });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function submit() {
    if (state.kind !== "ready") return;
    const err = validatePerson(person, "Your details");
    if (err) return setError(err);
    haptic();
    setError("");
    setWorking(true);
    try {
      const id = await acceptInvite(token, person);
      rememberReading({
        id,
        type: "full_relationship_intelligence",
        title: `${state.info.first_name} × ${person.name.trim()} Synastry Report`,
        date: new Date().toISOString(),
      });
      capture("invite_accepted");
      router.push(`/r/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setWorking(false);
    }
  }

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-xl mx-auto">
      {state.kind === "loading" && (
        <div aria-busy="true" aria-label="Loading invite" className="h-64 rounded-card border border-hairline bg-white/[0.02] animate-pulse" />
      )}

      {state.kind === "missing" && (
        <Card className="p-6 text-center" data-testid="invite-missing">
          <p className="font-display font-extrabold text-xl text-ink">This invite link isn&apos;t valid</p>
          <p className="mt-2 text-sm text-ink-secondary">Check that you copied the whole link, or ask them to send a new one.</p>
          <ButtonLink href="/" variant="secondary" className="mt-4">Go to ZodicogAI</ButtonLink>
        </Card>
      )}

      {state.kind === "error" && <ErrorNotice message={state.message} onRetry={() => router.refresh()} />}

      {state.kind === "ready" && state.info.status === "expired" && (
        <Card className="p-6 text-center" data-testid="invite-expired">
          <p className="font-display font-extrabold text-xl text-ink">This invite has expired</p>
          <p className="mt-2 text-sm text-ink-secondary">
            Ask {state.info.first_name} for a fresh link. Invites last 14 days.
          </p>
        </Card>
      )}

      {state.kind === "ready" && state.info.status === "accepted" && (
        <Card variant="gold" className="p-6" data-testid="invite-ready">
          <Eyebrow>{mine ? "Your invite" : "Already opened"}</Eyebrow>
          <p className="mt-3 font-display font-extrabold text-2xl tracking-[-0.02em] text-ink">
            {mine ? "Ready - your report is here" : "This report is ready"}
          </p>
          {state.info.result_id && (
            <ButtonLink href={`/r/${state.info.result_id}`} size="lg" className="mt-5">
              View the report →
            </ButtonLink>
          )}
        </Card>
      )}

      {state.kind === "ready" && state.info.status === "pending" && mine && (
        <Card variant="gold" className="p-6" data-testid="invite-waiting">
          <Eyebrow>Your invite</Eyebrow>
          <p className="mt-3 font-display font-extrabold text-2xl tracking-[-0.02em] text-ink">Waiting for your partner</p>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
            Nothing has been opened yet. Send them this page&apos;s link; the report appears here as soon as they add their details.
          </p>
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => void navigator.clipboard.writeText(window.location.href).catch(() => {})}
            >
              Copy link
            </Button>
            <Link href="/" className="text-sm text-ink-muted hover:text-ink-secondary">Back to ZodicogAI</Link>
          </div>
        </Card>
      )}

      {state.kind === "ready" && state.info.status === "pending" && !mine && !working && (
        <>
          <header className="mb-6">
            <Eyebrow>Compatibility invite</Eyebrow>
            <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.08] text-ink text-balance">
              <span className="inline-flex items-center gap-2 align-middle">
                <SignGlyph sign={state.info.sign} size={26} className="text-gold-bright" />
                {state.info.first_name}
              </span>{" "}
              wants to check your compatibility
            </h1>
            <p className="mt-3 text-ink-secondary leading-relaxed">
              Add your details and you&apos;ll both see the full report: scored by 18 deterministic engines, explained by AI.
              Free, no sign-up. {state.info.first_name} sees only the report, never your birth date.
            </p>
          </header>

          <PersonForm label="You" value={person} onChange={setPerson} self />

          {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

          <Button onClick={() => void submit()} size="lg" className="mt-5 w-full">
            See our compatibility
          </Button>
        </>
      )}

      {working && (
        <div data-testid="invite-working" className="py-10">
          <ConstellationLoader />
        </div>
      )}
    </main>
  );
}
