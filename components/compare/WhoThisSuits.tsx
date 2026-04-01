"use client";

import { FUNDS } from "@/data/funds";

interface WhoThisSuitsProps {
  selectedFunds: string[];
}

export default function WhoThisSuits({ selectedFunds }: WhoThisSuitsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {selectedFunds.map((ticker) => {
        const fund = FUNDS[ticker];
        if (!fund) return null;
        return (
          <div
            key={ticker}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: fund.chartColor }}
              />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {fund.shortName}
              </h3>
              <span className="text-xs text-[var(--color-text-muted)]">
                {fund.provider}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {fund.whoThisSuits}
            </p>
          </div>
        );
      })}
    </div>
  );
}
