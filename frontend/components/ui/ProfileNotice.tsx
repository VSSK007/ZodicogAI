"use client";

/**
 * ProfileNotice — the one-line strip under a "Person A" form:
 * offers to remember the visitor, or shows that a saved profile is in use.
 */
import Link from "next/link";
import { Check, UserRound } from "lucide-react";
import { clearProfile, isProfileComplete, saveProfile, useProfile } from "@/lib/profile";

type Person = {
  name: string;
  day: number | string;
  month: number | string;
  mbti?: string;
  gender: "M" | "F";
};

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors tap-highlight-none";

export default function ProfileNotice({ person }: { person: Person }) {
  const profile = useProfile();
  const complete = isProfileComplete(person);

  const same =
    !!profile &&
    profile.name === person.name.trim() &&
    profile.day === Number(person.day) &&
    profile.month === Number(person.month);

  function save() {
    saveProfile({
      name: person.name.trim(),
      day: Number(person.day),
      month: Number(person.month),
      mbti: person.mbti ?? "",
      gender: person.gender,
    });
  }

  if (profile && same) {
    return (
      <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
        <Check className="size-3.5 text-success" aria-hidden="true" />
        Using your saved profile.
        <Link href="/profile" className="font-semibold text-accent-bright hover:text-gold-bright">Edit</Link>
        <button onClick={clearProfile} className="hover:text-ink-secondary underline underline-offset-2">Forget</button>
      </p>
    );
  }

  if (!complete) {
    return profile ? null : (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <UserRound className="size-3.5" aria-hidden="true" />
        Fill this in once and we&apos;ll remember you on this device.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <button
        onClick={save}
        className={`${chip} border-hairline text-ink-secondary hover:text-ink hover:border-hairline-strong`}
      >
        <UserRound className="size-3.5" aria-hidden="true" />
        {profile ? "Update my saved profile" : "Remember me on this device"}
      </button>
    </div>
  );
}
