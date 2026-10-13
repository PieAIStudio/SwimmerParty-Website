import { existsSync } from "node:fs";
import { loadavg } from "node:os";

/** Optional operator scheduling fence; never starts a poller or removes another task's lock. */
export function checkMediaWorkSlot() {
  const lock = process.env.SWIMMER_MEDIA_BLOCKING_LOCK;
  const limit = process.env.SWIMMER_MEDIA_MAX_LOAD;
  if (lock && existsSync(lock))
    throw new Error(`Media work deferred: blocking lock exists (${lock})`);
  if (limit !== undefined) {
    const max = Number(limit);
    if (!Number.isFinite(max) || max < 0) throw new Error("Invalid media load ceiling");
    if (loadavg()[0] > max) throw new Error(`Media work deferred: load exceeds ${max}`);
  }
}
