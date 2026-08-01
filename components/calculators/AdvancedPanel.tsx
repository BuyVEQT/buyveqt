"use client";

/**
 * AdvancedPanel — expander at the bottom of a calculator's control column.
 * Children render inside an animated `grid-template-rows: 0fr → 1fr`
 * reveal. The "+" rotates 45deg to an × on open.
 *
 * Also exports `AdvToggle` — the Instrument square-checkbox toggle used
 * both inside the advanced section ("Adjust for inflation") and inline in
 * the control-bar strip ("REAL DOLLARS (CPI)").
 */
import { useState, type ReactNode } from "react";

interface AdvancedPanelProps {
  children: ReactNode;
  /** Override the default "Advanced options" label. */
  label?: string;
}

export default function AdvancedPanel({ children, label = "Advanced options" }: AdvancedPanelProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="advp">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="advp__head"
      >
        <span className="advp__label">{label}</span>
        <span
          className="advp__toggle"
          aria-hidden
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <div
        className="advp__body"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="advp__body-inner">
          <div className="advp__content">{children}</div>
        </div>
      </div>

      <style jsx>{`
        .advp {
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .advp__head {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 4px 0;
          /* 32px → 44px: the expander head is the only way into the
             advanced controls, so it gets a full tap target on desktop
             too, not just under the 640px query. */
          min-height: 44px;
          cursor: pointer;
          color: inherit;
        }
        .advp__head:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 2px;
        }
        /* "ADVANCED OPTIONS" — a TRUE LABEL (it names the section). Caps
           stay, 8.5px → the floor, one tracking notch back (0.2em →
           0.18em) for the fixed 320px control column it lives in. */
        .advp__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-ink);
        }
        .advp__toggle {
          font-family: var(--ins-font);
          font-weight: 600;
          font-size: 15px;
          color: var(--ins-gray-600);
          transition: transform 0.2s ease;
          line-height: 1;
        }
        .advp__body {
          display: grid;
          transition: grid-template-rows 0.25s ease, opacity 0.25s ease;
        }
        .advp__body-inner {
          overflow: hidden;
        }
        .advp__content {
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}

interface AdvToggleProps {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  /** "row" — square + label + sub-line. "inline" — square + label only. */
  variant?: "row" | "inline";
}

export function AdvToggle({
  label,
  sub,
  value,
  onChange,
  variant = "row",
}: AdvToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`atog atog--${variant}${value ? " is-on" : ""}`}
    >
      <span className="atog__box" aria-hidden>
        {value ? "✓" : ""}
      </span>
      <span className="atog__text">
        <span className="atog__label">{label}</span>
        {sub && variant === "row" && <span className="atog__sub">{sub}</span>}
      </span>
      <style jsx>{`
        .atog {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 0;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--ins-ink);
          font-family: var(--ins-font);
          text-align: left;
          /* 32px → 44px on every viewport — a 12px checkbox needs the
             whole row to be the target, not the square. */
          min-height: 44px;
        }
        .atog--row {
          width: 100%;
          align-items: flex-start;
        }
        .atog:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 3px;
        }
        /* The tick glyph is text, so the floor applies to it too: 8px →
           10px. The square grew 12px → 14px to keep the ✓ centred inside
           its 1px rule rather than crowding it. */
        .atog__box {
          width: 14px;
          height: 14px;
          border: 1px solid var(--ins-ink);
          flex: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          line-height: 1;
          color: var(--ins-paper);
          transition: background 0.15s;
        }
        .atog--row .atog__box {
          margin-top: 2px;
        }
        .atog.is-on .atog__box {
          background: var(--ins-ink);
        }
        .atog__text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        /* Toggle text is a TRUE LABEL — "Adjust for inflation", "Real
           dollars (CPI)" name a switch. Caps stay, 9px → the floor.
           Tracking holds at 0.12em (already below the dial-back table). */
        .atog__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        /* The sub-line is an EXPLANATORY CAPTION — "Subtract 2.5% from the
           assumed return rate" is helper text under a control, so it takes
           the caption contract: 12px / 500 / 0.01em / gray-600, no caps.
           It was already sentence case; only the size and tracking moved,
           so captions across this directory read at one size. */
        .atog__sub {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-transform: none;
          color: var(--ins-gray-600);
          line-height: 1.45;
        }
      `}</style>
    </button>
  );
}
