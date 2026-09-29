"use client";

/** Navbar entry to /profile — shows the saved name's initial once a profile exists. */
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useProfile } from "@/lib/profile";

export default function ProfileLink({ active }: { active: boolean }) {
  const profile = useProfile();
  const initial = profile?.name.trim().charAt(0).toUpperCase();
  return (
    <Link
      href="/profile"
      aria-label={profile ? `Your profile (${profile.name})` : "Set up your profile"}
      className={`size-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors tap-highlight-none ${
        active || profile
          ? "border-hairline-accent bg-accent/15 text-accent-bright"
          : "border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong"
      }`}
    >
      {initial ?? <UserRound className="size-4" aria-hidden="true" />}
    </Link>
  );
}
