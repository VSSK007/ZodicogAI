import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker builds set NEXT_OUTPUT=standalone for a small, self-contained server
  // (see frontend/Dockerfile); the PM2 deployment leaves it unset.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  // Pin the workspace root so a stray lockfile in a parent folder can't change it.
  turbopack: { root: process.cwd() },
  typescript: {
    // CI runs the type-check on every push. A small server (<=2 GB RAM) can set
    // SKIP_TYPECHECK=1 so `next build` doesn't spend ~1 GB repeating it.
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1",
  },
  async headers() {
    // Baseline hardening. (A strict CSP is intentionally not set here: GA, PostHog
    // and Sentry load lazily from several origins and need a tested allow-list.)
    return [
      {
        // The worker script itself must never be cached by the browser/CDN, or
        // a fixed worker would take days to reach visitors.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
  experimental: {
    // React <ViewTransition>: page cross-fades and shared-element morphs.
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
  async redirects() {
    return [
      // The full-report experience lives at /dashboard; the old analyze route
      // was a second UI over the same endpoint.
      {
        source: "/analyze/relationship-intelligence",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

// Source-map upload needs SENTRY_AUTH_TOKEN (+ SENTRY_ORG / SENTRY_PROJECT).
// Without it the config is returned untouched (Sentry still reports, with
// minified stacks) and the SDK isn't even loaded by `next start`.
export default async function config(): Promise<NextConfig> {
  if (!process.env.SENTRY_AUTH_TOKEN) return nextConfig;
  const { withSentryConfig } = await import("@sentry/nextjs");
  return withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
  });
}
