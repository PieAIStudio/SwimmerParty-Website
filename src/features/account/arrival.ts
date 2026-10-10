/** Cross-product arrival: a SWIM IN AI product link carries `swimmer_sso=1`. Pure, so it can be tested without a browser. */
export const SSO_ARRIVAL_PARAM = "swimmer_sso=1";

/** Removes exactly `swimmer_sso=1` from a raw query string and keeps every other part as written.
 * Returns null when the marker is absent, otherwise the cleaned query ("" when nothing is left). */
export function withoutSwimmerSso(search: string): string | null {
  const parts = search.replace(/^\?/, "").split("&").filter(Boolean);
  const kept = parts.filter((part) => part !== SSO_ARRIVAL_PARAM);
  if (kept.length === parts.length) return null;
  return kept.length ? `?${kept.join("&")}` : "";
}

/** The one decision taken on the first finished session check of a page load. */
export function planArrival(input: {
  search: string;
  mode: "mock" | "swimmer" | null;
  signedIn: boolean;
}): { search: string | null; startSignIn: boolean } {
  const cleaned = withoutSwimmerSso(input.search);
  if (cleaned === null) return { search: null, startSignIn: false };
  // Mock accounts never start a cross-product sign-in; only the real account center does.
  return { search: cleaned, startSignIn: input.mode === "swimmer" && !input.signedIn };
}
