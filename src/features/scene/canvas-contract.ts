import type { CameraState, FigureIdentity, JointRotations, SceneState } from "./model";

export type ExportPicture = (width: number, height: number) => Promise<Blob>;
export type SceneCanvasProps = {
  scene: SceneState;
  identities: FigureIdentity[];
  selected: string;
  limbs: boolean;
  onPose: (id: string, joints: JointRotations) => void;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
  onCameraChange: (camera: CameraState, record?: boolean) => void;
  onReady: (exporter: ExportPicture | null) => void;
};
