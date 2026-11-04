"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import {
  AnimationMixer,
  Group,
  Mesh,
  PerspectiveCamera,
  Plane,
  Vector2,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { useSiteI18n } from "@/i18n/client";
import { loadFigure } from "./figure-assets";
import type { FigureState } from "./model";
import type { ExportPicture, SceneCanvasProps } from "./canvas-contract";

type OrbitApi = ComponentRef<typeof OrbitControls>;
const floor = new Plane(new Vector3(0, 1, 0), 0);
const clamp = (value: number) => Math.max(-5, Math.min(5, value));

function Figure({
  figure,
  selected,
  onDragging,
  onSelect,
  onMove,
}: {
  figure: FigureState;
  selected: boolean;
  onDragging: (dragging: boolean) => void;
  onSelect: (id: string) => void;
  onMove: SceneCanvasProps["onMove"];
}) {
  const source = useLoader(GLTFLoader, loadFigure(figure.build));
  const model = useMemo(() => {
    const object = clone(source.scene);
    object.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return object;
  }, [source]);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const root = useRef<Group>(null);
  const drag = useRef<{ pointer: number; offset: Vector3 } | null>(null);
  const { invalidate, gl } = useThree();
  useEffect(() => {
    const clip = source.animations.find((candidate) => candidate.name === figure.pose);
    if (!clip) throw new Error(`Figure asset is missing pose ${figure.pose}`);
    mixer.stopAllAction();
    mixer.clipAction(clip).play();
    mixer.setTime(0);
    invalidate();
    return () => {
      mixer.stopAllAction();
    };
  }, [figure.pose, source, mixer, invalidate]);
  useEffect(() => {
    const cancel = () => {
      if (!drag.current) return;
      drag.current = null;
      root.current?.position.set(figure.x, 0, figure.z);
      onDragging(false);
      invalidate();
    };
    gl.domElement.addEventListener("pointercancel", cancel);
    return () => {
      gl.domElement.removeEventListener("pointercancel", cancel);
      onDragging(false);
    };
  }, [onDragging, figure.x, figure.z, gl, invalidate]);
  function down(event: ThreeEvent<PointerEvent>) {
    if (event.button !== 0) return;
    event.stopPropagation();
    const point = event.ray.intersectPlane(floor, new Vector3());
    if (!point) return;
    drag.current = {
      pointer: event.pointerId,
      offset: point.sub(new Vector3(figure.x, 0, figure.z)),
    };
    (event.target as Element).setPointerCapture(event.pointerId);
    onDragging(true);
    onSelect(figure.id);
  }
  function move(event: ThreeEvent<PointerEvent>) {
    if (!drag.current || !root.current) return;
    event.stopPropagation();
    const point = event.ray.intersectPlane(floor, new Vector3());
    if (!point) return;
    point.sub(drag.current.offset);
    root.current.position.set(clamp(point.x), 0, clamp(point.z));
    invalidate();
  }
  function up(event: ThreeEvent<PointerEvent>) {
    if (!drag.current || !root.current) return;
    event.stopPropagation();
    drag.current = null;
    (event.target as Element).releasePointerCapture(event.pointerId);
    onDragging(false);
    onMove(figure.id, root.current.position.x, root.current.position.z);
  }
  return (
    <group
      ref={root}
      position={[figure.x, 0, figure.z]}
      rotation={[0, (figure.turn * Math.PI) / 180, 0]}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
    >
      <primitive object={model} scale={figure.heightCm / 175} dispose={null} />
      {selected ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          userData={{ editorOnly: true }}
        >
          <ringGeometry args={[0.35, 0.39, 40]} />
          <meshBasicMaterial color="#4b5a5b" />
        </mesh>
      ) : null}
    </group>
  );
}

function Runtime({
  scene: document,
  selected,
  onSelect,
  onMove,
  onCameraChange,
  onReady,
  onLost,
}: SceneCanvasProps & { onLost: (lost: boolean) => void }) {
  const { scene, camera, gl, invalidate } = useThree();
  const controls = useRef<OrbitApi>(null);
  const dragging = useCallback((active: boolean) => {
    if (controls.current) controls.current.enabled = !active;
  }, []);
  const notified = useRef(false);
  const exportPicture = useCallback<ExportPicture>(
    async (width, height) => {
      const size = gl.getSize(new Vector2());
      const ratio = gl.getPixelRatio();
      if (!(camera instanceof PerspectiveCamera))
        throw new Error("A perspective camera is required");
      const lens = camera;
      const aspect = lens.aspect;
      const hidden: Object3D[] = [];
      scene.traverse((node) => {
        if (node.userData.editorOnly && node.visible) {
          node.visible = false;
          hidden.push(node);
        }
      });
      try {
        gl.setPixelRatio(1);
        gl.setSize(width, height, false);
        lens.aspect = width / height;
        lens.updateProjectionMatrix();
        // Copy the freshly rendered framebuffer, never a stale demand-mode frame.
        gl.render(scene, camera);
        return await new Promise<Blob>((resolve, reject) =>
          gl.domElement.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("PNG capture failed"))),
            "image/png",
          ),
        );
      } finally {
        hidden.forEach((node) => {
          node.visible = true;
        });
        gl.setPixelRatio(ratio);
        gl.setSize(size.x, size.y, false);
        lens.aspect = aspect;
        lens.updateProjectionMatrix();
        invalidate();
      }
    },
    [camera, gl, invalidate, scene],
  );
  useFrame(() => {
    if (notified.current) return;
    notified.current = true;
    queueMicrotask(() => {
      gl.domElement.dataset.sceneReady = "true";
      onReady(exportPicture);
    });
  });
  useEffect(() => {
    camera.position.set(...document.camera.position);
    if (controls.current) {
      controls.current.target.set(...document.camera.target);
      controls.current.update();
    }
    invalidate();
  }, [camera, document.camera, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onReady(null);
      onLost(true);
    };
    const restored = () => {
      invalidate();
      onReady(exportPicture);
      onLost(false);
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      onReady(null);
    };
  }, [exportPicture, gl, invalidate, onLost, onReady]);
  return (
    <>
      <color attach="background" args={["#eeebe5"]} />
      <ambientLight intensity={1.1} />
      <directionalLight
        position={[3, 7, 5]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-4, 3, -2]} intensity={1.3} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e3dfd7" roughness={1} />
      </mesh>
      <gridHelper
        args={[12, 24, "#b8b3aa", "#d0cbc2"]}
        position={[0, 0.003, 0]}
        userData={{ editorOnly: true }}
      />
      {document.figures.map((figure) => (
        <Figure
          key={figure.id}
          figure={figure}
          selected={figure.id === selected}
          onDragging={dragging}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping={false}
        minDistance={1.5}
        maxDistance={35}
        maxPolarAngle={Math.PI * 0.55}
        onEnd={() => {
          if (controls.current)
            onCameraChange({
              view: document.camera.view,
              position: camera.position.toArray() as [number, number, number],
              target: controls.current.target.toArray() as [number, number, number],
            });
        }}
      />
    </>
  );
}

export default function SceneCanvas(props: SceneCanvasProps) {
  const { t } = useSiteI18n();
  const [lost, setLost] = useState(false);
  return (
    <div className="relative h-full w-full">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        shadows
        camera={{ fov: 40, near: 0.1, far: 250, position: props.scene.camera.position }}
        gl={{ antialias: true, alpha: false }}
        fallback={
          <p className="p-6" role="alert">
            {t("scene.unavailable")}
          </p>
        }
      >
        <Suspense fallback={null}>
          <Runtime {...props} onLost={setLost} />
        </Suspense>
      </Canvas>
      {lost ? (
        <p className="absolute inset-x-0 top-0 bg-card p-4" role="alert">
          {t("scene.unavailable")}
        </p>
      ) : null}
    </div>
  );
}
