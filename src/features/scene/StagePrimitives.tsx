"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Camera, Mesh, Object3D } from "three";
import type { FilmStageState, StageWall } from "./stage-contract";

type PrimitiveProps = FilmStageState["props"][number];

function StageMaterial({ colour }: { colour: string }) {
  return <meshStandardMaterial color={colour} roughness={0.82} metalness={0.02} />;
}

function StageProp({ prop }: { prop: PrimitiveProps }) {
  const [width, height, depth] = prop.size;
  const colour =
    prop.kind === "door"
      ? "#7b5b42"
      : prop.kind === "toilet" || prop.kind === "cylinder"
        ? "#d9dce0"
        : prop.kind === "handProp"
          ? "#b7b0a3"
          : "#aaa39a";
  const position =
    prop.kind === "door" && Math.abs(prop.rotation) < 0.01
      ? ([prop.position[0] - 0.5, prop.position[1], prop.position[2] + 0.5] as [number, number, number])
      : prop.position;
  if (prop.kind === "toilet" || prop.kind === "cylinder") {
    return (
      <mesh
        position={position}
        rotation={[0, prop.rotation, 0]}
        castShadow
        receiveShadow
        userData={{
          stagePrimitive: prop.id,
          stagePrimitiveKind: prop.kind,
          stagePrimitiveSize: prop.size,
          stagePrimitiveRotation: prop.rotation,
          stageOwnerId: prop.ownerId,
        }}
      >
        <cylinderGeometry args={[width / 2, width / 2, height, 20]} />
        <StageMaterial colour={colour} />
      </mesh>
    );
  }
  return (
    <mesh
      position={position}
      rotation={[0, prop.rotation, 0]}
      castShadow
      receiveShadow
      userData={{
          stagePrimitive: prop.id,
          stagePrimitiveKind: prop.kind,
          stagePrimitiveSize: prop.size,
          stagePrimitiveRotation: prop.rotation,
          stageOwnerId: prop.ownerId,
        }}
    >
      <boxGeometry args={[width, height, depth]} />
      <StageMaterial colour={colour} />
    </mesh>
  );
}

function roomCenter(walls: StageWall[]): [number, number] {
  if (walls.length === 0) return [0, 0];
  const total = walls.reduce(
    (sum, wall) => [sum[0] + wall.position[0], sum[1] + wall.position[2]] as [number, number],
    [0, 0] as [number, number],
  );
  return [total[0] / walls.length, total[1] / walls.length];
}

function rotate(point: [number, number], radians: number): [number, number] {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [point[0] * c - point[1] * s, point[0] * s + point[1] * c];
}

function wallBasis(wall: {
  position: [number, number, number];
  size: [number, number, number];
  rotation: number;
}, center: [number, number]) {
  const alongX = wall.size[0] >= wall.size[2];
  const localNormal = alongX ? ([0, 1] as [number, number]) : ([1, 0] as [number, number]);
  const localTangent = alongX ? ([1, 0] as [number, number]) : ([0, 1] as [number, number]);
  let normal = rotate(localNormal, wall.rotation);
  const tangent = rotate(localTangent, wall.rotation);
  const outward: [number, number] = [wall.position[0] - center[0], wall.position[2] - center[1]];
  if (normal[0] * outward[0] + normal[1] * outward[1] < 0)
    normal = [-normal[0], -normal[1]];
  return { normal, tangent, halfLength: (alongX ? wall.size[0] : wall.size[2]) / 2 };
}

export function wallIsVisible(
  wall: {
    position: [number, number];
    size: [number, number, number];
    rotation: number;
  },
  center: [number, number],
  camera: Pick<Camera, "position">,
  target: [number, number, number] = [center[0], 1.1, center[1]],
) {
  const { normal, tangent, halfLength } = wallBasis(
    { position: [wall.position[0], 1.4, wall.position[1]], size: wall.size, rotation: wall.rotation },
    center,
  );
  const plane = [wall.position[0], wall.position[1]] as [number, number];
  const cameraPoint: [number, number] = [camera.position.x, camera.position.z];
  const targetPoint: [number, number] = [target[0], target[2]];
  const cameraDistance =
    (cameraPoint[0] - plane[0]) * normal[0] + (cameraPoint[1] - plane[1]) * normal[1];
  const targetDistance =
    (targetPoint[0] - plane[0]) * normal[0] + (targetPoint[1] - plane[1]) * normal[1];
  if (cameraDistance * targetDistance >= -0.0001) return true;
  const fraction = cameraDistance / (cameraDistance - targetDistance);
  const hit: [number, number] = [
    cameraPoint[0] + (targetPoint[0] - cameraPoint[0]) * fraction,
    cameraPoint[1] + (targetPoint[1] - cameraPoint[1]) * fraction,
  ];
  const along = (hit[0] - plane[0]) * tangent[0] + (hit[1] - plane[1]) * tangent[1];
  return Math.abs(along) > halfLength + 0.08;
}

function segmentHitsProp(
  position: [number, number, number],
  size: [number, number, number],
  rotation: number,
  camera: Pick<Camera, "position">,
  target: [number, number, number],
) {
  const toLocal = (point: [number, number]) => {
    const dx = point[0] - position[0];
    const dz = point[1] - position[2];
    return rotate([dx, dz], -rotation);
  };
  const a = toLocal([camera.position.x, camera.position.z]);
  const b = toLocal([target[0], target[2]]);
  const halfX = size[0] / 2 + 0.04;
  const halfZ = size[2] / 2 + 0.04;
  let t0 = 0;
  let t1 = 1;
  for (const [start, delta, half] of [
    [a[0], b[0] - a[0], halfX],
    [a[1], b[1] - a[1], halfZ],
  ] as Array<[number, number, number]>) {
    if (Math.abs(delta) < 1e-6) {
      if (Math.abs(start) > half) return false;
      continue;
    }
    const near = (-half - start) / delta;
    const far = (half - start) / delta;
    const low = Math.min(near, far);
    const high = Math.max(near, far);
    t0 = Math.max(t0, low);
    t1 = Math.min(t1, high);
    if (t0 > t1) return false;
  }
  return t1 >= 0 && t0 <= 1;
}

export function updateStageWallVisibility(
  root: Object3D,
  camera: Pick<Camera, "position">,
  target?: [number, number, number],
) {
  const resolvedTarget = target ?? [0, 1.1, 0];
  root.traverse((node) => {
    const primitiveKind = node.userData.stagePrimitiveKind as string | undefined;
    if (primitiveKind === "door") {
      const size = node.userData.stagePrimitiveSize as [number, number, number] | undefined;
      const rotation = node.userData.stagePrimitiveRotation as number | undefined;
      if (size && rotation !== undefined)
        node.visible = !segmentHitsProp(
          [node.position.x, node.position.y, node.position.z],
          size,
          rotation,
          camera,
          resolvedTarget,
        );
      return;
    }
    const center = node.userData.stageWallCenter as [number, number] | undefined;
    const size = node.userData.stageWallSize as [number, number, number] | undefined;
    const rotation = node.userData.stageWallRotation as number | undefined;
    if (!center || !size || rotation === undefined || !node.userData.stageWall) return;
    const wall = {
      position: [node.position.x, node.position.z] as [number, number],
      size,
      rotation,
    };
    const visibleOnRay = wallIsVisible(wall, center, camera, target);
    const { normal } = wallBasis(
      { position: [node.position.x, 1.4, node.position.z], size, rotation },
      center,
    );
    const cameraDistance =
      (camera.position.x - node.position.x) * normal[0] +
      (camera.position.z - node.position.z) * normal[1];
    const centerDistance =
      (center[0] - node.position.x) * normal[0] +
      (center[1] - node.position.z) * normal[1];
    // Outside cameras get the near perimeter wall cut away. Inside cameras
    // use the exact rotation-aware camera-to-target segment test above.
    const nearOutside = cameraDistance > 0.02 && centerDistance < -0.02;
    node.visible = visibleOnRay && !nearOutside;
  });
}

function StageWall({
  wall,
  center,
  target,
}: {
  wall: StageWall;
  center: [number, number];
  target?: [number, number, number];
}) {
  const meshRef = useRef<Mesh>(null);
  useFrame(({ camera }) => {
    if (meshRef.current) updateStageWallVisibility(meshRef.current, camera, target);
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
        stageWallSize: wall.size,
        stageWallRotation: wall.rotation,
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

export function StagePrimitives({
  stage,
  target,
}: {
  stage?: FilmStageState;
  target?: [number, number, number];
}) {
  const center = roomCenter(stage?.walls ?? []);
  if (!stage) return null;
  return (
    <>
      {stage.walls.map((wall) => (
        <StageWall key={wall.id} wall={wall} center={center} target={target} />
      ))}
      {stage.props.map((prop) => (
        <StageProp key={prop.id} prop={prop} />
      ))}
      {stage.axis ? <StageAxis from={stage.axis.from} to={stage.axis.to} /> : null}
    </>
  );
}
