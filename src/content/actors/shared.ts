/** Paired authored messages; every human sentence exists in both locales. */
export type L = { en: string; zh: string };
export type ActorStatus = "active" | "new-face" | "in-development" | "concept";
export type ActorGender = "female" | "male";

type SpecRow = { id: string; label: L; value: L };

export type Actor = {
  slug: string;
  nameEn: string;
  nameCn: string;
  tagline: L;
  status: ActorStatus;
  gender: ActorGender;
  age: number;
  heightCm?: number;
  portrait: string | null;
  spec: SpecRow[];
  note: L;
  promptSeed: string | null;
  version?: string;
  versionDate?: string;
  versionNote?: L;
  voiceLanguage?: "en" | "zh";
  assetSource?: string;
};

export const row = (id: string, en: string, zh: string, valueEn: string, valueZh: string): SpecRow => ({
  id,
  label: { en, zh },
  value: { en: valueEn, zh: valueZh },
});
