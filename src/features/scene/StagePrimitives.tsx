"use client";

import type { FilmStageState } from "./model";

type PrimitiveProps = FilmStageState["props"][number];
type WallProps = FilmStageState["walls"][number];

function StageMaterial({ colour }: { colour: string }) {
  return <meshStandardMaterial color={colour} roughness={0.82} metalness={0.02} />;
}

function StageProp({ prop }: { prop: PrimitiveProps }) {
  const [width, height, depth] = prop.size;
  const colour =
    prop.kind === "door"
      ? "#7b5b42"
      : prop.kind === "toilet"
        ? "#d9dce0"
        : prop.kind === "handProp"
          ? "#b7b0a3"
          : "#aaa39a";
  if (prop.kind === "cylinder") {
    return (
      <mesh
        position={prop.position}
        rotation={[0, prop.rotation, 0]}
        castShadow
        receiveShadow
        userData={{ stagePrimitive: prop.id }}
      >
        <cylinderGeometry args={[width / 2, width / 2, height, 20]} />
        <StageMaterial colour={colour} />
      </mesh>
    );
  }
  return (
    <mesh
      position={prop.position}
      rotation={[0, prop.rotation, 0]}
      castShadow
      receiveShadow
      userData={{ stagePrimitive: prop.id }}
    >
      <boxGeometry args={[width, height, depth]} />
      <StageMaterial colour={colour} />
    </mesh>
  );
}

function StageWall({ wall }: { wall: WallProps }) {
  return (
    <mesh
      position={wall.position}
      rotation={[0, wall.rotation, 0]}
      castShadow
      receiveShadow
      userData={{ stageWall: wall.id }}
    >
      <boxGeometry args={wall.size} />
      <meshStandardMaterial color="#c8c4bc" roughness={0.95} />
    </mesh>
  );
}

function StageAxis({ from, to }: { from: [number, number]; to: [number, number] }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  if (length < 0.01) return null;
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, 0.012, (from[1] + to[1]) / 2]}
      rotation={[0, Math.atan2(dx, dz), 0]}
      userData={{ stageAxis: true }}
    >
      <boxGeometry args={[0.035, 0.018, length]} />
      <meshBasicMaterial color="#5c7f9e" transparent opacity={0.72} />
    </mesh>
  );
}

export function StagePrimitives({ stage }: { stage?: FilmStageState }) {
  if (!stage) return null;
  return (
    <>
      {stage.walls.map((wall) => <StageWall key={wall.id} wall={wall} />)}
      {stage.props.map((prop) => <StageProp key={prop.id} prop={prop} />)}
      {stage.axis ? <StageAxis from={stage.axis.from} to={stage.axis.to} /> : null}
    </>
  );
}
