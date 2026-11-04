import type { CameraState, SceneState } from "./model";

export type ExportPicture = (width: number, height: number) => Promise<Blob>;
export type SceneCanvasProps = {
  scene: SceneState;
  selected: string;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
  onCameraChange: (camera: CameraState) => void;
  onReady: (exporter: ExportPicture | null) => void;
};
