import { routeLocaleRequest } from "./i18n/proxy";

import { NextResponse, type NextRequest } from "next/server";

/** Served as-is: locale-prefixing a robots file breaks it. */
const SYSTEM_FILES = new Set(["/sitemap.xml", "/robots.txt"]);

export default function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === "swimmerparty.vercel.app") {
    const url = request.nextUrl.clone();
    url.hostname = "swimmerparty.swiminai.com";
    return NextResponse.redirect(url, 308);
  }
  if (SYSTEM_FILES.has(request.nextUrl.pathname)) return NextResponse.next();
  return routeLocaleRequest(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/sitemap.xml", "/robots.txt"],
};
