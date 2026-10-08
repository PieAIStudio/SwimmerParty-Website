export const TOOLS = [
  "ChatGPT",
  "Midjourney",
  "Flux",
  "Stable Diffusion / ComfyUI",
  "Kling",
  "Runway",
  "Veo",
  "Sora",
  "Hailuo / MiniMax",
  "Pika",
  "Luma",
  "ElevenLabs",
  "Suno",
  "CapCut",
  "Blender",
  "Other",
] as const;
export type CommunityTool = (typeof TOOLS)[number];
