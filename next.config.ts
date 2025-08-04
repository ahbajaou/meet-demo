import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  turbopack: {
    experimental: {
      resolveOptions: {
        alias: {
          fs: false,
          net: false,
          tls: false,
        },
      },
    },
  },
  // other Next.js config options here
};

export default nextConfig;