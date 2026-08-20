"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import type { Mesh } from "three";
import { WhiteModel } from "./WhiteModel";

/**
 * The stage.
 *
 * Colour pipeline (Web3D capability baseline rule 2): R3F owns the single
 * renderer for this canvas, applies ACES Filmic tone mapping, and encodes
 * to sRGB exactly once on output. There is deliberately no EffectComposer
 * here — inserting one would move the encode and silently wash the image.
 * The grade is done in-scene with light colour and fog instead.
 *
 * DPR is clamped and drops a tier on coarse pointers (rule 4).
 */

/** A ring sweeping the figure — reads as an active 3D scan pass. A flat
 *  plane was tried first and rendered as a glowing slab across the stage;
 *  a thin torus outline is what actually looks like a scanner. */
function ScanRing({ color }: { color: string }) {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = (clock.elapsedTime * 0.28) % 1;
    mesh.current.position.y = t * 1.82;
    // Widen at the hips, narrow at the crown, so the ring hugs the body.
    const w = 1 + Math.sin(t * Math.PI) * 0.28;
    mesh.current.scale.set(w, w, w);
    const m = mesh.current.material as { opacity: number };
    m.opacity = Math.sin(t * Math.PI) * 0.85;
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.36, 0.0055, 8, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function Scene({ accent }: { accent: string }) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 4.6, 15]} />

      {/* Key: cold white from front-right. */}
      <directionalLight position={[2.6, 3.2, 2.4]} intensity={2.1} color="#eef2ff" castShadow />
      {/* Rim: acid from behind-left. This is what carves the silhouette. */}
      <directionalLight position={[-3, 2.2, -2.6]} intensity={2.2} color={accent} />
      {/* Bounce: cyan up-light from the grid. */}
      <pointLight
        position={[0, 0.15, 1.2]}
        intensity={2.2}
        color="#00e5ff"
        distance={5}
        decay={2}
      />
      <ambientLight intensity={0.16} />

      <group position={[0, -0.88, 0]}>
        <WhiteModel accent={accent} />
        <ScanRing color={accent} />
      </group>

      <Grid
        args={[40, 40]}
        position={[0, -0.88, 0]}
        cellSize={0.3}
        cellThickness={0.5}
        cellColor="#0e2b31"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#0e7c8c"
        fadeDistance={16}
        fadeStrength={1.6}
        followCamera={false}
        infiniteGrid
      />
    </>
  );
}

export default function Stage({ accent = "#ccff00" }: { accent?: string }) {
  const [active, setActive] = useState(true);
  const host = useRef<HTMLDivElement>(null);

  /* Lifecycle: stop rendering when the canvas scrolls away or the tab is
   * backgrounded. A 3D hero that keeps burning GPU off-screen is the most
   * common reason a site kills a laptop battery. */
  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);

    const onVisibility = () => setActive(!document.hidden && !!el.offsetParent);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={coarse ? [1, 1.35] : [1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [2.0, 0.28, 4.15], fov: 32, near: 0.1, far: 60 }}
        shadows
      >
        <Scene accent={accent} />
      </Canvas>
    </div>
  );
}
