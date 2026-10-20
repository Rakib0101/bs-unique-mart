import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Traces only the packages actually needed at runtime into
  // .next/standalone, instead of shipping the full node_modules (4.8GB)
  // to shared hosting on every deploy.
  output: "standalone",
  images: {
    // Self-hosted on cPanel, so skip Next's optimizer (needs `sharp`, not
    // guaranteed on shared hosting) — images are served as-is.
    unoptimized: true,
  },
  experimental: {
    // Admin product/settings forms upload images as multipart Server Action
    // bodies. Next's default 1MB limit silently fails the whole submission
    // for any real photo — raised to fit several full-size photos at once.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
