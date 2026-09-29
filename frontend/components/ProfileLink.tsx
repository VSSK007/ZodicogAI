"use client";

/** Navbar entry to /profile — shows the saved name's initial once a profile exists. */
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { useSession } from "@/lib/auth";

export default function ProfileLink({ active }: { active: boolean }) {
  const profile = useProfile();
  const session = useSession();
  const initial = (profile?.name.trim() || session.user?.email || "").charAt(0).toUpperCase() || undefined;
  const signedIn = session.status === "signed-in";
  return (
    <Link
      href="/profile"
      aria-label={profile ? `Your profile (${profile.name})` : signedIn ? "Your account" : "Set up your profile"}
      className={`size-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors tap-highlight-none ${
        active || profile || signedIn
          ? "border-hairline-accent bg-accent/15 text-accent-bright"
          : "border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong"
      }`}
    >
      {initial ?? <UserRound className="size-4" aria-hidden="true" />}
    </Link>
  );
}
