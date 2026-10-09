import { ACTORS, type Actor } from "../../content/actors/index.ts";

/** Pure catalog queries; safe for API handlers without importing actor UI. */
export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((actor) => actor.slug === slug);
}
export function latestActors(limit = 5): Actor[] {
  return ACTORS.filter((actor) => actor.versionDate)
    .slice()
    .sort((a, b) => (b.versionDate ?? "").localeCompare(a.versionDate ?? ""))
    .slice(0, limit);
}
