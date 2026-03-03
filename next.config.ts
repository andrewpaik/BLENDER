import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages deployment
  output: "export",
  // Allow large static frame assets to be served efficiently
  experimental: {
    largePageDataBytes: 512 * 1024,
  },
  // Static export requires unoptimized images (no server-side optimization)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
