"use client";

import { createContext, useContext, useEffect } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "buyveqt:theme";

/**
 * Round 4 polish: dark mode is disabled. ThemeProvider is reduced to a
 * stub that always reports "light" and clears any stale localStorage
 * value from prior sessions so the auto-detect bootstrap script (also
 * removed) can't re-activate dark on a reload.
 *
 * Kept mounted + exported so call sites don't break and we can flip
 * dark back on later without rewiring.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "light";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore — private browsing or storage disabled
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
