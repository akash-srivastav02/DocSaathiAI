import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "formfixer_language";
const CHANGE_EVENT = "formfixer-language-change";

function getPreferredLanguage() {
  if (typeof window === "undefined") return "en";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "hi") return saved;
  return "en";
}

export default function useLanguage() {
  const [language, setLanguageState] = useState(getPreferredLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  useEffect(() => {
    const handleChange = (event) => {
      const nextLanguage = event?.detail;
      if (nextLanguage === "en" || nextLanguage === "hi") {
        setLanguageState(nextLanguage);
      }
    };

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && (event.newValue === "en" || event.newValue === "hi")) {
        setLanguageState(event.newValue);
      }
    };

    window.addEventListener(CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setLanguage = (nextLanguage) => {
    if (nextLanguage !== "en" && nextLanguage !== "hi") return;
    setLanguageState(nextLanguage);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: nextLanguage }));
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "hi" : "en");

  return useMemo(
    () => ({
      language,
      isHindi: language === "hi",
      setLanguage,
      toggleLanguage,
    }),
    [language]
  );
}
