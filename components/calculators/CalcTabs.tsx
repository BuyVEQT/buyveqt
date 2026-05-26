"use client";

import { useEffect, useRef } from "react";

/**
 * CalcTabs — sticky tab strip that switches between the four calculators.
 *
 * Editorial pill-card row: each tab is a stamp + display name + sub-line.
 * Active tab gets an ink fill with paper text and a vermilion top hairline.
 * 4-up on desktop, 2x2 on tablet, horizontal scroll-snap on phones so each
 * card stays readable without truncating.
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

  // On phones the strip is horizontal scroll-snap. When the active tab
  // changes from outside the strip (e.g. URL deep link, or a tab off
  // screen got tapped), smooth-scroll it into view so the user always
  // sees the current selection.
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
    <nav
      aria-label="Calculator selector"
      className="calc-tabs"
      role="tablist"
    >
      <div className="calc-tabs__rail" aria-hidden="true">
        <span className="calc-tabs__rail-label">The four calculators</span>
        <span className="calc-tabs__rail-divider" />
        <span className="calc-tabs__rail-hint">Tap to switch</span>
      </div>
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
              <span className="calc-tab__num">{t.num}</span>
              <span className="calc-tab__body">
                <span className="calc-tab__label">{t.label}</span>
                <span className="calc-tab__sub">{t.sub}</span>
              </span>
              <span className="calc-tab__chev" aria-hidden="true">
                <svg viewBox="0 0 12 12" width="10" height="10">
                  <path
                    d="M3 1.5 L7.5 6 L3 10.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
          padding: 14px 28px 16px;
          border-bottom: 1px solid var(--rule-soft);
        }
        @media (max-width: 720px) {
          .calc-tabs {
            margin: 0 -18px;
            padding: 10px 18px 10px;
          }
        }
        /* Phones — collapse the rail row to just a small caption above the
           scroll-snap strip. Saves ~20px of always-pinned chrome. */
        @media (max-width: 520px) {
          .calc-tabs {
            padding: 8px 0 8px;
            margin: 0 -14px;
          }
        }
        .calc-tabs__rail {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 2px 10px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }
        @media (max-width: 520px) {
          .calc-tabs__rail {
            padding: 0 14px 6px;
            font-size: 10px;
            gap: 8px;
          }
        }
        .calc-tabs__rail-label {
          color: var(--stamp);
        }
        .calc-tabs__rail-divider {
          flex: 1;
          height: 1px;
          background: var(--rule-soft);
        }
        .calc-tabs__rail-hint {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          color: var(--ink-mute);
        }
        @media (max-width: 480px) {
          .calc-tabs__rail-hint {
            display: none;
          }
        }
        .calc-tabs__row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        @media (max-width: 880px) {
          .calc-tabs__row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        /* Phones — flip to a horizontal scroll-snap strip. Was a 1-col
           stack at ≤520px which ate ~280px of always-pinned vertical
           chrome on an iPhone (4 × 64px tabs + rail + padding). The
           horizontal strip fits two tabs in view at any phone width,
           swipe to discover the rest, and keeps the pinned chrome
           down to ~78px total. */
        @media (max-width: 520px) {
          .calc-tabs__row {
            display: flex;
            grid-template-columns: none;
            gap: 8px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-padding-inline: 14px;
            padding: 2px 14px 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .calc-tabs__row::-webkit-scrollbar {
            display: none;
          }
        }
        .calc-tab {
          appearance: none;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 14px;
          color: var(--ink-soft);
          font: inherit;
          position: relative;
          transition:
            background 0.15s,
            color 0.15s,
            border-color 0.15s,
            transform 0.08s;
          min-height: 64px;
        }
        @media (max-width: 520px) {
          .calc-tab {
            /* Each tab snaps to start so two tabs fit in view at most
               phone widths and the user swipes to see the rest. */
            scroll-snap-align: start;
            flex: 0 0 calc(50% - 4px);
            min-height: 56px;
            padding: 10px 12px;
            gap: 10px;
          }
        }
        .calc-tab:hover {
          background: var(--paper-light);
          border-color: var(--ink-mute);
          color: var(--ink);
        }
        .calc-tab:focus-visible {
          outline: 2px solid var(--stamp);
          outline-offset: 2px;
        }
        .calc-tab:active {
          transform: translateY(1px);
        }
        .calc-tab.is-active {
          background: var(--band-ink);
          border-color: var(--band-ink);
          color: var(--band-paper);
        }
        .calc-tab.is-active::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 12px;
          right: 12px;
          height: 3px;
          background: var(--stamp);
          border-radius: 0 0 2px 2px;
        }
        .calc-tab__num {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 26px;
          line-height: 1;
          letter-spacing: -0.03em;
          color: var(--ink-mute);
          font-variant-numeric: tabular-nums lining-nums;
          flex-shrink: 0;
        }
        @media (max-width: 520px) {
          .calc-tab__num {
            font-size: 22px;
          }
          .calc-tab__sub {
            font-size: 11.5px;
          }
        }
        .calc-tab:hover .calc-tab__num {
          color: var(--ink);
        }
        .calc-tab.is-active .calc-tab__num {
          color: var(--stamp);
        }
        .calc-tab__body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }
        .calc-tab__label {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(16px, 1.55vw, 19px);
          line-height: 1.05;
          letter-spacing: -0.012em;
          color: inherit;
        }
        .calc-tab__sub {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12.5px;
          color: var(--ink-mute);
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .calc-tab.is-active .calc-tab__sub {
          color: var(--on-band-mute);
        }
        .calc-tab__chev {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          color: var(--ink-mute);
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .calc-tab:hover .calc-tab__chev {
          opacity: 1;
          transform: translateX(0);
        }
        .calc-tab.is-active .calc-tab__chev {
          opacity: 1;
          transform: translateX(0);
          color: var(--stamp);
          background: rgba(246, 239, 220, 0.12);
        }
      `}</style>
    </nav>
  );
}
