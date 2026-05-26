"use client";

/**
 * ThemeProvider — tri-state theme switcher.
 *
 * `pref` ∈ { "auto", "light", "dark" } is what the user has chosen.
 * `resolved` ∈ { "light", "dark" } is what's actually painted on the
 * page after resolving `auto` via the OS `prefers-color-scheme`.
 *
 * The first paint is owned by an inline `<script>` in <head> (see
 * `<NoFoucThemeScript>` below) that reads localStorage synchronously,
 * resolves auto, and writes `data-theme` to <html> BEFORE the
 * stylesheet loads. This component runs after hydration and:
 *   1. Adds `html.theme-ready` so the body transition can kick in
 *      (suppresses the cold-load fade described in globals.css).
 *   2. Subscribes to OS preference changes when pref === "auto".
 *   3. Re-applies + persists when the user changes pref via the toggle.
 *
 * STORAGE_KEY is read by both this component and the no-FOUC inline
 * script — they must agree on the key, so it's also literal-string
 * embedded in the inline script for safety.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemePref = "auto" | "light" | "dark";
export type Resolved = "light" | "dark";

interface ThemeContextValue {
  /** User's chosen preference. Default "auto". */
  pref: ThemePref;
  /** Currently applied theme after resolving auto. */
  resolved: Resolved;
  /** Update preference + persist + apply. */
  setPref: (pref: ThemePref) => void;
}

const STORAGE_KEY = "veqt-theme";

const ThemeContext = createContext<ThemeContextValue>({
  pref: "auto",
  resolved: "light",
  setPref: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function readPref(): ThemePref {
  if (typeof window === "undefined") return "auto";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
    // private browsing / storage disabled — fall through
  }
  return "auto";
}

function osPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveTheme(pref: ThemePref): Resolved {
  if (pref === "light") return "light";
  if (pref === "dark") return "dark";
  return osPrefersDark() ? "dark" : "light";
}

function applyTheme(t: Resolved) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with sensible SSR defaults; the no-FOUC script + this hook
  // converge to the correct value on first paint client-side.
  const [pref, setPrefState] = useState<ThemePref>("auto");
  const [resolved, setResolved] = useState<Resolved>("light");

  // Hydrate from storage + os, mark theme-ready (enables transition).
  useEffect(() => {
    const p = readPref();
    const r = resolveTheme(p);
    setPrefState(p);
    setResolved(r);
    applyTheme(r);
    // Defer the .theme-ready add by one frame so the body transition
    // doesn't fade in the initial paint when the no-FOUC script set
    // a value different from the SSR default.
    const id = requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // When pref is "auto", live-track OS changes.
  useEffect(() => {
    if (pref !== "auto" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const r: Resolved = mq.matches ? "dark" : "light";
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [pref]);

  const setPref = useCallback((next: ThemePref) => {
    setPrefState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — private browsing
    }
    const r = resolveTheme(next);
    setResolved(r);
    applyTheme(r);
  }, []);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * NoFoucThemeScript — the inline `<script>` that has to run in <head>
 * *before* the stylesheet loads. Without it, dark-mode users see a
 * cream paper flash for ~150ms on every cold load.
 *
 * Kept in this file (not duplicated into layout.tsx) so the storage
 * key and resolution logic stay co-located with the provider that
 * reads them. The script is small, self-contained, and idempotent.
 */
export function NoFoucThemeScript() {
  // Literal-embed the storage key so a refactor that renames the
  // constant won't silently desync the inline script.
  const js = `(function(){try{var k="${STORAGE_KEY}";var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="auto")p="auto";var t=p;if(t==="auto"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
