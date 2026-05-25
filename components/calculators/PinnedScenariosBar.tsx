"use client";

/**
 * PinnedScenariosBar — sits above the dark result slab of a calculator.
 * Shows up to 3 saved scenarios as chips; clicking a chip restores its
 * inputs. Empty state is a quiet dashed-border hint.
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
}

export default function PinnedScenariosBar<I>({
  pinned,
  onRestore,
  onRemove,
  formatter,
}: PinnedScenariosBarProps<I>) {
  if (pinned.length === 0) {
    return (
      <div className="psb psb--empty">
        <span className="ed-stamp">Pinned scenarios</span>
        <span className="ed-caption psb__hint">
          Save up to 3 scenarios with the <em>Pin</em> button to compare them side-by-side.
        </span>
        <style jsx>{`
          .psb {
            margin-bottom: 12px;
          }
          .psb--empty {
            display: flex;
            align-items: baseline;
            gap: 14px;
            padding: 10px 14px;
            background: var(--paper-warm);
            border: 1px dashed var(--rule-soft);
            border-radius: 10px;
            flex-wrap: wrap;
          }
          .psb__hint {
            color: var(--ink-mute);
          }
          .psb__hint :global(em) {
            font-style: italic;
            color: var(--ink);
          }
        `}</style>
      </div>
    );
  }
  return (
    <div className="psb psb--filled">
      <span className="ed-stamp psb__label">Pinned</span>
      <div className="psb__chips">
        {pinned.map((p, i) => (
          <div key={i} className="psb__chip">
            <button
              type="button"
              onClick={() => onRestore(i)}
              className="psb__chip-main"
              aria-label={`Restore ${p.label}`}
            >
              <span className="ed-label psb__chip-label">{p.label}</span>
              <span className="ed-numerals psb__chip-val">{formatter(p.value)}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${p.label}`}
              className="psb__chip-remove"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .psb {
          margin-bottom: 12px;
        }
        .psb--filled {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 10px;
          flex-wrap: wrap;
        }
        .psb__label {
          flex-shrink: 0;
          color: var(--ink-mute);
        }
        .psb__chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 0;
        }
        .psb__chip {
          display: inline-flex;
          align-items: stretch;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-left: 3px solid var(--stamp);
          border-radius: 8px;
          overflow: hidden;
        }
        .psb__chip-main {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-start;
          text-align: left;
          color: inherit;
        }
        .psb__chip-main:hover {
          background: var(--paper-warm);
        }
        .psb__chip-label {
          color: var(--ink-mute);
        }
        .psb__chip-val {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 15px;
          color: var(--ink);
          letter-spacing: -0.015em;
        }
        .psb__chip-remove {
          appearance: none;
          background: transparent;
          border: 0;
          border-left: 1px solid var(--rule-soft);
          padding: 0 10px;
          color: var(--ink-mute);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }
        .psb__chip-remove:hover {
          color: var(--stamp);
        }
      `}</style>
    </div>
  );
}

/**
 * usePinnedScenarios — in-memory pin list capped at `max` entries. New
 * pins past the cap evict the oldest (FIFO).
 */
export function usePinnedScenarios<I>(max = 3) {
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
