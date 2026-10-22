import { z } from "zod";

const sampleId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sampleMediaSchema = z.looseObject({
  kind: z.enum(["image", "video"]),
  source: z.string().min(1),
  sourceRoot: z.enum(["media-pack", "assets-inbox"]).optional(),
  sourceSha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  public: z.string().startsWith("/media/"),
  transcode: z.boolean().optional(),
});
const sampleClipSchema = z.looseObject({
  sampleId: sampleId.optional(),
  actorSlugs: z.array(sampleId).min(1).max(2).optional(),
  // Actual performers may include a co-star without crediting their page with another delivery.
  castSlugs: z.array(sampleId).min(1).max(2).optional(),
  note: z.object({ en: z.string(), zh: z.string() }).optional(),
  label: z.enum(["solo", "action", "two-actors"]).optional(),
  approvedOn: z.iso.date(),
  tools: z.array(z.string().min(1)).nonempty(),
  media: z.array(sampleMediaSchema).min(1),
  approval: z
    .looseObject({
      rootStatus: z.string().startsWith("passed"),
      evidence: z.string().min(1),
      evidenceSha256: z.string().regex(/^[a-f0-9]{64}$/),
      ownerReviewPending: z.boolean(),
    })
    .optional(),
});
// Single objects are the already shipped video-01 contract, not a second catalog.
export const productionSamplesSchema = z.union([
  sampleClipSchema,
  z.array(sampleClipSchema).max(4),
]);
export type ProductionSample = z.infer<typeof sampleClipSchema>;
export type OfficialSample = {
  sampleId: string;
  slug: string;
  actorSlugs: string[];
  castSlugs?: string[];
  note?: { en: string; zh: string };
  label: "solo" | "action" | "two-actors";
  tools: string[];
  images: string[];
  poster: string;
  video: string;
  approvedOn: string;
};
