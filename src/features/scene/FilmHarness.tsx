"use client";

import { useEffect, useState } from "react";
import { FilmShotView } from "./FilmShotView";
import type { DirectingShot } from "./film-adapter";

declare global {
  interface Window {
    __MF_SET_FILM_SHOT__?: (payload: unknown) => void;
    __filmStageExport?: () => Promise<string>;
  }
}

export function FilmHarness() {
  const [payload, setPayload] = useState<DirectingShot | null>(null);
  const acceptShot = (value: unknown) => {
    const shot = value as DirectingShot;
    document.body.dataset.mfShotId = String(shot.id ?? shot.shotId ?? "");
    document.querySelector("canvas")?.removeAttribute("data-film-ready");
    delete window.__filmStageExport;
    setPayload(shot);
  };
  // The injector waits for the mounted effect; a render-time handler can be
  // replaced by StrictMode cleanup before the first payload is committed.
  useEffect(() => {
    window.__MF_SET_FILM_SHOT__ = acceptShot;
    document.body.dataset.mfHarnessReady = "true";
    return () => {
      delete window.__MF_SET_FILM_SHOT__;
      delete window.__filmStageExport;
      delete document.body.dataset.mfShotId;
      delete document.body.dataset.mfHarnessReady;
    };
  }, []);
  if (!payload)
    return <main data-film-harness="waiting" className="fixed inset-0" aria-hidden="true" />;
  return <FilmShotView payload={payload} />;
}
