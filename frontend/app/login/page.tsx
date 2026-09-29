"use client";

/**
 * /login - passwordless sign-in. Enter an email, get a one-time link.
 * Accounts are optional: they add cross-device sync of your profile and readings.
 */
import { useState } from "react";
import Link from "next/link";
import { CloudSync, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { requestLink, signOut, useSession } from "@/lib/auth";

export default function LoginPage() {
  const session = useSession();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await requestLink(email.trim());
      setSentTo(email.trim());
      setDevLink(res.dev_link ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 md:px-6 py-10 md:py-16 max-w-md mx-auto">
      <Eyebrow>Account</Eyebrow>
      <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.08] text-ink text-balance">
        Sign in
      </h1>
      <p className="mt-3 text-ink-secondary leading-relaxed">
        No password. We email you a one-time link, and your profile and readings follow you to every device.
        Everything still works without an account.
      </p>

      {session.status === "signed-in" ? (
        <Card variant="gold" className="mt-8 p-5">
          <p className="text-sm text-ink-secondary">Signed in as</p>
          <p className="font-semibold text-ink break-all">{session.user.email}</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link href="/profile" className="text-sm font-semibold text-accent-bright hover:text-gold-bright">
              Go to your profile →
            </Link>
            <button onClick={() => void signOut()} className="text-sm text-ink-muted hover:text-ink-secondary underline underline-offset-2">
              Sign out
            </button>
          </div>
        </Card>
      ) : sentTo ? (
        <Card className="mt-8 p-6" role="status">
          <Mail className="size-5 text-gold-bright" aria-hidden="true" />
          <p className="mt-3 font-display font-extrabold text-xl tracking-[-0.02em] text-ink">Check your inbox</p>
          <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
            If <strong className="text-ink">{sentTo}</strong> is a valid address, a sign-in link is on its way. It works
            once and expires in 15 minutes.
          </p>
          {devLink && (
            <a href={devLink} className="mt-4 inline-block text-sm font-semibold text-gold-bright underline underline-offset-2" data-testid="dev-link">
              Open sign-in link (development)
            </a>
          )}
          <button
            onClick={() => { setSentTo(null); setDevLink(null); }}
            className="mt-5 block text-xs text-ink-muted hover:text-ink-secondary underline underline-offset-2"
          >
            Use a different email
          </button>
        </Card>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-control border border-hairline-strong bg-white/[0.04] px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:outline-none focus:border-hairline-accent"
            />
          </label>
          {error && <ErrorNotice message={error} />}
          <Button type="submit" loading={busy} size="lg" className="w-full">
            Email me a sign-in link
          </Button>
          <p className="flex items-start gap-2 text-xs text-ink-muted leading-relaxed">
            <CloudSync className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            Signing in uploads nothing until you save a profile or finish a reading while signed in.
          </p>
        </form>
      )}
    </main>
  );
}
