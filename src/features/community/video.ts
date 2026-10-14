import type { VideoDescriptor } from "../../contracts/community.ts";
import { CommunityError } from "./errors.ts";

/** Exact host/path grammar from private.swimmer_party_parse_video at 7611445. No network lookups. */
export function parseCommunityVideo(value: string): VideoDescriptor {
  if (
    !value ||
    value.length > 2048 ||
    /[\s%@\\]/u.test(value) ||
    [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
  )
    throw new CommunityError("VIDEO_URL_UNSUPPORTED");
  let match =
    value.match(
      /^https:\/\/(?:www\.|m\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})(?:&t=[0-9]{1,6})?$/,
    ) ??
    value.match(/^https:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:\?t=[0-9]{1,6})?$/) ??
    value.match(/^https:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})\/?$/);
  if (match)
    return {
      platform: "youtube",
      externalId: match[1],
      canonicalUrl: `https://www.youtube.com/watch?v=${match[1]}`,
    };
  match = value.match(/^https:\/\/(?:www\.|m\.)?bilibili\.com\/video\/(BV[A-Za-z0-9]{10})\/?$/);
  if (match)
    return {
      platform: "bilibili",
      externalId: match[1],
      canonicalUrl: `https://www.bilibili.com/video/${match[1]}/`,
    };
  match =
    value.match(/^https:\/\/(?:www\.)?vimeo\.com\/([1-9][0-9]{0,11})\/?$/) ??
    value.match(/^https:\/\/player\.vimeo\.com\/video\/([1-9][0-9]{0,11})\/?$/);
  if (match)
    return {
      platform: "vimeo",
      externalId: match[1],
      canonicalUrl: `https://vimeo.com/${match[1]}`,
    };
  throw new CommunityError("VIDEO_URL_UNSUPPORTED");
}
export function communityEmbed(video: VideoDescriptor): string {
  const verified = parseCommunityVideo(video.canonicalUrl);
  if (verified.platform !== video.platform || verified.externalId !== video.externalId)
    throw new CommunityError("VIDEO_URL_UNSUPPORTED");
  if (video.platform === "youtube")
    return `https://www.youtube-nocookie.com/embed/${video.externalId}?autoplay=1`;
  if (video.platform === "bilibili")
    return `https://player.bilibili.com/player.html?bvid=${video.externalId}&autoplay=1`;
  return `https://player.vimeo.com/video/${video.externalId}?autoplay=1`;
}
