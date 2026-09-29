"use client";

/**
 * /profile — set up "me" once. The saved profile pre-fills Person A on every
 * analysis form, on this device only (localStorage; no account).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Trash2 } from "lucide-react";
import PersonForm from "@/components/PersonForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SignGlyph } from "@/components/ui/glyphs";
import { emptyPerson, validatePerson, type PersonData } from "@/lib/api";
import { getSign } from "@/lib/zodiac";
import { clearProfile, saveProfile, useProfile } from "@/lib/profile";

export default function ProfilePage() {
  const saved = useProfile();
  const [person, setPerson] = useState<PersonData>(emptyPerson());
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (saved && !touched) setPerson(saved);
  }, [saved, touched]);

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
          anywhere until you run an analysis.
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
        onChange={(p) => { setTouched(true); setPerson(p); }}
      />

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <Button onClick={save} size="lg">
          {justSaved ? <><Check className="size-4" aria-hidden="true" /> Saved</> : "Save my profile"}
        </Button>
        {saved && (
          <button
            onClick={() => { clearProfile(); setPerson(emptyPerson()); setTouched(true); }}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink-secondary transition-colors"
          >
            <Trash2 className="size-4" aria-hidden="true" /> Forget me
          </button>
        )}
      </div>

      <p className="mt-8 text-sm text-ink-muted">
        Ready?{" "}
        <Link href="/analyze/hybrid" className="font-semibold text-accent-bright hover:text-gold-bright">
          Start with your behavioral profile →
        </Link>
      </p>
    </main>
  );
}
