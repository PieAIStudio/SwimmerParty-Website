import { NextResponse, type NextRequest } from "next/server";
import { canonicalLocale } from "@pieai/swimmer-i18n-kit";
import { catalogLocale, hasLocale, localePath, routing, type AppLocale } from "./routing";

export function preferredLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): AppLocale {
  if (hasLocale(routing.locales, cookie)) return cookie;
  const candidates = (acceptLanguage ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((value) => value.trim().startsWith("q="));
      const q = quality ? Number(quality.trim().slice(2)) : 1;
      return { tag, q, index };
    })
    .filter(({ tag, q }) => tag && Number.isFinite(q) && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of candidates) {
    const normalized = canonicalLocale(tag);
    const exact = routing.locales.find((locale) => catalogLocale(locale) === normalized);
    if (exact) return exact;
    const same = routing.locales.find(
      (locale) => catalogLocale(locale).split("-")[0] === normalized.split("-")[0],
    );
    if (same) return same;
  }
  return routing.defaultLocale;
}

export function routeLocaleRequest(request: NextRequest) {
  const segment = request.nextUrl.pathname.split("/")[1];
  if (hasLocale(routing.locales, segment)) {
    const headers = new Headers(request.headers);
    headers.set("x-site-locale", segment);
    const response = NextResponse.next({ request: { headers } });
    if (
      !request.headers.has("next-router-prefetch") &&
      request.headers.get("purpose") !== "prefetch"
    ) {
      response.cookies.set("NEXT_LOCALE", segment, { path: "/", sameSite: "lax" });
    }
    return response;
  }
  const locale = preferredLocale(
    request.cookies.get("NEXT_LOCALE")?.value,
    request.headers.get("accept-language"),
  );
  const url = request.nextUrl.clone();
  url.pathname = localePath(url.pathname, locale);
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}
