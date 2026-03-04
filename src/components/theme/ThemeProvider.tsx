"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

const STORAGE_KEY = "vstudent.theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function getInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const t = setTimeout(() => {
      const initial = getInitialTheme();
      setThemeState(initial);
      applyTheme(initial);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const value = useMemo<ThemeState>(() => {
    return {
      theme,
      setTheme: (t) => {
        setThemeState(t);
        applyTheme(t);
        try {
          window.localStorage.setItem(STORAGE_KEY, t);
        } catch {}
      },
      toggleTheme: () => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setThemeState(next);
        applyTheme(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      },
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider/>");
  return ctx;
}

