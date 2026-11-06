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
import { CameraControls } from "@react-three/drei/core/CameraControls";
import { Grid } from "@react-three/drei/core/Grid";
import { LimbHandles } from "./LimbHandles";
import {
  Box3,
  CanvasTexture,
  FileLoader,
  Group,
  PerspectiveCamera,
  Plane,
  SRGBColorSpace,
  Sprite,
  Vector2,
  Vector3,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useSiteI18n } from "@/i18n/client";
import { figureScale, loadFigure, loadPose } from "./figure-assets";
import { poseFigure, updateSkinBounds, type FigurePose } from "./rigged-figure";
import { frameFigures, setLens } from "./framing";
import type { FigureIdentity, FigureState } from "./model";
import type { ExportPicture, SceneCanvasProps } from "./canvas-contract";

type CameraApi = ComponentRef<typeof CameraControls>;
const floor = new Plane(new Vector3(0, 1, 0), 0);

function FigureLabel({ identity, y }: { identity: FigureIdentity; y: number }) {
  const sprite = useRef<Sprite>(null);
  useFrame(({ camera, size }) => {
    if (sprite.current && camera instanceof PerspectiveCamera) {
      const scale = (40 * Math.tan((camera.fov * Math.PI) / 360)) / size.height;
      sprite.current.scale.set(scale, scale, 1);
    }
  });
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = "#202124";
    const number = identity.label.split(" · ")[0];
    context.font = `600 ${Math.min(88, 168 / number.length)}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(number, 64, 56);
    context.fillStyle = identity.colour;
    context.fillRect(0, 108, 128, 20);
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [identity.label, identity.colour]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite ref={sprite} position={[0, y, 0]} renderOrder={10}>
      <spriteMaterial
        map={texture}
        sizeAttenuation={false}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

function ContactPatch({
  position,
  size = 0.55,
}: {
  position: [number, number, number];
  size?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d")!;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(53,45,36,0.28)");
    gradient.addColorStop(0.35, "rgba(53,45,36,0.16)");
    gradient.addColorStop(1, "rgba(53,45,36,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} raycast={() => {}}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Figure({
  figure,
  identity,
  selected,
  limbs,
  shot,
  onPose,
  onDragging,
  onSelect,
  onMove,
}: {
  figure: FigureState;
  identity: FigureIdentity;
  selected: boolean;
  limbs: boolean;
  shot: SceneCanvasProps["scene"]["camera"]["shot"];
  onPose: SceneCanvasProps["onPose"];
  onDragging: (dragging: boolean) => void;
  onSelect: (id: string) => void;
  onMove: SceneCanvasProps["onMove"];
}) {
  const source = useLoader(GLTFLoader, loadFigure(figure.build));
  const pose = useLoader(FileLoader, loadPose(figure.pose), (loader) =>
    loader.setResponseType("json"),
  ) as unknown as FigurePose;
  const scale = figureScale(figure.build, figure.heightCm);
  const model = useMemo(
    () => poseFigure(source.scene, pose, scale, figure.pose === "sit", figure.joints),
    [source, pose, scale, figure.pose, figure.joints],
  );
  useEffect(() => () => model.dispose(), [model]);
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
    root.current.position.set(point.x, 0, point.z);
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
      <group userData={{ figureBody: figure.id }}>
        <primitive object={model.object} dispose={null} />
        {model.seat ? (
          <mesh
            position={model.seat.position}
            castShadow
            receiveShadow
            userData={{ figureSeat: figure.id }}
          >
            <boxGeometry args={model.seat.size} />
            <meshStandardMaterial color="#4a4e54" roughness={0.95} />
          </mesh>
        ) : null}
      </group>
      {model.contacts.map((foot, index) => (
        <ContactPatch key={index} position={[foot[0], 0.005, foot[2]]} />
      ))}
      {model.seat ? (
        <ContactPatch
          position={[model.seat.position[0], 0.006, model.seat.position[2]]}
          size={0.9}
        />
      ) : null}
      {selected && limbs ? (
        <LimbHandles object={model.object} id={figure.id} onDragging={onDragging} onPose={onPose} />
      ) : null}
      <FigureLabel identity={identity} y={model.top + (shot === "close" ? 0.08 : 0.2)} />
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
  limbs,
  onPose,
  onSelect,
  onMove,
  onCameraChange,
  onReady,
  onLost,
}: SceneCanvasProps & { onLost: (lost: boolean) => void }) {
  const { scene, camera, gl, invalidate, size: viewport } = useThree();
  const { t } = useSiteI18n();
  const controls = useRef<CameraApi>(null);
  const pointerActive = useRef(false);
  const wheelActive = useRef(false);
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
        const columns = Math.max(1, Math.floor(width / 280));
        const rows = Math.ceil(identities.length / columns);
        picture.height = height + rows * 64 + 48;
        const context = picture.getContext("2d")!;
        context.drawImage(gl.domElement, 0, 0);
        // A fixed name key stays readable even when the camera puts figures behind one another.
        // The matching number and band remain attached to each figure in the 3D view.
        const column = width / columns;
        context.fillStyle = "#eeebe5";
        context.fillRect(0, height, width, rows * 64 + 48);
        context.font = "600 24px system-ui, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        identities.forEach((identity, index) => {
          const left = (index % columns) * column + 12;
          const top = height + Math.floor(index / columns) * 64;
          context.fillStyle = "#ffffff";
          context.fillRect(left, top + 4, column - 24, 56);
          context.fillStyle = "#202124";
          let label = identity.label;
          while (context.measureText(label).width > column - 40 && label.length > 1)
            label = label.slice(0, -2) + "…";
          context.fillText(label, left + (column - 24) / 2, top + 27);
          context.fillStyle = identity.colour;
          context.fillRect(left, top + 48, column - 24, 8);
        });
        context.fillStyle = "#202124";
        context.font = "24px system-ui, sans-serif";
        const subjectIndex = document.figures.findIndex(
          (figure) => figure.id === document.camera.subject,
        );
        const subject = subjectIndex < 0 ? t("scene.everyone") : identities[subjectIndex].label;
        context.fillText(
          `${document.camera.lens} mm · ${t(`scene.shot.${document.camera.shot}`)} · ${t(`scene.view.${document.camera.view}`)} · ${subject}`,
          width / 2,
          height + rows * 64 + 24,
        );
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
    [camera, gl, invalidate, scene, identities, document.camera, document.figures, t],
  );
  useFrame(() => {
    if (notified.current) return;
    notified.current = true;
    queueMicrotask(() => {
      gl.domElement.dataset.sceneReady = "true";
      gl.domElement.dataset.sceneAssets = document.figures
        .map((figure) => loadFigure(figure.build))
        .join(",");
      gl.domElement.dataset.scenePoses = document.figures.map((figure) => figure.pose).join(",");
      gl.domElement.dataset.sceneJoints = JSON.stringify(
        document.figures.map((figure) => figure.joints),
      );
      onReady(exportPicture);
    });
  });
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || !controls.current) return;
    setLens(camera, document.camera);
    const api = controls.current;
    const bodies = new Map<string, Box3>();
    const seats: string[] = [];
    const joints: Record<string, Record<string, number[]>> = {};
    updateSkinBounds(scene);
    scene.traverse((node) => {
      if (node.userData.figureBody) {
        bodies.set(node.userData.figureBody, new Box3().setFromObject(node, true));
        joints[node.userData.figureBody] = Object.fromEntries(
          [
            "hand_l",
            "hand_r",
            "middle_01_l",
            "index_01_l",
            "pinky_01_l",
            "middle_01_r",
            "index_01_r",
            "pinky_01_r",
            "upperarm_l",
            "upperarm_r",
            "lowerarm_l",
            "lowerarm_r",
            "foot_l",
            "foot_r",
            "head",
          ].map((name) => [
            name,
            node.getObjectByName(name)!.getWorldPosition(new Vector3()).toArray(),
          ]),
        );
      }
      if (node.userData.figureSeat) seats.push(node.userData.figureSeat);
    });
    if (document.camera.fit) {
      frameFigures(api, document.camera, document.figures, bodies);
      const resolved = {
        ...document.camera,
        fit: false,
        position: api.getPosition(new Vector3()).toArray() as [number, number, number],
        target: api.getTarget(new Vector3()).toArray() as [number, number, number],
      };
      queueMicrotask(() => onCameraChange(resolved, false));
    } else {
      void api.setLookAt(...document.camera.position, ...document.camera.target, false);
      api.update(0);
    }
    // Evidence is the real rendered camera and loaded geometry, not standing-height estimates.
    gl.domElement.setAttribute(
      "data-scene-camera",
      JSON.stringify({
        ...document.camera,
        position: api.getPosition(new Vector3()).toArray(),
        target: api.getTarget(new Vector3()).toArray(),
        fov: camera.fov,
        aspect: camera.aspect,
        seats,
        joints,
        bodies: [...bodies].map(([id, box]) => ({
          id,
          min: box.min.toArray(),
          max: box.max.toArray(),
        })),
      }),
    );
    invalidate();
  }, [
    camera,
    document.camera,
    document.figures,
    gl,
    invalidate,
    onCameraChange,
    scene,
    viewport.width,
    viewport.height,
  ]);
  function saveCamera() {
    if (!controls.current) return;
    onCameraChange({
      ...document.camera,
      fit: false,
      position: controls.current.getPosition(new Vector3(), true).toArray() as [
        number,
        number,
        number,
      ],
      target: controls.current.getTarget(new Vector3(), true).toArray() as [number, number, number],
    });
  }
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
      delete canvas.dataset.scenePoses;
      delete canvas.dataset.sceneJoints;
      onReady(null);
    };
  }, [exportPicture, gl, invalidate, onLost, onReady]);
  return (
    <>
      <color attach="background" args={["#eeebe5"]} />
      <fog attach="fog" args={["#eeebe5", 8, 24]} />
      <hemisphereLight args={["#fff9ef", "#d4cfcb", 2.2]} />
      <directionalLight
        position={[3, 7, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-4, 3, -2]} intensity={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#eeebe5" roughness={1} />
      </mesh>
      <Grid
        args={[40, 40]}
        cellSize={0.5}
        sectionSize={2}
        cellColor="#d0cbc2"
        sectionColor="#b8b3aa"
        cellThickness={0.5}
        sectionThickness={0.6}
        fadeDistance={12}
        fadeStrength={2}
        position={[0, 0.003, 0]}
        userData={{ editorOnly: true }}
      />
      {document.figures.map((figure, index) => (
        <Figure
          key={figure.id}
          figure={figure}
          identity={identities[index]}
          selected={figure.id === selected}
          limbs={limbs}
          shot={document.camera.shot}
          onPose={onPose}
          onDragging={dragging}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0}
        draggingSmoothTime={0}
        minDistance={0.2}
        maxDistance={Infinity}
        maxPolarAngle={Math.PI * 0.55}
        onControlStart={() => {
          pointerActive.current = true;
        }}
        onControl={() => {
          if (!pointerActive.current) wheelActive.current = true;
        }}
        onControlEnd={() => {
          pointerActive.current = false;
          wheelActive.current = false;
          saveCamera();
        }}
        onRest={() => {
          if (wheelActive.current) {
            wheelActive.current = false;
            saveCamera();
          }
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
        camera={{ fov: 40, near: 0.05, far: 10000, position: props.scene.camera.position }}
        gl={{ antialias: true, alpha: false }}
        fallback={
          <p className="p-6" role="alert">
            {t("scene.unavailable")}
          </p>
        }
      >
        <Suspense
          key={props.scene.figures.map((figure) => `${figure.build}:${figure.pose}`).join(",")}
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
