"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const t = window.localStorage.getItem("vstudent.theme");
      if (t === "dark" || t === "light") {
        document.documentElement.dataset.theme = t;
      }
    } catch (e) {
      // Silently fail - theme initialization is not critical
    }
  }, []);

  return null;
}
