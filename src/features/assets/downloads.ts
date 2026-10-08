import type { AssetItem } from "./asset-types.ts";
export const GUEST_DOWNLOAD_WINDOW_SECONDS = 30;
export const SIGNED_DOWNLOAD_SECONDS = 120;
export const MAX_BUNDLE_ITEMS = 64;
export const GUEST_COOLDOWN_KEY = "sp-guest-cooldown-until";
export function assetFilename(
  slug: string,
  item: Pick<AssetItem, "series" | "key" | "look" | "format">,
): string {
  if (/^SP-\d/.test(slug))
    return `${slug}_${item.series}${item.look ? `-${item.look}` : ""}-${item.key}.${item.format}`;
  return `${slug}__${item.series}${item.look ? `-${item.look}` : ""}__${item.key}.${item.format}`;
}
