import { z } from "zod";
import { DEFAULT_SETTING_DRAFT, SETTING_IDS } from "../../content/settings.ts";

export const settingDraftSchema = z
  .object({
    selected: z.enum(SETTING_IDS),
    sentences: z.partialRecord(z.enum(SETTING_IDS), z.string().max(300)),
  })
  .default(DEFAULT_SETTING_DRAFT);
export type SettingDraft = z.infer<typeof settingDraftSchema>;
