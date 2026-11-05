/** Cleared reference files only. Null is an honest, non-downloadable image slot. */
export const SETTING_IDS = [
  "studio",
  "cafe",
  "street",
  "garden",
  "livingRoom",
  "gym",
  "parkPathDay",
  "forestClearing",
  "beachBoardwalk",
  "rooftopSunset",
  "cityStreetNight",
  "alleyRainNight",
  "campfireNight",
  "schoolClassroom",
  "library",
  "office",
  "kitchen",
  "bedroom",
  "trainPlatform",
  "busStopDusk",
  "shopFrontStreet",
  "marketStreet",
  "mountainLookout",
  "lakesideDock",
  "snowyStreet",
  "stageConcertNight",
] as const;
export type SettingId = (typeof SETTING_IDS)[number];
export const SETTING_GROUPS = ["indoor", "outdoor", "night"] as const;
type SettingGroup = (typeof SETTING_GROUPS)[number];
export type SettingImage = {
  preview: string;
  download: string;
  filename: string;
  width: number;
  height: number;
};
export const SETTING_MANIFEST: Record<
  SettingId,
  { group: SettingGroup; image: SettingImage | null }
> = {
  studio: {
    group: "indoor",
    image: {
      preview: "/media/settings/studio.webp",
      download: "/media/settings/studio.png",
      filename: "studio.png",
      width: 1664,
      height: 936,
    },
  },
  cafe: {
    group: "indoor",
    image: {
      preview: "/media/settings/cafe.webp",
      download: "/media/settings/cafe.png",
      filename: "cafe.png",
      width: 1664,
      height: 936,
    },
  },
  street: {
    group: "outdoor",
    image: {
      preview: "/media/settings/street.webp",
      download: "/media/settings/street.png",
      filename: "street.png",
      width: 1664,
      height: 936,
    },
  },
  garden: {
    group: "outdoor",
    image: {
      preview: "/media/settings/garden.webp",
      download: "/media/settings/garden.png",
      filename: "garden.png",
      width: 1664,
      height: 936,
    },
  },
  livingRoom: {
    group: "indoor",
    image: {
      preview: "/media/settings/living-room.webp",
      download: "/media/settings/living-room.png",
      filename: "living-room.png",
      width: 1664,
      height: 936,
    },
  },
  gym: {
    group: "indoor",
    image: {
      preview: "/media/settings/gym.webp",
      download: "/media/settings/gym.png",
      filename: "gym.png",
      width: 1664,
      height: 936,
    },
  },
  parkPathDay: {
    group: "outdoor",
    image: {
      preview: "/media/settings/park-path-day.webp",
      download: "/media/settings/park-path-day.png",
      filename: "park-path-day.png",
      width: 1664,
      height: 936,
    },
  },
  forestClearing: {
    group: "outdoor",
    image: {
      preview: "/media/settings/forest-clearing.webp",
      download: "/media/settings/forest-clearing.png",
      filename: "forest-clearing.png",
      width: 1664,
      height: 936,
    },
  },
  beachBoardwalk: {
    group: "outdoor",
    image: {
      preview: "/media/settings/beach-boardwalk.webp",
      download: "/media/settings/beach-boardwalk.png",
      filename: "beach-boardwalk.png",
      width: 1664,
      height: 936,
    },
  },
  rooftopSunset: {
    group: "night",
    image: {
      preview: "/media/settings/rooftop-sunset.webp",
      download: "/media/settings/rooftop-sunset.png",
      filename: "rooftop-sunset.png",
      width: 1664,
      height: 936,
    },
  },
  cityStreetNight: {
    group: "night",
    image: {
      preview: "/media/settings/city-street-night.webp",
      download: "/media/settings/city-street-night.png",
      filename: "city-street-night.png",
      width: 1664,
      height: 936,
    },
  },
  alleyRainNight: {
    group: "night",
    image: {
      preview: "/media/settings/alley-rain-night.webp",
      download: "/media/settings/alley-rain-night.png",
      filename: "alley-rain-night.png",
      width: 1664,
      height: 936,
    },
  },
  campfireNight: {
    group: "night",
    image: {
      preview: "/media/settings/campfire-night.webp",
      download: "/media/settings/campfire-night.png",
      filename: "campfire-night.png",
      width: 1664,
      height: 936,
    },
  },
  schoolClassroom: {
    group: "indoor",
    image: {
      preview: "/media/settings/school-classroom.webp",
      download: "/media/settings/school-classroom.png",
      filename: "school-classroom.png",
      width: 1664,
      height: 936,
    },
  },
  library: {
    group: "indoor",
    image: {
      preview: "/media/settings/library.webp",
      download: "/media/settings/library.png",
      filename: "library.png",
      width: 1664,
      height: 936,
    },
  },
  office: {
    group: "indoor",
    image: {
      preview: "/media/settings/office.webp",
      download: "/media/settings/office.png",
      filename: "office.png",
      width: 1664,
      height: 936,
    },
  },
  kitchen: {
    group: "indoor",
    image: {
      preview: "/media/settings/kitchen.webp",
      download: "/media/settings/kitchen.png",
      filename: "kitchen.png",
      width: 1664,
      height: 936,
    },
  },
  bedroom: {
    group: "indoor",
    image: {
      preview: "/media/settings/bedroom.webp",
      download: "/media/settings/bedroom.png",
      filename: "bedroom.png",
      width: 1664,
      height: 936,
    },
  },
  trainPlatform: {
    group: "outdoor",
    image: {
      preview: "/media/settings/train-platform.webp",
      download: "/media/settings/train-platform.png",
      filename: "train-platform.png",
      width: 1664,
      height: 936,
    },
  },
  busStopDusk: {
    group: "night",
    image: {
      preview: "/media/settings/bus-stop-dusk.webp",
      download: "/media/settings/bus-stop-dusk.png",
      filename: "bus-stop-dusk.png",
      width: 1664,
      height: 936,
    },
  },
  shopFrontStreet: {
    group: "outdoor",
    image: {
      preview: "/media/settings/shop-front-street.webp",
      download: "/media/settings/shop-front-street.png",
      filename: "shop-front-street.png",
      width: 1664,
      height: 936,
    },
  },
  marketStreet: {
    group: "outdoor",
    image: {
      preview: "/media/settings/market-street.webp",
      download: "/media/settings/market-street.png",
      filename: "market-street.png",
      width: 1664,
      height: 936,
    },
  },
  mountainLookout: {
    group: "outdoor",
    image: {
      preview: "/media/settings/mountain-lookout.webp",
      download: "/media/settings/mountain-lookout.png",
      filename: "mountain-lookout.png",
      width: 1664,
      height: 936,
    },
  },
  lakesideDock: {
    group: "outdoor",
    image: {
      preview: "/media/settings/lakeside-dock.webp",
      download: "/media/settings/lakeside-dock.png",
      filename: "lakeside-dock.png",
      width: 1664,
      height: 936,
    },
  },
  snowyStreet: {
    group: "night",
    image: {
      preview: "/media/settings/snowy-street.webp",
      download: "/media/settings/snowy-street.png",
      filename: "snowy-street.png",
      width: 1664,
      height: 936,
    },
  },
  stageConcertNight: {
    group: "night",
    image: {
      preview: "/media/settings/stage-concert-night.webp",
      download: "/media/settings/stage-concert-night.png",
      filename: "stage-concert-night.png",
      width: 1664,
      height: 936,
    },
  },
};
