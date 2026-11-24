type StageProp = {
  id: string;
  kind: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation: number;
  orientation?: [number, number, number];
  surfaceHeight?: number;
  ownerId?: string;
  /** Authored hand socket for a held prop, in world stage coordinates. */
  handJoint?: [number, number, number];
  /** World point the held prop's front (+Z) should face. */
  frontTarget?: [number, number, number];
};

export type StageWall = {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  rotation: number;
};

type StageAxis = {
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
  /** Runtime contact evidence for slumped/table blocking. */
  contacts?: Array<{
    roleId: string;
    tableId: string;
    tableTop: number;
    footprint: [number, number, number, number];
    head: [number, number, number];
    forearms: Array<[number, number, number]>;
  }>;
};
