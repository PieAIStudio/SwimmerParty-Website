"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, useIsoLayoutEffect } from "./gsap";

/**
 * Headline type that arrives one unit at a time, from below a hard mask.
 *
 * The unit differs by script and that matters: English reads in words, so
 * splitting on spaces is right. Chinese has no spaces, and splitting a
 * Chinese line into words would need a segmenter — but Chinese poster type
 * also lands harder per character, so characters are both the easier and
 * the better unit. `Array.from` is used rather than `split("")` so an
 * astral-plane character is never cut in half.
 */
function units(text: string): string[] {
  if (text.includes(" ")) return text.split(/(\s+)/).filter(Boolean);
  return Array.from(text);
}

export function SlamText({
  text,
  className,
  delay = 0,
  /** Play as soon as it mounts (hero) rather than when scrolled to. */
  immediate = false,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  immediate?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const host = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = host.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>(".sp-word");
    if (words.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(words, { y: 0, rotate: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const to = {
        y: 0,
        rotate: 0,
        opacity: 1,
        duration: 0.92,
        ease: "expo.out",
        stagger: 0.055,
        delay,
      };
      if (immediate) {
        gsap.to(words, to);
      } else {
        gsap.to(words, {
          ...to,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [text, delay, immediate]);

  return (
    <Tag ref={host as never} className={className}>
      {units(text).map((unit, i) =>
        unit.trim() === "" ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="sp-word-mask">
            <span className="sp-word">{unit}</span>
          </span>
        ),
      )}
    </Tag>
  );
}

/** Refresh ScrollTrigger once webfonts land, so pinned spans measure right. */
export function useFontRefresh() {
  useIsoLayoutEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);
}
