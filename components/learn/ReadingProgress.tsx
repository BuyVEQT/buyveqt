"use client";

import { useEffect, useState } from "react";
import { useArticleProgress } from "./ArticleContext";

const css = `
.rtape {
  position: fixed;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 45;
  pointer-events: none;
  background: transparent;
}
.rtape__fill {
  height: 100%;
  transform-origin: left center;
  background: var(--ins-signal);
  will-change: transform;
}
`;

/**
 * The reading tape — a 3px signal-red bar that fills left to right as the
 * dispatch scrolls, pinned to the underside of the shell masthead.
 *
 * The shell's nav (DesktopNav on lg+, TopBar below) is `position: sticky;
 * top: 0`, so its height is a fixed offset from the top of the viewport —
 * measured on mount and on resize rather than hard-coded, because the two
 * bars have different heights and either can reflow. Sitting *below* the
 * masthead keeps the tape clear of the nav's links and ticker; z-index 45
 * puts it over page content but under the mobile drawer (50).
 *
 * Progress comes from <ArticleProvider>'s single rAF-throttled listener,
 * shared with the meta line so both tick off one measurement.
 */
export default function ReadingProgress() {
  const pct = useArticleProgress();
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    function measure() {
      // Whichever masthead is mounted at this breakpoint reports a height;
      // the hidden one measures 0.
      const bars = [
        document.querySelector(".ins-desktopnav"),
        document.querySelector(".shell-topbar"),
      ];
      let h = 0;
      for (const bar of bars) {
        if (!bar) continue;
        const r = bar.getBoundingClientRect();
        if (r.height > h) h = r.height;
      }
      setTop(h > 0 ? Math.round(h) : null);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Until the masthead is measured the tape stays hidden rather than
  // flashing at the wrong offset.
  if (top === null) return <style dangerouslySetInnerHTML={{ __html: css }} />;

  return (
    <div className="rtape ins-shell" aria-hidden style={{ top }}>
      <div
        className="rtape__fill"
        style={{ transform: `scaleX(${(pct / 100).toFixed(4)})` }}
      />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
