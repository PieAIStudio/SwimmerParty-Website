import { strToU8 } from "fflate";
import { SITE } from "../../content/site.ts";
import { LICENSE, STARTER_LICENSE } from "../../content/license.ts";
import { zipBlob } from "../../lib/browser-files.ts";
import { loadSignedImages } from "./signed-images.ts";

/** The references every tool needs first. New faces have only the full-body front. */
const STARTER_SLOTS = ["turnaround.front", "face.front"];
export type StarterActor = {
  slug: string;
  nameEn: string;
  nameCn: string;
  promptSeed: string | null;
  slots: string[];
};
export function starterSlots(items: { slot: string }[]): string[] {
  return STARTER_SLOTS.filter((slot) => items.some((item) => item.slot === slot));
}

function guide(actor: StarterActor): string {
  return `SWIMMER PARTY · ${actor.nameEn}

1. Upload the images in this folder to your image or video tool.
2. Paste the character prompt from prompt.txt.
3. Describe your scene.

Credit: ${actor.nameEn} · ${LICENSE.credit.en}
${STARTER_LICENSE.en} ${SITE.url}/en/license

1. 把这个文件夹里的图片上传到你的图像或视频工具。
2. 粘贴 prompt.txt 里的角色提示词。
3. 写你想要的场景。

署名：${actor.nameCn} · ${LICENSE.credit.zh}
${STARTER_LICENSE.zh}${SITE.url}/zh/license
`;
}

async function actorFiles(actor: StarterActor, prefix: string, signal?: AbortSignal) {
  const images = await loadSignedImages(
    actor.slug,
    actor.slots.map((slot) => ({ slot })),
    {
      signal,
      authorizationError: "Starter pack authorization failed",
    },
  );
  const files: Record<string, Uint8Array> = {};
  for (const item of images)
    files[`${prefix}${item.filename}`] = new Uint8Array(await item.blob.arrayBuffer());
  files[`${prefix}prompt.txt`] = strToU8(`${actor.promptSeed ?? ""}\n`);
  files[`${prefix}README.txt`] = strToU8(guide(actor));
  return files;
}

/** One actor's starter pack, or a whole cast in one ZIP, built in the browser from signed masters. */
export async function starterPack(
  actors: StarterActor[],
  signal?: AbortSignal,
): Promise<{ blob: Blob; filename: string }> {
  const single = actors.length === 1;
  const files: Record<string, Uint8Array> = {};
  for (const actor of actors)
    Object.assign(files, await actorFiles(actor, single ? "" : `${actor.slug}/`, signal));
  if (!single) {
    files["cast.json"] = strToU8(
      JSON.stringify(
        { version: 1, actors: actors.map((actor) => ({ slug: actor.slug, name: actor.nameEn })) },
        null,
        2,
      ) + "\n",
    );
    files["credit.txt"] = strToU8(
      `${actors.map((actor) => actor.nameEn).join(", ")} · ${LICENSE.credit.en}\n`,
    );
  }
  return {
    blob: zipBlob(files, signal),
    filename: single ? `${actors[0]!.slug}_starter.zip` : "swimmer-party-cast.zip",
  };
}
