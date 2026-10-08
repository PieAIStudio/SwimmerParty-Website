import { readFile, mkdir, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { zipSync, strToU8 } from "fflate";
import { ACTORS } from "../src/content/actors/index.ts";
const root = process.cwd();
const text = (actor: any, version: string) =>
  `SWIMMER PARTY · ${actor.nameEn} · v${version}\n\n1. Upload the full-body front and the front face to your image or video tool.\n2. Paste the character prompt from prompt.txt.\n3. Describe your scene.\n\nCredit: ${actor.nameEn} · Swim In AI\nFree for any use, even commercial. License v1.0: /en/license\n\n1. 把正面全身和正面头像上传到你的图像或视频工具。\n2. 粘贴 prompt.txt 里的角色提示词。\n3. 写你想要的场景。\n\n署名：${actor.nameCn} · Swim In AI\n用在哪都免费，赚钱的也行。授权 v1.0：/zh/license\n`;
async function build(actor: any) {
  const manifest = JSON.parse(
    await readFile(path.join(root, "src/content/actors", actor.slug, "assets.json"), "utf8"),
  );
  const version = actor.version ?? "0.1.0";
  const items = manifest.items.filter((x: any) => x.kind === "image");
  const files: any = {
    "README.txt": strToU8(text(actor, version)),
    "credit.txt": strToU8(`${actor.nameEn} · Swim In AI\n`),
    "prompt.txt": strToU8(actor.promptSeed ?? ""),
    "profile.json": strToU8(JSON.stringify(actor, null, 2) + "\n"),
    "assets.json": strToU8(JSON.stringify(manifest, null, 2) + "\n"),
  };
  const chosen = items.filter((x: any) => ["turnaround.front", "face.front"].includes(x.slot));
  for (const item of chosen) {
    try {
      files[`${item.slot.replaceAll(".", "-")}.png`] = await readFile(
        path.join(root, "public", item.preview.replace(/^\//, "")),
      );
    } catch {}
  }
  const out = path.join(root, "media-pack/library/packs", actor.slug, `v${version}`);
  await mkdir(out, { recursive: true });
  await writeFile(
    path.join(out, `${actor.slug}_v${version}_starter.zip`),
    zipSync(files, { level: 0 }),
  );
  const full: any = { ...files };
  for (const item of items) {
    try {
      full[`images/${item.slot.replaceAll(".", "-")}.webp`] = await readFile(
        path.join(root, "public", item.preview.replace(/^\//, "")),
      );
    } catch {}
  }
  const voiceDir = path.join(root, "media-pack/library/voice", actor.slug);
  for (const name of await readdir(voiceDir).catch(() => [])) {
    if (/\.(wav|mp3|m4a|json)$/u.test(name))
      full[`voice/${name}`] = await readFile(path.join(voiceDir, name));
  }
  await writeFile(
    path.join(out, `${actor.slug}_v${version}_full.zip`),
    zipSync(full, { level: 0 }),
  );
}
for (const actor of ACTORS) await build(actor);
