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
  // The MF Playwright injector may run as soon as the local harness hydrates.
  // Install during the client render as well as in the effect so a static page
  // that delays passive effects cannot lose the first shot payload.
  if (typeof window !== "undefined") window.__MF_SET_FILM_SHOT__ = acceptShot;
  useEffect(() => {
    window.__MF_SET_FILM_SHOT__ = (value) => {
      const shot = value as DirectingShot;
      document.body.dataset.mfShotId = String(shot.id ?? shot.shotId ?? "");
      document.querySelector("canvas")?.removeAttribute("data-film-ready");
      delete window.__filmStageExport;
      setPayload(shot);
    };
    return () => {
      delete window.__MF_SET_FILM_SHOT__;
      delete window.__filmStageExport;
      delete document.body.dataset.mfShotId;
    };
  }, []);
  if (!payload)
    return <main data-film-harness="waiting" className="fixed inset-0" aria-hidden="true" />;
  return <FilmShotView payload={payload} />;
}
