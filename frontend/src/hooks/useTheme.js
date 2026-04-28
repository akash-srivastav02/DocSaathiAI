import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "formfixer_theme";
const CHANGE_EVENT = "formfixer-theme-change";

function getPreferredTheme() {
  if (typeof window === "undefined") return "dark";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

export default function useTheme() {
  const [theme, setThemeState] = useState(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme = event?.detail;
      if (nextTheme === "dark" || nextTheme === "light") {
        setThemeState(nextTheme);
      }
    };

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && (event.newValue === "dark" || event.newValue === "light")) {
        setThemeState(event.newValue);
      }
    };

    window.addEventListener(CHANGE_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setTheme = (nextTheme) => {
    if (nextTheme !== "dark" && nextTheme !== "light") return;
    setThemeState(nextTheme);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: nextTheme }));
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme]
  );
}
