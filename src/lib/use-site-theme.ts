"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type SiteTheme } from "./theme";

function readTheme(): SiteTheme {
  return document.documentElement.dataset.gameUiTheme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ["data-game-ui-theme"] });
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const followSystem = () => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      root.dataset.gameUiTheme =
        saved === "light" || saved === "dark" ? saved : system.matches ? "dark" : "light";
    } catch {
      // A blocked store must not undo an explicit choice made in this document.
    }
  };
  system.addEventListener("change", followSystem);
  window.addEventListener("storage", followSystem);
  // A streamed not-found boundary can replace the document after its head script.
  // Reapply the preference when the client subscribes, without recreating state.
  followSystem();
  return () => {
    observer.disconnect();
    system.removeEventListener("change", followSystem);
    window.removeEventListener("storage", followSystem);
  };
}

const serverTheme = (): SiteTheme => "light";

export function useSiteTheme(): SiteTheme {
  return useSyncExternalStore(subscribe, readTheme, serverTheme);
}

export function setSiteTheme(theme: SiteTheme): void {
  document.documentElement.dataset.gameUiTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The current page still switches when persistence is unavailable.
  }
}
