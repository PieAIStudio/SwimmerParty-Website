import { z } from "zod";
import { SETTING_IDS } from "@/content/settings";

export const settingDraftSchema = z
  .object({
    selected: z.enum(SETTING_IDS),
    sentences: z.partialRecord(z.enum(SETTING_IDS), z.string().max(300)),
  })
  .default({ selected: "studio", sentences: {} });
export type SettingDraft = z.infer<typeof settingDraftSchema>;
