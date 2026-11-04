/** Cleared reference files only. Null is an honest, non-downloadable image slot. */
export const SETTING_IDS = ["studio", "cafe", "street", "garden", "livingRoom", "gym"] as const;
export type SettingId = (typeof SETTING_IDS)[number];
export type SettingImage = {
  preview: string;
  download: string;
  filename: string;
  width: number;
  height: number;
};
export const SETTING_MANIFEST: Record<SettingId, { image: SettingImage | null }> = {
  studio: { image: null },
  cafe: { image: null },
  street: { image: null },
  garden: { image: null },
  livingRoom: { image: null },
  gym: { image: null },
};
