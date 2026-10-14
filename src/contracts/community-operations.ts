import { z } from "zod";
import {
  actorReferenceSchema,
  authorPostSchema,
  communityKindSchema,
  communityPostResponseSchema,
  communityPostsResponseSchema,
  draftContentSchema,
  likeResultSchema,
  limitsSchema,
  operationStatusSchema,
  ownerPostSchema,
  postStatusSchema,
  reportReasonSchema,
  submitConfirmationSchema,
  uploadInputSchema,
  uploadStatusSchema,
  videoDescriptorSchema,
  voteResultSchema,
} from "./community.ts";

const id = z.uuid();
const op = { operationId: id };
const post = { postId: id };
const revision = { ...post, expectedRevision: z.number().int().positive() };
const empty = z.strictObject({});
const cursor = {
  cursor: z.string().max(4096).nullable().optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
};
const postResult = z.strictObject({ post: authorPostSchema, operationId: id });
const ownerResult = z.strictObject({ post: ownerPostSchema, operationId: id });
const authorPage = z.strictObject({
  posts: z.array(authorPostSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
const ownerPage = z.strictObject({
  posts: z.array(ownerPostSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
const reason = z.string().trim().min(1).max(2000);
/** Only these caller operations can cross the website boundary. No service_* or table access. */
export const communityOperations = {
  get_limits: { access: "public", write: false, input: empty, output: limitsSchema },
  // Website-only bounded aggregation of the existing get_actor_votes RPC, not an invented remote operation.
  list_actor_votes: {
    access: "public",
    write: false,
    input: empty,
    output: z.strictObject({
      votes: z.array(
        z.strictObject({
          actorSlug: actorReferenceSchema.shape.slug,
          count: z.number().int().nonnegative(),
        }),
      ),
    }),
  },

  list_posts: {
    access: "public",
    write: false,
    input: z.strictObject({
      ...cursor,
      filter: z
        .strictObject({
          kind: communityKindSchema.optional(),
          actorSlug: actorReferenceSchema.shape.slug.optional(),
          tool: z.string().max(200).optional(),
          platform: videoDescriptorSchema.shape.platform.optional(),
          q: z.string().max(100).optional(),
          sort: z.enum(["latest", "likes", "featured"]).optional(),
        })
        .optional(),
    }),
    output: communityPostsResponseSchema,
  },
  get_post: {
    access: "public",
    write: false,
    input: z.strictObject(post),
    output: communityPostResponseSchema,
  },
  list_my_posts: {
    access: "member",
    write: false,
    input: z.strictObject({ ...cursor, status: postStatusSchema.nullable().optional() }),
    output: authorPage,
  },
  get_my_post: {
    access: "member",
    write: false,
    input: z.strictObject(post),
    output: z.strictObject({ post: authorPostSchema }),
  },
  create_draft: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, content: draftContentSchema }),
    output: postResult,
  },
  update_draft: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, ...revision, content: draftContentSchema }),
    output: postResult,
  },
  submit_post: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, ...revision, confirmation: submitConfirmationSchema }),
    output: postResult,
  },
  create_upload: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, ...revision, file: uploadInputSchema }),
    output: uploadStatusSchema,
  },
  // Website capability for swimmer-party-upload-complete; never a direct finalize_upload RPC.
  complete_upload: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, uploadId: id }),
    output: uploadStatusSchema,
  },
  get_upload_status: {
    access: "member",
    write: false,
    input: z.strictObject({ uploadId: id }),
    output: uploadStatusSchema,
  },
  get_operation: {
    access: "member",
    write: false,
    input: z.strictObject({
      ...op,
      operation: z.enum([
        "create_draft",
        "update_draft",
        "submit_post",
        "set_like",
        "set_actor_vote",
        "report_post",
        "delete_post",
        "review_post",
        "set_author_trust",
        "set_submission_paused",
        "set_limits",
        "set_post_featured",
      ]),
    }),
    output: operationStatusSchema,
  },
  set_like: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, ...post, liked: z.boolean() }),
    output: likeResultSchema,
  },
  set_actor_vote: {
    access: "member",
    write: true,
    input: z.strictObject({
      ...op,
      actorSlug: actorReferenceSchema.shape.slug,
      voted: z.boolean(),
    }),
    output: voteResultSchema,
  },
  get_actor_votes: {
    access: "public",
    write: false,
    input: z.strictObject({ actorSlug: actorReferenceSchema.shape.slug }),
    output: voteResultSchema.extend({ actorSlug: actorReferenceSchema.shape.slug }),
  },
  report_post: {
    access: "member",
    write: true,
    input: z.strictObject({
      ...op,
      ...post,
      reasonCode: reportReasonSchema,
      note: z.string().trim().max(2000).nullable().optional(),
    }),
    output: z.strictObject({ ...op, status: z.literal("received") }),
  },
  delete_post: {
    access: "member",
    write: true,
    input: z.strictObject({ ...op, ...revision }),
    output: z.strictObject({ ...op, status: z.literal("deleting") }),
  },
  list_review_queue: {
    access: "owner",
    write: false,
    input: z.strictObject({
      ...cursor,
      status: z.enum(["pending", "hidden", "returned", "published"]).nullable().optional(),
    }),
    output: ownerPage,
  },
  get_review_detail: {
    access: "owner",
    write: false,
    input: z.strictObject(post),
    output: z.strictObject({ post: ownerPostSchema }),
  },
  review_post: {
    access: "owner",
    write: true,
    input: z
      .strictObject({
        ...op,
        ...revision,
        action: z.enum(["approve", "return", "hide", "restore"]),
        reason: reason.nullable(),
      })
      .refine((value) => value.action === "approve" || value.reason !== null),
    output: ownerResult,
  },
  set_author_trust: {
    access: "owner",
    write: true,
    input: z.strictObject({ ...op, userId: id, trusted: z.boolean(), reason: reason.max(1000) }),
    output: z.strictObject({
      ...op,
      userId: id,
      trusted: z.boolean(),
      status: z.enum(["trusted", "revoked"]),
    }),
  },
  set_submission_paused: {
    access: "owner",
    write: true,
    input: z.strictObject({ ...op, paused: z.boolean(), reason: reason.max(500) }),
    output: z.strictObject({ ...op, submissionsOpen: z.boolean() }),
  },
} as const;
export type CommunityOperation = keyof typeof communityOperations;
export type OperationInput<K extends CommunityOperation> = z.input<
  (typeof communityOperations)[K]["input"]
>;
export type OperationOutput<K extends CommunityOperation> = z.output<
  (typeof communityOperations)[K]["output"]
>;
export type WriteOperation = {
  [K in CommunityOperation]: (typeof communityOperations)[K]["write"] extends true ? K : never;
}[CommunityOperation];
export function isCommunityOperation(value: string): value is CommunityOperation {
  return Object.prototype.hasOwnProperty.call(communityOperations, value);
}
export type CommunityCall = <K extends CommunityOperation>(
  operation: K,
  input: OperationInput<K>,
  signal?: AbortSignal,
) => Promise<OperationOutput<K>>;
