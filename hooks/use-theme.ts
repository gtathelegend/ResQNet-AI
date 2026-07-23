"use client";

import { useEffect } from "react";

type Theme = "light";

export function useTheme() {
  const theme: Theme = "light";

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    // Locked to light theme
  };

  return { theme, toggleTheme, isDark: false };
}
