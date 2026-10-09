import { z } from "zod";

export const MAX_BUNDLE_ITEMS = 64;
const filename = z
  .string()
  .min(1)
  .refine(
    (value) => !/[\\/]/u.test(value) && value !== "." && value !== "..",
    "Expected one download filename",
  );
export const signedDownloadSchema = z.object({
  url: z.string().min(1),
  filename,
  cooldown: z.number().nonnegative().optional(),
});
export const signedBundleSchema = z.object({
  items: z.array(z.object({ slot: z.string(), url: z.string().min(1), filename })),
});
export const bundleRequestSchema = z.object({
  slots: z
    .array(z.string().max(100))
    .min(1)
    .max(MAX_BUNDLE_ITEMS)
    .refine((slots) => new Set(slots).size === slots.length, "Duplicate slots"),
});
