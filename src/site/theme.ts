export const SITE_UI_STYLE = "grey" as const;
export const THEME_STORAGE_KEY = "sp-theme";
export type SiteTheme = "light" | "dark";

/** Runs in the head before paint. A blocked store falls back to a readable page. */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("sp-theme");var t=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-game-ui-theme",t);}catch(e){document.documentElement.setAttribute("data-game-ui-theme","light");}document.documentElement.classList.add("js");})();`;
