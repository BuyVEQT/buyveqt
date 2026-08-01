"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Parks a module's ambient loops while it is scrolled out of view.
 *
 * Same idea as `components/mdx/useExhibit`, deliberately re-stated here so
 * the home page doesn't import article infrastructure — and because the
 * two want opposite defaults. An exhibit's animation is *armed* on first
 * view (un-armed IS the finished frame, so starting false is correct).
 * The Instrument's loops are ambient: the glyph spins, the end dot
 * pulses, the drag hint shimmers, all from first paint. So `onScreen`
 * starts true and the observer only ever *takes it away*. That also makes
 * the no-IntersectionObserver path (very old engines, some test runners)
 * degrade to today's behaviour — always running — rather than to a
 * permanently frozen page.
 *
 * Usage: spread the ref, then declare
 *   `.root[data-run="false"] .looping { animation-play-state: paused; }`
 * for each infinite animation. One-shot entrances are left alone; where a
 * shorthand stacks an entrance and a loop on one element, pause the list
 * positionally (`animation-play-state: running, paused`).
 *
 * Reduced motion needs no handling here — `animation: none !important` on
 * `.ins-root` in globals.css removes the animations outright, and
 * pausing an animation that doesn't exist is a no-op.
 */
export function useOnScreen<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  onScreen: boolean;
} {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setOnScreen(entry.isIntersecting);
      },
      // Generous margin: loops resume just before the module is visible,
      // so nothing is caught mid-frame on the way in.
      { rootMargin: "160px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, onScreen };
}
