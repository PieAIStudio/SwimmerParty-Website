// The ZIP that goes with a sheet: the picture, any voice or video references, the prompt and profile,
// the license and a readme. Pure byte assembly; the component fetches and saves.
import { strToU8 } from "fflate";

export type SheetNames = { slug: string; nameEn: string; nameCn: string };

/** The readme that ships in every sheet ZIP; the wording is part of the product's credit promise. */
export function sheetReadme({ slug, nameEn, nameCn }: SheetNames): string {
  return [
    `SWIMMER PARTY · ${nameEn}`,
    `1. Upload ${slug}_sheet.png to your image or video tool as the character reference.`,
    "2. Voice and video files are references for voice and motion tools.",
    `3. Credit: ${nameEn} · Swim In AI`,
    "",
    `SWIMMER PARTY · ${nameCn}`,
    `1. 把 ${slug}_sheet.png 作为角色参考图上传到你的图像或视频工具。`,
    "2. 声音和视频文件给配音、动作类工具做参考。",
    `3. 署名：${nameCn} · Swim In AI`,
    "",
  ].join("\n");
}

export type SheetMedia = { folder: "voice" | "video"; name: string; bytes: Uint8Array };

export function sheetBundleFiles(input: {
  sheetName: string;
  sheet: Uint8Array;
  media: readonly SheetMedia[];
  /** Present only when the prompt and profile were ticked. */
  prompt?: string;
  profile?: string;
  license: string;
  readme: string;
}): Record<string, Uint8Array> {
  const files: Record<string, Uint8Array> = { [input.sheetName]: input.sheet };
  for (const item of input.media) files[`${item.folder}/${item.name}`] = item.bytes;
  if (input.prompt !== undefined) files["prompt.txt"] = strToU8(input.prompt);
  if (input.profile !== undefined) files["character.json"] = strToU8(input.profile);
  files["LICENSE.txt"] = strToU8(input.license);
  files["README.txt"] = strToU8(input.readme);
  return files;
}
