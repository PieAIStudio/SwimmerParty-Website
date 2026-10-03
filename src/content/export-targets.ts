export const EXPORT_TARGETS = [
  {
    id: "gpt-image",
    name: "GPT Image 2.5",
    limit: 16,
    verifiedAt: "2026-10-03",
    source: "https://developers.openai.com/api/reference/resources/images/methods/edit",
    verification: "official",
  },
  // Google permits up to three references; this product deliberately exports exactly three.
  {
    id: "veo",
    name: "Veo 3.1",
    limit: 3,
    verifiedAt: "2026-10-03",
    source: "https://ai.google.dev/gemini-api/docs/veo",
    verification: "official",
  },
  // Owner's plan supplies nine. An official limit has NOT been independently confirmed.
  {
    id: "seedance",
    name: "Seedance 2.0",
    limit: 9,
    verifiedAt: null,
    source: null,
    verification: "plan-only",
  },
] as const;
export type ExportTarget = (typeof EXPORT_TARGETS)[number]["id"];
