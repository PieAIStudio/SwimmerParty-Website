import { z } from "zod";
import {
  uploadTargetResponseSchema,
  mediaReadResponseSchema,
} from "../../../contracts/community-transfer.ts";
import { uploadStatusSchema } from "../../../contracts/community.ts";
import { CommunityError, responseError } from "../errors.ts";
/** Exact caller-facing B2 functions. No service_* RPC, executor, arbitrary URL or finalize shortcut. */
export const edgeContracts = {
  target: {
    name: "swimmer-party-upload-target",
    input: z.strictObject({ uploadId: z.uuid() }),
    output: uploadTargetResponseSchema,
  },
  complete: {
    name: "swimmer-party-upload-complete",
    input: z.strictObject({ uploadId: z.uuid(), operationId: z.uuid() }),
    output: uploadStatusSchema,
  },
  media: {
    name: "swimmer-party-media-preview",
    input: z.strictObject({ mediaId: z.uuid(), mode: z.enum(["read", "review"]) }),
    output: mediaReadResponseSchema,
  },
} as const;
type EdgeOperation = keyof typeof edgeContracts;
export type EdgeTransport = (
  name: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
) => Promise<{ data: unknown; error: unknown; response?: Response }>;
export type EdgeCall = <K extends EdgeOperation>(
  operation: K,
  body: z.input<(typeof edgeContracts)[K]["input"]>,
  signal?: AbortSignal,
) => Promise<z.output<(typeof edgeContracts)[K]["output"]>>;
export function createCommunityEdge(
  transport: EdgeTransport,
  userId: string | null,
  requestId: string,
): EdgeCall {
  return async (operation, input, signal) => {
    const contract = edgeContracts[operation];
    const body = contract.input.safeParse(input);
    if (!body.success) throw new CommunityError("INVALID_INPUT", { requestId });
    if ((operation !== "media" || (body.data as { mode?: string }).mode === "review") && !userId)
      throw new CommunityError(operation === "media" ? "MEDIA_UNAVAILABLE" : "AUTH_REQUIRED", {
        requestId,
      });
    let result;
    try {
      result = await transport(contract.name, body.data, signal);
    } catch (error) {
      if (error instanceof CommunityError) throw error;
      throw new CommunityError("PROCESSING_UNAVAILABLE", {
        requestId,
        uncertain: operation === "complete",
      });
    }
    if (result.error || (result.response && !result.response.ok)) {
      // SDK error context may contain provider text: only parse the fixed envelope and never retain a signed URL.
      const envelope = result.response ? await result.response.json().catch(() => null) : null;
      throw responseError(envelope, result.response?.status ?? 503, requestId);
    }
    const output = contract.output.safeParse(result.data);
    if (!output.success)
      throw new CommunityError("PROCESSING_UNAVAILABLE", {
        requestId,
        uncertain: operation === "complete",
      });
    if (
      "uploadId" in output.data &&
      output.data.uploadId !== (body.data as { uploadId?: string }).uploadId
    )
      throw new CommunityError("PROCESSING_UNAVAILABLE", { requestId });
    if (
      "mediaId" in body.data &&
      "mediaId" in output.data &&
      body.data.mediaId !== output.data.mediaId
    )
      throw new CommunityError("MEDIA_UNAVAILABLE", { requestId });
    return output.data as never;
  };
}
