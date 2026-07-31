"use client";

import { useEffect, useRef, useState } from "react";

export interface ExhibitState<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  /** True once the exhibit has been scrolled into view — never goes back. */
  entered: boolean;
  /** True while any part of the exhibit is on screen. */
  onScreen: boolean;
  /**
   * Spread onto the exhibit root. `data-live` arms the animations (they are
   * declared off by default so the un-armed state IS the final frame), and
   * `data-run` parks them with animation-play-state while scrolled away.
   */
  props: { "data-live": string; "data-run": string };
}

/**
 * Arms an exhibit's animation the first time it scrolls into view, and
 * parks it again when it scrolls away.
 *
 * Every exhibit's CSS declares its animation only under `[data-live="true"]`,
 * so three states collapse to one static frame: before first view, without
 * JavaScript, and under prefers-reduced-motion (globals.css kills animation
 * outright on `.ins-root` surfaces). Nothing has to be re-specified per
 * component to satisfy the reduced-motion contract.
 */
export function useExhibit<T extends HTMLElement>(): ExhibitState<T> {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (very old engines, some test runners) means the
    // exhibit simply never arms — which is already the correct degradation,
    // since the un-armed state is the finished diagram.
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setOnScreen(entry.isIntersecting);
          if (entry.isIntersecting) setEntered(true);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    entered,
    onScreen,
    props: {
      "data-live": entered ? "true" : "false",
      "data-run": onScreen ? "true" : "false",
    },
  };
}
