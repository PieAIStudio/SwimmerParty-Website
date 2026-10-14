import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { randomUUID } from "node:crypto";
import { communityMode, isCommunityPage } from "../../../contracts/community-access.ts";
import { remoteContext } from "./context.ts";
import { verifiedCommunityOwner, type CommunityAccessContext } from "./access.ts";

type Resolve = (
  request: IncomingMessage,
  response: ServerResponse,
  requestId: string,
) => Promise<CommunityAccessContext>;
/** Runs before route rendering (including RSC). Adapt only the transport to AuthKit; never parse its cookies ourselves. */
export async function communityPageAccess(
  request: Request,
  resolve: Resolve = remoteContext,
): Promise<{ allowed: boolean; cookies: string[] } | null> {
  if (!isCommunityPage(new URL(request.url).pathname)) return null;
  const mode = communityMode(process.env.NEXT_PUBLIC_COMMUNITY_MODE);
  if (mode === "on") return null;
  if (mode === "off" || !request.headers.get("cookie")) return { allowed: false, cookies: [] };
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.headers = Object.fromEntries(request.headers.entries());
  req.method = request.method;
  req.url = new URL(request.url).pathname;
  const res = new ServerResponse(req);
  let allowed = false;
  try {
    allowed = await verifiedCommunityOwner(await resolve(req, res, randomUUID()));
  } catch {
    /* Failed identity/backend checks never reveal an owner-only page. */
  }
  const header = res.getHeader("set-cookie");
  const cookies = Array.isArray(header)
    ? header.map(String)
    : typeof header === "string"
      ? [header]
      : [];
  socket.destroy();
  return { allowed, cookies };
}
