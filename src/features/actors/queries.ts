import { ACTORS, type Actor } from "../../content/actors/index.ts";

/** Pure catalog queries; safe for API handlers without importing actor UI. */
export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((actor) => actor.slug === slug);
}
