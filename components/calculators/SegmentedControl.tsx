"use client";

/**
 * SegmentedControl — pill segmented selector (ink fill on the active
 * option, paper text). Options may be plain strings or `{value,label}`.
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
      {label !== undefined && <div className="ed-label seg__label">{label}</div>}
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
        .seg__label {
          margin-bottom: 8px;
        }
        .seg__track {
          display: inline-flex;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 999px;
          padding: 3px;
          gap: 2px;
        }
        .seg__opt {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 8px 16px;
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .seg__opt:hover:not(.is-active) {
          color: var(--ink);
        }
        .seg__opt.is-active {
          background: var(--ink);
          color: var(--paper-light);
        }
      `}</style>
    </div>
  );
}
