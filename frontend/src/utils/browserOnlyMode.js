export const BROWSER_ONLY_MODE = true;

export const BROWSER_ONLY_COPY = {
  banner: "Browser-only mode is active. Offline-ready tools stay available while server-based tools are paused.",
  short: "Browser-only mode",
  pausedTitle: "This tool is paused in browser-only mode",
  pausedText:
    "This workflow depended on the backend service. To keep FormFixer alive with zero hosting cost, only browser-side tools are currently enabled.",
};

export const LIVE_BROWSER_ROUTES = new Set([
  "/all-tools",
  "/support",
  "/blog",
  "/tool/passport-sheet",
  "/exam/ssc-cgl",
  "/exam/ssc-chsl",
  "/exam/upsc-cds",
  "/exam/neet-ug",
  "/exam/jee-main",
  "/exam/ibps-clerk",
]);

export const LIVE_BROWSER_TOOL_IDS = new Set([
  "passport-sheet",
  "ssc-cgl-tool",
  "upsc-cds-tool",
  "neet-ug-tool",
  "jee-main-tool",
]);
