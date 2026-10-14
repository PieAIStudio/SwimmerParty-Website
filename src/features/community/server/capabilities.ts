import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { communityMode } from "../../../contracts/community-access.ts";
import { runtimeModes, siteOrigin } from "../../../config/server.ts";
import { requireSameOrigin } from "../../../lib/server/api.ts";
import { CommunityError } from "../errors.ts";
import { remoteContext, requireCommunityEnabled, type CommunityContext } from "./context.ts";
import { requireCommunityAudience, verifiedCommunityOwner } from "./access.ts";
import { communityFailure } from "./gateway.ts";
import { edgeContracts } from "./edge.ts";

type Resolve = (req: NextApiRequest, res: NextApiResponse, id: string) => Promise<CommunityContext>;
export function createCapabilityRoute(kind: "target" | "media", resolve: Resolve = remoteContext) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const id = randomUUID();
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    try {
      requireCommunityEnabled();
      if (req.method !== "POST") throw new CommunityError("METHOD_NOT_ALLOWED");
      try {
        requireSameOrigin(req, runtimeModes().account, siteOrigin());
      } catch {
        throw new CommunityError("ORIGIN_NOT_ALLOWED");
      }
      const body = edgeContracts[kind].input.safeParse(req.body);
      if (!body.success) throw new CommunityError("INVALID_INPUT");
      const pathId = kind === "target" ? req.query.uploadId : req.query.mediaId;
      const bodyId = "uploadId" in body.data ? body.data.uploadId : body.data.mediaId;
      if (pathId !== bodyId) throw new CommunityError("INVALID_INPUT");
      const context = await resolve(req, res, id);
      await requireCommunityAudience(context);
      if (!context.edge) throw new CommunityError("PROCESSING_UNAVAILABLE");
      const output =
        kind === "target"
          ? await context.edge("target", body.data as { uploadId: string })
          : await context.edge("media", body.data as { mediaId: string; mode: "read" | "review" });
      res.status(200).json(output);
    } catch (error) {
      // Media absence, visibility and authority refusals must not become an existence oracle.
      const refusal =
        kind === "media" &&
        error instanceof CommunityError &&
        ["AUTH_REQUIRED", "OWNER_REQUIRED", "SCOPE_NOT_ALLOWED", "POST_UNAVAILABLE"].includes(
          error.code,
        )
          ? new CommunityError("MEDIA_UNAVAILABLE", { requestId: id })
          : error;
      communityFailure(res, refusal, id);
    }
  };
}
export function createAccessRoute(resolve: Resolve = remoteContext) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    if (req.method !== "GET")
      return communityFailure(res, new CommunityError("METHOD_NOT_ALLOWED"), randomUUID());
    const mode = communityMode(process.env.NEXT_PUBLIC_COMMUNITY_MODE);
    let owner = false;
    if (mode !== "off" && req.headers.cookie) {
      try {
        owner = await verifiedCommunityOwner(await resolve(req, res, randomUUID()));
      } catch {
        /* A failed authority check is not a local Owner. */
      }
    }
    res.status(200).json({ mode, allowed: mode === "on" || (mode === "owner" && owner), owner });
  };
}
export const uploadTarget = createCapabilityRoute("target");
export const mediaPreview = createCapabilityRoute("media");
export const access = createAccessRoute();
