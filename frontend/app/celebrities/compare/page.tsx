"use client";

/**
 * /celebrities/compare - pick any two of the 360 public figures and compare how
 * their sun signs and numerology line up. Zodiac and numerology only.
 */
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CELEBRITIES, SIGN_LABEL, SIGN_ORDER } from "@/lib/celebrities";
import { comparePath } from "@/lib/couples";

const SELECT =
  "w-full rounded-lg bg-surface-raised border border-hairline-strong px-3 py-3 text-base text-ink focus:outline-none focus:border-hairline-accent min-h-[44px] font-[inherit]";

function Picker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${SELECT} mt-1.5`}>
        <option value="">Choose someone…</option>
        {SIGN_ORDER.map((sign) => (
          <optgroup key={sign} label={SIGN_LABEL[sign]}>
            {CELEBRITIES.filter((c) => c.sign === sign).map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function Compare() {
  const router = useRouter();
  const params = useSearchParams();
  const known = (v: string | null) => (v && CELEBRITIES.some((c) => c.slug === v) ? v : "");
  const [a, setA] = useState(known(params.get("a")));
  const [b, setB] = useState(known(params.get("b")));

  const same = !!a && a === b;
  const ready = !!a && !!b && !same;

  return (
    <main className="min-h-screen px-4 md:px-6 py-8 md:py-14 max-w-xl mx-auto">
      <header className="mb-8">
        <Eyebrow>Celebrities</Eyebrow>
        <h1 className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.08] text-ink text-balance">
          Compare two celebrities
        </h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          See how two public figures&apos; sun signs and numerology numbers line up. It&apos;s a zodiac comparison from their
          public birth dates and names, and says nothing about any relationship between them.
        </p>
      </header>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) router.push(comparePath(a, b));
        }}
      >
        <Picker label="First person" value={a} onChange={setA} />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => { setA(b); setB(a); }}
            aria-label="Swap the two people"
            className="size-10 rounded-full border border-hairline flex items-center justify-center text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors tap-highlight-none"
          >
            <ArrowLeftRight className="size-4 rotate-90" aria-hidden="true" />
          </button>
        </div>
        <Picker label="Second person" value={b} onChange={setB} />

        {same && <p role="status" className="text-sm text-ink-muted">Pick two different people.</p>}

        <Button type="submit" size="lg" disabled={!ready} className="w-full">
          Compare
        </Button>
      </form>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <Compare />
    </Suspense>
  );
}
