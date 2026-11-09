import type { ReactNode } from "react";
import type { Camera, Object3D } from "three";
import type { CameraState, FigureIdentity, JointRotations, SceneState } from "./model";

export type ExportPicture = (width: number, height: number) => Promise<Blob>;
export type SceneCanvasProps = {
  scene: SceneState;
  identities: FigureIdentity[];
  selected: string;
  limbs: boolean;
  cleanExport?: boolean;
  stageLayer?: ReactNode;
  beforeExport?: (scene: Object3D, camera: Camera) => void;
  onPose: (id: string, joints: JointRotations) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
  onCameraChange: (camera: CameraState, record?: boolean) => void;
  onReady: (exporter: ExportPicture | null) => void;
};
