"use client";

/**
 * PinnedScenariosBar — the PINNED row: micro label, 1px ink chips
 * ("MAR 2020 · $18,940 ✕"), and a right-aligned micro hint. Clicking a
 * chip restores its inputs; the ✕ drops it.
 *
 * The local `usePinnedScenarios` hook here is intentionally in-memory
 * only — pinned scenarios are scoped to the active session so they
 * disappear on reload. This matches the prototype's behaviour and keeps
 * the bar from accruing forgotten pins.
 */
import { useCallback, useState } from "react";

export interface PinnedScenario<I> {
  label: string;
  value: number;
  inputs: I;
}

interface PinnedScenariosBarProps<I> {
  pinned: PinnedScenario<I>[];
  onRestore: (i: number) => void;
  onRemove: (i: number) => void;
  formatter: (n: number) => string;
  /** Right-aligned micro line — pre-uppercased. */
  hint?: string;
}

export default function PinnedScenariosBar<I>({
  pinned,
  onRestore,
  onRemove,
  formatter,
  hint = "PIN UP TO FOUR SCENARIOS TO COMPARE",
}: PinnedScenariosBarProps<I>) {
  return (
    <div className="psb">
      <span className="psb__label">Pinned</span>
      {pinned.length === 0 ? (
        <span className="psb__empty">NONE YET</span>
      ) : (
        <div className="psb__chips">
          {pinned.map((p, i) => (
            <div key={i} className="psb__chip">
              <button
                type="button"
                onClick={() => onRestore(i)}
                className="psb__chip-main"
                aria-label={`Restore ${p.label}`}
              >
                {p.label} &middot; {formatter(p.value)}
              </button>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${p.label}`}
                className="psb__chip-remove"
              >
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
      <span className="psb__hint">{hint}</span>

      <style jsx>{`
        .psb {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .psb__label {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          flex: none;
        }
        .psb__empty {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        .psb__chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          min-width: 0;
        }
        .psb__chip {
          display: inline-flex;
          align-items: stretch;
          border: 1px solid var(--ins-ink);
        }
        .psb__chip-main {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 0;
          padding: 5px 10px 5px 12px;
          cursor: pointer;
          color: var(--ins-ink);
          font-family: var(--ins-font);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .psb__chip-main:hover {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }
        .psb__chip-remove {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 0;
          padding: 0 10px 0 4px;
          color: var(--ins-gray-600);
          cursor: pointer;
          font-size: 9px;
          line-height: 1;
        }
        .psb__chip-remove:hover {
          color: var(--ins-signal);
        }
        .psb__chip-main:focus-visible,
        .psb__chip-remove:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: -3px;
        }
        .psb__hint {
          margin-left: auto;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          /* Pre-uppercased by the caller — no text-transform. */
        }
        @media (max-width: 640px) {
          .psb__chip-main,
          .psb__chip-remove {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
          }
          .psb__chip-remove {
            padding: 0 12px 0 6px;
          }
          .psb__hint {
            margin-left: 0;
            flex-basis: 100%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * usePinnedScenarios — in-memory pin list capped at `max` entries. New
 * pins past the cap evict the oldest (FIFO).
 */
export function usePinnedScenarios<I>(max = 4) {
  const [pinned, setPinned] = useState<PinnedScenario<I>[]>([]);

  const pin = useCallback(
    (item: PinnedScenario<I>) => {
      setPinned((prev) => {
        if (prev.length >= max) return [...prev.slice(1), item];
        return [...prev, item];
      });
    },
    [max]
  );

  const remove = useCallback((idx: number) => {
    setPinned((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const restore = useCallback(
    (idx: number): I | null => pinned[idx]?.inputs ?? null,
    [pinned]
  );

  return { pinned, pin, remove, restore };
}
