import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Self-hosted on cPanel, so skip Next's optimizer (needs `sharp`, not
    // guaranteed on shared hosting) — images are served as-is.
    unoptimized: true,
  },
};

export default nextConfig;
