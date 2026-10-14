import {
  communityOperations,
  type CommunityCall,
  type CommunityOperation,
  type OperationInput,
} from "../../../contracts/community-operations.ts";
import { CommunityError, rpcError } from "../errors.ts";

export type RpcTransport = (
  name: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
) => Promise<{ data: unknown; error: unknown }>;
/** These are the exact public invoker RPC parameters, not a general-purpose RPC proxy. */
export function rpcArguments<K extends CommunityOperation>(
  operation: K,
  input: OperationInput<K>,
): Record<string, unknown> {
  const p = communityOperations[operation].input.parse(input) as Record<string, unknown>;
  const op = { p_operation_id: p.operationId };
  const post = { p_post_id: p.postId };
  const rev = { ...post, p_expected_revision: p.expectedRevision };
  const page = { p_cursor: p.cursor ?? null, p_page_size: p.pageSize ?? 20 };
  switch (operation) {
    case "get_limits":
      return {};
    case "list_posts":
      return { ...page, p_filter: p.filter ?? {} };
    case "get_post":
    case "get_my_post":
    case "get_review_detail":
      return post;
    case "list_my_posts":
    case "list_review_queue":
      return { ...page, p_status: p.status ?? null };
    case "create_draft":
      return { ...op, p_input: p.content };
    case "update_draft":
      return { ...op, ...rev, p_input: p.content };
    case "submit_post":
      return { ...op, ...rev, p_input: p.confirmation };
    case "create_upload":
      return { ...op, ...rev, p_input: p.file };
    case "complete_upload":
      // B2's edge processor owns finalize + derived-media verification. No direct RPC shortcut.
      throw new CommunityError("PROCESSING_UNAVAILABLE");
    case "get_upload_status":
      return { p_upload_id: p.uploadId };
    case "get_operation":
      return { ...op, p_operation: p.operation };
    case "set_like":
      return { ...op, ...post, p_liked: p.liked };
    case "set_actor_vote":
      return { ...op, p_actor_slug: p.actorSlug, p_voted: p.voted };
    case "get_actor_votes":
      return { p_actor_slug: p.actorSlug };
    case "report_post":
      return { ...op, ...post, p_reason_code: p.reasonCode, p_note: p.note ?? null };
    case "delete_post":
      return { ...op, ...rev };
    case "review_post":
      return { ...op, ...rev, p_action: p.action, p_reason: p.reason };
    case "set_author_trust":
      return { ...op, p_user_id: p.userId, p_trusted: p.trusted, p_reason: p.reason };
    case "set_submission_paused":
      return { ...op, p_paused: p.paused, p_reason: p.reason };
  }
  throw new CommunityError("INVALID_INPUT");
}
export function createRemoteCommunity(
  transport: RpcTransport,
  userId: string | null,
  requestId: string,
): CommunityCall {
  return async (operation, input, signal) => {
    const definition = communityOperations[operation];
    if (definition.access !== "public" && !userId)
      throw new CommunityError("AUTH_REQUIRED", { requestId });
    const parsed = definition.input.safeParse(input);
    if (!parsed.success) throw new CommunityError("INVALID_INPUT", { requestId });
    if (operation === "complete_upload")
      throw new CommunityError("PROCESSING_UNAVAILABLE", { requestId });
    let result;
    try {
      result = await transport(operation, rpcArguments(operation, input), signal);
    } catch {
      throw new CommunityError("COMMUNITY_UNAVAILABLE", { requestId, uncertain: definition.write });
    }
    if (result.error)
      throw rpcError(result.error, Boolean(userId), definition.access === "owner", requestId);
    const output = definition.output.safeParse(result.data);
    // Reject, rather than silently strip, an unsafe or unsupported projection.
    if (!output.success)
      throw new CommunityError("COMMUNITY_UNAVAILABLE", { requestId, uncertain: definition.write });
    return output.data as never;
  };
}
