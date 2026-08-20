import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlProxy = createMiddleware(routing);

/** Served as-is: locale-prefixing a robots file breaks it. */
const SYSTEM_FILES = new Set(["/sitemap.xml", "/robots.txt"]);

export default function proxy(request: NextRequest) {
  if (SYSTEM_FILES.has(request.nextUrl.pathname)) return NextResponse.next();
  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/sitemap.xml", "/robots.txt"],
};
