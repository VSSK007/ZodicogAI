"use client";

/**
 * /profile — set up "me" once. The saved profile pre-fills Person A on every
 * analysis form, on this device only (localStorage; no account).
 */
import { useState } from "react";
import Link from "next/link";
import { Check, CloudSync, Trash2 } from "lucide-react";
import PersonForm from "@/components/PersonForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SignGlyph } from "@/components/ui/glyphs";
import { emptyPerson, validatePerson, type PersonData } from "@/lib/api";
import { getSign } from "@/lib/zodiac";
import { clearProfile, saveProfile, useProfile } from "@/lib/profile";
import { deleteAccount, signOut, useSession } from "@/lib/auth";

function AccountPanel() {
  const session = useSession();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (session.status === "loading") return null;

  if (session.status === "signed-out") {
    return (
      <Card className="mt-10 p-5">
        <p className="flex items-center gap-2 font-display font-extrabold text-base tracking-[-0.01em] text-ink">
          <CloudSync className="size-4 text-gold-bright" aria-hidden="true" /> Sync across devices
        </p>
        <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
          Sign in with your email (no password) to keep this profile and your reading history on every device.
        </p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-accent-bright hover:text-gold-bright">
          Sign in →
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="gold" className="mt-10 p-5" data-testid="account-panel">
      <p className="text-xs text-ink-muted uppercase tracking-wider">Signed in</p>
      <p className="mt-1 font-semibold text-ink break-all">{session.user.email}</p>
      <p className="mt-2 text-sm text-ink-secondary">Your profile and readings sync to this account.</p>
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <button onClick={() => void signOut()} className="text-sm font-semibold text-ink-secondary hover:text-ink transition-colors">
          Sign out
        </button>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="text-sm text-ink-muted hover:text-danger transition-colors">
            Delete account
          </button>
        ) : (
          <span className="text-sm text-ink-secondary">
            Delete your account, profile and readings for good?{" "}
            <button
              disabled={busy}
              onClick={async () => { setBusy(true); await deleteAccount().catch(() => {}); setBusy(false); setConfirming(false); }}
              className="font-semibold text-danger hover:underline"
            >
              Yes, delete
            </button>{" "}
            <button onClick={() => setConfirming(false)} className="text-ink-muted hover:text-ink-secondary">
              Cancel
            </button>
          </span>
        )}
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const saved = useProfile();
  const [edited, setEdited] = useState<PersonData | null>(null);
  const person = edited ?? saved ?? emptyPerson();
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  function save() {
    const err = validatePerson(person, "Your profile");
    if (err) return setError(err);
    setError("");
    saveProfile(person);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  const sign = saved && saved.day && saved.month ? getSign(saved.day, saved.month) : null;

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-xl mx-auto">
      <header className="mb-8">
        <Eyebrow>Your profile</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.08] text-ink text-balance">
          Tell us once
        </h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          We&apos;ll pre-fill every reading with your details. They stay on this device — nothing is sent
          anywhere until you run an analysis, unless you choose to sign in and sync.
        </p>
      </header>

      {saved && sign && (
        <Card variant="gold" className="mb-5 p-4 flex items-center gap-3">
          <span className="size-10 rounded-card border border-hairline-gold bg-gold/10 flex items-center justify-center text-gold-bright">
            <SignGlyph sign={sign} size={20} strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">{saved.name}</p>
            <p className="text-xs text-ink-muted">
              {sign}{saved.mbti ? ` · ${saved.mbti}` : ""} · saved on this device
            </p>
          </div>
        </Card>
      )}

      <PersonForm
        label="You"
        value={person}
        onChange={setEdited}
      />

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <Button onClick={save} size="lg">
          {justSaved ? <><Check className="size-4" aria-hidden="true" /> Saved</> : "Save my profile"}
        </Button>
        {saved && (
          <button
            onClick={() => { clearProfile(); setEdited(emptyPerson()); }}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Forget me
          </button>
        )}
      </div>

      <AccountPanel />

      <p className="mt-8 text-sm text-ink-muted">
        Ready?{" "}
        <Link href="/analyze/hybrid" className="font-semibold text-accent-bright hover:text-gold-bright">
          Start with your behavioral profile →
        </Link>
      </p>
    </main>
  );
}
