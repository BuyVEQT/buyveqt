"use client";

import { FUNDS } from "@/data/funds";

interface FundPickerProps {
  selected: string[];
  onToggle: (ticker: string) => void;
}

const FUND_OPTIONS = Object.values(FUNDS);

export default function FundPicker({ selected, onToggle }: FundPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FUND_OPTIONS.map((fund) => {
        const isActive = selected.includes(fund.ticker);
        const isVeqt = fund.ticker === "VEQT.TO";
        return (
          <button
            key={fund.ticker}
            onClick={() => !isVeqt && onToggle(fund.ticker)}
            disabled={isVeqt}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              isActive
                ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                : "bg-[var(--color-card)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:text-[var(--color-text-secondary)]"
            } ${isVeqt ? "cursor-default" : "cursor-pointer"}`}
          >
            {fund.shortName}
          </button>
        );
      })}
    </div>
  );
}
