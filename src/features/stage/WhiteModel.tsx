"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { SiteTheme } from "@/site/theme";
import { assemblyOrder, PARTS, scatterOf, type Part } from "./parts";
import { CLAY } from "./palette";

function Geometry({ part }: { part: Part }) {
  if (part.kind === "sphere") return <sphereGeometry args={[part.r, 28, 24]} />;
  if (part.kind === "box") return <boxGeometry args={part.size} />;
  return <capsuleGeometry args={[part.r, part.len, 8, 20]} />;
}

/** A single 1.4s assembly, then only a bounded ±12° pointer yaw. */
export function WhiteModel({
  theme,
  assemble,
  reduced,
}: {
  theme: SiteTheme;
  assemble: boolean;
  reduced: boolean;
}) {
  const group = useRef<Group>(null);
  const nodes = useRef<(Group | null)[]>([]);
  const elapsed = useRef(0);
  const scatter = useMemo(() => PARTS.map((_, index) => scatterOf(index)), []);
  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    elapsed.current += delta;
    const target = reduced ? 0 : (Math.max(-1, Math.min(1, pointer.x)) * Math.PI) / 15;
    group.current.rotation.y = reduced
      ? 0
      : group.current.rotation.y + (target - group.current.rotation.y) * Math.min(1, delta * 5);
    const progress = assemble && !reduced ? Math.min(1, elapsed.current / 1.4) : 1;
    PARTS.forEach((part, index) => {
      const node = nodes.current[index];
      if (!node) return;
      const start = assemblyOrder(index) * 0.5;
      const amount = Math.max(0, Math.min(1, (progress - start) / 0.5));
      const remaining = (1 - amount) ** 3;
      const scattered = scatter[index];
      node.position.set(
        ...(part.pos.map((value, axis) => value + scattered.offset[axis] * remaining) as [
          number,
          number,
          number,
        ]),
      );
      const rotation = "rot" in part && part.rot ? part.rot : [0, 0, 0];
      node.rotation.set(
        rotation[0] + scattered.rot[0] * remaining,
        rotation[1] + scattered.rot[1] * remaining,
        rotation[2] + scattered.rot[2] * remaining,
      );
      node.scale.setScalar(1 - 0.65 * remaining);
    });
  });
  return (
    <group ref={group}>
      {PARTS.map((part, index) => (
        <group
          key={index}
          ref={(node) => {
            nodes.current[index] = node;
          }}
          position={part.pos}
        >
          <mesh castShadow receiveShadow>
            <Geometry part={part} />
            <meshStandardMaterial color={CLAY[theme]} roughness={0.9} metalness={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
