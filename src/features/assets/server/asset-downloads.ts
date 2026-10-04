import type { AssetItem } from "../asset-types.ts";
import { assetFilename } from "../downloads.ts";
import { signLocalObject, readLocalObject } from "./local-downloads.ts";
import { configuredBlobStore } from "./blob-store.ts";

export async function signedAsset(code: string, item: AssetItem, mode: "local" | "blob") {
  let url: string;
  if (mode === "local") {
    // Check delivery, not just the manifest. A missing master never produces a dead success URL.
    await readLocalObject(process.env.ASSET_LOCAL_ROOT ?? ".assets-local", item.object);
    url = signLocalObject(item.object);
  } else url = await (await configuredBlobStore()).sign(item.object);
  return {
    slot: item.slot,
    url,
    filename: assetFilename(code, item),
    width: item.width,
    height: item.height,
    series: item.series,
    key: item.key,
  };
}
