"use client";

import { useRef, type ReactNode } from "react";

/**
 * 2.5D parallax for a flat plate.
 *
 * The plate is a painted image, not geometry, so the depth has to be
 * faked: the frame takes a small perspective rotation toward the pointer
 * and the image inside it moves further than the frame does. The gap
 * between those two rates is the entire illusion.
 *
 * Everything is written straight to `style.transform` inside one pointer
 * handler rather than through React state — a re-render per pointermove
 * would drop frames on exactly the machines this effect is for.
 */
export function TiltPlate({
  children,
  className,
  /** Degrees of rotation at the far edge. */
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = frame.current;
    const deep = inner.current;
    if (!el || !deep) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    el.style.transform = `perspective(1400px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
    deep.style.transform = `translate3d(${x * -3.2}%, ${y * -3.2}%, 0) scale(1.07)`;
  };

  const reset = () => {
    if (frame.current) frame.current.style.transform = "";
    if (inner.current) inner.current.style.transform = "";
  };

  return (
    <div
      ref={frame}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`transition-transform duration-500 ease-[var(--ease-out-expo)] ${className ?? ""}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        ref={inner}
        className="h-full w-full transition-transform duration-500 ease-[var(--ease-out-expo)]"
      >
        {children}
      </div>
    </div>
  );
}
