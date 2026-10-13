"use client";

/**
 * GroupResultView - the finished group reading: score, glue / strongest /
 * spiciest, the heat-map, the web and the AI notes. Used live on
 * /analyze/group and for saved readings on /r/[id].
 */
import { GroupHeatmap, GroupWeb, band, type GroupResult } from "@/components/group/GroupViz";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { renderMd } from "@/lib/renderMd";

function Note({ title, text }: { title: string; text: string }) {
  if (!text || text === "—") return null;
  return (
    <div className="border-l-2 border-gold/40 pl-4">
      <p className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1">{title}</p>
      <p className="text-sm md:text-base text-ink-secondary leading-relaxed">{renderMd(text)}</p>
    </div>
  );
}

export default function GroupResultView({ result }: { result: GroupResult }) {
  return (
    <div className="space-y-6">
      <Card variant="gold" className="p-5 md:p-6">
        <Eyebrow>Group chemistry</Eyebrow>
        <p className="mt-3 font-display font-extrabold tracking-[-0.03em] text-3xl md:text-4xl text-ink tabular-nums">
          {result.group_score.toFixed(0)}
          <span className="text-base text-ink-muted ml-1">/ 100</span>
        </p>
        <p className="mt-1 text-sm text-ink-secondary">{band(result.group_score).label} across {result.pairs.length} pairs</p>
        <div className="mt-5 space-y-4">
          <Note title="How the group works" text={result.analysis.group_dynamic} />
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4" data-testid="group-glue">
          <p className="text-micro uppercase tracking-wider text-gold">The glue</p>
          <p className="mt-1 font-display font-extrabold text-lg text-ink truncate">{result.glue.name}</p>
          <p className="text-xs text-ink-muted tabular-nums">average {result.glue.average.toFixed(0)}</p>
        </Card>
        <Card className="p-4" data-testid="group-strongest">
          <p className="text-micro uppercase tracking-wider text-success">Strongest pair</p>
          <p className="mt-1 font-display font-extrabold text-lg text-ink truncate">{result.strongest.names.join(" + ")}</p>
          <p className="text-xs text-ink-muted tabular-nums">{result.strongest.score.toFixed(0)}</p>
        </Card>
        <Card className="p-4" data-testid="group-spiciest">
          <p className="text-micro uppercase tracking-wider text-danger">Spiciest pair</p>
          <p className="mt-1 font-display font-extrabold text-lg text-ink truncate">{result.spiciest.names.join(" + ")}</p>
          <p className="text-xs text-ink-muted tabular-nums">{result.spiciest.score.toFixed(0)}</p>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <p className="text-sm font-semibold text-ink-secondary mb-4">Who fits whom</p>
        <GroupHeatmap result={result} />
      </Card>

      <Card className="p-4 md:p-6">
        <p className="text-sm font-semibold text-ink-secondary mb-2">The web</p>
        <GroupWeb result={result} />
        <p className="mt-2 text-center text-xs text-ink-muted">Thicker, warmer lines are stronger pairs. Gold ring: the glue.</p>
      </Card>

      <div className="space-y-5">
        <Note title={`The glue: ${result.glue.name}`} text={result.analysis.glue_note} />
        <Note title={`Strongest: ${result.strongest.names.join(" + ")}`} text={result.analysis.strongest_pair_note} />
        <Note title={`Spiciest: ${result.spiciest.names.join(" + ")}`} text={result.analysis.spiciest_pair_note} />
        <Note title="One thing to try" text={result.analysis.tip} />
      </div>
    </div>
  );
}
