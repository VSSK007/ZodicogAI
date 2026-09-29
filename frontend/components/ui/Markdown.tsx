/**
 * Markdown — block-level renderer for long-form AI replies: ## headings become
 * section cards, lists become bullet rows, everything else is paragraphs.
 * Inline formatting comes from lib/renderMd.
 */
import { renderMd } from "@/lib/renderMd";


function isHeading(line: string) {
  return /^#{2,4}\s/.test(line.trim());
}
function headingText(line: string) {
  return line.trim().replace(/^#{2,4}\s+/, "");
}

function BulletItem({ raw }: { raw: string }) {
  // "**Title** — description" or "**Title**: description" → title card
  const titleMatch = raw.match(/^\*\*([^*]+)\*\*\s*[-—–:]\s*([\s\S]*)/);
  if (titleMatch) {
    return (
      <div className="flex gap-3 items-start py-1">
        <span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-gold-bright/40" />
        <div className="min-w-0">
          <span className="text-white font-semibold text-sm">{titleMatch[1]}</span>
          <span className="text-ink-muted text-sm"> — </span>
          <span className="text-ink-secondary text-sm leading-relaxed">{renderMd(titleMatch[2])}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-start py-0.5">
      <span className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-white/20" />
      <span className="text-ink-secondary text-sm leading-relaxed">{renderMd(raw)}</span>
    </div>
  );
}

function renderLines(lines: string[]) {
  return lines.map((line, j) => {
    const t = line.trim();
    if (!t) return null;
    if (/^[-*•]\s/.test(t))
      return <BulletItem key={j} raw={t.replace(/^[-*•]\s+/, "")} />;
    if (/^\d+\.\s/.test(t))
      return (
        <div key={j} className="flex gap-3 items-start py-0.5">
          <span className="shrink-0 text-gold-bright/50 text-xs font-semibold mt-0.5 tabular-nums min-w-[1rem]">
            {t.match(/^(\d+)\./)?.[1]}.
          </span>
          <span className="text-ink-secondary text-sm leading-relaxed">{renderMd(t.replace(/^\d+\.\s+/, ""))}</span>
        </div>
      );
    return <p key={j} className="text-ink-secondary text-sm leading-[1.8]">{renderMd(t)}</p>;
  });
}

export default function Markdown({ text }: { text: string }) {
  const normalised = text
    .replace(/([^\n])(#{2,4}\s)/g, "$1\n\n$2")   // heading inline after text → break before
    .replace(/\n(#{2,4}\s)/g, "\n\n$1")           // single newline before heading → double
    .replace(/(#{2,4}\s[^\n]+)\n(?!\n)/g, "$1\n\n"); // single newline after heading → double
  const blocks = normalised.split(/\n\n+/);

  const rendered = blocks.map((block, i) => {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return null;

    // Section card: heading + content below it
    if (isHeading(lines[0])) {
      const ht = headingText(lines[0]);
      const rest = lines.slice(1);
      if (rest.length === 0) {
        // Heading only — standalone label
        return (
          <div key={i} className="flex items-center gap-2 mt-2">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-micro font-semibold tracking-widest uppercase text-gold-bright/60 px-2">
              {ht}
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
        );
      }
      return (
        <div key={i} className="rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.05] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-bright/50 shrink-0" />
            <span className="text-micro font-semibold tracking-widest uppercase text-gold-bright/70">
              {ht}
            </span>
          </div>
          <div className="px-4 py-3 space-y-1.5">{renderLines(rest)}</div>
        </div>
      );
    }

    // Pure list
    const isList = lines.every((l) => /^[-*•]\s/.test(l.trim()) || /^\d+\.\s/.test(l.trim()));
    if (isList) {
      return <div key={i} className="space-y-1.5 pl-1">{renderLines(lines)}</div>;
    }

    // Plain paragraphs
    if (lines.length > 1) {
      return <div key={i} className="space-y-2">{renderLines(lines)}</div>;
    }

    return <p key={i} className="text-ink-secondary text-sm leading-[1.8]">{renderMd(lines[0])}</p>;
  });

  return <div className="space-y-3">{rendered}</div>;
}

