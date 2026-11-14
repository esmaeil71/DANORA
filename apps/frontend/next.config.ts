import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone فقط برای Docker — در dev باعث کندی و خطای routes-manifest می‌شود
  ...(process.env.NEXT_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  optimizePackageImports: ["lucide-react"],
};

export default nextConfig;