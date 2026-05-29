"use client";

import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Animate a number from its current displayed value to a target.
 * Uses requestAnimationFrame with cubic ease-out for smooth transitions.
 *
 * Snaps immediately on first render (no animation from 0).
 * Cleans up animation on unmount or when target changes mid-flight.
 *
 * The integer overload (default export) rounds to the nearest int — used
 * for dollar amounts. For fractional values (years, percentages) use
 * `useAnimatedNumberRaw`.
 */
export function useAnimatedNumber(target: number, duration = 400): number {
  return Math.round(useAnimatedNumberRaw(target, duration));
}

/** Same animation as `useAnimatedNumber` but without int rounding. */
export function useAnimatedNumberRaw(target: number, duration = 700): number {
  const [displayed, setDisplayed] = useState(target);
  const rafRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);
  // Track displayed value via ref so consecutive target changes start from
  // the live animated value, not stale React state.
  const displayedRef = useRef(target);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      displayedRef.current = target;
      setDisplayed(target);
      return;
    }

    // Respect the OS reduce-motion setting: snap to the target, skip the
    // count-up animation entirely.
    if (reduced) {
      displayedRef.current = target;
      setDisplayed(target);
      return;
    }

    const startValue = displayedRef.current;
    const startTime = performance.now();
    const delta = target - startValue;

    if (Math.abs(delta) < 1e-6) {
      displayedRef.current = target;
      setDisplayed(target);
      return;
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + delta * eased;

      displayedRef.current = progress >= 1 ? target : current;
      setDisplayed(displayedRef.current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, reduced]);

  return displayed;
}
