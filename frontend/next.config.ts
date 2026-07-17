import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
