import type { Actor, L } from "../../content/actors/index.ts";
import type { Work } from "../../content/works.ts";

export type ActorFacets = { origin: L; roles: string[]; voice: boolean; video: boolean };
export type ActorFilterState = {
  q: string;
  look: string;
  gender: string;
  age: string;
  language: string;
  origin: string;
  role: string;
  height: string;
  voice: boolean;
  video: boolean;
};
export const DEFAULT_ACTOR_FILTERS: ActorFilterState = {
  q: "",
  look: "",
  gender: "all",
  age: "all",
  language: "all",
  origin: "all",
  role: "all",
  height: "all",
  voice: false,
  video: false,
};
const CHOICES = {
  gender: ["all", "female", "male"],
  age: ["all", "under30", "30to45", "over45"],
  language: ["all", "en", "zh"],
  role: ["all", "comedy", "boss", "villain", "crew"],
  height: ["all", "under160", "160to179", "180plus"],
};
export function readActorFilters(search: string, origins: readonly string[]): ActorFilterState {
  const params = new URLSearchParams(search);
  const filters = { ...DEFAULT_ACTOR_FILTERS };
  for (const key of ["q", "look"] as const) filters[key] = (params.get(key) ?? "").slice(0, 120);
  for (const key of ["gender", "age", "language", "role", "height"] as const) {
    const value = params.get(key) ?? "all";
    filters[key] = CHOICES[key].includes(value) ? value : "all";
  }
  const origin = params.get("origin");
  filters.origin = origin && origins.includes(origin) ? origin : "all";
  filters.voice = params.get("voice") === "1";
  filters.video = params.get("video") === "1";
  return filters;
}
export function actorFilterSearch(filters: ActorFilterState, current = ""): string {
  const params = new URLSearchParams(current);
  for (const key of Object.keys(DEFAULT_ACTOR_FILTERS) as (keyof ActorFilterState)[]) {
    const value = filters[key];
    if (value === DEFAULT_ACTOR_FILTERS[key]) params.delete(key);
    else params.set(key, typeof value === "boolean" ? "1" : value);
  }
  return params.toString();
}

/** Role cues come from credited stories, never from inferred appearance or ethnicity. */
export function makeActorFacets(
  actors: readonly Actor[],
  media: Record<string, readonly { kind: string }[]>,
  samples: readonly { slug: string; actorSlugs?: readonly string[]; video: string }[],
  works: readonly Work[],
): Record<string, ActorFacets> {
  return Object.fromEntries(
    actors.map((actor) => {
      const origin = actor.spec.find((field) => field.id === "origin")?.value ?? { en: "", zh: "" };
      const credits = works
        .flatMap((work) =>
          work.cast
            .filter((credit) => credit.actor === actor.slug)
            .map(
              (credit) =>
                `${work.format.en} ${work.format.zh} ${credit.role?.name.en ?? ""} ${credit.role?.name.zh ?? ""} ${credit.role?.note?.en ?? ""} ${credit.role?.note?.zh ?? ""}`,
            ),
        )
        .join(" ");
      const roles = [
        ["comedy", /comedy|sitcom|喜剧/i],
        ["boss", /\bceo\b|\bboss\b|总裁|老板/i],
        ["villain", /\bvillain\b|反派/i],
        ["crew", /director|grip|导演|场务/i],
      ] as const;
      const items = media[actor.slug] ?? [];
      return [
        actor.slug,
        {
          origin,
          roles: roles.filter(([, pattern]) => pattern.test(credits)).map(([role]) => role),
          voice: items.some((item) => item.kind === "voice"),
          video:
            items.some((item) => item.kind === "video") ||
            samples.some(
              (sample) =>
                (sample.actorSlugs ?? [sample.slug]).includes(actor.slug) && Boolean(sample.video),
            ),
        },
      ];
    }),
  );
}
function matches(text: string, query: string) {
  const normalized = text.normalize("NFKC").toLowerCase();
  return query
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .split(/\s+/)
    .every((word) => normalized.includes(word));
}
export function filterActors(
  actors: readonly Actor[],
  facets: Record<string, ActorFacets>,
  f: ActorFilterState,
): Actor[] {
  return actors.filter((actor) => {
    const facet = facets[actor.slug];
    const searchable = `${actor.slug} ${actor.nameEn} ${actor.nameCn} ${actor.tagline.en} ${actor.tagline.zh} ${facet?.origin.en ?? ""} ${facet?.origin.zh ?? ""}`;
    const appearance = `${actor.note.en} ${actor.note.zh} ${actor.tagline.en} ${actor.tagline.zh} ${actor.promptSeed ?? ""}`;
    return (
      matches(searchable, f.q) &&
      matches(appearance, f.look) &&
      (f.gender === "all" || actor.gender === f.gender) &&
      (f.age === "all" ||
        (f.age === "under30"
          ? actor.age < 30
          : f.age === "30to45"
            ? actor.age >= 30 && actor.age <= 45
            : actor.age > 45)) &&
      (f.language === "all" || actor.voiceLanguage === f.language) &&
      (f.origin === "all" || facet?.origin.en === f.origin) &&
      (f.role === "all" || Boolean(facet?.roles.includes(f.role))) &&
      (f.height === "all" ||
        (actor.heightCm !== undefined &&
          (f.height === "under160"
            ? actor.heightCm < 160
            : f.height === "160to179"
              ? actor.heightCm >= 160 && actor.heightCm < 180
              : actor.heightCm >= 180))) &&
      (!f.voice || facet?.voice === true) &&
      (!f.video || facet?.video === true)
    );
  });
}
