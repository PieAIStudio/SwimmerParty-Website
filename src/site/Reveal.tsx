"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** One observer per group. Plain HTML stays visible when scripting is unavailable. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const targets = host.current?.querySelectorAll<HTMLElement>(".sp-reveal");
    if (!targets?.length) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      targets.forEach((node) => node.classList.add("is-in"));
      return;
    }
    targets.forEach((node, index) => {
      node.style.transitionDelay = `${Math.min(index, 5) * 60}ms`;
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04 },
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={host} className={className}>
      {children}
    </div>
  );
}
