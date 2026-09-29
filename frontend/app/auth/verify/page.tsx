"use client";

/** /auth/verify?token=... - the target of the emailed link. Exchanges it for a session. */
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { completeSignIn } from "@/lib/auth";

function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const ran = useRef(false);
  const [error, setError] = useState<string | null>(token ? null : "This sign-in link is missing its token.");

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // the link is single-use; never spend it twice (StrictMode, re-renders)
    completeSignIn(token)
      .then(() => router.replace("/profile"))
      .catch((e: Error) => setError(e.message));
  }, [token, router]);

  return (
    <main className="min-h-[70vh] px-4 py-16 max-w-md mx-auto text-center">
      <Eyebrow>Account</Eyebrow>
      {error ? (
        <Card className="mt-6 p-6 text-left" role="alert">
          <h1 className="font-display font-extrabold text-2xl tracking-[-0.02em] text-ink">Couldn&apos;t sign you in</h1>
          <p className="mt-2 text-sm text-ink-secondary">{error}</p>
          <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-accent-bright hover:text-gold-bright">
            Get a new link →
          </Link>
        </Card>
      ) : (
        <p className="mt-6 text-ink-secondary" role="status">
          Signing you in…
        </p>
      )}
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <Verify />
    </Suspense>
  );
}
