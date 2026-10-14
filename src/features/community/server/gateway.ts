import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { requireCommunityAudience } from "./access.ts";
import {
  communityOperations,
  isCommunityOperation,
} from "../../../contracts/community-operations.ts";
import { runtimeModes, siteOrigin } from "../../../config/server.ts";
import { requireSameOrigin } from "../../../lib/server/api.ts";
import { CommunityError, asCommunityError } from "../errors.ts";
import { remoteContext, requireCommunityEnabled, type CommunityContext } from "./context.ts";

type Resolve = (
  req: NextApiRequest,
  res: NextApiResponse,
  requestId: string,
) => Promise<CommunityContext>;
export function communityFailure(res: NextApiResponse, error: unknown, requestId: string) {
  if (res.writableEnded) return;
  const safe = asCommunityError(error);
  res.status(safe.status).json({
    error: {
      code: safe.code,
      retryable: safe.retryable,
      requestId,
      ...(safe.retryAfterSeconds === undefined
        ? {}
        : { retryAfterSeconds: safe.retryAfterSeconds }),
    },
  });
}
export function createCommunityGateway(resolve: Resolve = remoteContext) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = randomUUID();
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    try {
      requireCommunityEnabled();
      const operation = typeof req.query.operation === "string" ? req.query.operation : "";
      if (!isCommunityOperation(operation)) throw new CommunityError("INVALID_INPUT");
      const definition = communityOperations[operation];
      if (req.method !== (definition.write ? "POST" : "GET")) {
        res.setHeader("Allow", definition.write ? "POST" : "GET");
        throw new CommunityError("METHOD_NOT_ALLOWED");
      }
      if (definition.write) {
        try {
          requireSameOrigin(req, runtimeModes().account, siteOrigin());
        } catch {
          throw new CommunityError("ORIGIN_NOT_ALLOWED");
        }
      }
      let input: unknown;
      if (definition.write) input = req.body;
      else {
        const serialized = typeof req.query.input === "string" ? req.query.input : "{}";
        if (serialized.length > 16000) throw new CommunityError("INVALID_INPUT");
        try {
          input = JSON.parse(serialized);
        } catch {
          throw new CommunityError("INVALID_INPUT");
        }
      }
      const parsed = definition.input.safeParse(input);
      if (!parsed.success) throw new CommunityError("INVALID_INPUT");
      const context = await resolve(req, res, requestId);
      await requireCommunityAudience(context);
      if (definition.access !== "public" && !context.userId)
        throw new CommunityError("AUTH_REQUIRED");
      const result = await context.call(operation, parsed.data as never);
      const checked = definition.output.safeParse(result);
      if (!checked.success) throw new CommunityError("COMMUNITY_UNAVAILABLE");
      res.status(200).json(checked.data);
    } catch (error) {
      communityFailure(res, error, requestId);
    }
  };
}
export const gateway = createCommunityGateway();
