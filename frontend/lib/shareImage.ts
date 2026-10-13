"use client";

/**
 * Fetch a generated card image and hand it to the visitor: the system share
 * sheet when it can take files (phones), otherwise a plain download.
 */
export type ShareOutcome = "shared" | "downloaded" | "cancelled";

export async function shareImageUrl(url: string, filename: string, title = "ZodicogAI"): Promise<ShareOutcome> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't generate the image (HTTP ${res.status})`);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      // Fall through to a download for any other share failure.
    }
  }

  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
  return "downloaded";
}
