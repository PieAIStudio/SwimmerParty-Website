const KINDS = ["download", "cast", "post", "vote"] as const;
export type FirstUseKind = (typeof KINDS)[number];
export function isFirstUseKind(value: unknown): value is FirstUseKind {
  return typeof value === "string" && (KINDS as readonly string[]).includes(value);
}
type SeenStorage = Pick<Storage, "getItem" | "setItem">;
/** Non-personal preference only; storage-denied browsers retain it for this page session. */
export function createFirstUseTracker(storage: () => SeenStorage) {
  const memory = new Set<FirstUseKind>();
  return {
    seen(kind: FirstUseKind): boolean {
      if (memory.has(kind)) return true;
      try {
        return storage().getItem(`sp-first-use-v1:${kind}`) === "seen";
      } catch {
        return false;
      }
    },
    markSeen(kind: FirstUseKind): void {
      memory.add(kind);
      try {
        storage().setItem(`sp-first-use-v1:${kind}`, "seen");
      } catch {
        /* The in-memory preference still avoids repeated notices in this session. */
      }
    },
  };
}
