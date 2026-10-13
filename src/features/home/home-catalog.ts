import type { Actor } from "../../content/actors/index.ts";
import type { OfficialSample } from "../../content/official-samples.generated.ts";

type HomeActor = Pick<Actor, "slug" | "status" | "versionDate" | "versionNote">;

/** Editorial selection of published data only. Does not manufacture releases or sample IDs. */
export function selectHomeContent<T extends HomeActor>(
  actors: readonly T[],
  samples: readonly OfficialSample[],
) {
  const ready = actors.filter((actor) => actor.status === "active");
  const newFaces = actors.filter((actor) => actor.status === "new-face");
  const playable = samples.flatMap((sample) => {
    const actor = ready.find((candidate) => candidate.slug === sample.slug);
    return actor && sample.video ? [{ actor, sample }] : [];
  });
  const updates = actors
    .filter((actor) => actor.versionDate && actor.versionNote)
    .slice()
    .sort((a, b) => (b.versionDate ?? "").localeCompare(a.versionDate ?? ""))
    .slice(0, 3);
  return { ready, newFaces, hero: playable[0] ?? null, featured: playable.slice(1, 3), updates };
}
