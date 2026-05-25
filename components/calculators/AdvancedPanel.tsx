"use client";

/**
 * AdvancedPanel — `<details>`-style expander at the bottom of each calc's
 * controls column. Children render inside an animated `grid-template-rows:
 * 0fr → 1fr` reveal. Caret rotates 45deg to an X on open.
 *
 * Also exports `AdvToggle` — the small editorial toggle used inside the
 * advanced section (e.g. "Adjust for inflation").
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
        <span className="ed-label advp__label">{label}</span>
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
          padding-top: 16px;
          border-top: 1px solid var(--rule-soft);
        }
        .advp__head {
          appearance: none;
          background: transparent;
          border: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          cursor: pointer;
          color: inherit;
        }
        .advp__label {
          color: var(--ink);
        }
        .advp__toggle {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 18px;
          color: var(--ink-mute);
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
          gap: 14px;
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
}

export function AdvToggle({ label, sub, value, onChange }: AdvToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`atog${value ? " is-on" : ""}`}
    >
      <span className="atog__text">
        <span className="atog__label">{label}</span>
        {sub && <span className="ed-caption atog__sub">{sub}</span>}
      </span>
      <span className="atog__switch" aria-hidden>
        <span className="atog__thumb" />
      </span>
      <style jsx>{`
        .atog {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 4px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          color: inherit;
          width: 100%;
          text-align: left;
        }
        .atog__text {
          text-align: left;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .atog__label {
          font-family: var(--font-serif);
          font-size: 14px;
          color: var(--ink);
        }
        .atog__sub {
          margin-top: 2px;
          font-size: 11.5px;
        }
        .atog__switch {
          position: relative;
          width: 36px;
          height: 20px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 999px;
          flex-shrink: 0;
          transition: background 0.18s, border-color 0.18s;
          display: inline-block;
        }
        .atog.is-on .atog__switch {
          background: var(--stamp);
          border-color: var(--stamp);
        }
        .atog__thumb {
          position: absolute;
          top: 1px;
          left: 1px;
          width: 16px;
          height: 16px;
          background: var(--ink);
          border-radius: 50%;
          transition: transform 0.18s, background 0.18s;
        }
        .atog.is-on .atog__thumb {
          background: var(--paper);
          transform: translateX(16px);
        }
      `}</style>
    </button>
  );
}
