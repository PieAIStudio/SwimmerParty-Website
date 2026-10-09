import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/**": [
      "./src/content/actors/*/assets.json",
      // AuthKit's phone surface is an externalized ESM dependency under pnpm.
      // Keep its parser beside the API function for production SSO routes.
      "./node_modules/.pnpm/libphonenumber-js@1.13.14/node_modules/libphonenumber-js/**",
    ],
  },
  // Local originals and test evidence are never deployment artifacts.
  outputFileTracingExcludes: {
    "/api/**": [
      "./.assets-local/**",
      "./assets-inbox/**",
      "./media-pack/**",
      "./.devspace-reports/**",
      "./e2e/**",
      "./tools/**",
      "./.env*",
    ],
  },
  transpilePackages: [
    // AuthKit's phone parser is ESM and otherwise remains an absent pnpm
    // external in Vercel's server function trace.
    "libphonenumber-js",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
