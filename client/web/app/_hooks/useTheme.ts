"use client";
import { useEffect } from "react";
import { useUIStore } from "../_stores/useUIStore";

const THEME_STORAGE_KEY = "oldvibes-theme";

export const useTheme = () => {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  // Initialize theme from localStorage and apply to DOM
  useEffect(() => {
    // Load saved theme or default to system
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as
      | "light"
      | "dark"
      | "system"
      | null;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    // Apply initial theme
    applyTheme(savedTheme || theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = useUIStore.getState().theme;
      if (currentTheme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme changes to DOM and persist
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
