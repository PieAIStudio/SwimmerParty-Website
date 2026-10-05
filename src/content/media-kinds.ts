export const MEDIA_KINDS = [
  { id: "image", icon: "card" as const },
  { id: "voice", icon: "hourglass" as const },
  { id: "video", icon: "hourglass" as const },
  { id: "model3d", icon: "hourglass" as const },
  { id: "motion", icon: "hourglass" as const },
] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number]["id"];
