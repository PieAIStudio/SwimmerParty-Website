import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { zipSync } from "fflate";
import { getActor } from "@/content/actors";
import { accountUser } from "@/features/account/server";
import { apiFailure } from "@/lib/server/api";
import { HttpError, runtimeModes } from "@/lib/server/runtime-mode";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") throw new HttpError(405, "method-not-allowed");
    const user = await accountUser(req, res, runtimeModes().account);
    if (!user) throw new HttpError(401, "sign-in-required");
    if (runtimeModes().store !== "local") throw new HttpError(503, "pack-storage-not-configured");
    const raw = typeof req.query.slugs === "string" ? req.query.slugs : "";
    const slugs = raw.split(",").filter(Boolean).slice(0, 12);
    const actors = slugs.map(getActor).filter(Boolean);
    if (!actors.length) throw new HttpError(400, "cast-empty");
    const files: Record<string, Uint8Array> = {
      "cast.json": new TextEncoder().encode(
        JSON.stringify(
          {
            version: 1,
            story: null,
            actors: actors.map((a) => ({ slug: a!.slug, name: a!.nameEn, reason: null })),
          },
          null,
          2,
        ),
      ),
      "credit.txt": new TextEncoder().encode(
        `Actors: ${actors.map((a) => a!.nameEn).join(", ")} · Swim In AI`,
      ),
      "README.txt": new TextEncoder().encode(
        "A Swimmer Party cast pack. Each actor folder contains the local starter pack.",
      ),
    };
    for (const actor of actors) {
      const version = actor!.version ?? "0.1.0";
      const file = path.join(
        process.cwd(),
        "media-pack/library/packs",
        actor!.slug,
        `v${version}`,
        `${actor!.slug}_v${version}_starter.zip`,
      );
      files[`${actor!.slug}/starter.zip`] = await readFile(file);
    }
    const body = zipSync(files);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="swimmer-party-cast.zip"');
    res.status(200).send(Buffer.from(body));
  } catch (error) {
    apiFailure(res, error);
  }
}
