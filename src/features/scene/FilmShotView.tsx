"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import { directingToSceneState, type DirectingShot } from "./film-adapter";
import type { ExportPicture } from "./canvas-contract";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });
declare global {
  interface Window {
    __filmStageExport?: () => Promise<string>;
  }
}
function decodePayload(encoded: string): DirectingShot {
  const text = atob(
    encoded.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (encoded.length % 4)) % 4),
  );
  return JSON.parse(text);
}
export function FilmShotView({ encodedShot }: { encodedShot: string }) {
  const mapping = useMemo(() => directingToSceneState(decodePayload(encodedShot)), [encodedShot]);
  const { scene } = mapping;
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
        onPose={() => {}}
        onSelect={() => {}}
        onMove={() => {}}
        onCameraChange={() => {}}
        onReady={ready}
      />
    </main>
  );
}
