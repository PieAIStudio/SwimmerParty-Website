import type { Actor, ActorStatus, L } from "./shared.ts";
export type { Actor, ActorStatus, L } from "./shared.ts";
import { profile as actor0 } from "./hu-qian/profile.ts";
import { profile as actor1 } from "./qi-man/profile.ts";
import { profile as actor2 } from "./dai-er/profile.ts";
import { profile as actor3 } from "./ding-yi/profile.ts";
import { profile as actor4 } from "./luo-dajiang/profile.ts";
import { profile as actor5 } from "./bai-lu/profile.ts";
import { profile as actor6 } from "./hao-anquan/profile.ts";
import { profile as actor7 } from "./mi-xue/profile.ts";
import { profile as actor8 } from "./jin-mantang/profile.ts";
import { profile as actor9 } from "./lu-dekai/profile.ts";
import { profile as actor10 } from "./su-xiao/profile.ts";
import { profile as actor11 } from "./guan-hai/profile.ts";
import { profile as actor12 } from "./he-jie/profile.ts";
export const ACTORS: Actor[] = [
  actor0,
  actor1,
  actor2,
  actor3,
  actor4,
  actor5,
  actor6,
  actor7,
  actor8,
  actor9,
  actor10,
  actor11,
  actor12,
];

export const STATUS_LABEL: Record<ActorStatus, L> = {
  active: { en: "CASTABLE", zh: "可出演" },
  "in-development": { en: "IN DEVELOPMENT", zh: "研发中" },
  concept: { en: "CONCEPT", zh: "概念" },
};

export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((a) => a.slug === slug);
}
