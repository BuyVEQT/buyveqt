"use client";

import { useEffect, useRef } from "react";

/**
 * CalcTabs — the four-up ordinal strip that switches between calculators.
 *
 * Instrument grammar: four bordered cells sharing 1px ink rules, each
 * stamped with an oversized ordinal, a name, and a one-line sub. The
 * active cell fills ink with paper text and prints a signal square in the
 * corner. 4-up on desktop, 2×2 on phones.
 *
 * `tab` values mirror the OG-image metadata keys so the same URL param
 * drives both navigation and shareable previews:
 *   historical  → Lookback
 *   dca         → Dollar-cost averaging
 *   tfsa-rrsp   → Shelter (TFSA / RRSP / FHSA)
 *   fire        → FIRE planner
 */
export type CalcTabId = "historical" | "dca" | "tfsa-rrsp" | "fire";

interface TabSpec {
  id: CalcTabId;
  num: string;
  label: string;
  sub: string;
}

export const CALC_TABS: TabSpec[] = [
  { id: "historical", num: "01", label: "Lookback", sub: "What if you'd bought…" },
  { id: "dca", num: "02", label: "DCA", sub: "Monthly contributions" },
  { id: "tfsa-rrsp", num: "03", label: "Shelter", sub: "TFSA · RRSP · FHSA" },
  { id: "fire", num: "04", label: "FIRE", sub: "Years to independence" },
];

interface CalcTabsProps {
  value: CalcTabId;
  onChange: (id: CalcTabId) => void;
}

export default function CalcTabs({ value, onChange }: CalcTabsProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  // When the active tab changes from outside the strip (URL deep link,
  // the closer's "run the DCA" CTA), bring it into view.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const target = row.querySelector<HTMLButtonElement>(
      `button[data-tab-id="${value}"]`
    );
    if (!target) return;
    target.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }, [value]);

  return (
    <nav aria-label="Calculator selector" className="calc-tabs" role="tablist">
      <div className="calc-tabs__row" ref={rowRef}>
        {CALC_TABS.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tab-id={t.id}
              aria-selected={active}
              aria-controls={`calc-panel-${t.id}`}
              onClick={() => onChange(t.id)}
              className={`calc-tab${active ? " is-active" : ""}`}
            >
              <span className="calc-tab__top">
                <span className="calc-tab__num">{t.num}</span>
                {active && <span className="calc-tab__sq" aria-hidden />}
              </span>
              <span className="calc-tab__label">{t.label}</span>
              <span className="calc-tab__sub">{t.sub}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .calc-tabs {
          font-family: var(--ins-font);
        }
        .calc-tabs__row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .calc-tab {
          appearance: none;
          border: 1px solid var(--ins-ink);
          border-radius: 0;
          background: transparent;
          color: var(--ins-ink);
          padding: 18px 20px;
          text-align: left;
          cursor: pointer;
          font: inherit;
          display: flex;
          flex-direction: column;
          min-width: 0;
          transition: background 0.15s, color 0.15s;
        }
        .calc-tab + .calc-tab {
          border-left: 0;
        }
        .calc-tab:hover:not(.is-active) {
          background: rgba(17, 17, 17, 0.04);
        }
        .calc-tab:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: -4px;
        }
        .calc-tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }
        .calc-tab__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
        }
        .calc-tab__num {
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
          color: var(--ins-ordinal);
          font-variant-numeric: tabular-nums;
        }
        .calc-tab.is-active .calc-tab__num {
          color: rgba(255, 255, 255, 0.4);
        }
        .calc-tab__sq {
          width: 7px;
          height: 7px;
          background: var(--ins-signal);
          flex: none;
        }
        .calc-tab__label {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-top: 12px;
        }
        .calc-tab__sub {
          font-size: 10.5px;
          font-weight: 500;
          color: var(--ins-gray-600);
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .calc-tab.is-active .calc-tab__sub {
          color: var(--ins-inv-mute);
        }

        @media (max-width: 900px) {
          .calc-tab {
            padding: 14px 16px;
          }
          .calc-tab__label {
            font-size: 12px;
            margin-top: 10px;
          }
        }

        /* 2×2 on phones — the mock's mobile grid. Gaps replace the shared
           rules so every cell keeps a full border. */
        @media (max-width: 640px) {
          .calc-tabs__row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .calc-tab {
            padding: 13px 14px;
            min-height: 64px;
          }
          .calc-tab + .calc-tab {
            border-left: 1px solid var(--ins-ink);
          }
          .calc-tab__num {
            font-size: 18px;
          }
          .calc-tab__label {
            font-size: 11px;
            letter-spacing: 0.12em;
            margin-top: 8px;
          }
          .calc-tab__sub {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
