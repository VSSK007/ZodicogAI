import React from "react";

/**
 * The one inline-markdown renderer: **bold**, *italic*, [text](url) links and
 * bare URLs → React nodes. Use wherever AI-generated text is rendered.
 * Block-level structure (headings, lists) lives in components/ui/Markdown.tsx,
 * which is built on this.
 *
 * tone   "gold" tints emphasis for Zodicognac/constellation surfaces
 * breaks turn newlines into <br/> (streamed text arrives with raw newlines)
 */
type Options = { tone?: "default" | "gold"; breaks?: boolean };

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+|\n)/;

export function renderMd(
  text: string | undefined | null,
  { tone = "default", breaks = false }: Options = {},
): React.ReactNode {
  if (!text) return null;
  const strong = tone === "gold" ? "text-gold-bright font-semibold" : "text-ink font-semibold";
  const em = tone === "gold" ? "text-gold-bright/80 italic" : "italic";
  const link = "text-gold-bright underline underline-offset-2 hover:text-gold transition-colors";

  return text.split(TOKEN).map((part, i) => {
    if (part === "\n") return breaks ? <br key={i} /> : part;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={i} className={strong}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={i} className={em}>{part.slice(1, -1)}</em>;
    const md = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (md)
      return <a key={i} href={md[2]} target="_blank" rel="noopener noreferrer" className={link}>{md[1]}</a>;
    if (/^https?:\/\//.test(part))
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={`${link} break-all`}>{part}</a>;
    return part;
  });
}
