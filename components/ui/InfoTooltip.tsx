"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Small inline info affordance — a circled-i trigger that reveals a short note
 * on hover (mouse), keyboard focus (Tab), or tap/click (touch). No deps; styled
 * via the editorial CSS vars so it inherits light/dark theming.
 *
 * Used to attach the "management fee vs MER / pending recalculation" context to
 * cost figures across the site. The copy comes from `merFootnote` in data/funds.ts.
 */
export default function InfoTooltip({
  content,
  srLabel = "More information",
}: {
  content: string;
  srLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  // Close on outside tap/click and on Escape (only while open).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="infotip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="infotip__trigger"
        aria-label={srLabel}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        // Suppress focus-on-mouse-click so a mouse click doesn't both focus
        // (open) and toggle (close). Keyboard Tab focus still works.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span role="tooltip" id={id} className="infotip__pop">
          {content}
        </span>
      )}

      <style jsx>{`
        .infotip {
          position: relative;
          display: inline-flex;
          vertical-align: middle;
          margin-left: 0.3em;
        }
        .infotip__trigger {
          all: unset;
          box-sizing: border-box;
          cursor: help;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.15em;
          height: 1.15em;
          border-radius: 50%;
          border: 1px solid var(--ink-mute, #8a8a8a);
          color: var(--ink-mute, #8a8a8a);
          font-family: var(--font-serif, Georgia, serif);
          font-style: italic;
          font-size: 0.72em;
          line-height: 1;
          transition: color 0.12s ease, border-color 0.12s ease;
        }
        .infotip__trigger:hover,
        .infotip__trigger:focus-visible {
          color: var(--ink, #111);
          border-color: var(--ink, #111);
          outline: none;
        }
        .infotip__pop {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          width: max-content;
          max-width: 260px;
          padding: 10px 12px;
          background: var(--paper-light, #fff);
          color: var(--ink, #111);
          border: 1px solid var(--ink, #111);
          border-radius: 8px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
          font-family: var(--font-sans, system-ui, sans-serif);
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 1.45;
          letter-spacing: 0;
          text-transform: none;
          white-space: normal;
          text-align: left;
        }
        @media (max-width: 480px) {
          .infotip__pop {
            max-width: 220px;
          }
        }
      `}</style>
    </span>
  );
}
