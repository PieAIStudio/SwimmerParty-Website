import type { Actor, ActorGender, ActorStatus, L } from "./shared.ts";
export type { Actor, ActorGender, ActorStatus, L } from "./shared.ts";
import { profile as tangYunqiu } from "./tang-yunqiu/profile.ts";
import { profile as mishaLuo } from "./misha-luo/profile.ts";
import { profile as zhangQiang } from "./zhang-qiang/profile.ts";
import { profile as chenWei } from "./chen-wei/profile.ts";
import { NEW_FACE_DATA } from "./new-faces.ts";
import { row } from "./shared.ts";

const newFaces: Actor[] = NEW_FACE_DATA.map((entry) => ({
  slug: entry.slug,
  nameEn: entry.nameEn,
  nameCn: entry.nameZh,
  tagline: entry.tagline,
  status: "new-face" as const,
  gender: entry.gender as ActorGender,
  age: entry.age,
  heightCm: entry.heightCm,
  portrait: `/media/assets/${entry.slug}/turnaround.front.webp`,
  spec: [
    row("age", "Age", "年龄", String(entry.age), `${entry.age} 岁`),
    row("height", "Height", "身高", `${entry.heightCm} cm`, `${entry.heightCm} cm`),
    row("origin", "From", "籍贯", entry.origin.en, entry.origin.zh),
    row("language", "Speaks", "语言", entry.voice.language === "en" ? "English" : "Chinese", entry.voice.language === "en" ? "英语" : "中文"),
  ],
  note: entry.tagline,
  promptSeed: null,
  version: "0.1.0",
  versionDate: "2026-10-08",
  versionNote: { en: "New face: one full-body casting photo and a self-introduction.", zh: "新面孔：一张全身试镜照、一段自我介绍。" },
  voiceLanguage: entry.voice.language,
  assetSource: entry.image,
}));

export const ACTORS: Actor[] = [tangYunqiu, mishaLuo, zhangQiang, chenWei, ...newFaces];
export const STATUS_LABEL: Record<ActorStatus, L> = {
  active: { en: "Ready to cast", zh: "可出演" },
  "new-face": { en: "New face", zh: "新面孔" },
  "in-development": { en: "In development", zh: "制作中" },
  concept: { en: "Concept", zh: "概念" },
};
export function getActor(slug: string): Actor | undefined { return ACTORS.find((actor) => actor.slug === slug); }
export function latestActors(limit = 5): Actor[] { return ACTORS.filter((actor) => actor.versionDate).slice().sort((a,b)=>(b.versionDate??"").localeCompare(a.versionDate??"")).slice(0,limit); }
