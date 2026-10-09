import { z } from "zod";

export const localizedSchema = z.object({ en: z.string(), zh: z.string() });
export const actorStatusSchema = z.enum(["active", "new-face", "in-development", "concept"]);
export const genderSchema = z.enum(["female", "male"]);
export const languageSchema = z.enum(["en", "zh"]);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const versionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
export const dateSchema = z.iso.date();
export const releaseHistorySchema = z.object({
  version: versionSchema,
  date: dateSchema,
  note: localizedSchema,
});
export const actorSchema = z.object({
  slug: slugSchema,
  nameEn: z.string(),
  nameCn: z.string(),
  tagline: localizedSchema,
  status: actorStatusSchema,
  gender: genderSchema,
  age: z.number().int().positive(),
  heightCm: z.number().positive().optional(),
  portrait: z.string().nullable(),
  spec: z.array(z.object({ id: z.string(), label: localizedSchema, value: localizedSchema })),
  note: localizedSchema,
  promptSeed: z.string().nullable(),
  version: versionSchema.optional(),
  versionDate: dateSchema.optional(),
  versionNote: localizedSchema.optional(),
  versionHistory: z.array(releaseHistorySchema).optional(),
  voiceLanguage: languageSchema.optional(),
  assetSource: z.string().optional(),
});
export const lookSchema = z.object({
  id: slugSchema,
  kind: z.enum(["personal", "role"]),
  label: localizedSchema,
  prompt: z.string(),
  role: z.object({ work: z.string(), id: z.string() }).optional(),
  extras: z.array(z.object({ key: slugSchema, label: localizedSchema, direction: z.string() })),
});
export type Actor = z.infer<typeof actorSchema>;
export type Look = z.infer<typeof lookSchema>;
export type L = z.infer<typeof localizedSchema>;
export type ActorGender = z.infer<typeof genderSchema>;
export type ActorStatus = z.infer<typeof actorStatusSchema>;

// Loose objects validate consumed fields without discarding production extensions.
const releaseSchema = z.looseObject({
  date: dateSchema,
  note: localizedSchema,
  history: z.array(releaseHistorySchema).optional(),
});
export const websiteSchema = z.looseObject({
  published: z.boolean(),
  order: z.number().int().nonnegative(),
  status: actorStatusSchema,
  tagline: localizedSchema,
  introduction: localizedSchema,
  specOrder: z.array(z.enum(["age", "height", "origin", "language"])),
  visibleLooks: z.array(slugSchema),
  ageDisplay: localizedSchema.optional(),
  exportPrompt: z.string().optional(),
});
export const productionActorSchema = z.looseObject({
  slug: slugSchema,
  website: websiteSchema.optional(),
});
export const publishedActorSchema = z.looseObject({
  slug: slugSchema,
  name: localizedSchema,
  identity: z.string(),
  status: z.looseObject({ version: versionSchema, siteProfile: z.string() }),
  proportions: z.looseObject({ heightCm: z.number().positive().nullable() }),
  demographics: z.looseObject({
    age: z.number().int().positive(),
    gender: genderSchema,
    origin: localizedSchema,
    voiceLanguage: languageSchema,
  }),
  release: releaseSchema,
  website: websiteSchema,
  looks: z.array(z.unknown()),
  officialSamples: z
    .looseObject({
      approvedOn: dateSchema,
      tools: z.array(z.string()).nonempty(),
      media: z.array(
        z.looseObject({
          kind: z.enum(["image", "video"]),
          source: z.string(),
          public: z.string().startsWith("/media/"),
        }),
      ),
    })
    .optional(),
});
export const productionLookSchema = lookSchema
  .extend({
    role: z.looseObject({ work: z.string(), siteWork: z.string(), id: z.string() }).optional(),
  })
  .loose();
export const newFaceSchema = z.looseObject({
  slug: slugSchema,
  source: z.string(),
  nameZh: z.string(),
  nameEn: z.string(),
  gender: genderSchema,
  group: z.string(),
  age: z.number().int().positive(),
  heightCm: z.number().positive(),
  origin: localizedSchema,
  tagline: localizedSchema,
  voice: z.looseObject({ language: languageSchema, brief: z.string(), introLine: z.string() }),
  image: z.string(),
  look: z.string(),
});
export const castingSchema = z.looseObject({
  actors: z.array(newFaceSchema),
  release: releaseSchema.extend({ version: versionSchema }),
});
