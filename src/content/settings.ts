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
  studio: {
    image: {
      preview: "/media/settings/studio.webp",
      download: "/media/settings/studio.png",
      filename: "studio.png",
      width: 1664,
      height: 936,
    },
  },
  cafe: {
    image: {
      preview: "/media/settings/cafe.webp",
      download: "/media/settings/cafe.png",
      filename: "cafe.png",
      width: 1664,
      height: 936,
    },
  },
  street: {
    image: {
      preview: "/media/settings/street.webp",
      download: "/media/settings/street.png",
      filename: "street.png",
      width: 1664,
      height: 936,
    },
  },
  garden: {
    image: {
      preview: "/media/settings/garden.webp",
      download: "/media/settings/garden.png",
      filename: "garden.png",
      width: 1664,
      height: 936,
    },
  },
  livingRoom: {
    image: {
      preview: "/media/settings/living-room.webp",
      download: "/media/settings/living-room.png",
      filename: "living-room.png",
      width: 1664,
      height: 936,
    },
  },
  gym: {
    image: {
      preview: "/media/settings/gym.webp",
      download: "/media/settings/gym.png",
      filename: "gym.png",
      width: 1664,
      height: 936,
    },
  },
};
