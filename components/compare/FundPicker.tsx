"use client";

import { FUNDS } from "@/data/funds";

interface FundPickerProps {
  selected: string[];
  onToggle: (ticker: string) => void;
}

const FUND_OPTIONS = Object.values(FUNDS);

/**
 * Custom-pick row beneath the marquee matchups. Each fund is a small
 * tile — ticker in the display face, provider as caption underneath.
 * Selected tiles invert (ink fill, paper text) with a vermilion top edge.
 * VEQT is permanently pinned (the "house" fighter) and styled with a
 * vermilion underline rather than the disabled pill greyout.
 */
export default function FundPicker({ selected, onToggle }: FundPickerProps) {
  return (
    <section aria-labelledby="picker-heading">
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <p id="picker-heading" className="bs-stamp">
          Or pick your own
        </p>
        <p
          className="bs-caption italic text-[11.5px]"
          style={{ color: "var(--ink-soft)" }}
        >
          VEQT stays in the ring
        </p>
      </header>

      <ul
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5"
        role="list"
      >
        {FUND_OPTIONS.map((fund) => {
          const isActive = selected.includes(fund.ticker);
          const isVeqt = fund.ticker === "VEQT.TO";
          return (
            <li key={fund.ticker}>
              <button
                onClick={() => !isVeqt && onToggle(fund.ticker)}
                disabled={isVeqt}
                aria-pressed={isActive}
                className="group w-full text-left transition-colors"
                style={{
                  backgroundColor:
                    isActive && !isVeqt
                      ? "var(--ink)"
                      : "transparent",
                  color: isActive && !isVeqt ? "var(--paper)" : "var(--ink)",
                  borderTop: isVeqt
                    ? "2px solid var(--stamp)"
                    : isActive
                    ? "2px solid var(--stamp)"
                    : "2px solid var(--ink)",
                  padding: "8px 10px 10px",
                  cursor: isVeqt ? "default" : "pointer",
                }}
              >
                <span
                  className="bs-display block text-[15px] sm:text-base leading-tight"
                  style={{
                    color:
                      isActive && !isVeqt
                        ? "var(--paper)"
                        : isVeqt
                        ? "var(--stamp)"
                        : "var(--ink)",
                  }}
                >
                  {fund.shortName}
                </span>
                <span
                  className="bs-caption italic block mt-0.5 text-[10.5px] truncate"
                  style={{
                    color:
                      isActive && !isVeqt
                        ? "color-mix(in oklab, var(--paper) 70%, transparent)"
                        : "var(--ink-soft)",
                  }}
                >
                  {isVeqt ? "house" : fund.provider}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
