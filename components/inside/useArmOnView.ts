"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Arms a module's entrance the first time it scrolls into view, then lets the
 * observer go.
 *
 * Same contract as `components/mdx/useExhibit`: the animation is declared only
 * under `[data-armed="true"]`, so the un-armed frame IS the finished diagram
 * and three states collapse into one — before first view, without JavaScript,
 * and under prefers-reduced-motion (globals.css kills animation outright on
 * `.ins-root`). Nothing has to be re-specified per component to satisfy the
 * reduced-motion contract.
 *
 * Re-stated here rather than imported because this page wants a strict
 * one-shot. `useExhibit` keeps observing to track `onScreen`, which would
 * re-render the heat board's ~1,900 cells every time the board crossed the
 * fold; this observer disconnects the moment it fires.
 *
 * `ready` defers observation until the element worth watching exists — the
 * heat board renders a skeleton until history lands, and arming on the
 * skeleton would spend the sweep on cells that aren't there yet.
 */
export function useArmOnView<T extends HTMLElement>(
  ready: boolean = true
): { ref: React.RefObject<T | null>; armed: boolean } {
  const ref = useRef<T>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    // `armed` is a dependency, so flipping it re-runs this effect and the
    // cleanup below disconnects — the observer never outlives the arming.
    if (!ready || armed) return;
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (very old engines, some test runners) means the
    // module simply never arms — already the correct degradation, since the
    // un-armed state is the finished frame.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setArmed(true);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready, armed]);

  return { ref, armed };
}
