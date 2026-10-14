import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { swimmerAccount } from "../../account/server/index.ts";
import { runtimeModes } from "../../../config/server.ts";
import { CommunityError } from "../errors.ts";
import { createRemoteCommunity } from "./remote.ts";
import type { CommunityCall } from "../../../contracts/community-operations.ts";

export type CommunityContext = { call: CommunityCall; userId: string | null };
export function requireCommunityEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  if (env.NEXT_PUBLIC_COMMUNITY_ENABLED !== "1") throw new CommunityError("COMMUNITY_UNAVAILABLE");
}
/** Each request owns its verified AuthKit data client. No browser-supplied identity, service key or memory fallback. */
export async function remoteContext(
  req: NextApiRequest,
  res: NextApiResponse,
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
  const call = createRemoteCommunity(
    async (name, args, signal) => {
      const query = scoped.schema("swimmer_party").rpc(name, args);
      return await query.abortSignal(signal ?? AbortSignal.timeout(15000));
    },
    userId,
    requestId,
  );
  return { call, userId };
}
