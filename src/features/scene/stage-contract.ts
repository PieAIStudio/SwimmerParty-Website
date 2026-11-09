export type StageProp = {
  id: string;
  kind: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation: number;
  ownerId?: string;
};

export type StageWall = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation: number;
};

export type StageAxis = {
  from: [number, number];
  to: [number, number];
  cameraSide?: "left" | "right";
};

export type FilmStageState = {
  props: StageProp[];
  walls: StageWall[];
  axis?: StageAxis;
  frame?: { left: string[]; right: string[]; center: string[] };
  eyeTargets: Array<{ roleId: string; targetId: string }>;
};
