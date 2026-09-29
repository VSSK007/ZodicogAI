/**
 * Re-mounts on every navigation, so each page gets the same short fade-in.
 * Opacity only — a transform here would become the containing block for
 * position:fixed children inside pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
