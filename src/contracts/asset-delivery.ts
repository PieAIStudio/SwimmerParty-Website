import { z } from "zod";

const source = z.object({
  slot: z.string().min(1),
  source: z.string().min(1),
  nativeSource: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
  version: z.number().int().positive(),
});
/** A candidate import is not a claim that the source satisfies the standard v1 image frame. */
export const assetDeliverySchema = z
  .object({
    mode: z.literal("source-originals"),
    candidateAuthorizedOn: z.iso.date(),
    ownerReviewPending: z.boolean(),
    sourceEvidence: z.array(z.string().min(1)).nonempty(),
    images: z.array(source).min(1).max(128),
    voices: z
      .array(
        source.extend({
          slot: z.enum(["intro", "intro-alt", "chat", "happy", "angry", "sad"]),
          transcript: z.string().optional(),
        }),
      )
      .max(6),
  })
  .superRefine((delivery, context) => {
    for (const kind of ["images", "voices"] as const) {
      const slots = new Set<string>();
      const paths = new Set<string>();
      for (const [index, item] of delivery[kind].entries()) {
        if (slots.has(item.slot) || paths.has(item.source))
          context.addIssue({
            code: "custom",
            path: [kind, index],
            message: "Duplicate delivery slot or source",
          });
        slots.add(item.slot);
        paths.add(item.source);
        if (
          item.source.startsWith("/") ||
          item.source.includes("\\") ||
          item.source.split("/").some((p) => !p || p === "." || p === "..")
        )
          context.addIssue({
            code: "custom",
            path: [kind, index, "source"],
            message: "Source must be a safe assets-inbox relative path",
          });
      }
    }
  });
export type AssetDelivery = z.infer<typeof assetDeliverySchema>;
