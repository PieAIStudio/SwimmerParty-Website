export type PublicDownload = {
  url: string;
  filename: string;
};

const PUBLIC_DOWNLOADS: Record<string, PublicDownload> = {
  "swim-in-ai-white": {
    url: "/downloads/swim-in-ai-white.png",
    filename: "swim-in-ai-white.png",
  },
  "swim-in-ai-black": {
    url: "/downloads/swim-in-ai-black.png",
    filename: "swim-in-ai-black.png",
  },
};

export function getPublicDownload(slot: string): PublicDownload | undefined {
  return PUBLIC_DOWNLOADS[slot];
}
