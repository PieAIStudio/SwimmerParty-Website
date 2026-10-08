import type { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getActorAssets } from "@/features/assets";
export default async function voicePreview(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }
  const slug = typeof req.query.slug === "string" ? req.query.slug : "";
  const slot = typeof req.query.slot === "string" ? req.query.slot : "";
  const item = getActorAssets(slug).items.find((candidate) => candidate.slot === `voice.${slot}`);
  if (!item || item.kind !== "voice") {
    res.status(404).json({ error: "voice-not-found" });
    return;
  }
  const object = item.object.replace(/^voice\//, "");
  if (!/^(?:[a-z0-9-]+\/)+[a-z0-9_-]+\.(mp3|wav)$/.test(object)) {
    res.status(404).json({ error: "voice-not-found" });
    return;
  }
  try {
    const bytes = await readFile(path.join(process.cwd(), "media-pack/library/voice", object));
    res.setHeader("Content-Type", item.format === "wav" ? "audio/wav" : "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(bytes);
  } catch {
    res.status(404).json({ error: "voice-not-found" });
  }
}
