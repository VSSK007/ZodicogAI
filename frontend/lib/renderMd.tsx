import React from "react";

/**
 * Converts **bold** and *italic* markdown to React nodes.
 * Use wherever AI-generated text fields are rendered.
 */
export function renderMd(text: string | undefined | null): React.ReactNode {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
