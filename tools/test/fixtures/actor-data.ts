import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export function castingFixture() {
  return {
    note: "Synthetic test actors; never production media.",
    release: {
      version: "0.1.0",
      date: "2026-10-08",
      note: { en: "Fixture debut", zh: "夹具初次亮相" },
    },
    actors: [
      {
        slug: "fixture-actor",
        source: "CC-999",
        nameZh: "测试演员",
        nameEn: "Fixture Actor",
        gender: "female",
        group: "fixture",
        age: 28,
        heightCm: 165,
        origin: { en: "Fixture town", zh: "测试小镇" },
        tagline: { en: "A synthetic actor", zh: "合成演员" },
        voice: { language: "zh", brief: "Synthetic voice", introLine: "Test only." },
        image: "library/fixtures/casting.png",
        look: "plain grey shirt",
      },
    ],
  };
}
export function promotedFixture() {
  const face = castingFixture().actors[0];
  return {
    slug: face.slug,
    name: { en: face.nameEn, zh: face.nameZh },
    identity: "Synthetic fixture identity",
    status: {
      published: false,
      version: "1.0.0",
      siteProfile: `src/content/actors/${face.slug}/profile.ts`,
    },
    proportions: { heightCm: face.heightCm },
    demographics: {
      age: face.age,
      gender: face.gender,
      origin: face.origin,
      voiceLanguage: face.voice.language,
    },
    release: { date: "2026-10-09", note: { en: "Fixture promotion", zh: "夹具晋升" } },
    website: {
      published: true,
      order: 0,
      status: "active",
      tagline: face.tagline,
      introduction: face.tagline,
      specOrder: ["age", "height", "origin", "language"],
      visibleLooks: ["personal"],
    },
    looks: [
      {
        id: "personal",
        kind: "personal",
        label: { en: "Personal", zh: "个人" },
        prompt: "plain shirt",
        extras: [],
      },
    ],
    productionExtension: { preserved: true },
  };
}
export async function writeJson(root: string, file: string, value: unknown) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
}
export async function actorDataRoot(published = false) {
  const root = await mkdtemp(path.join(tmpdir(), "swimmer-actor-data-"));
  await mkdir(path.join(root, "media-pack/actors"), { recursive: true });
  await writeJson(root, "media-pack/casting/new-faces-2026-10.json", castingFixture());
  if (published) await writeJson(root, "media-pack/actors/fixture-actor.json", promotedFixture());
  await writeJson(root, "src/content/actors/fixture-actor/assets.json", {
    slug: "fixture-actor",
    looks: [],
    items: [],
    productionExtension: { preserved: true },
  });
  return root;
}
