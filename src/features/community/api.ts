import {
  communityOperations,
  type CommunityCall,
  type OperationInput,
  type OperationOutput,
  type WriteOperation,
} from "../../contracts/community-operations.ts";
import { CommunityError, responseError } from "./errors.ts";

export const callCommunity: CommunityCall = async (operation, input, signal) => {
  const definition = communityOperations[operation];
  const parsed = definition.input.safeParse(input);
  if (!parsed.success) throw new CommunityError("INVALID_INPUT");
  let response: Response;
  try {
    const path = `/api/community/v3/${operation}`;
    response = await fetch(
      definition.write ? path : `${path}?input=${encodeURIComponent(JSON.stringify(parsed.data))}`,
      {
        method: definition.write ? "POST" : "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
          : AbortSignal.timeout(20000),
        ...(definition.write
          ? { headers: { "content-type": "application/json" }, body: JSON.stringify(parsed.data) }
          : {}),
      },
    );
  } catch {
    throw new CommunityError("COMMUNITY_UNAVAILABLE", { uncertain: definition.write });
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw responseError(body, response.status);
  const result = definition.output.safeParse(body);
  if (!result.success)
    throw new CommunityError("COMMUNITY_UNAVAILABLE", { uncertain: definition.write });
  return result.data as never;
};

/** A caller retains this attempt until an explicit result or reconciliation. Never change IDs after a lost reply. */
export type PendingWrite = {
  operation: WriteOperation;
  input: Record<string, unknown>;
  operationId: string;
  /** Local recovery metadata only; it is never forwarded to an RPC. */
  resourceId?: string;
};
function resourceId(value: unknown): string | undefined {
  const result = communityOperations.get_post.input.safeParse({ postId: value });
  return result.success ? result.data.postId : undefined;
}
/** Stable per-tab composer journal: a newly assigned draft URL must not orphan an upload operation. */
export const COMPOSER_WRITE_SCOPE = "composer";
export class WriteSession {
  private pending: PendingWrite | null = null;
  private resourceId?: string;
  private readonly key: string;
  private storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
  constructor(
    userId: string,
    scope: string,
    storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  ) {
    this.key = `sp-community-v3:${userId}:${scope}`;
    this.storage = storage;
    try {
      const data: unknown = JSON.parse(storage?.getItem(this.key) ?? "null");
      if (data && typeof data === "object") {
        const saved = data as PendingWrite;
        const def = communityOperations[saved.operation];
        if (
          def?.write &&
          def.input.safeParse(saved.input).success &&
          saved.input.operationId === saved.operationId
        ) {
          this.resourceId = resourceId(saved.input.postId) ?? resourceId(saved.resourceId);
          this.pending = {
            operation: saved.operation,
            operationId: saved.operationId,
            input: saved.input,
            resourceId: this.resourceId,
          };
        }
      }
    } catch {
      /* Storage denial leaves a request-local journal, not fabricated success. */
    }
  }
  snapshot() {
    return this.pending;
  }
  private save() {
    try {
      if (this.pending) this.storage?.setItem(this.key, JSON.stringify(this.pending));
      else this.storage?.removeItem(this.key);
    } catch {
      /* Preserve this instance's journal. */
    }
  }
  async execute<K extends WriteOperation>(
    operation: K,
    input: Omit<OperationInput<K>, "operationId">,
    call: CommunityCall = callCommunity,
    signal?: AbortSignal,
  ): Promise<OperationOutput<K>> {
    if (this.pending) throw new CommunityError("INVALID_STATE", { uncertain: true });
    const operationId = crypto.randomUUID();
    const payload = { ...input, operationId };
    if (!communityOperations[operation].input.safeParse(payload).success)
      throw new CommunityError("INVALID_INPUT");
    this.resourceId =
      resourceId((payload as Record<string, unknown>).postId) ??
      (operation === "create_draft" ? undefined : this.resourceId);
    this.pending = { operation, operationId, input: payload, resourceId: this.resourceId };
    this.save();
    return this.retry(call, signal) as Promise<OperationOutput<K>>;
  }
  async retry(call: CommunityCall = callCommunity, signal?: AbortSignal) {
    const pending = this.pending;
    if (!pending) throw new CommunityError("INVALID_STATE");
    // Reconcile first. A missing operation does NOT authorize a new key.
    if (pending.operation !== "create_upload" && pending.operation !== "complete_upload") {
      try {
        await call(
          "get_operation",
          { operation: pending.operation, operationId: pending.operationId },
          signal,
        );
      } catch (error) {
        if (
          !(error instanceof CommunityError) ||
          !["OPERATION_UNAVAILABLE", "INVALID_INPUT"].includes(error.code)
        )
          throw error;
      }
    }
    try {
      const result = await call(
        pending.operation,
        pending.input as OperationInput<WriteOperation>,
        signal,
      );
      if ("post" in result) this.resourceId = resourceId(result.post.id) ?? this.resourceId;
      this.pending = null;
      this.save();
      return result;
    } catch (error) {
      // Semantic denials have an unambiguous response. Retain uncertain/transient attempts, including IDs.
      if (
        error instanceof CommunityError &&
        !error.uncertain &&
        !error.retryable &&
        error.status < 500
      ) {
        this.pending = null;
        this.save();
      }
      throw error;
    }
  }
}
