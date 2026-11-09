"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { directingToSceneState, type DirectingShot } from "./film-adapter";
import { StagePrimitives, updateStageWallVisibility } from "./StagePrimitives";
import type { FilmStageState } from "./stage-contract";
import type { ExportPicture } from "./canvas-contract";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

declare global {
  interface Window {
    __filmStageExport?: () => Promise<string>;
  }
}

export function FilmShotView({ payload }: { payload: DirectingShot }) {
  const mapping = useMemo(() => directingToSceneState(payload), [payload]);
  const { scene } = mapping;
  const stage = scene.stage as FilmStageState | undefined;
  const identities = useMemo(
    () =>
      scene.figures.map((figure, index) => ({
        label: String(index + 1),
        colour: ["#235ea8", "#986400", "#983f78", "#08776e"][index % 4],
      })),
    [scene.figures],
  );
  useEffect(
    () => () => {
      delete window.__filmStageExport;
    },
    [],
  );
  function ready(exporter: ExportPicture | null) {
    const canvas = document.querySelector("canvas");
    if (!exporter || !canvas) {
      delete window.__filmStageExport;
      return;
    }
    canvas.dataset.filmReady = "true";
    window.__filmStageExport = async () => {
      const blob = await exporter(1920, 1080);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      return btoa(binary);
    };
  }
  return (
    <main className="fixed inset-0" aria-hidden="true">
      <SceneCanvas
        scene={scene}
        identities={identities}
        selected=""
        limbs={false}
        cleanExport
        stageLayer={<StagePrimitives stage={stage} target={scene.camera.target} />}
        beforeExport={(root, camera) =>
          updateStageWallVisibility(root, camera, scene.camera.target)
        }
        onPose={() => {}}
        onSelect={() => {}}
        onMove={() => {}}
        onCameraChange={() => {}}
        onReady={ready}
      />
    </main>
  );
}
