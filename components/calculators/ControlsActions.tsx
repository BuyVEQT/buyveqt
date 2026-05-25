"use client";

/**
 * ControlsActions — the "Pin this scenario" + "Reset" action row at the
 * bottom of each calculator's controls panel.
 *
 * - Pin: ink pill that turns vermilion on hover; disabled when the parent
 *   reports pinned.length >= max.
 * - Reset: outlined ghost that returns inputs to their defaults.
 */
interface ControlsActionsProps {
  onPin: () => void;
  onReset: () => void;
  pinDisabled?: boolean;
}

export default function ControlsActions({
  onPin,
  onReset,
  pinDisabled,
}: ControlsActionsProps) {
  return (
    <div className="ctla">
      <button
        type="button"
        onClick={onPin}
        disabled={pinDisabled}
        className="ctla__pin"
      >
        <span className="ctla__pin-icon" aria-hidden>
          {"\u{1F4CC}"}
        </span>
        Pin this scenario
      </button>
      <button type="button" onClick={onReset} className="ctla__reset">
        Reset
      </button>
      <style jsx>{`
        .ctla {
          display: flex;
          gap: 10px;
          margin-top: 4px;
          padding-top: 16px;
          border-top: 1px solid var(--rule-soft);
        }
        .ctla__pin {
          appearance: none;
          flex: 1;
          padding: 10px 14px;
          background: var(--ink);
          color: var(--paper-light);
          border: 0;
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.18s;
        }
        .ctla__pin:hover:not(:disabled) {
          background: var(--stamp);
        }
        .ctla__pin:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ctla__pin-icon {
          font-size: 11px;
        }
        .ctla__reset {
          appearance: none;
          padding: 10px 16px;
          background: transparent;
          color: var(--ink-mute);
          border: 1px solid var(--rule-soft);
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .ctla__reset:hover {
          background: var(--paper-warm);
          color: var(--ink);
        }
      `}</style>
    </div>
  );
}
