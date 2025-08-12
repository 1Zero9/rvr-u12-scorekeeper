import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optional: if TypeScript errors ever block builds, uncomment below.
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
