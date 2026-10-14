import { routeLocaleRequest } from "./i18n/proxy";
import { communityPageAccess } from "./features/community/server";

import { NextResponse, type NextRequest } from "next/server";

/** Served as-is: locale-prefixing a robots file breaks it. */
const SYSTEM_FILES = new Set(["/sitemap.xml", "/robots.txt"]);

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === "swimmerparty.vercel.app") {
    const url = request.nextUrl.clone();
    url.hostname = "swimmerparty.swiminai.com";
    return NextResponse.redirect(url, 308);
  }
  if (SYSTEM_FILES.has(request.nextUrl.pathname)) return NextResponse.next();
  const gate = await communityPageAccess(request);
  const response =
    gate && !gate.allowed
      ? new NextResponse(
          '<!doctype html><html><head><meta name="robots" content="noindex,nofollow"></head><body>404</body></html>',
          { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
        )
      : routeLocaleRequest(request);
  if (gate) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.append("Vary", "Cookie");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    for (const cookie of gate.cookies) response.headers.append("Set-Cookie", cookie);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/sitemap.xml",
    "/robots.txt",
    // Scope to authored locales: an unconstrained :locale would also capture /api/community/*.
    // Protect RSC/prefetch/segment suffixes as well as the human-facing pages.
    "/:locale(en|zh)/community:tail(.*)",
    "/:locale(en|zh)/admin/review:tail(.*)",
    "/:locale(en|zh)/works/p/:path*",
  ],
};
