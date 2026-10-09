import type { Actor, ActorStatus, L } from "./shared.ts";
export type { Actor, ActorGender, ActorStatus, L } from "./shared.ts";
import { ACTIVE_ACTORS } from "./active.generated.ts";
import { NEW_FACE_ACTORS } from "./new-face-profiles.generated.ts";

export const ACTORS: Actor[] = [...ACTIVE_ACTORS, ...NEW_FACE_ACTORS];
export const STATUS_LABEL: Record<ActorStatus, L> = {
  active: { en: "Ready to cast", zh: "可出演" },
  "new-face": { en: "New face", zh: "新面孔" },
  "in-development": { en: "In development", zh: "制作中" },
  concept: { en: "Concept", zh: "概念" },
};
export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((actor) => actor.slug === slug);
}
export function latestActors(limit = 5): Actor[] {
  return ACTORS.filter((actor) => actor.versionDate)
    .slice()
    .sort((a, b) => (b.versionDate ?? "").localeCompare(a.versionDate ?? ""))
    .slice(0, limit);
}
