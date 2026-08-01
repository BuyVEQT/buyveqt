"use client";

/**
 * YearPicker — the Lookback's entry ruler.
 *
 * A 1px ink baseline with a tick per selectable entry year between `min`
 * and `max` inclusive, and a draggable ink marker carrying the entry-month
 * label. Same mechanics as before the reskin: drag or click the rule,
 * arrow keys step a year, Home/End jump to the ends.
 *
 * `markerLabel` is the caller's rendered entry month ("JAN 2019") so the
 * marker reads the same as the date chip above the poster figure.
 */
import { useRef } from "react";

interface YearPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (y: number) => void;
  /** Label printed above the marker. Defaults to the year itself. */
  markerLabel?: string;
  /** Explanatory caption under the rule — sentence case, not a label. */
  caption?: string;
}

export default function YearPicker({
  min,
  max,
  value,
  onChange,
  markerLabel,
  /* Re-cased from SHOUTING CAPS in Turn 8. It is a sentence about how the
     ruler behaves ("the cohort reprices"), not a label naming a thing, so
     it reads as a caption now. Wording is unchanged. */
  caption = "Any entry year since launch — the cohort reprices as you go",
}: YearPickerProps) {
  const years: number[] = [];
  for (let y = min; y <= max; y++) years.push(y);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const idx = years.indexOf(value);
  const last = years.length - 1;
  const pct = last > 0 ? (Math.max(0, idx) / last) * 100 : 0;

  function pickFromX(clientX: number) {
    if (!trackRef.current || years.length === 0) return;
    const r = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const i = Math.round(ratio * last);
    const next = years[i];
    if (next !== undefined && next !== value) onChange(next);
  }

  const markerEdge = pct < 8 ? " is-edge-l" : pct > 92 ? " is-edge-r" : "";

  return (
    <div className="ruler">
      <div
        ref={trackRef}
        className="ruler__track"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          pickFromX(e.clientX);
          const move = (ev: PointerEvent) => pickFromX(ev.clientX);
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
        role="slider"
        aria-label="Entry year"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={markerLabel ?? String(value)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            if (value > min) onChange(value - 1);
          }
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            if (value < max) onChange(value + 1);
          }
          if (e.key === "Home") {
            e.preventDefault();
            onChange(min);
          }
          if (e.key === "End") {
            e.preventDefault();
            onChange(max);
          }
        }}
      >
        <span className="ruler__base" aria-hidden />
        {years.map((y, i) => {
          const left = last > 0 ? (i / last) * 100 : 0;
          const major = i === 0 || i === last;
          const labelled = major || i % 2 === 0;
          return (
            <span key={y} aria-hidden>
              <span
                className={`ruler__tick${major ? " is-major" : ""}`}
                style={{ left: `${left}%` }}
              />
              {labelled && (
                <span
                  className={`ruler__year${i === 0 ? " is-first" : ""}${
                    i === last ? " is-last" : ""
                  }`}
                  style={{ left: `${left}%` }}
                >
                  {major ? y : `’${String(y).slice(-2)}`}
                </span>
              )}
            </span>
          );
        })}
        <span
          className={`ruler__marker${markerEdge}`}
          style={{ left: `${pct}%` }}
          aria-hidden
        >
          <span className="ruler__marker-label">{markerLabel ?? value}</span>
          <span className="ruler__marker-stem" />
        </span>
      </div>
      <div className="ruler__caption">
        <span className="ruler__drag">&#9666; DRAG &#9656;</span> {caption}
      </div>

      <style jsx>{`
        .ruler {
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .ruler__track {
          position: relative;
          height: 72px;
          touch-action: none;
          cursor: ew-resize;
          outline: none;
        }
        .ruler__track:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 4px;
        }
        .ruler__base {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 22px;
          height: 1px;
          background: var(--ins-ink);
        }
        .ruler__tick {
          position: absolute;
          bottom: 22px;
          width: 1px;
          height: 7px;
          background: var(--ins-hair);
        }
        .ruler__tick.is-major {
          height: 11px;
          background: var(--ins-ink);
        }
        /* Tick numerals — TRUE LABELS (they name a year). 8px → the 10px
           floor. No tracking to dial back, and the widest string is a
           four-digit year at ~25px against ticks that sit ~100px apart on
           desktop and ~114px apart on mobile (only every other year is
           labelled), so nothing collides. */
        .ruler__year {
          position: absolute;
          bottom: 4px;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 600;
          color: var(--ins-gray-600);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .ruler__year.is-first {
          transform: none;
        }
        .ruler__year.is-last {
          transform: translateX(-100%);
        }
        .ruler__marker {
          position: absolute;
          bottom: 22px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          pointer-events: none;
        }
        .ruler__marker.is-edge-l {
          transform: none;
          align-items: flex-start;
        }
        .ruler__marker.is-edge-r {
          transform: translateX(-100%);
          align-items: flex-end;
        }
        .ruler__marker-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .ruler__marker-stem {
          width: 3px;
          height: 20px;
          background: var(--ins-ink);
        }
        /* EXPLANATORY CAPTION — a sentence about the ruler, so it takes
           the caption contract (12px / 500 / 0.01em / gray-600) and the
           copy itself was re-cased at the prop default. Still no
           text-transform: the string is authored in the case it prints. */
        .ruler__caption {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          line-height: 1.45;
          color: var(--ins-gray-600);
        }
        /* The drag hint stays caps at the floor — "◄ DRAG ►" names an
           affordance, it does not explain one, so it is a label riding
           inside a caption line (same split as the home band's rail). */
        .ruler__drag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          animation: ins-hintShimmer 2.6s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .ruler__track {
            height: 60px;
          }
          .ruler__base,
          .ruler__tick,
          .ruler__marker {
            bottom: 18px;
          }
          .ruler__tick {
            height: 6px;
          }
          .ruler__tick.is-major {
            height: 9px;
          }
          .ruler__year {
            bottom: 2px;
          }
          .ruler__marker-label {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
          .ruler__marker-stem {
            height: 16px;
          }
          /* Size and tracking now come from the base caption rule — the
             phone only tightens the gap above it. */
          .ruler__caption {
            margin-top: 6px;
          }
        }
      `}</style>
    </div>
  );
}
