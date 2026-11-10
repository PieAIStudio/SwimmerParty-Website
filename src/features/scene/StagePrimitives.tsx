"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Raycaster, Vector3, type Camera, type Object3D } from "three";
import type { FilmStageState, StageWall } from "./stage-contract";

type PrimitiveProps = FilmStageState["props"][number];
type StageNode = Object3D & { userData: Record<string, unknown> };
type PrimitiveMeta = {
  id: string;
  kind: string;
  node: StageNode;
  size: [number, number, number];
  rotation: number;
  center: Vector3;
  ownerId?: string;
};

function StageMaterial({ colour }: { colour: string }) {
  return <meshStandardMaterial color={colour} roughness={0.82} metalness={0.02} />;
}

function primitiveData(prop: PrimitiveProps) {
  return {
    stagePrimitiveId: prop.id,
    stagePrimitiveKind: prop.kind,
    stagePrimitiveSize: prop.size,
    stagePrimitiveRotation: prop.rotation,
    stagePrimitiveOwnerId: prop.ownerId,
    stagePrimitiveRoot: true,
  };
}

function StageProp({ prop }: { prop: PrimitiveProps }) {
  const [width, height, depth] = prop.size;
  const data = primitiveData(prop);
  const colour =
    prop.kind === "door"
      ? "#7b5b42"
      : prop.kind === "toilet" || prop.kind === "cylinder"
        ? "#d9dce0"
        : prop.kind === "handProp"
          ? "#b7b0a3"
          : "#aaa39a";

  if (prop.kind === "toilet" || prop.kind === "cylinder") {
    const bowlHeight = Math.max(0.3, height * 0.9);
    return (
      <group position={prop.position} rotation={[0, prop.rotation, 0]} userData={data}>
        <mesh position={[0, -0.01, depth * 0.08]} castShadow receiveShadow userData={data}>
          <cylinderGeometry args={[width * 0.44, width * 0.5, bowlHeight, 20]} />
          <StageMaterial colour={colour} />
        </mesh>
        {prop.kind === "toilet" ? (
          <mesh
            position={[0, height * 0.68, -depth * 0.24]}
            castShadow
            receiveShadow
            userData={data}
          >
            <boxGeometry args={[width * 0.72, 0.68, depth * 0.42]} />
            <StageMaterial colour={colour} />
          </mesh>
        ) : null}
      </group>
    );
  }

  if (prop.kind === "door") {
    const open = Math.abs(Math.sin(prop.rotation)) > 0.9;
    const frameData = { ...data, stagePrimitivePart: true };
    return (
      <group position={prop.position} userData={data}>
        <mesh position={[0, height / 2, -depth / 2]} castShadow receiveShadow userData={frameData}>
          <boxGeometry args={[width, height, 0.1]} />
          <StageMaterial colour={colour} />
        </mesh>
        <mesh position={[0, height / 2, depth / 2]} castShadow receiveShadow userData={frameData}>
          <boxGeometry args={[width, height, 0.1]} />
          <StageMaterial colour={colour} />
        </mesh>
        <mesh position={[0, height - 0.05, 0]} castShadow receiveShadow userData={frameData}>
          <boxGeometry args={[width, 0.1, depth + 0.1]} />
          <StageMaterial colour={colour} />
        </mesh>
        {open ? (
          <group position={[0, 0, -depth / 2]} rotation={[0, Math.PI / 2, 0]}>
            <mesh
              position={[0, height / 2, depth / 2]}
              castShadow
              receiveShadow
              userData={frameData}
            >
              <boxGeometry args={[width, height, Math.max(0.1, depth - 0.1)]} />
              <StageMaterial colour={colour} />
            </mesh>
          </group>
        ) : (
          <mesh position={[0, height / 2, 0]} castShadow receiveShadow userData={frameData}>
            <boxGeometry args={[width, height, Math.max(0.1, depth - 0.1)]} />
            <StageMaterial colour={colour} />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <mesh
      position={prop.position}
      rotation={[0, prop.rotation, 0]}
      castShadow
      receiveShadow
      userData={data}
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

function primitiveId(node: Object3D) {
  return typeof node.userData.stagePrimitiveId === "string"
    ? node.userData.stagePrimitiveId
    : undefined;
}

function stageNodes(root: Object3D) {
  const nodes: StageNode[] = [];
  root.traverse((node) => {
    if (node.userData.stageWall || primitiveId(node)) nodes.push(node as StageNode);
  });
  return nodes;
}

function primitiveMeta(node: StageNode): PrimitiveMeta | undefined {
  const id = primitiveId(node);
  if (!id) return undefined;
  const size = node.userData.stagePrimitiveSize;
  if (!Array.isArray(size) || size.length !== 3) return undefined;
  const center = new Vector3();
  node.getWorldPosition(center);
  return {
    id,
    kind: String(node.userData.stagePrimitiveKind ?? "prop"),
    node,
    size: size as [number, number, number],
    rotation:
      typeof node.userData.stagePrimitiveRotation === "number"
        ? node.userData.stagePrimitiveRotation
        : 0,
    center,
    ownerId:
      typeof node.userData.stagePrimitiveOwnerId === "string"
        ? node.userData.stagePrimitiveOwnerId
        : undefined,
  };
}

function pointInsideBox(point: Vector3, meta: PrimitiveMeta) {
  if (meta.kind === "door") return false;
  const local = point.clone().sub(meta.center);
  local.applyAxisAngle(new Vector3(0, 1, 0), -meta.rotation);
  const [width, height, depth] = meta.size;
  return (
    Math.abs(local.x) < width / 2 + 0.03 &&
    Math.abs(local.z) < depth / 2 + 0.03 &&
    Math.abs(local.y) < Math.max(0.02, height / 2 - 0.025)
  );
}

function targetPoints(root: Object3D) {
  const points: Array<{ point: Vector3; ownerId?: string }> = [];
  const sceneRoot = root.parent ?? root;
  sceneRoot.traverse((node) => {
    const figureId =
      typeof node.userData.figureBody === "string" ? node.userData.figureBody : undefined;
    if (!figureId) return;
    for (const name of ["head", "spine_03", "hand_l", "hand_r"]) {
      const joint = node.getObjectByName(name);
      if (joint) {
        const point = new Vector3();
        joint.getWorldPosition(point);
        points.push({ point });
      }
    }
    if (!["head", "spine_03", "hand_l", "hand_r"].some((name) => node.getObjectByName(name))) {
      const point = new Vector3();
      node.getWorldPosition(point);
      points.push({ point: point.add(new Vector3(0, 1.1, 0)) });
    }
  });
  root.traverse((node) => {
    const meta = primitiveMeta(node as StageNode);
    if (meta?.ownerId) points.push({ point: meta.center, ownerId: meta.id });
  });
  return points;
}

function stageEvidence(root: Object3D, camera: Camera) {
  const nodes = stageNodes(root);
  const grouped = new Map<string, StageNode[]>();
  const metas = new Map<string, PrimitiveMeta>();
  for (const node of nodes) {
    const id =
      primitiveId(node) ??
      (typeof node.userData.stageWall === "string" ? node.userData.stageWall : undefined);
    if (!id) continue;
    const group = grouped.get(id) ?? [];
    group.push(node);
    grouped.set(id, group);
    const meta = primitiveMeta(node);
    if (meta && !metas.has(id)) metas.set(id, meta);
    node.visible = true;
  }

  const hidden = new Set<string>();
  const raycaster = new Raycaster();
  const origin = camera.position.clone();
  for (const endpoint of targetPoints(root)) {
    const delta = endpoint.point.clone().sub(origin);
    const distance = delta.length();
    if (distance < 0.05) continue;
    raycaster.set(origin, delta.normalize());
    for (const [id, parts] of grouped) {
      if (metas.get(id)?.ownerId) continue;
      let blocked = false;
      for (const part of parts) {
        if (!part.visible || !(part as StageNode & { isMesh?: boolean }).isMesh) continue;
        const hit = raycaster.intersectObject(part, false)[0];
        if (hit && hit.distance < distance - 0.035) {
          blocked = true;
          break;
        }
      }
      if (blocked) hidden.add(id);
    }
  }
  for (const [id, parts] of grouped) {
    const visible = !hidden.has(id);
    for (const part of parts) part.visible = visible;
  }

  const inside: Array<{ personId: string; propId: string; joint: string }> = [];
  const sceneRoot = root.parent ?? root;
  sceneRoot.traverse((node) => {
    const personId =
      typeof node.userData.figureBody === "string" ? node.userData.figureBody : undefined;
    if (!personId) return;
    for (const jointName of ["pelvis", "spine_01", "spine_02", "spine_03"]) {
      const joint = node.getObjectByName(jointName);
      if (!joint) continue;
      const point = new Vector3();
      joint.getWorldPosition(point);
      for (const [propId, meta] of metas) {
        if (pointInsideBox(point, meta)) inside.push({ personId, propId, joint: jointName });
      }
    }
  });

  const evidence = {
    hiddenObjects: [...hidden].sort(),
    personInsideProps: inside,
  };
  if (typeof document !== "undefined") {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.dataset.sceneHiddenObjects = JSON.stringify(evidence.hiddenObjects);
      canvas.dataset.scenePropCheck = JSON.stringify(evidence.personInsideProps);
    }
  }
  return evidence;
}

export function updateStageVisibility(root: Object3D, camera: Camera) {
  return stageEvidence(root, camera);
}

function StageWall({ wall, center }: { wall: StageWall; center: [number, number] }) {
  return (
    <mesh
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

export function StagePrimitives({ stage }: { stage?: FilmStageState }) {
  const stageRoot = useRef<Group>(null);
  const center = roomCenter(stage?.walls ?? []);
  useFrame(({ camera }) => {
    if (stageRoot.current) updateStageVisibility(stageRoot.current, camera);
  });
  if (!stage) return null;
  return (
    <group ref={stageRoot}>
      {stage.walls.map((wall) => (
        <StageWall key={wall.id} wall={wall} center={center} />
      ))}
      {stage.props.map((prop) => (
        <StageProp key={prop.id} prop={prop} />
      ))}
      {stage.axis ? <StageAxis from={stage.axis.from} to={stage.axis.to} /> : null}
    </group>
  );
}
