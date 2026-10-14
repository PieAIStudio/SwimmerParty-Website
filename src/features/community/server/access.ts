import {
  communityOperations,
  type CommunityCall,
} from "../../../contracts/community-operations.ts";
import { communityMode } from "../../../contracts/community-access.ts";
import { CommunityError } from "../errors.ts";
export type CommunityAccessContext = { call: CommunityCall; userId: string | null };
/** An empty successful Owner queue still proves authority. A member cookie or local allow-list never does. */
export async function verifiedCommunityOwner(context: CommunityAccessContext): Promise<boolean> {
  if (!context.userId) return false;
  try {
    const result = await context.call("list_review_queue", { pageSize: 1 });
    return communityOperations.list_review_queue.output.safeParse(result).success;
  } catch {
    return false;
  }
}
export async function requireCommunityAudience(context: CommunityAccessContext) {
  const mode = communityMode(process.env.NEXT_PUBLIC_COMMUNITY_MODE);
  if (mode === "off") throw new CommunityError("COMMUNITY_UNAVAILABLE");
  if (mode === "owner" && !(await verifiedCommunityOwner(context)))
    throw new CommunityError("POST_UNAVAILABLE");
}
