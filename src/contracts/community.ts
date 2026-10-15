import { z } from "zod";

/** Consumer DTOs pinned to SwimmerBackend sp-community@c29cbfc, not the retired v1 API. */
export const communityKindSchema = z.enum(["image", "video", "audio"]);
export const postStatusSchema = z.enum([
  "draft",
  "processing",
  "pending",
  "published",
  "returned",
  "hidden",
  "deleted",
]);
const processingStatusSchema = z.enum([
  "reserved",
  "uploaded",
  "validating",
  "processing",
  "ready",
  "failed",
  "deleting",
  "deleted",
]);
export const reportReasonSchema = z.enum([
  "real_person",
  "sexual_violent",
  "hate_harassment",
  "not_site_actors",
  "stolen_work",
  "other",
]);
export const errorStatus = {
  INVALID_INPUT: 400,
  INVALID_CURSOR: 400,
  AUTH_REQUIRED: 401,
  OWNER_REQUIRED: 403,
  SCOPE_NOT_ALLOWED: 403,
  ORIGIN_NOT_ALLOWED: 403,
  METHOD_NOT_ALLOWED: 405,
  POST_UNAVAILABLE: 404,
  MEDIA_UNAVAILABLE: 404,
  OPERATION_UNAVAILABLE: 404,
  REVISION_CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  INVALID_STATE: 409,
  UPLOAD_EXPIRED: 410,
  FILE_TOO_LARGE: 413,
  POST_MEDIA_LIMIT: 413,
  UNSUPPORTED_MEDIA: 415,
  MEDIA_INVALID: 422,
  AUDIO_TOO_LONG: 422,
  VIDEO_URL_UNSUPPORTED: 422,
  RIGHTS_CONFIRMATION_REQUIRED: 422,
  POST_QUOTA_EXCEEDED: 429,
  UPLOAD_QUOTA_EXCEEDED: 429,
  RATE_LIMITED: 429,
  SUBMISSIONS_PAUSED: 503,
  COMMUNITY_UNAVAILABLE: 503,
  PROCESSING_UNAVAILABLE: 503,
} as const;
export const communityErrorCodeSchema = z.enum(
  Object.keys(errorStatus) as [keyof typeof errorStatus, ...(keyof typeof errorStatus)[]],
);
export const communityErrorSchema = z.strictObject({
  error: z.strictObject({
    code: communityErrorCodeSchema,
    retryable: z.boolean(),
    requestId: z.string().min(1).max(100),
    field: z
      .string()
      .regex(/^[a-zA-Z][a-zA-Z0-9.[\]_-]{0,79}$/)
      .optional(),
    retryAfterSeconds: z.number().int().nonnegative().optional(),
  }),
});
export type CommunityErrorCode = keyof typeof errorStatus;
export const actorReferenceSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
  assetVersion: z.string().regex(/^[A-Za-z0-9._-]{1,80}$/),
});
const actorReferencesSchema = z
  .array(actorReferenceSchema)
  .max(16)
  .refine((actors) => new Set(actors.map((actor) => actor.slug)).size === actors.length);
const instant = z.iso.datetime({ offset: true });
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const text = z.string().max(50000).nullable();
const httpsUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
});
/** An unsupported display avatar must not invalidate a saved work or an entire queue.
 * Omit inline account SVG and other non-HTTPS sources instead of rendering untrusted data.
 * Keep the identity, work, media URL and unknown-field validation strict.
 */
const displayAvatarUrl = z
  .string()
  .nullable()
  .transform((value) => {
    if (value === null) return null;
    try {
      return httpsUrl.parse(value);
    } catch {
      return null;
    }
  });
export const videoDescriptorSchema = z.strictObject({
  platform: z.enum(["youtube", "bilibili", "vimeo"]),
  externalId: z.string().min(1).max(100),
  canonicalUrl: httpsUrl,
});
const mediaShape = {
  id: z.uuid(),
  kind: z.enum(["image", "audio"]),
  sortOrder: count,
  altText: z.string().max(2000).nullable(),
};
const publicMediaSchema = z.strictObject(mediaShape);
const privateMediaSchema = z.strictObject({
  ...mediaShape,
  processingStatus: processingStatusSchema,
  reviewStatus: z.enum(["unreviewed", "approved", "rejected"]),
});
const postShape = {
  id: z.uuid(),
  revision: z.number().int().positive(),
  kind: communityKindSchema.nullable(),
  status: postStatusSchema,
  title: z.string().max(200).nullable(),
  description: text,
  recipe: text,
  tool: z.string().max(200).nullable(),
  actors: actorReferencesSchema,
  author: z.strictObject({
    id: z.uuid(),
    displayName: z.string().min(1).max(300),
    avatarUrl: displayAvatarUrl,
  }),
  media: z.array(publicMediaSchema),
  video: videoDescriptorSchema.nullable(),
  creditConfirmed: z.boolean(),
  rightsConfirmed: z.boolean(),
  official: z.boolean(),
  featuredAt: instant.nullable(),
  likeCount: count,
  viewerHasLiked: z.boolean(),
  createdAt: instant,
  updatedAt: instant,
  publishedAt: instant.nullable(),
};
export const publicPostSchema = z.strictObject({
  ...postShape,
  kind: communityKindSchema,
  status: z.literal("published"),
  title: z.string().trim().min(1).max(200),
  actors: actorReferencesSchema.refine((value) => value.length > 0),
  publishedAt: instant,
});
export const authorPostSchema = z.strictObject({
  ...postShape,
  media: z.array(privateMediaSchema),
  submittedAt: instant.nullable(),
  deletedAt: instant.nullable(),
  returnedReason: z.string().max(2000).nullable(),
  hiddenReason: z.string().max(2000).nullable(),
});
export const ownerPostSchema = authorPostSchema.extend({
  submittedRevision: count.nullable(),
  reportRound: count,
  legacyV1: z.boolean(),
  reportCount: count,
  reports: z.array(
    z.strictObject({
      round: count,
      reasonCode: reportReasonSchema,
      note: z.string().max(2000).nullable(),
      createdAt: instant,
    }),
  ),
  authorTrusted: z.boolean(),
  history: z.array(
    z.strictObject({
      action: z.string().max(80),
      source: z.string().max(80),
      reason: z.string().max(2000).nullable(),
      postRevision: count.nullable(),
      createdAt: instant,
    }),
  ),
});
export const limitsSchema = z.strictObject({
  limitsVersion: z.number().int().positive(),
  submissionsOpen: z.boolean(),
  limits: z.strictObject({
    imageCount: count.positive(),
    imageBytes: count.positive(),
    audioCount: count.positive(),
    audioBytes: count.positive(),
    audioDurationMs: count.positive(),
    dailyPosts: count.positive(),
    dailyUploadBytes: count.positive(),
  }),
  kinds: z.array(communityKindSchema),
  videoPlatforms: z.array(videoDescriptorSchema.shape.platform),
});
export const draftContentSchema = z
  .strictObject({
    kind: communityKindSchema,
    title: z.string().trim().max(200).nullable().optional(),
    description: text.optional(),
    recipe: text.optional(),
    tool: z.string().trim().max(200).nullable().optional(),
    actors: actorReferencesSchema.optional(),
    videoUrl: z.string().min(1).max(2048).optional(),
  })
  .refine((value) => value.kind === "video" || value.videoUrl === undefined);
export const submitConfirmationSchema = z.strictObject({
  creditConfirmed: z.literal(true),
  rightsConfirmed: z.literal(true),
  termsVersion: z.string().trim().min(1).max(100),
});
export const uploadStatusSchema = z.strictObject({
  uploadId: z.uuid(),
  mediaId: z.uuid().nullable(),
  status: z.enum(["issued", "finalizing", "completed", "failed", "expired"]),
  processingStatus: processingStatusSchema.nullable(),
  expiresAt: instant.optional(),
  failureCode: communityErrorCodeSchema.nullable().optional(),
});
export const uploadInputSchema = z.strictObject({
  mime: z.enum(["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "audio/mp4"]),
  bytes: count.positive(),
  durationMs: count.positive().optional(),
  sortOrder: count.max(63).optional(),
});
export const likeResultSchema = z.strictObject({ count, liked: z.boolean() });
export const voteResultSchema = z.strictObject({ count, voted: z.boolean() });
export const operationStatusSchema = z.strictObject({
  operationId: z.uuid(),
  status: z.enum(["accepted", "processing", "succeeded", "failed"]),
  resourceId: z.uuid().nullable().optional(),
  resultCode: communityErrorCodeSchema.nullable().optional(),
});
export const communityPostsResponseSchema = z.strictObject({
  posts: z.array(publicPostSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
export const communityPostResponseSchema = z.strictObject({ post: publicPostSchema });
export type CommunityPost = z.infer<typeof publicPostSchema>;
export type AuthorPost = z.infer<typeof authorPostSchema>;
export type OwnerPost = z.infer<typeof ownerPostSchema>;
export type CommunityLimits = z.infer<typeof limitsSchema>;
export type DraftContent = z.infer<typeof draftContentSchema>;
export type UploadStatus = z.infer<typeof uploadStatusSchema>;
export type VideoDescriptor = z.infer<typeof videoDescriptorSchema>;
export type ReportReason = z.infer<typeof reportReasonSchema>;
