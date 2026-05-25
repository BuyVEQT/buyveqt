"use client";

/**
 * CalcTabs — sticky tab strip that switches between the four calculators.
 *
 * 4-up horizontal grid on desktop; 2x2 on tablet; horizontal scroll on
 * mobile. The active tab gets a vermilion underline + ink text. Each
 * tab carries a short sub-label describing what the calculator does.
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
  return (
    <nav
      aria-label="Calculator selector"
      className="calc-tabs"
      role="tablist"
    >
      <div className="calc-tabs__row">
        {CALC_TABS.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`calc-panel-${t.id}`}
              onClick={() => onChange(t.id)}
              className={`calc-tab${active ? " is-active" : ""}`}
            >
              <span className="calc-tab__num">{t.num}</span>
              <span className="calc-tab__body">
                <span className="calc-tab__label">{t.label}</span>
                <span className="calc-tab__sub">{t.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .calc-tabs {
          position: sticky;
          top: 0;
          z-index: 30;
          background: var(--paper);
          margin: 0 -28px;
          padding: 12px 28px;
          border-bottom: 1px solid var(--rule-soft);
        }
        @media (max-width: 720px) {
          .calc-tabs {
            margin: 0 -18px;
            padding: 10px 18px;
          }
        }
        .calc-tabs__row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 3px solid var(--ink);
          border-bottom: 1px solid var(--ink);
        }
        @media (max-width: 880px) {
          .calc-tabs__row {
            grid-template-columns: repeat(2, 1fr);
            border-bottom: 1px solid var(--ink);
          }
        }
        @media (max-width: 480px) {
          .calc-tabs__row {
            grid-template-columns: 1fr 1fr;
          }
        }
        .calc-tab {
          appearance: none;
          background: transparent;
          border: 0;
          border-right: 1px solid var(--rule-soft);
          padding: 14px 18px;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: baseline;
          gap: 12px;
          color: var(--ink-soft);
          font: inherit;
          position: relative;
          transition: background 0.15s, color 0.15s;
        }
        .calc-tab:last-child {
          border-right: 0;
        }
        @media (max-width: 880px) {
          .calc-tab:nth-child(2) {
            border-right: 0;
          }
          .calc-tab:nth-child(1),
          .calc-tab:nth-child(2) {
            border-bottom: 1px solid var(--rule-soft);
          }
        }
        .calc-tab:hover {
          background: var(--paper-warm);
        }
        .calc-tab:focus-visible {
          outline: 2px solid var(--stamp);
          outline-offset: -2px;
          background: var(--paper-warm);
        }
        .calc-tab.is-active {
          color: var(--ink);
        }
        .calc-tab.is-active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 3px;
          background: var(--stamp);
        }
        .calc-tab__num {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 22px;
          letter-spacing: -0.025em;
          color: var(--ink-mute);
          font-variant-numeric: tabular-nums lining-nums;
          flex-shrink: 0;
        }
        .calc-tab.is-active .calc-tab__num {
          color: var(--stamp);
        }
        .calc-tab__body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .calc-tab__label {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(15px, 1.6vw, 18px);
          line-height: 1.05;
          letter-spacing: -0.012em;
          color: inherit;
        }
        .calc-tab__sub {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12px;
          color: var(--ink-mute);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </nav>
  );
}
