import type { OfficialSample, ProductionSample } from "../../src/contracts/samples.ts";

type SourceActor = { slug: string; officialSamples?: ProductionSample | ProductionSample[] };
/** A film has one production owner; associations never duplicate its bytes or identity. */
export function sourceSamples(published: readonly SourceActor[]) {
  return published.flatMap((actor) => {
    const value = actor.officialSamples;
    return (value ? (Array.isArray(value) ? value : [value]) : []).map((clip) => ({
      owner: actor.slug,
      clip,
    }));
  });
}
export function projectOfficialSamples(
  published: readonly SourceActor[],
  knownSlugs: readonly string[],
): OfficialSample[] {
  const known = new Set(knownSlugs);
  const ids = new Set<string>();
  const videos = new Set<string>();
  const counts = new Map<string, number>();
  return sourceSamples(published).map(({ owner, clip }) => {
    const id = clip.sampleId ?? `official-sample-${owner}`;
    if (ids.has(id)) throw new Error(`Duplicate sampleId: ${id}; keep one production owner`);
    ids.add(id);
    if (clip.sampleId && !clip.approval)
      throw new Error(`${id}: new samples require a passed Root review`);
    const actorSlugs = clip.actorSlugs ?? [owner];
    if (
      !actorSlugs.includes(owner) ||
      new Set(actorSlugs).size !== actorSlugs.length ||
      actorSlugs.some((slug) => !known.has(slug))
    )
      throw new Error(`${id}: invalid actor association`);
    const mediaVideos = clip.media.filter((m) => m.kind === "video");
    const images = clip.media.filter((m) => m.kind === "image").map((m) => m.public);
    if (mediaVideos.length !== 1 || images.length > 2 || (!clip.sampleId && images.length === 0))
      throw new Error(
        `${id}: officialSamples must list one video and zero to two images (legacy needs an image)`,
      );
    if (new Set(clip.media.map((m) => m.public)).size !== clip.media.length)
      throw new Error(`${id}: duplicate public media path`);
    const video = mediaVideos[0];
    if (videos.has(video.public))
      throw new Error(`${id}: duplicate video; associate both actors with one sampleId`);
    videos.add(video.public);
    if (clip.sampleId && (!video.sourceSha256 || !video.transcode))
      throw new Error(`${id}: new sample needs a pinned source and bounded transcode`);
    const castSlugs = clip.castSlugs ?? actorSlugs;
    if (
      new Set(castSlugs).size !== castSlugs.length ||
      castSlugs.some((slug) => !known.has(slug)) ||
      actorSlugs.some((slug) => !castSlugs.includes(slug))
    )
      throw new Error(`${id}: invalid cast association`);
    const label = clip.label ?? "solo";
    if ((label === "two-actors") !== (castSlugs.length === 2))
      throw new Error(`${id}: label and actor count differ`);
    for (const slug of actorSlugs) {
      const count = (counts.get(slug) ?? 0) + 1;
      if (count > 4) throw new Error(`${slug}: at most four associated samples`);
      counts.set(slug, count);
    }
    return {
      sampleId: id,
      slug: owner,
      actorSlugs,
      ...(clip.castSlugs ? { castSlugs } : {}),
      ...(clip.note ? { note: clip.note } : {}),
      label,
      tools: clip.tools,
      images,
      poster: images[0] ?? video.public.replace(/\.mp4$/, ".poster.webp"),
      video: video.public,
      approvedOn: clip.approvedOn,
    };
  });
}
