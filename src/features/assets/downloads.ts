import type { AssetItem } from "./asset-types.ts";
export const GUEST_DOWNLOAD_WINDOW_SECONDS = 30;
export const SIGNED_DOWNLOAD_SECONDS = 120;
export { MAX_BUNDLE_ITEMS } from "../../contracts/downloads.ts";
export const GUEST_COOLDOWN_KEY = "sp-guest-cooldown-until";
export class SignInRequired extends Error {}
export function assetFilename(
  slug: string,
  item: Pick<AssetItem, "series" | "key" | "look" | "format">,
): string {
  return `${slug}__${item.series}${item.look ? `-${item.look}` : ""}__${item.key}.${item.format}`;
}
