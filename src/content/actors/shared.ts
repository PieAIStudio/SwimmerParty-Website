/**
 * The roster.
 *
 * This file is the single source of truth for who exists. It is product
 * content, not governed documentation — it lives outside `docs/**` on
 * purpose (see AGENTS.md, "Governed surface").
 *
 * HONESTY RULE: `status` must reflect reality. An actor with no delivered
 * plate is `in-development` and says so on screen. Never dress a
 * placeholder as a finished asset, and never invent a credit, a brand
 * partner or a view count. This site is shown to people who will check.
 *
 * LOCALE RULE: every human sentence is `{ en, zh }`. Serial nomenclature
 * (`SP-01`, `VERSION 6 / 10`, `UNITS: CM`) stays latin in both locales the
 * way units on an engineering drawing do — that is notation, not prose.
 */

/** A string that exists in both authored locales. */
export type L = { en: string; zh: string };
/** A list that exists in both authored locales. */
export type LList = { en: string[]; zh: string[] };

export type ActorStatus = "active" | "in-development" | "concept";

export type SpecRow = {
  /** Stable identifier, used as the React key and never rendered. */
  id: string;
  /** Field name on the sheet. */
  label: L;
  value: L;
};

export type Actor = {
  slug: string;
  /** Roster code. Reads as a serial number because that is the point. */
  code: string;
  nameEn: string;
  nameCn: string;
  /** One line that has to do all the work on a card. */
  tagline: L;
  status: ActorStatus;
  /** Design iteration count, shown as `VERSION n OF m` like a model sheet. */
  version: { current: number; total: number };
  /** Authored height only; never inferred from the displayed picture. */
  heightCm?: number;
  /** Legacy public crop, used only until a new-spec image is delivered. */
  portrait: string | null;
  spec: SpecRow[];
  /** Longer character note. Kept short — the spec sheet does the talking. */
  note: L;
  /** What this actor is castable for. Drives the /casting conversation. */
  castFor: LList;
  /**
   * A copy-pasteable character seed for the open kit.
   *
   * Only non-null when the look is actually locked, because this string is
   * a promise: paste it into an image model and you should get THIS person.
   * An actor still on the white model has no locked face to describe, so
   * the kit page says so rather than shipping a guess.
   */
  promptSeed: string | null;
};

/** Shorthand so the roster below stays readable. */
export const row = (id: string, en: string, zh: string, ven: string, vzh: string): SpecRow => ({
  id,
  label: { en, zh },
  value: { en: ven, zh: vzh },
});

export const TBD = ["TBD", "待定"] as const;
const NOT_BUILT = ["NOT BUILT", "尚未构建"] as const;
const IN_DEV = ["IN DEVELOPMENT", "研发中"] as const;
const NOT_YET = ["NOT YET", "尚未开放"] as const;

/** The eight rows every in-development actor shares below the line. */
export const devTail = (
  originEn: string,
  originZh: string,
  registerEn: string,
  registerZh: string,
) => [
  row("build", "BUILD", "体型", TBD[0], TBD[1]),
  row("origin", "ORIGIN", "出身", originEn, originZh),
  row("register", "REGISTER", "语域", registerEn, registerZh),
  row("expression", "EXPRESSION SET", "表情组", NOT_BUILT[0], NOT_BUILT[1]),
  row("status", "STATUS", "状态", IN_DEV[0], IN_DEV[1]),
  row("license", "LICENSE", "授权", NOT_YET[0], NOT_YET[1]),
];
