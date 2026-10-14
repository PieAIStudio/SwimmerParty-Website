import {
  communityErrorCodeSchema,
  communityErrorSchema,
  errorStatus,
  type CommunityErrorCode,
} from "../../contracts/community.ts";

export class CommunityError extends Error {
  readonly code: CommunityErrorCode;
  readonly retryable: boolean;
  readonly requestId: string;
  readonly uncertain: boolean;
  readonly retryAfterSeconds?: number;
  constructor(
    code: CommunityErrorCode,
    options: {
      retryable?: boolean;
      requestId?: string;
      uncertain?: boolean;
      retryAfterSeconds?: number;
    } = {},
  ) {
    super(code);
    this.name = "CommunityError";
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.requestId = options.requestId ?? "local";
    this.uncertain = options.uncertain ?? false;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
  get status() {
    return errorStatus[this.code];
  }
}
/** Never use provider text as a UI message, log entry, or request ID. */
export function asCommunityError(value: unknown): CommunityError {
  return value instanceof CommunityError ? value : new CommunityError("COMMUNITY_UNAVAILABLE");
}
export function responseError(
  value: unknown,
  status: number,
  requestId = "transport",
): CommunityError {
  const parsed = communityErrorSchema.safeParse(value);
  if (parsed.success) return new CommunityError(parsed.data.error.code, parsed.data.error);
  return new CommunityError(
    status === 401
      ? "AUTH_REQUIRED"
      : status === 403
        ? "SCOPE_NOT_ALLOWED"
        : "COMMUNITY_UNAVAILABLE",
    { requestId },
  );
}
/** PostgREST uses SQLSTATE in code and the stable v3 product code in message. */
export function rpcError(
  value: unknown,
  authenticated: boolean,
  ownerOperation: boolean,
  requestId: string,
): CommunityError {
  const body =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const code = communityErrorCodeSchema.safeParse(body.message);
  if (code.success)
    return new CommunityError(code.data, {
      requestId,
      retryable: ["COMMUNITY_UNAVAILABLE", "PROCESSING_UNAVAILABLE", "RATE_LIMITED"].includes(
        code.data,
      ),
    });
  if (body.code === "42501")
    return new CommunityError(
      !authenticated ? "AUTH_REQUIRED" : ownerOperation ? "OWNER_REQUIRED" : "SCOPE_NOT_ALLOWED",
      { requestId },
    );
  if (body.code === "PGRST301" || body.code === "PGRST303")
    return new CommunityError("AUTH_REQUIRED", { requestId });
  return new CommunityError("COMMUNITY_UNAVAILABLE", { requestId });
}
