"use client";

import { useEffect, useState } from "react";

/**
 * 1px reading-progress bar fixed to the top of the viewport.
 * Draws over the masthead so the reader always has a sense of how far
 * through the dispatch they are. Intentionally thin so it doesn't
 * compete visually with the nameplate.
 */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function update() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) {
        setPct(0);
        return;
      }
      const scrolled = window.scrollY;
      setPct(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          backgroundColor: "var(--stamp)",
          transition: "width 80ms linear",
        }}
      />
    </div>
  );
}
