import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
