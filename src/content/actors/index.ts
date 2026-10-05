import type { Actor, ActorStatus, L } from "./shared.ts";
export type { Actor, ActorStatus, L } from "./shared.ts";
import { profile as actor0 } from "./tang-yunqiu/profile.ts";
import { profile as actor1 } from "./misha-luo/profile.ts";
export const ACTORS: Actor[] = [actor0, actor1];

export const STATUS_LABEL: Record<ActorStatus, L> = {
  active: { en: "CASTABLE", zh: "可出演" },
  "in-development": { en: "IN DEVELOPMENT", zh: "研发中" },
  concept: { en: "CONCEPT", zh: "概念" },
};

export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((a) => a.slug === slug);
}
