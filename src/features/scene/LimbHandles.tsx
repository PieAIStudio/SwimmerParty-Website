import { useEffect, useMemo, useRef, type PointerEvent } from "react";
import { createPortal, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei/web/Html";
import { GameIconButton } from "@pieai/swimmer-ui-kit";
import { Plane, Raycaster, Vector2, Vector3, type Object3D } from "three";
import { useSiteI18n } from "@/i18n/client";
import { createFigureIK, HANDLES, type Handle } from "./figure-ik";
import type { JointRotations } from "./model";

export function LimbHandles({
  object,
  id,
  onDragging,
  onPose,
}: {
  object: Object3D;
  id: string;
  onDragging: (active: boolean) => void;
  onPose: (id: string, joints: JointRotations) => void;
}) {
  const ik = useMemo(() => createFigureIK(object), [object]);
  useEffect(() => () => ik.dispose(), [ik]);
  return HANDLES.map((handle) => (
    <HandleDot key={handle} {...{ ik, handle, id, onDragging, onPose }} />
  ));
}

function HandleDot({
  ik,
  handle,
  id,
  onDragging,
  onPose,
}: {
  ik: ReturnType<typeof createFigureIK>;
  handle: Handle;
  id: string;
  onDragging: (active: boolean) => void;
  onPose: (id: string, joints: JointRotations) => void;
}) {
  const { t } = useSiteI18n();
  const { camera, gl, scene, invalidate } = useThree();
  const drag = useRef<Plane | null>(null);
  useEffect(() => {
    invalidate();
  }, [invalidate]);
  useEffect(() => () => onDragging(false), [onDragging]);
  function finish(event: PointerEvent, cancelled = false) {
    if (!drag.current) return;
    event.stopPropagation();
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragging(false);
    // Persist one edit per gesture, including interrupted gestures, never per move.
    onPose(id, ik.rotations());
    if (cancelled) invalidate();
  }
  return createPortal(
    <group userData={{ editorOnly: true }}>
      <Html center zIndexRange={[30, 0]}>
        <GameIconButton
          size="sm"
          label={t(`scene.handle.${handle}`)}
          data-scene-handle={handle}
          style={{ touchAction: "none" }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = new Plane().setFromNormalAndCoplanarPoint(
              camera.getWorldDirection(new Vector3()),
              ik.position(handle),
            );
            onDragging(true);
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            event.stopPropagation();
            const box = gl.domElement.getBoundingClientRect();
            const ray = new Raycaster();
            ray.setFromCamera(
              new Vector2(
                ((event.clientX - box.left) / box.width) * 2 - 1,
                1 - ((event.clientY - box.top) / box.height) * 2,
              ),
              camera,
            );
            const point = ray.ray.intersectPlane(drag.current, new Vector3());
            if (!point) return;
            if (handle.endsWith("Wrist")) {
              // A small screen-space shoulder snap supplies the missing drag depth.
              // It lets a front/OTS view reach the actual shoulder, not its projection.
              let nearest = 20;
              scene.traverse((node) => {
                if (!node.userData.figureBody || node.userData.figureBody === id) return;
                for (const name of ["upperarm_l", "upperarm_r"]) {
                  const bone = node.getObjectByName(name);
                  if (!bone) continue;
                  const shoulder = bone.getWorldPosition(new Vector3());
                  const screen = shoulder.clone().project(camera);
                  const distance = Math.hypot(
                    ((screen.x + 1) * box.width) / 2 + box.left - event.clientX,
                    ((1 - screen.y) * box.height) / 2 + box.top - event.clientY,
                  );
                  if (distance < nearest) {
                    nearest = distance;
                    point.copy(shoulder);
                  }
                }
              });
            }
            point.y = Math.max(0.06, point.y);
            ik.solve(handle, point);
            invalidate();
          }}
          onPointerUp={(event) => finish(event)}
          onPointerCancel={(event) => finish(event, true)}
          onKeyDown={(event) => {
            const directions: Record<string, Vector3> = {
              ArrowLeft: new Vector3(-0.025, 0, 0),
              ArrowRight: new Vector3(0.025, 0, 0),
              ArrowUp: new Vector3(0, 0.025, 0),
              ArrowDown: new Vector3(0, -0.025, 0),
            };
            const step = directions[event.key];
            if (!step) return;
            event.preventDefault();
            ik.solve(handle, ik.position(handle).add(step));
            onPose(id, ik.rotations());
            invalidate();
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <circle cx="6" cy="6" r="4" fill="currentColor" />
          </svg>
        </GameIconButton>
      </Html>
    </group>,
    ik.effector(handle),
  );
}
