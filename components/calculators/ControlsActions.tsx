"use client";

/**
 * ControlsActions — the PIN SCENARIO / RESET pair.
 *
 * Two skins, same handlers:
 *   bar    — right-hand cells of the instrument control-bar strip, each
 *            divided from the strip by a 1px rule (Lookback).
 *   column — a ruled footer row at the bottom of a control column
 *            (DCA / Shelter / FIRE).
 */
interface ControlsActionsProps {
  onPin: () => void;
  onReset: () => void;
  pinDisabled?: boolean;
  variant?: "bar" | "column";
}

export default function ControlsActions({
  onPin,
  onReset,
  pinDisabled,
  variant = "column",
}: ControlsActionsProps) {
  return (
    <div className={`ctla ctla--${variant}`}>
      <button
        type="button"
        onClick={onPin}
        disabled={pinDisabled}
        className="ctla__btn ctla__pin"
      >
        Pin scenario
      </button>
      <button type="button" onClick={onReset} className="ctla__btn ctla__reset">
        Reset
      </button>
      <style jsx>{`
        .ctla {
          display: flex;
          align-items: stretch;
          font-family: var(--ins-font);
        }
        .ctla__btn {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 0;
          font-family: var(--ins-font);
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-ink);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .ctla__btn:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: -3px;
        }
        .ctla__btn:hover:not(:disabled) {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }
        .ctla__reset {
          color: var(--ins-gray-600);
        }
        .ctla__btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* ── bar skin — cells inside the control strip ── */
        .ctla--bar .ctla__btn {
          display: flex;
          align-items: center;
          padding: 0 20px;
          border-left: 1px solid var(--ins-hair);
          min-height: 44px;
        }

        /* ── column skin — ruled footer of a control column ── */
        .ctla--column {
          border-top: 1px solid var(--ins-ink);
        }
        .ctla--column .ctla__btn {
          flex: 1;
          padding: 13px 10px;
          min-height: 44px;
        }
        .ctla--column .ctla__reset {
          flex: 0 0 auto;
          padding-left: 18px;
          padding-right: 18px;
          border-left: 1px solid var(--ins-hair);
        }

        @media (max-width: 640px) {
          .ctla--bar {
            width: 100%;
          }
          .ctla--bar .ctla__btn {
            flex: 1;
            justify-content: center;
            padding: 0 12px;
          }
          .ctla--bar .ctla__pin {
            border-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
