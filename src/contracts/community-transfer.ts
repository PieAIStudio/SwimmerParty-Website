import { z } from "zod";
/** Website capability boundary for the separately owned signer/read adapter. Not an invented database RPC. */
const signedUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.hash;
});
export const transferTargetSchema = z.strictObject({
  url: signedUrl,
  method: z.enum(["PUT", "POST"]),
  expiresAt: z.iso.datetime({ offset: true }),
  headers: z
    .record(z.string(), z.string())
    .refine((value) =>
      Object.keys(value).every((key) => ["content-type", "x-upsert"].includes(key.toLowerCase())),
    ),
});
export const mediaAccessSchema = z.strictObject({
  url: signedUrl,
  expiresAt: z.iso.datetime({ offset: true }),
  mime: z.enum(["image/jpeg", "image/png", "image/webp", "audio/wav", "audio/mpeg", "audio/mp4"]),
});
export type TransferTarget = z.infer<typeof transferTargetSchema>;

/** Exact c29cbfc edge responses; mapping is local and does not sign or contact storage. */
const uploadTargetResponseSchema = z.strictObject({
  uploadId: z.uuid(),
  uploadUrl: signedUrl,
  uploadUrlExpiresAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
});
const mediaReadResponseSchema = z.strictObject({
  mediaId: z.uuid(),
  url: signedUrl,
  mime: mediaAccessSchema.shape.mime,
  expiresInSeconds: z.number().int().positive().max(86400),
});
export function normalizeUploadTarget(
  value: unknown,
  uploadId: string,
  mime: string,
  now = Date.now(),
): TransferTarget {
  const data = uploadTargetResponseSchema.parse(value);
  if (
    data.uploadId !== uploadId ||
    Date.parse(data.uploadUrlExpiresAt) <= now ||
    Date.parse(data.uploadUrlExpiresAt) > Date.parse(data.expiresAt)
  )
    throw new Error("Invalid upload capability identity or expiry");
  return transferTargetSchema.parse({
    url: data.uploadUrl,
    method: "PUT",
    headers: { "content-type": mime, "x-upsert": "false" },
    expiresAt: data.uploadUrlExpiresAt,
  });
}
export function normalizeMediaAccess(value: unknown, mediaId: string, requestedAt: number) {
  const data = mediaReadResponseSchema.parse(value);
  if (data.mediaId !== mediaId || !Number.isFinite(requestedAt))
    throw new Error("Invalid media capability identity");
  // Count validity from request start, never response arrival, so latency cannot extend the grant.
  return mediaAccessSchema.parse({
    url: data.url,
    mime: data.mime,
    expiresAt: new Date(requestedAt + data.expiresInSeconds * 1000).toISOString(),
  });
}
