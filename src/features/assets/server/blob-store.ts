import type {
  BlobNotFoundError,
  head,
  issueSignedToken,
  presignUrl,
  put,
  IssuedSignedToken,
} from "@vercel/blob";
import { objectPath, type AssetStore } from "./asset-store.ts";
import { SIGNED_DOWNLOAD_SECONDS } from "../downloads.ts";

export type BlobSdk = {
  BlobNotFoundError: typeof BlobNotFoundError;
  head: typeof head;
  issueSignedToken: typeof issueSignedToken;
  presignUrl: typeof presignUrl;
  put: typeof put;
};
const VOICE_OBJECT = /^voice\/[a-z0-9-]+\/[a-z0-9_-]+\.(mp3|wav)$/;
const CONTENT_TYPES = {
  png: "image/png",
  webp: "image/webp",
  mp3: "audio/mpeg",
  wav: "audio/wav",
} as const;
/** Image masters follow the asset-store key rules; voice masters live under voice/<slug>/. */
export function privateObjectType(object: string): string {
  if (!VOICE_OBJECT.test(object)) objectPath(".", object);
  return CONTENT_TYPES[object.slice(object.lastIndexOf(".") + 1) as keyof typeof CONTENT_TYPES];
}
/** SDK 2.8.0 contract checked 2026-10-03 against Vercel's signed-URL documentation.
 * This module has no eager SDK import, credential read or network side effect.
 */
export function blobAssetStore(
  sdk: BlobSdk,
  now = Date.now,
): AssetStore & {
  sign: (object: string) => Promise<string>;
  exists: (object: string) => Promise<number | null>;
} {
  const tokens = new Map<string, Promise<IssuedSignedToken>>();
  return {
    async put(object, bytes) {
      await sdk.put(object, Buffer.from(bytes), {
        access: "private",
        contentType: privateObjectType(object),
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    },
    /** Stored size, or null when the object is absent. */
    async exists(object) {
      privateObjectType(object);
      try {
        return (await sdk.head(object)).size;
      } catch (error) {
        if (error instanceof sdk.BlobNotFoundError) return null;
        throw error;
      }
    },
    async sign(object) {
      privateObjectType(object);
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
