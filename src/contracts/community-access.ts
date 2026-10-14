/** One explicit rollout state. Unknown values (including the retired 1/0 switch) fail closed. */
export function communityMode(value: string | undefined): "off" | "owner" | "on" {
  return value === "owner" || value === "on" ? value : "off";
}
export function isCommunityPage(pathname: string): boolean {
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  return /^\/(?:en|zh)\/(?:community(?:[/.]|$)|admin\/review(?:[/.]|$)|works\/p(?:\/|$))/.test(
    pathname,
  );
}
