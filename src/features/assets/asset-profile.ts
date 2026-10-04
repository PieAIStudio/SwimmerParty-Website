import type { Actor } from "../../content/actors/index.ts";
import type { ActorAssets } from "./asset-types.ts";

/** The same public profile is used by the free JSON and every member pack. */
export function characterProfile(actor: Actor, assets: ActorAssets) {
  return {
    code: actor.code,
    slug: actor.slug,
    name: { en: actor.nameEn, zh: actor.nameCn },
    tagline: actor.tagline,
    spec: actor.spec,
    note: actor.note,
    castFor: actor.castFor,
    heightCm: actor.heightCm ?? null,
    promptSeed: actor.promptSeed,
    looks: assets.looks,
    slots: assets.items.map(
      ({ slot, series, key, look, conformance, version, width, height, sha256 }) => ({
        slot,
        series,
        key,
        look,
        conformance,
        version,
        width,
        height,
        sha256,
      }),
    ),
  };
}
