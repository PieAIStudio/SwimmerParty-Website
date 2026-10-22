import type { NextConfig } from "next";
import { readdirSync, readFileSync } from "node:fs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The production record owns both the new identity and its historical casting URL.
    return readdirSync("media-pack/actors")
      .filter((file) => file.endsWith(".json"))
      .flatMap((file) => {
        const actor = JSON.parse(readFileSync(`media-pack/actors/${file}`, "utf8"));
        const oldSlug = actor.castingSource?.oldSlug;
        if (!actor.website?.published || !oldSlug || oldSlug === actor.slug) return [];
        return ["", "/zh", "/en"].map((prefix) => ({
          source: `${prefix}/actors/${oldSlug}/:path*`,
          destination: `${prefix}/actors/${actor.slug}/:path*`,
          permanent: true,
        }));
      });
  },
  outputFileTracingIncludes: {
    "/api/**": [
      "./src/content/actors/*/assets.json",
      // AuthKit's phone surface is an externalized ESM dependency under pnpm.
      // Keep its parser beside the API function for production SSO routes.
      "./node_modules/.pnpm/libphonenumber-js@*/node_modules/libphonenumber-js/**",
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
  // Only headers that cannot affect sign-in, media or embedding; CSP and framing stay open.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
