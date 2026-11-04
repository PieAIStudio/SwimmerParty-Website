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
  Box3,
  CanvasTexture,
  Group,
  Mesh,
  PerspectiveCamera,
  Plane,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useSiteI18n } from "@/i18n/client";
import { figureScale, loadFigure } from "./figure-assets";
import type { FigureIdentity, FigureState } from "./model";
import type { ExportPicture, SceneCanvasProps } from "./canvas-contract";

type OrbitApi = ComponentRef<typeof OrbitControls>;
const floor = new Plane(new Vector3(0, 1, 0), 0);
const clamp = (value: number) => Math.max(-5, Math.min(5, value));

function FigureLabel({ identity, y }: { identity: FigureIdentity; y: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = "#202124";
    context.font = "600 88px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(identity.label.split(" · ")[0], 64, 56);
    context.fillStyle = identity.colour;
    context.fillRect(0, 108, 128, 20);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [identity.label, identity.colour]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={[0, y, 0]} scale={[0.14, 0.14, 1]} renderOrder={10}>
      <spriteMaterial map={texture} depthTest={false} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

function Figure({
  figure,
  identity,
  selected,
  onDragging,
  onSelect,
  onMove,
}: {
  figure: FigureState;
  identity: FigureIdentity;
  selected: boolean;
  onDragging: (dragging: boolean) => void;
  onSelect: (id: string) => void;
  onMove: SceneCanvasProps["onMove"];
}) {
  const source = useLoader(GLTFLoader, loadFigure(figure.build, figure.pose));
  const model = useMemo(() => {
    const object = source.scene.clone(true);
    object.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return object;
  }, [source]);
  const scale = figureScale(figure.build, figure.heightCm);
  const top = useMemo(() => new Box3().setFromObject(model).max.y, [model]);
  const root = useRef<Group>(null);
  const drag = useRef<{ pointer: number; offset: Vector3 } | null>(null);
  const { invalidate, gl } = useThree();
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
      <primitive object={model} scale={scale} dispose={null} />
      <FigureLabel identity={identity} y={top * scale + 0.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[0.27, 0.34, 40]} />
        <meshBasicMaterial color={identity.colour} toneMapped={false} />
      </mesh>
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
  identities,
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
        const picture = window.document.createElement("canvas");
        picture.width = width;
        picture.height = height;
        const context = picture.getContext("2d")!;
        context.drawImage(gl.domElement, 0, 0);
        // A fixed name key stays readable even when the camera puts figures behind one another.
        // The matching number and band remain attached to each figure in the 3D view.
        const column = width / identities.length;
        const fontSize = Math.min(28, width / (identities.length * 9));
        context.font = `600 ${fontSize}px system-ui, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        identities.forEach((identity, index) => {
          const left = index * column + 12;
          context.fillStyle = "#ffffff";
          context.fillRect(left, height - 72, column - 24, 56);
          context.fillStyle = "#202124";
          context.fillText(identity.label, (index + 0.5) * column, height - 48, column - 40);
          context.fillStyle = identity.colour;
          context.fillRect(left, height - 24, column - 24, 8);
        });
        return await new Promise<Blob>((resolve, reject) =>
          picture.toBlob(
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
    [camera, gl, invalidate, scene, identities],
  );
  useFrame(() => {
    if (notified.current) return;
    notified.current = true;
    queueMicrotask(() => {
      gl.domElement.dataset.sceneReady = "true";
      gl.domElement.dataset.sceneAssets = document.figures
        .map((figure) => loadFigure(figure.build, figure.pose))
        .join(",");
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
    notified.current = false;
    invalidate();
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
      delete canvas.dataset.sceneReady;
      delete canvas.dataset.sceneAssets;
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
      {document.figures.map((figure, index) => (
        <Figure
          key={figure.id}
          figure={figure}
          identity={identities[index]}
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
        <Suspense
          key={props.scene.figures.map((figure) => loadFigure(figure.build, figure.pose)).join(",")}
          fallback={null}
        >
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
