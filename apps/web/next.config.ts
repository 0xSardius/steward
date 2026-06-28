import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS (main -> ./src). Let Next compile them.
  transpilePackages: ["@steward/core", "@steward/db", "@steward/solana"],
};

export default nextConfig;
