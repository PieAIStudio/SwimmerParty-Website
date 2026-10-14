import { communityOperations } from "../../../contracts/community-operations.ts";
import type { RpcTransport } from "./remote.ts";
import { CommunityError, rpcError } from "../errors.ts";
/** No batch RPC exists: bounded concurrency, one pass, all-or-error (never crown a partial result). */
export async function collectActorVotes(
  transport: RpcTransport,
  slugs: string[],
  parent?: AbortSignal,
  requestId = "leaderboard",
) {
  if (slugs.length > 128) throw new CommunityError("COMMUNITY_UNAVAILABLE");
  const controller = new AbortController();
  const signal = AbortSignal.any([
    controller.signal,
    AbortSignal.timeout(15000),
    ...(parent ? [parent] : []),
  ]);
  const votes: { actorSlug: string; count: number }[] = [];
  let next = 0;
  try {
    await Promise.all(
      Array.from({ length: Math.min(4, slugs.length) }, async () => {
        while (next < slugs.length) {
          signal.throwIfAborted();
          const slug = slugs[next++];
          const result = await transport("get_actor_votes", { p_actor_slug: slug }, signal);
          if (result.error) throw rpcError(result.error, false, false, requestId);
          const parsed = communityOperations.get_actor_votes.output.safeParse(result.data);
          if (!parsed.success || parsed.data.actorSlug !== slug)
            throw new CommunityError("COMMUNITY_UNAVAILABLE");
          votes.push({ actorSlug: slug, count: parsed.data.count });
        }
      }),
    );
    return {
      votes: votes.sort((a, b) => b.count - a.count || a.actorSlug.localeCompare(b.actorSlug)),
    };
  } catch {
    controller.abort();
    throw new CommunityError("COMMUNITY_UNAVAILABLE", { requestId });
  }
}
