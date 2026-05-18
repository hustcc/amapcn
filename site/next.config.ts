import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  transpilePackages: ["amapcn"],
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};
export default nextConfig;
