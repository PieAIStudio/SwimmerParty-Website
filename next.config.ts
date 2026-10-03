import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: { "/api/**": ["./src/content/assets/*.json"] },
  // Local originals and test evidence are never deployment artifacts.
  outputFileTracingExcludes: {
    "/api/**": [
      "./.assets-local/**",
      "./assets-inbox/**",
      "./.devspace-reports/**",
      "./e2e/**",
      "./tools/**",
      "./.env*",
    ],
  },
  // three and its R3F wrappers ship ESM that Next must transpile for the
  // server pass; without this the app router fails on `import ... from 'three'`.
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
