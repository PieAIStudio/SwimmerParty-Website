"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Camera, Mesh, Object3D } from "three";
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

function roomCenter(walls: WallProps[]): [number, number] {
  if (walls.length === 0) return [0, 0];
  const total = walls.reduce(
    (sum, wall) => [sum[0] + wall.position[0], sum[1] + wall.position[2]] as [number, number],
    [0, 0] as [number, number],
  );
  return [total[0] / walls.length, total[1] / walls.length];
}

function wallNormal(
  position: [number, number],
  alongX: boolean,
  center: [number, number],
): [number, number] {
  if (alongX) return [0, position[1] < center[1] ? -1 : 1];
  return [position[0] < center[0] ? -1 : 1, 0];
}

function wallIsVisible(
  position: [number, number],
  alongX: boolean,
  center: [number, number],
  camera: Pick<Camera, "position">,
) {
  const [nx, nz] = wallNormal(position, alongX, center);
  const cameraSide =
    (camera.position.x - position[0]) * nx + (camera.position.z - position[1]) * nz;
  const roomSide = (center[0] - position[0]) * nx + (center[1] - position[1]) * nz;
  // A perimeter wall between the camera and the room is the cutaway wall.
  return cameraSide * roomSide > 0.001;
}

export function updateStageWallVisibility(root: Object3D, camera: Pick<Camera, "position">) {
  root.traverse((node) => {
    const center = node.userData.stageWallCenter as [number, number] | undefined;
    const alongX = node.userData.stageWallAlongX as boolean | undefined;
    if (!center || alongX === undefined || !node.userData.stageWall) return;
    node.visible = wallIsVisible([node.position.x, node.position.z], alongX, center, camera);
  });
}

function StageWall({ wall, center }: { wall: WallProps; center: [number, number] }) {
  const meshRef = useRef<Mesh>(null);
  useFrame(({ camera }) => {
    if (meshRef.current) updateStageWallVisibility(meshRef.current, camera);
  });
  return (
    <mesh
      ref={meshRef}
      position={wall.position}
      rotation={[0, wall.rotation, 0]}
      castShadow
      receiveShadow
      userData={{
        stageWall: wall.id,
        stageWallCenter: center,
        stageWallAlongX: wall.size[0] >= wall.size[2],
      }}
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
  const center = roomCenter(stage?.walls ?? []);
  if (!stage) return null;
  return (
    <>
      {stage.walls.map((wall) => (
        <StageWall key={wall.id} wall={wall} center={center} />
      ))}
      {stage.props.map((prop) => (
        <StageProp key={prop.id} prop={prop} />
      ))}
      {stage.axis ? <StageAxis from={stage.axis.from} to={stage.axis.to} /> : null}
    </>
  );
}
