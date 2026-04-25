import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@societe/ui"],
  },
  transpilePackages: ["@societe/ui", "@societe/emails"],
};

export default nextConfig;
