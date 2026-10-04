import type { issueSignedToken, presignUrl, put, IssuedSignedToken } from "@vercel/blob";
import { objectPath, type AssetStore } from "./asset-store.ts";
import { SIGNED_DOWNLOAD_SECONDS } from "../features/assets/downloads.ts";

export type BlobSdk = {
  issueSignedToken: typeof issueSignedToken;
  presignUrl: typeof presignUrl;
  put: typeof put;
};
/** SDK 2.8.0 contract checked 2026-10-03 against Vercel's signed-URL documentation.
 * This module has no eager SDK import, credential read or network side effect.
 */
export function blobAssetStore(
  sdk: BlobSdk,
  now = Date.now,
): AssetStore & { sign: (object: string) => Promise<string> } {
  const tokens = new Map<string, Promise<IssuedSignedToken>>();
  return {
    async put(object, bytes) {
      objectPath(".", object);
      await sdk.put(object, Buffer.from(bytes), {
        access: "private",
        contentType: object.endsWith(".png") ? "image/png" : "image/webp",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    },
    async sign(object) {
      objectPath(".", object);
      let pending = tokens.get(object);
      if (pending && (await pending).validUntil <= now() + (SIGNED_DOWNLOAD_SECONDS + 10) * 1000) {
        tokens.delete(object);
        pending = undefined;
      }
      if (!pending) {
        // Bounded per-object delegation; the browser receives only the concrete URL.
        if (tokens.size >= 512) tokens.delete(tokens.keys().next().value!);
        pending = sdk.issueSignedToken({
          pathname: object,
          operations: ["get"],
          validUntil: now() + 15 * 60 * 1000,
        });
        tokens.set(object, pending);
        void pending.catch(() => {
          if (tokens.get(object) === pending) tokens.delete(object);
        });
      }
      const token = await pending;
      return (
        await sdk.presignUrl(token, {
          operation: "get",
          pathname: object,
          access: "private",
          validUntil: now() + SIGNED_DOWNLOAD_SECONDS * 1000,
        })
      ).presignedUrl;
    },
  };
}
let blobStore: Promise<ReturnType<typeof blobAssetStore>> | undefined;
export function configuredBlobStore(): Promise<ReturnType<typeof blobAssetStore>> {
  // Called only after the caller explicitly selected blob mode. The SDK owns token/OIDC resolution.
  return (blobStore ??= import("@vercel/blob").then((sdk) => blobAssetStore(sdk)));
}
