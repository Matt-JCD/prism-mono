import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@agents": path.resolve(__dirname, "agents"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@agents": path.resolve(__dirname, "agents"),
    };
    return config;
  },
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
