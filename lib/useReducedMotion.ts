"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's OS-level "reduce motion" preference.
 *
 * SSR-safe: defaults to `false` (animate) on the server and first client
 * render, then syncs to the real `matchMedia` value after mount. Callers use
 * it to snap JS-driven animations (rAF count-ups) straight to their final
 * value. Pure CSS animations/transitions are handled globally in globals.css.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
