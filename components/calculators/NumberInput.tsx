"use client";

/**
 * NumberInput — Instrument numeric field: micro-label above, tabular
 * figure below. Commits on blur + Enter; ArrowUp/Down tweak by `step`.
 * Min/max clamps applied at commit time so typing past the limits is
 * allowed mid-edit but never persisted.
 *
 * Two skins, same mechanics:
 *   panel — 1px hairline box, used inside a calculator's control column.
 *   bar   — bare cell, used inside the instrument control-bar strip where
 *           the strip's own 1px rules already divide the fields.
 */
import { useState, useEffect } from "react";

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  variant?: "panel" | "bar";
}

export default function NumberInput({
  value,
  onChange,
  label,
  prefix,
  suffix,
  step = 100,
  min = 0,
  max,
  variant = "panel",
}: NumberInputProps) {
  const [local, setLocal] = useState(String(value));

  // Keep the local string in sync when the controlled value changes from
  // the outside (e.g. preset buttons, Reset, pinned-scenario restore).
  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  function commit(raw: string) {
    const cleaned = raw.replace(/[^0-9.\-]/g, "");
    const n = Number(cleaned);
    if (Number.isFinite(n)) {
      const clamped = Math.max(min, Math.min(max ?? Number.POSITIVE_INFINITY, n));
      onChange(clamped);
      setLocal(String(clamped));
    } else {
      setLocal(String(value));
    }
  }

  return (
    // The input is nested inside its label — implicit association, no id
    // needed. (An explicit useId pair here hydration-mismatched: the
    // dynamic-import boundary shifts React's id sequence between server
    // and client renders.)
    <label className={`ninp ninp--${variant}`}>
      <span className="ninp__label">{label}</span>
      <div className="ninp__row">
        {prefix && <span className="ninp__affix">{prefix}</span>}
        <input
          type="text"
          /* "decimal" (not "numeric") — rate fields step in halves, so the
             keypad has to offer a separator. Both render the numeric pad. */
          inputMode="decimal"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(e.currentTarget.value);
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const next = Math.min(max ?? Number.POSITIVE_INFINITY, value + step);
              onChange(next);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const next = Math.max(min, value - step);
              onChange(next);
            }
          }}
        />
        {suffix && <span className="ninp__affix">{suffix}</span>}
      </div>
      <style jsx>{`
        .ninp {
          display: block;
          font-family: var(--ins-font);
          color: var(--ins-ink);
          min-width: 0;
        }
        /* Field label — a TRUE LABEL (it names the field), so caps and
           tracking stay; 8px → the 10px floor. Both skins are fixed boxes
           (a 320px control column, a 118px bar cell), so the bump takes
           one tracking notch: 0.2em → 0.18em. Longest real label in the
           column, "Contribution growth (annual)", measures ~224px against
           288px of inner width; the bar's "Amount / month" ~112px against
           the 118px cell. The <input> font-sizes below are untouched —
           anything under 16px makes iOS Safari zoom on focus. */
        .ninp__label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .ninp__row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 4px;
          min-width: 0;
        }
        .ninp__affix {
          font-size: 11px;
          font-weight: 700;
          color: var(--ins-gray-600);
          flex: none;
        }
        .ninp__row input {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 0;
          font-family: var(--ins-font);
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.01em;
          color: var(--ins-ink);
          width: 100%;
          min-width: 0;
          outline: none;
          font-variant-numeric: tabular-nums;
        }
        .ninp__row input:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 3px;
        }

        /* ── panel skin — 1px box inside a control column ── */
        .ninp--panel .ninp__row {
          border: 1px solid var(--ins-hair);
          padding: 9px 12px;
          margin-top: 6px;
          min-height: 44px;
          align-items: center;
        }
        .ninp--panel .ninp__row:focus-within {
          border-color: var(--ins-ink);
        }
        .ninp--panel .ninp__row input {
          font-size: 19px;
        }

        /* ── bar skin — bare cell in the control-bar strip ── */
        .ninp--bar {
          min-width: 118px;
        }

        @media (max-width: 640px) {
          .ninp--bar .ninp__row input {
            font-size: 16px; /* ≥16px keeps iOS from zooming on focus */
          }
        }
      `}</style>
    </label>
  );
}
