"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Animate a number from its current displayed value to a target.
 * Uses requestAnimationFrame with cubic ease-out for smooth transitions.
 *
 * Snaps immediately on first render (no animation from 0).
 * Cleans up animation on unmount or when target changes mid-flight.
 */
export function useAnimatedNumber(target: number, duration = 400): number {
  const [displayed, setDisplayed] = useState(target);
  const rafRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Snap on first render — don't animate from 0
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayed(target);
      return;
    }

    const startValue = displayed;
    const startTime = performance.now();
    const delta = target - startValue;

    // No animation needed if value hasn't changed
    if (Math.abs(delta) < 0.5) {
      setDisplayed(target);
      return;
    }

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + delta * eased;

      setDisplayed(progress >= 1 ? target : current);

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
  }, [target, duration]);

  return Math.round(displayed);
}
