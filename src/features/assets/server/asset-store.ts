import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type AssetStore = { put: (object: string, bytes: Uint8Array) => Promise<void> };

export function objectPath(root: string, object: string): string {
  if (
    !/^[a-z0-9-]+\/[a-f0-9]{16}\/SP-\d{2,4}__[a-z0-9-]+__[a-z0-9-]+__v\d+\.(png|webp)$/.test(
      object,
    ) &&
    !/^[a-z0-9-]+\/v\d+\/SP-\d{2,4}__[a-z0-9-]+__[a-z0-9-]+__v\d+\.(png|webp)$/.test(object)
  ) {
    throw new Error("Invalid asset object key");
  }
  // A validated runtime store path, not a request to trace the repository into a deployment.
  return path.join(/* turbopackIgnore: true */ path.resolve(root), ...object.split("/"));
}

/** Masters are immutable: a different image needs a new anchor version. */
export function localAssetStore(root: string): AssetStore {
  return {
    async put(object, bytes) {
      const target = objectPath(root, object);
      await mkdir(path.dirname(target), { recursive: true });
      try {
        await writeFile(target, bytes, { flag: "wx" });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        if (!(await readFile(target)).equals(Buffer.from(bytes)))
          throw new Error(
            `Master already exists with different bytes: ${object}. Increment the anchor version.`,
            { cause: error },
          );
      }
    },
  };
}
