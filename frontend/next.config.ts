import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker builds set NEXT_OUTPUT=standalone for a small, self-contained server
  // (see frontend/Dockerfile); the PM2 deployment leaves it unset.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  async headers() {
    // Baseline hardening. (A strict CSP is intentionally not set here: GA, PostHog
    // and Sentry load lazily from several origins and need a tested allow-list.)
    return [
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
