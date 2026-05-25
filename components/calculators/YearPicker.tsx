"use client";

/**
 * YearPicker — a slim timeline strip for picking a start year between
 * `min` and `max` inclusive. Click a year tick, drag the thumb, or use
 * arrow keys when the track is focused.
 */
import { useRef } from "react";

interface YearPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (y: number) => void;
}

export default function YearPicker({ min, max, value, onChange }: YearPickerProps) {
  const years: number[] = [];
  for (let y = min; y <= max; y++) years.push(y);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const idx = years.indexOf(value);
  const pct = years.length > 1 ? (Math.max(0, idx) / (years.length - 1)) * 100 : 0;

  function pickFromX(clientX: number) {
    if (!trackRef.current || years.length === 0) return;
    const r = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const i = Math.round(ratio * (years.length - 1));
    const next = years[i];
    if (next !== value) onChange(next);
  }

  return (
    <div className="yp">
      <div className="yp__top">
        <span className="ed-label">From</span>
        <span className="yp__value ed-display ed-numerals">{value}</span>
      </div>
      <div
        ref={trackRef}
        className="yp__track"
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
        aria-label="Start year"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
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
        <div className="yp__fill" style={{ width: `${pct}%` }} />
        <div className="yp__thumb" style={{ left: `${pct}%` }} />
      </div>
      <div className="yp__years">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            className={`yp__year${y === value ? " is-active" : ""}`}
            onClick={() => onChange(y)}
            aria-label={`Start in ${y}`}
          >
            &rsquo;{String(y).slice(-2)}
          </button>
        ))}
      </div>

      <style jsx>{`
        .yp {
          width: 100%;
        }
        .yp__top {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 12px;
        }
        .yp__value {
          font-size: clamp(2rem, 3.4vw, 2.6rem);
          line-height: 1;
          color: var(--ink);
        }
        .yp__track {
          position: relative;
          height: 6px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 3px;
          cursor: pointer;
          touch-action: none;
          outline: none;
        }
        .yp__track:focus-visible {
          box-shadow: 0 0 0 3px rgba(138, 28, 28, 0.25);
        }
        .yp__fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--stamp);
          border-radius: 3px 0 0 3px;
          transition: width 0.18s ease;
        }
        .yp__thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 18px;
          height: 18px;
          background: var(--ink);
          border-radius: 50%;
          border: 3px solid var(--paper);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
          transition: left 0.18s ease;
          pointer-events: none;
        }
        .yp__years {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          gap: 2px;
        }
        .yp__year {
          appearance: none;
          background: transparent;
          border: 0;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-mute);
          cursor: pointer;
          padding: 4px 6px;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }
        .yp__year:hover {
          color: var(--ink);
        }
        .yp__year.is-active {
          color: var(--ink);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
