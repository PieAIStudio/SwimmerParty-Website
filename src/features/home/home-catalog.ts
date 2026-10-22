import type { Actor } from "../../content/actors/index.ts";
import type { OfficialSample } from "../../content/official-samples.generated.ts";

type HomeActor = Pick<Actor, "slug" | "status" | "versionDate" | "versionNote"> &
  Partial<Pick<Actor, "spec" | "voiceLanguage">>;

/** Editorial selection of published data only. Does not manufacture releases or sample IDs. */
export function selectHomeContent<T extends HomeActor>(
  actors: readonly T[],
  samples: readonly OfficialSample[],
) {
  const ready = actors.filter((actor) => actor.status === "active");
  const newFaces = actors.filter((actor) => actor.status === "new-face");
  // Broaden the first look using authored language/origin, never inferred ethnicity.
  const firstFace = newFaces[0];
  const origin = (actor: T) => actor.spec?.find((field) => field.id === "origin")?.value.en;
  const secondFace = firstFace
    ? (newFaces.find(
        (actor) =>
          actor !== firstFace &&
          actor.voiceLanguage &&
          firstFace.voiceLanguage &&
          actor.voiceLanguage !== firstFace.voiceLanguage &&
          origin(actor) &&
          origin(actor) !== origin(firstFace),
      ) ??
      newFaces.find(
        (actor) => actor !== firstFace && origin(actor) && origin(actor) !== origin(firstFace),
      ) ??
      newFaces[1])
    : undefined;
  const featuredFaces = [firstFace, secondFace].filter((actor): actor is T => Boolean(actor));
  const playable = samples.flatMap((sample) => {
    const actor = ready.find((candidate) => candidate.slug === sample.slug);
    return actor && sample.video ? [{ actor, sample }] : [];
  });
  // Outside the same-face comparison, feature each actor only once.
  const shownActors = new Set<string>();
  const uniquePlayable = playable.filter(({ actor }) => {
    if (shownActors.has(actor.slug)) return false;
    shownActors.add(actor.slug);
    return true;
  });
  const hero = uniquePlayable[0] ?? null;
  const comparison = hero
    ? playable.find(
        ({ actor, sample }) =>
          actor.slug === hero.actor.slug && sample.tools.at(-1) !== hero.sample.tools.at(-1),
      )
    : undefined;
  const heroSamples = hero ? [hero, ...(comparison ? [comparison] : [])] : [];
  const updates = actors
    .filter((actor) => actor.versionDate && actor.versionNote)
    .slice()
    .sort((a, b) => (b.versionDate ?? "").localeCompare(a.versionDate ?? ""))
    .slice(0, 3);
  return {
    ready,
    newFaces,
    featuredFaces,
    hero,
    heroSamples,
    featured: uniquePlayable.slice(1, 3),
    updates,
  };
}
