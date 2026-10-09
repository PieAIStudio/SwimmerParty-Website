import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  actorSchema,
  castingSchema,
  lookSchema,
  productionActorSchema,
  publishedActorSchema,
  productionLookSchema,
} from "../src/contracts/actors.ts";
import type { Actor, Look } from "../src/contracts/actors.ts";

export function parseSource<T>(schema: z.ZodType<T>, input: unknown, file: string): T {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new Error(
      `${file}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  // These schemas validate without coercion/defaults. Keep input ordering and
  // producer extensions: delivered JSON must not be silently re-serialized.
  return input as T;
}
export function unique(values: string[], context: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${context}: duplicate ${value}`);
    seen.add(value);
  }
}
export function projectActorData(production: unknown[], castingInput: unknown) {
  const casting = parseSource(
    castingSchema,
    castingInput,
    "media-pack/casting/new-faces-2026-10.json",
  );
  const records = production.map((input, i) =>
    parseSource(productionActorSchema, input, `media-pack/actors[${i}]`),
  );
  unique(
    records.map((a) => a.slug),
    "production actors",
  );
  unique(
    casting.actors.map((a) => a.slug),
    "casting actors",
  );
  unique(
    casting.actors.map((a) => a.source),
    "casting sources",
  );
  const published = records
    .filter((a) => a.website?.published)
    .map((a) => parseSource(publishedActorSchema, a, `media-pack/actors/${a.slug}.json`))
    .sort((a, b) => a.website.order - b.website.order);
  unique(
    published.map((a) => String(a.website.order)),
    "website order",
  );
  const looks: Record<string, Look[]> = {};
  const active: Actor[] = published.map((a) => {
    const context = `media-pack/actors/${a.slug}.json`;
    if (a.status.siteProfile !== `src/content/actors/${a.slug}/profile.ts`)
      throw new Error(`${context}: status.siteProfile must match generated profile path`);
    unique(a.website.specOrder, `${context}: website.specOrder`);
    unique(a.website.visibleLooks, `${context}: website.visibleLooks`);
    const candidates = a.looks.map((l, i) =>
      parseSource(z.looseObject({ id: z.string() }), l, `${context}: looks.${i}`),
    );
    unique(
      candidates.map((l) => l.id),
      `${context}: looks`,
    );
    looks[a.slug] = a.website.visibleLooks.map((id) => {
      const source = candidates.find((l) => l.id === id);
      if (!source) throw new Error(`${context}: website.visibleLooks references missing ${id}`);
      const l = parseSource(productionLookSchema, source, `${context}: looks.${id}`);
      unique(
        l.extras.map((e) => e.key),
        `${context}: looks.${id}.extras`,
      );
      return lookSchema.parse({
        ...l,
        ...(l.role ? { role: { work: l.role.siteWork, id: l.role.id } } : {}),
      });
    });
    const specValues = {
      age: a.website.ageDisplay ?? {
        en: String(a.demographics.age),
        zh: `${a.demographics.age} 岁`,
      },
      height: { en: `${a.proportions.heightCm} cm`, zh: `${a.proportions.heightCm} cm` },
      origin: a.demographics.origin,
      language:
        a.demographics.voiceLanguage === "en"
          ? { en: "English", zh: "英语" }
          : { en: "Chinese", zh: "中文" },
    };
    const labels = {
      age: { en: "Age", zh: "年龄" },
      height: { en: "Height", zh: "身高" },
      origin: { en: "From", zh: "籍贯" },
      language: { en: "Speaks", zh: "语言" },
    };
    if (a.proportions.heightCm === null && a.website.specOrder.includes("height"))
      throw new Error(
        `${context}: website.specOrder.height requires confirmed proportions.heightCm`,
      );
    const promoted = casting.actors.find((c) => c.slug === a.slug);
    if (promoted && (promoted.nameEn !== a.name.en || promoted.nameZh !== a.name.zh))
      throw new Error(`${context}: promoted actor must preserve casting name/slug`);
    return parseSource(
      actorSchema,
      {
        slug: a.slug,
        nameEn: a.name.en,
        nameCn: a.name.zh,
        tagline: a.website.tagline,
        status: a.website.status,
        gender: a.demographics.gender,
        age: a.demographics.age,
        ...(a.proportions.heightCm === null ? {} : { heightCm: a.proportions.heightCm }),
        portrait: `/media/assets/${a.slug}/turnaround.front.webp`,
        spec: a.website.specOrder.map((id) => ({ id, label: labels[id], value: specValues[id] })),
        note: a.website.introduction,
        promptSeed: a.website.exportPrompt ?? a.identity,
        version: a.status.version,
        versionDate: a.release.date,
        versionNote: a.release.note,
        ...(a.release.history ? { versionHistory: a.release.history } : {}),
        voiceLanguage: a.demographics.voiceLanguage,
      },
      context,
    );
  });
  const promotedSlugs = new Set(published.map((a) => a.slug));
  // Casting source order is the public new-face order. Promotion suppresses only that slug.
  const newFaces = casting.actors.filter((a) => !promotedSlugs.has(a.slug));
  const newcomers: Actor[] = newFaces.map((entry) =>
    parseSource(
      actorSchema,
      {
        slug: entry.slug,
        nameEn: entry.nameEn,
        nameCn: entry.nameZh,
        tagline: entry.tagline,
        status: "new-face",
        gender: entry.gender,
        age: entry.age,
        heightCm: entry.heightCm,
        portrait: `/media/assets/${entry.slug}/turnaround.front.webp`,
        spec: [
          {
            id: "age",
            label: { en: "Age", zh: "年龄" },
            value: { en: String(entry.age), zh: `${entry.age} 岁` },
          },
          {
            id: "height",
            label: { en: "Height", zh: "身高" },
            value: { en: `${entry.heightCm} cm`, zh: `${entry.heightCm} cm` },
          },
          {
            id: "origin",
            label: { en: "From", zh: "籍贯" },
            value: { en: entry.origin.en, zh: entry.origin.zh },
          },
          {
            id: "language",
            label: { en: "Speaks", zh: "语言" },
            value:
              entry.voice.language === "en"
                ? { en: "English", zh: "英语" }
                : { en: "Chinese", zh: "中文" },
          },
        ],
        note: entry.tagline,
        promptSeed: `3D feature-animation character, the same character as the reference image: ${entry.look}. Realistic adult body proportions, about 7 heads tall. Clearly stylized and visibly animated, never photoreal.`,
        version: casting.release.version,
        versionDate: casting.release.date,
        versionNote: casting.release.note,
        ...(casting.release.history ? { versionHistory: casting.release.history } : {}),
        voiceLanguage: entry.voice.language,
        assetSource: entry.image,
      },
      `media-pack/casting/${entry.slug}`,
    ),
  );
  const samples = published
    .filter((a) => a.officialSamples)
    .map((a) => {
      const s = a.officialSamples!;
      const images = s.media.filter((m) => m.kind === "image").map((m) => m.public);
      const videos = s.media.filter((m) => m.kind === "video");
      if (![1, 2].includes(images.length) || videos.length !== 1)
        throw new Error(`${a.slug}: officialSamples must list one or two images and one video`);
      unique(
        s.media.map((m) => m.public),
        `${a.slug}: officialSamples.media.public`,
      );
      return {
        slug: a.slug,
        tools: s.tools,
        images,
        poster: images[0]!,
        video: videos[0].public,
        approvedOn: s.approvedOn,
      };
    });
  return {
    active,
    newFaces,
    newcomers,
    actors: [...active, ...newcomers],
    looks,
    samples,
    published,
  };
}
export async function readActorSources(root = process.cwd()) {
  const dir = path.join(root, "media-pack/actors");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  const production = await Promise.all(
    files.map(async (file) => {
      const data = JSON.parse(await readFile(path.join(dir, file), "utf8"));
      if (data.slug !== file.slice(0, -5))
        throw new Error(`media-pack/actors/${file}: slug must match filename`);
      return data;
    }),
  );
  const casting = JSON.parse(
    await readFile(path.join(root, "media-pack/casting/new-faces-2026-10.json"), "utf8"),
  );
  return { production, casting };
}
export async function loadActorProjection(root = process.cwd()) {
  const { production, casting } = await readActorSources(root);
  return projectActorData(production, casting);
}
