import type { IncomingMessage, ServerResponse } from "node:http";
import { communityMode } from "../../../contracts/community-access.ts";
import { siteOrigin } from "../../../config/server.ts";
import { createCommunityEdge, type EdgeCall } from "./edge.ts";
import { createClient } from "@supabase/supabase-js";
import { swimmerAccount } from "../../account/server/index.ts";
import { runtimeModes } from "../../../config/server.ts";
import { CommunityError } from "../errors.ts";
import { createRemoteCommunity } from "./remote.ts";
import type { CommunityCall } from "../../../contracts/community-operations.ts";

export type CommunityContext = { call: CommunityCall; userId: string | null; edge?: EdgeCall };
export function requireCommunityEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  if (communityMode(env.NEXT_PUBLIC_COMMUNITY_MODE) === "off")
    throw new CommunityError("COMMUNITY_UNAVAILABLE");
}
/** Each request owns its verified AuthKit data client. No browser-supplied identity, service key or memory fallback. */
export async function remoteContext(
  req: IncomingMessage,
  res: ServerResponse,
  requestId: string,
): Promise<CommunityContext> {
  requireCommunityEnabled();
  const modes = runtimeModes();
  if (modes.account !== "swimmer") throw new CommunityError("COMMUNITY_UNAVAILABLE", { requestId });
  const url = process.env.SWIMMER_BACKEND_URL;
  const key = process.env.SWIMMER_PUBLISHABLE_KEY;
  if (!url || !key || !/^https:\/\/[a-z0-9.-]+\/?$/i.test(url))
    throw new CommunityError("COMMUNITY_UNAVAILABLE", { requestId });
  const auth = req.headers.cookie ? await swimmerAccount(req, res) : null;
  const user = auth ? await auth.verifiedUser() : null;
  const userId = user?.is_anonymous === false ? user.id : null;
  const client =
    userId && auth
      ? auth.client
      : createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });
  // AuthKit and the local SDK carry distinct nominal generics. Narrow only the method surface; DTOs remain runtime-validated.
  const scoped = client as unknown as {
    schema(name: string): {
      rpc(
        name: string,
        args: Record<string, unknown>,
      ): { abortSignal(signal: AbortSignal): PromiseLike<{ data: unknown; error: unknown }> };
    };
  };
  const functions = client.functions as unknown as {
    invoke(
      name: string,
      options: {
        body: Record<string, unknown>;
        headers: Record<string, string>;
        method: "POST";
        signal: AbortSignal;
      },
    ): Promise<{ data: unknown; error: unknown; response?: Response }>;
  };
  const edge = createCommunityEdge(
    async (name, body, signal) => {
      // Forward the actual validated browser origin, never disguise a preview/local request as production.
      const origin = req.headers.origin;
      if (
        typeof origin !== "string" ||
        origin !== siteOrigin() ||
        req.headers.host !== new URL(origin).host ||
        req.headers["sec-fetch-site"] === "cross-site"
      )
        throw new CommunityError("ORIGIN_NOT_ALLOWED", { requestId });
      return functions.invoke(name, {
        body,
        method: "POST",
        headers: { Origin: origin },
        signal: signal ?? AbortSignal.timeout(20000),
      });
    },
    userId,
    requestId,
  );
  const call = createRemoteCommunity(
    async (name, args, signal) => {
      const query = scoped.schema("swimmer_party").rpc(name, args);
      return await query.abortSignal(signal ?? AbortSignal.timeout(15000));
    },
    userId,
    requestId,
    edge,
  );
  return { call, userId, edge };
}
