import type { AppLocale } from "../../i18n/routing.ts";

/** Carry display language through the Backend-owned entry. AuthKit still owns
 * the unchanged native request, PKCE attempt and exact product return path.
 * The center validates the registered provider/client/callback before contact.
 */
export function localizedSignInUrl(
  authorizationUrl: string,
  accountOrigin: string,
  locale: AppLocale,
): string {
  const native = new URL(authorizationUrl);
  const center = new URL(accountOrigin);
  if (
    native.protocol !== "https:" ||
    native.username ||
    native.password ||
    native.hash ||
    native.pathname !== "/auth/v1/oauth/authorize" ||
    center.protocol !== "https:" ||
    center.origin !== accountOrigin ||
    center.username ||
    center.password ||
    !["en", "zh"].includes(locale)
  )
    throw new Error("Invalid account redirect");
  const target = new URL("/authorize/start", center);
  target.searchParams.set("authorization_url", authorizationUrl);
  target.searchParams.set("ui_locales", locale);
  return target.href;
}
