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
  /** Right-aligned helper caption — sentence case, not a label. */
  hint?: string;
}

export default function PinnedScenariosBar<I>({
  pinned,
  onRestore,
  onRemove,
  formatter,
  /* Re-cased in Turn 8: an imperative instruction about how the bar works
     is helper text, not a label naming a thing. Wording is unchanged. */
  hint = "Pin up to four scenarios to compare",
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
        /* "PINNED" — a TRUE LABEL heading the row. Caps stay, 8.5px → the
           floor, one notch of tracking back (0.2em → 0.18em) for the fixed
           row it anchors. */
        .psb__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          flex: none;
        }
        /* "NONE YET" names a state rather than explaining one, so it stays
           a label: caps at the floor, 0.14em → 0.12em. */
        .psb__empty {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
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
        /* Chip text is a TRUE LABEL — it names a saved scenario ("MAR 2020
           · $18,940"). Caps stay, 9px → the floor; 0.08em tracking is
           already under the dial-back table's lowest step so it holds, and
           the chips flex-wrap rather than sharing a fixed track. Both chip
           buttons go to a 44px tap height on every viewport, not just
           phones — a 9px-tall ✕ was never a real target. */
        .psb__chip-main {
          appearance: none;
          background: transparent;
          border: 0;
          border-radius: 0;
          padding: 5px 10px 5px 12px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          color: var(--ins-ink);
          font-family: var(--ins-font);
          font-size: 10px;
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
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          color: var(--ins-gray-600);
          cursor: pointer;
          font-size: 10px;
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
        /* EXPLANATORY CAPTION — an imperative line telling the reader what
           the bar does. Caption contract, and the strings themselves are
           authored in sentence case now (here and at all three call
           sites), so there is still no text-transform. */
        .psb__hint {
          margin-left: auto;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }
        @media (max-width: 640px) {
          /* Tap heights are on the base rules now — phones only widen the
             ✕'s thumb padding and drop the hint onto its own line. */
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
