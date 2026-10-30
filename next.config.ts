import type { NextConfig } from "next";
import withBundleAnalyzerFactory from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Blob storage URLs already carry a random suffix per upload -- a given
    // URL+width+quality combination never changes content, so it's safe to
    // cache the optimized output as long as static assets.
    minimumCacheTTL: 31536000,
  },
  experimental: {
    // The only UI library in this codebase -- admin-only (product section
    // drag-and-drop), but tree-shaking its unused exports still shrinks the
    // admin bundle.
    optimizePackageImports: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
  },
};

const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
