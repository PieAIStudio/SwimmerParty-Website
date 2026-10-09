import { z } from "zod";
import { lookSchema, slugSchema } from "./actors.ts";

const assetKindSchema = z.enum(["image", "voice", "video"]);
const assetConformanceSchema = z.enum(["v1", "legacy"]);
const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const assetItemSchema = z.looseObject({
  kind: assetKindSchema,
  slot: z.string().min(1),
  series: z.string().min(1),
  key: z.string().min(1),
  look: z.string().nullable(),
  conformance: assetConformanceSchema,
  version: z.number().nonnegative(),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  bytes: z.number().int().nonnegative(),
  sha256: hashSchema,
  sourceSha256: hashSchema,
  bbox: z.object({ left: z.number(), top: z.number(), right: z.number(), bottom: z.number() }),
  format: z.enum(["png", "webp", "wav", "mp3", "mp4"]),
  object: z.string().min(1),
  preview: z.string(),
  thumb: z.string(),
  large: z.string().optional(),
  blur: z.string().optional(),
  durationSec: z.number().nonnegative().optional(),
  transcript: z.object({ text: z.string() }).optional(),
  previewUrl: z.string().optional(),
});
export const actorAssetsSchema = z.looseObject({
  slug: slugSchema,
  looks: z.array(lookSchema),
  items: z.array(assetItemSchema),
});

export type AssetItem = z.infer<typeof assetItemSchema>;
export type ActorAssets = z.infer<typeof actorAssetsSchema>;
