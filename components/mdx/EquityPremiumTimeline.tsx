"use client";

import { useState } from "react";

interface Crisis {
  year: number;
  label: string;
  drawdown: string;
  recovery: string;
  description: string;
}

const CRISES: Crisis[] = [
  {
    year: 1929,
    label: "Great Depression",
    drawdown: "-79%",
    recovery: "25 years",
    description:
      "The worst crash in modern history. U.S. stocks lost nearly 80% of their value. Yet markets recovered, and $1 invested in 1929 was worth over $50 by 1970.",
  },
  {
    year: 1939,
    label: "World War II",
    drawdown: "-26%",
    recovery: "4 years",
    description:
      "Global conflict devastated economies worldwide. Stocks dropped, but recovered within years of the war's end as rebuilding drove massive economic growth.",
  },
  {
    year: 1973,
    label: "Oil Crisis / Stagflation",
    drawdown: "-48%",
    recovery: "7 years",
    description:
      "Oil embargo, double-digit inflation, and recession. The 1970s were brutal for investors. Yet the 1980s bull market made those who held look prescient.",
  },
  {
    year: 1987,
    label: "Black Monday",
    drawdown: "-34%",
    recovery: "2 years",
    description:
      "The market dropped 22% in a single day — the largest one-day percentage decline in history. Within two years, stocks had fully recovered.",
  },
  {
    year: 2000,
    label: "Dot-Com Crash",
    drawdown: "-49%",
    recovery: "7 years",
    description:
      "The tech bubble burst. The NASDAQ fell 78%. But diversified global portfolios recovered faster than tech-heavy ones — a lesson in the power of diversification.",
  },
  {
    year: 2008,
    label: "Global Financial Crisis",
    drawdown: "-57%",
    recovery: "5 years",
    description:
      "Banks collapsed, housing crashed, the global economy froze. Stocks lost more than half their value. By 2013, markets had fully recovered and then some.",
  },
  {
    year: 2020,
    label: "COVID-19 Crash",
    drawdown: "-34%",
    recovery: "5 months",
    description:
      "The fastest 30% drop in history — and one of the fastest recoveries. Markets fell in weeks and recovered in months. Those who sold in March locked in catastrophic losses.",
  },
];

export function EquityPremiumTimeline() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedCrisis = selected !== null ? CRISES[selected] : null;

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Every Crisis Feels Like the End
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Seven times in the last century, markets dropped 25-79%. Seven times,
        they recovered. Select a crisis to see the details.
      </p>

      {/* Timeline bar */}
      <div className="relative mb-4">
        {/* Base line */}
        <div className="h-0.5 bg-[var(--color-border)] w-full absolute top-3" />

        {/* Crisis dots */}
        <div className="flex justify-between relative">
          {CRISES.map((crisis, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={crisis.year}
                onClick={() => setSelected(isSelected ? null : i)}
                className="flex flex-col items-center group relative z-10"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[var(--color-negative)] border-[var(--color-negative)] scale-125"
                      : "bg-[var(--color-card)] border-[var(--color-border)] group-hover:border-[var(--color-negative)]"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isSelected
                        ? "bg-white"
                        : "bg-[var(--color-negative)] opacity-60"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold tabular-nums mt-1 ${
                    isSelected
                      ? "text-[var(--color-negative)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {crisis.year}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail card */}
      {selectedCrisis ? (
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-4 mb-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {selectedCrisis.label}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {selectedCrisis.year}
              </p>
            </div>
            <div className="flex gap-3 text-right">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Drawdown
                </p>
                <p className="text-base font-bold text-[var(--color-negative)]">
                  {selectedCrisis.drawdown}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Recovery
                </p>
                <p className="text-base font-bold text-[var(--color-positive)]">
                  {selectedCrisis.recovery}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {selectedCrisis.description}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-base)] p-4 mb-3 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Select a crisis on the timeline above to see details
          </p>
        </div>
      )}

      {/* Bottom insight */}
      <div className="rounded-md bg-[var(--color-positive-bg)] border border-[var(--color-positive)]/20 p-3">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-positive)]">
            The pattern:
          </strong>{" "}
          Every crash felt like the end of the world. Every recovery seemed
          impossible until it happened. $1 invested in global equities in 1900
          would be worth over $700 today in real (inflation-adjusted) terms,
          despite two world wars, a great depression, pandemics, and dozens of
          recessions.
        </p>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        Drawdown and recovery figures are approximate, based on US and global
        equity indices. Source: Dimson, Marsh &amp; Staunton; S&amp;P 500
        historical data.
      </p>
    </div>
  );
}
