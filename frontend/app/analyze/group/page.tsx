"use client";

/**
 * /analyze/group - friend-group chemistry for 3 to 8 people.
 * Every pair is scored by the same deterministic engines as the full report;
 * the AI writes one summary for the whole group.
 */
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import AnalyzePageShell from "@/components/analyze/AnalyzePageShell";
import ResultActions from "@/components/analyze/ResultActions";
import PersonForm from "@/components/PersonForm";
import GroupResultView from "@/components/group/GroupResultView";
import type { GroupResult } from "@/components/group/GroupViz";
import { Button } from "@/components/ui/Button";
import { apiFetch, emptyPerson, toPerson, validatePerson, type PersonData } from "@/lib/api";
import { useProfile } from "@/lib/profile";

const MIN = 3;
const MAX = 8;

export default function GroupPage() {
  const saved = useProfile();
  const [edited, setEdited] = useState<PersonData[] | null>(null);
  const [result, setResult] = useState<GroupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Person 1 starts as the visitor's saved profile; typing takes over without a sync effect.
  const people = useMemo<PersonData[]>(
    () => edited ?? [saved ?? emptyPerson(), emptyPerson(), emptyPerson()],
    [edited, saved],
  );

  const update = (i: number, p: PersonData) => setEdited(people.map((x, k) => (k === i ? p : x)));
  const add = () => people.length < MAX && setEdited([...people, emptyPerson()]);
  const remove = (i: number) => people.length > MIN && setEdited(people.filter((_, k) => k !== i));

  async function run() {
    for (let i = 0; i < people.length; i++) {
      const err = validatePerson(people[i], `Person ${i + 1}`);
      if (err) return setError(err);
    }
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<GroupResult>("/analyze/group", { people: people.map(toPerson) });
      setResult(data);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const title = result ? `${result.people.map((p) => p.name).slice(0, 3).join(", ")}${result.people.length > 3 ? ` +${result.people.length - 3}` : ""} · Group Chemistry` : "";

  const form = (
    <div>
      <ol className="space-y-3">
        {people.map((p, i) => (
          <li key={i} data-testid="group-person">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Person {i + 1}</span>
              {people.length > MIN && (
                <button
                  onClick={() => remove(i)}
                  aria-label={`Remove person ${i + 1}`}
                  className="size-8 rounded-full flex items-center justify-center text-ink-muted hover:text-danger transition-colors tap-highlight-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <PersonForm label={`Person ${i + 1}`} value={p} onChange={(v) => update(i, v)} self={i === 0} />
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <Button variant="secondary" size="sm" onClick={add} disabled={people.length >= MAX}>
          <Plus className="size-4" aria-hidden="true" /> Add person
        </Button>
        <p className="text-xs text-ink-muted tabular-nums">{people.length} of {MAX} · minimum {MIN}</p>
      </div>

      <Button onClick={() => void run()} loading={loading} size="lg" className="mt-5 w-full">
        {loading ? "Reading the group…" : "Read the group"}
      </Button>
    </div>
  );

  const resultView = result && (
    <div className="space-y-6">
      <ResultActions analysisType="group_analysis" title={title} payload={result} />
      <GroupResultView result={result} />
    </div>
  );

  return (
    <AnalyzePageShell
      eyebrow="Group chemistry"
      title="Who holds the group together?"
      description="Add 3 to 8 people. Every pair is scored by the same engines as the full report; the AI then writes one summary for the group."
      form={form}
      result={resultView}
      hasResult={!!result}
      loading={loading}
      skeletonVariant="pair"
      error={error}
      onRetry={() => void run()}
      onReset={() => setResult(null)}
      resetLabel="Read another group"
    />
  );
}
