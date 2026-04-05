"use client";

import { FUNDS } from "@/data/funds";

interface FundPickerProps {
  selected: string[];
  onToggle: (ticker: string) => void;
}

const FUND_OPTIONS = Object.values(FUNDS);

export default function FundPicker({ selected, onToggle }: FundPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {FUND_OPTIONS.map((fund) => {
        const isActive = selected.includes(fund.ticker);
        const isVeqt = fund.ticker === "VEQT.TO";
        return (
          <button
            key={fund.ticker}
            onClick={() => !isVeqt && onToggle(fund.ticker)}
            disabled={isVeqt}
            className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              isActive
                ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-sm"
                : "bg-[var(--color-card)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-border-light)] hover:shadow-sm"
            } ${isVeqt ? "cursor-default" : "cursor-pointer"}`}
          >
            <span className="font-semibold">{fund.shortName}</span>
            <span
              className={`text-[10px] font-normal ${
                isActive
                  ? "text-white/70"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {fund.provider}
            </span>
          </button>
        );
      })}
    </div>
  );
}
