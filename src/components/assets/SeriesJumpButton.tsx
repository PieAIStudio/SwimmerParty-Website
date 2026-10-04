"use client";

import type { ReactNode } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";

export function SeriesJumpButton({ id, children }: { id: string; children: ReactNode }) {
  return (
    <GameButton
      size="sm"
      className="shrink-0"
      onClick={() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
        history.replaceState(history.state, "", `#${id}`);
      }}
    >
      {children}
    </GameButton>
  );
}
