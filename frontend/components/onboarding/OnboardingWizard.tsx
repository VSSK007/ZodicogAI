"use client";

/**
 * OnboardingWizard - three short steps (name, birthday, MBTI) that fill the
 * saved profile once, so every analysis form is pre-filled afterwards.
 * Never a forced modal: it lives on its own page (/welcome) and every step
 * can be revisited with Back; the MBTI step can be skipped.
 */
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import MbtiSelect from "@/components/MbtiSelect";
import MbtiQuiz from "@/components/MbtiQuiz";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { emptyPerson, type PersonData } from "@/lib/api";
import { isProfileComplete, saveProfile } from "@/lib/profile";
import { capture } from "@/lib/posthog";
import { DUR } from "@/lib/motion";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const STEPS = 3;
const FIELD =
  "w-full rounded-lg bg-white/[0.04] border border-hairline-strong px-3 py-3 text-base text-ink " +
  "placeholder:text-ink-faint focus:outline-none focus:border-hairline-accent transition-colors min-h-[44px] font-[inherit]";

export default function OnboardingWizard({
  initial,
  onDone,
}: {
  /** Existing profile to edit, if any. */
  initial?: PersonData | null;
  onDone: () => void;
}) {
  const [person, setPerson] = useState<PersonData>(initial ?? emptyPerson());
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(false);

  // Each step focuses its first field as it mounts (a stable callback ref, so
  // typing never steals focus back).
  const focusFirst = useCallback((el: HTMLElement | null) => {
    el?.querySelector<HTMLElement>("input, select, button")?.focus();
  }, []);

  const set = <K extends keyof PersonData>(key: K, value: PersonData[K]) => {
    setError("");
    setPerson((p) => ({ ...p, [key]: value }));
  };

  function next() {
    if (step === 0 && !person.name.trim()) return setError("Tell us your name to continue.");
    if (step === 1) {
      const d = Number(person.day);
      if (!person.month) return setError("Pick your birth month.");
      if (!d || d < 1 || d > 31) return setError("Enter your birth day (1-31).");
    }
    setError("");
    if (step < STEPS - 1) return setStep(step + 1);
    finish(person);
  }

  function finish(p: PersonData) {
    const done = { ...p, name: p.name.trim(), day: Number(p.day), month: Number(p.month) };
    if (!isProfileComplete(done)) return setError("Please complete your name and birthday.");
    saveProfile(done);
    capture("onboarding_completed", { has_mbti: !!done.mbti });
    onDone();
  }

  const days = Number(person.day);

  return (
    <div data-testid="onboarding">
      <div
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={1}
        aria-valuemax={STEPS}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of ${STEPS}`}
        className="flex gap-1.5"
      >
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-gold" : "bg-white/[0.08]"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-muted tabular-nums">Step {step + 1} of {STEPS}</p>

      {quiz ? (
        <div className="mt-5">
          <MbtiQuiz
            onResult={(t) => { set("mbti", t); setQuiz(false); }}
            onClose={() => setQuiz(false)}
          />
        </div>
      ) : (
        <form
          className="mt-5"
          onSubmit={(e) => { e.preventDefault(); next(); }}
          noValidate
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              ref={focusFirst}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: DUR.fast }}
            >
              {step === 0 && (
                <Card className="p-5 space-y-4">
                  <div>
                    <h2 className="font-display font-extrabold text-xl tracking-[-0.02em] text-ink">What should we call you?</h2>
                    <p className="mt-1 text-sm text-ink-secondary">First name or nickname is fine.</p>
                  </div>
                  <label className="block">
                    <span className="sr-only">Your name</span>
                    <input
                      className={FIELD}
                      placeholder="Your name"
                      autoComplete="given-name"
                      value={person.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </label>
                  <div role="group" aria-label="Gender" className="flex gap-2">
                    {([["M", "Male"], ["F", "Female"]] as const).map(([g, label]) => (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={person.gender === g}
                        onClick={() => set("gender", g)}
                        className={`flex-1 rounded-control border py-2.5 min-h-[44px] text-sm font-medium transition-colors tap-highlight-none ${
                          person.gender === g
                            ? "bg-gold text-gold-ink border-gold"
                            : "bg-surface-raised text-ink-secondary border-hairline hover:text-ink"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {step === 1 && (
                <Card className="p-5 space-y-4">
                  <div>
                    <h2 className="font-display font-extrabold text-xl tracking-[-0.02em] text-ink">When is your birthday?</h2>
                    <p className="mt-1 text-sm text-ink-secondary">Day and month are all we need for your sign.</p>
                  </div>
                  <div className="grid grid-cols-[1fr_6rem] gap-2">
                    <label className="block">
                      <span className="sr-only">Month</span>
                      <select
                        className={FIELD}
                        value={person.month || ""}
                        onChange={(e) => set("month", Number(e.target.value))}
                      >
                        <option value="" disabled>Month</option>
                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="sr-only">Day</span>
                      <input
                        className={FIELD}
                        placeholder="Day"
                        inputMode="numeric"
                        maxLength={2}
                        value={days ? String(days) : ""}
                        onChange={(e) => set("day", Number(e.target.value.replace(/\D/g, "")) || 0)}
                      />
                    </label>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-5 space-y-4">
                  <div>
                    <h2 className="font-display font-extrabold text-xl tracking-[-0.02em] text-ink">Your MBTI type</h2>
                    <p className="mt-1 text-sm text-ink-secondary">
                      Optional - it sharpens your readings. Not sure? Take the 8-question finder.
                    </p>
                  </div>
                  <div>
                    <MbtiSelect value={person.mbti} onChange={(v) => set("mbti", v)} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuiz(true)}
                    className="text-sm font-semibold text-accent-bright hover:text-gold-bright transition-colors"
                  >
                    Not sure? Take the quiz →
                  </button>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            {step > 0 && (
              <Button type="button" variant="ghost" onClick={() => { setError(""); setStep(step - 1); }}>
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1">
              {step === STEPS - 1 ? (person.mbti ? "Finish" : "Finish without MBTI") : "Next"}
            </Button>
          </div>

          {step === STEPS - 1 && !person.mbti && (
            <p className="mt-3 text-center text-xs text-ink-muted">
              You can add your type any time from your profile.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
