"use client";

/**
 * SegmentedControl — Instrument segmented selector: square 1px hairline
 * chips, ink fill + paper text on the active option. Options may be plain
 * strings or `{value,label}`.
 *
 * Used for the Strategy toggle in Lookback and the Account chooser in the
 * TFSA/RRSP/FHSA calculator.
 */
import type { ReactNode } from "react";

export type SegOption<V extends string> =
  | V
  | { value: V; label: ReactNode };

interface SegmentedControlProps<V extends string> {
  value: V;
  options: readonly SegOption<V>[];
  onChange: (v: V) => void;
  label?: ReactNode;
  ariaLabel?: string;
}

export default function SegmentedControl<V extends string>({
  value,
  options,
  onChange,
  label,
  ariaLabel,
}: SegmentedControlProps<V>) {
  return (
    <div className="seg">
      {label !== undefined && <div className="seg__label">{label}</div>}
      <div
        className="seg__track"
        role="radiogroup"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      >
        {options.map((opt) => {
          const v = typeof opt === "object" ? opt.value : opt;
          const lab = typeof opt === "object" ? opt.label : opt;
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(v)}
              className={`seg__opt${active ? " is-active" : ""}`}
            >
              {lab}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .seg {
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .seg__label {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          margin-bottom: 6px;
        }
        .seg__track {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .seg__opt {
          appearance: none;
          border-radius: 0;
          background: transparent;
          border: 1px solid var(--ins-hair);
          padding: 6px 10px;
          min-height: 30px;
          font-family: var(--ins-font);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ins-ink);
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .seg__opt:hover:not(.is-active) {
          border-color: var(--ins-ink);
        }
        .seg__opt:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 2px;
        }
        .seg__opt.is-active {
          background: var(--ins-ink);
          border-color: var(--ins-ink);
          color: var(--ins-paper);
        }
        @media (max-width: 640px) {
          .seg__opt {
            min-height: 44px;
            padding: 6px 14px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
