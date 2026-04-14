"use client";

import { useState } from "react";

interface Purchase {
  year: number;
  event: string;
  invested: string;
  crash: string;
  description: string;
}

const PURCHASES: Purchase[] = [
  {
    year: 1973,
    event: "Oil Crisis Peak",
    invested: "$6,000",
    crash: "-48%",
    description:
      "Bob invested right before the oil embargo and stagflation. The market dropped 48% — his $6,000 was cut nearly in half. He didn't sell.",
  },
  {
    year: 1987,
    event: "Black Monday Peak",
    invested: "$46,000",
    crash: "-34%",
    description:
      "Bob invested his savings the day before the largest single-day crash in history — a 22% drop in one day, 34% total decline. He didn't sell.",
  },
  {
    year: 2000,
    event: "Dot-Com Peak",
    invested: "$68,000",
    crash: "-49%",
    description:
      "Bob invested at the peak of the tech bubble. The market dropped 49% over the next two years. He didn't sell.",
  },
  {
    year: 2007,
    event: "Financial Crisis Peak",
    invested: "$64,000",
    crash: "-57%",
    description:
      "Bob invested right before the worst financial crisis since the Great Depression. Stocks lost 57%. He didn't sell.",
  },
];

const TOTAL_INVESTED = "$184,000";
const FINAL_VALUE = "~$1.16M";

export function BobTimeline() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedPurchase = selected !== null ? PURCHASES[selected] : null;

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Bob&apos;s Four Purchases — All at the Worst Possible Time
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Bob only invested right before major crashes. Select each purchase to see
        what happened.
      </p>

      {/* Timeline bar */}
      <div className="relative mb-4">
        <div className="h-0.5 bg-[var(--color-border)] w-full absolute top-3" />
        <div className="flex justify-between relative">
          {PURCHASES.map((purchase, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={purchase.year}
                onClick={() => setSelected(isSelected ? null : i)}
                className="flex flex-col items-center group relative z-10"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[var(--color-negative)] border-[var(--color-negative)] scale-125"
                      : "bg-[var(--color-card)] border-[var(--color-border)] group-hover:border-[var(--color-negative)]"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
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
                  {purchase.year}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail card */}
      {selectedPurchase ? (
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-4 mb-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                {selectedPurchase.event}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {selectedPurchase.year}
              </p>
            </div>
            <div className="flex gap-3 text-right">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Invested
                </p>
                <p className="text-base font-bold text-[var(--color-text-primary)]">
                  {selectedPurchase.invested}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Then Crashed
                </p>
                <p className="text-base font-bold text-[var(--color-negative)]">
                  {selectedPurchase.crash}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            {selectedPurchase.description}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-base)] p-4 mb-3 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Select a purchase on the timeline above to see details
          </p>
        </div>
      )}

      {/* Result box */}
      <div className="rounded-md bg-[var(--color-positive-bg)] border border-[var(--color-positive)]/20 p-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Invested
            </p>
            <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
              {TOTAL_INVESTED}
            </p>
          </div>
          <div className="text-2xl text-[var(--color-positive)]">&rarr;</div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Final Value (2013)
            </p>
            <p className="text-lg sm:text-xl font-bold tabular-nums text-[var(--color-positive)]">
              {FINAL_VALUE}
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-positive)]">
            Bob&apos;s secret:
          </strong>{" "}
          He never sold. Despite buying at the four worst peaks in modern market
          history, holding through every crash turned {TOTAL_INVESTED} into over
          $1 million — an annualized return of roughly 9%.
        </p>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        Based on Ben Carlson&apos;s analysis at A Wealth of Common Sense. S&amp;P
        500 total return data. Amounts and timing are approximate.
      </p>
    </div>
  );
}
