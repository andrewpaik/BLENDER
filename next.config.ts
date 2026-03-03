import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages deployment
  output: "export",
  // GitHub Pages serves at /BLENDER/ subpath; local dev uses root
  basePath: isGitHubPages ? "/BLENDER" : "",
  assetPrefix: isGitHubPages ? "/BLENDER/" : undefined,
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
