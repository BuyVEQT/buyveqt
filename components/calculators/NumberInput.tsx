"use client";

/**
 * NumberInput — editorial-styled big numeric input with optional prefix
 * ($) and suffix (% / years) slots. Commits on blur + Enter; ArrowUp/Down
 * tweak by `step`. Min/max clamps applied at commit time so typing past
 * the limits is allowed mid-edit but never persisted.
 */
import { useState, useEffect, useId } from "react";

interface NumberInputProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
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
}: NumberInputProps) {
  const [local, setLocal] = useState(String(value));
  const id = useId();

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
    <label className="ninp" htmlFor={id}>
      <span className="ed-label ninp__label">{label}</span>
      <div className="ninp__row">
        {prefix && <span className="ninp__prefix">{prefix}</span>}
        <input
          id={id}
          type="text"
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
        {suffix && <span className="ninp__suffix">{suffix}</span>}
      </div>
      <style jsx>{`
        .ninp {
          display: block;
        }
        .ninp__label {
          margin-bottom: 8px;
          display: block;
        }
        .ninp__row {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          padding: 8px 14px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 12px;
          transition: border-color 0.18s, background 0.18s;
          width: 100%;
        }
        .ninp__row:focus-within {
          border-color: var(--ink);
          background: var(--paper);
        }
        .ninp__prefix,
        .ninp__suffix {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--ink-mute);
          font-size: 16px;
          flex-shrink: 0;
        }
        .ninp__row input {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 0;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.6rem, 2.4vw, 2rem);
          letter-spacing: -0.02em;
          color: var(--ink);
          width: 100%;
          min-width: 0;
          outline: none;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </label>
  );
}
