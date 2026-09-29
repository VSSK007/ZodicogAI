/**
 * Tiny SVG blur placeholder for next/image (`placeholder="blur"`), tinted with
 * a colour so a slow photo fades in from something on-brand instead of a hole.
 */
export function blurDataURL(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">` +
    `<rect width="8" height="8" fill="#14121f"/><rect width="8" height="8" fill="${color}" fill-opacity="0.35"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
