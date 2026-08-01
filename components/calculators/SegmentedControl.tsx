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
        /* Field label — a TRUE LABEL (it names the control: "Mode",
           "Account"). Caps + tracking, now at the 10px floor. The control
           column and the Lookback bar cell are fixed boxes, so the bump is
           paid for with one tracking notch (0.2em → 0.18em) — the same
           step every sibling micro-label in the column takes. */
        .seg__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          margin-bottom: 6px;
        }
        .seg__track {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        /* Segment text is a TRUE LABEL — it names an option, it doesn't
           explain one. Caps stay; 9px → the 10px floor. Tracking holds at
           0.08em: it is already below the dial-back table's lowest step,
           and the longest real option ("MONTHLY DCA", ~77px + 20px padding)
           still clears the Lookback bar cell and the 320px control column.
           min-height 30px → 44px so every segment is a full tap target on
           every viewport, not just phones. The strip it sits in grows
           ~14px taller as a result — that is the cost of the target. */
        .seg__opt {
          appearance: none;
          border-radius: 0;
          background: transparent;
          border: 1px solid var(--ins-hair);
          padding: 6px 10px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--ins-font);
          font-size: 10px;
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
          /* min-height and font-size are now carried by the base rule —
             phones only widen the thumb-side padding. */
          .seg__opt {
            padding: 6px 14px;
          }
        }
      `}</style>
    </div>
  );
}
