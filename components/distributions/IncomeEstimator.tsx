"use client";

import { useState, useRef, useEffect } from "react";
import { track } from "@vercel/analytics";

interface IncomeEstimatorProps {
  annualDistPerUnit: number;
  currentPrice: number;
}

function formatDollars(n: number): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function IncomeEstimator({
  annualDistPerUnit,
  currentPrice,
}: IncomeEstimatorProps) {
  const [units, setUnits] = useState(100);
  const [inputValue, setInputValue] = useState("100");
  const tracked = useRef(false);

  useEffect(() => {
    if (units !== 100 && !tracked.current) {
      tracked.current = true;
      track("calculator_used", { type: "income-estimator" });
    }
  }, [units]);

  function handleChange(raw: string) {
    setInputValue(raw);
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    if (!isNaN(n) && n >= 0) {
      setUnits(Math.min(100000, n));
    }
  }

  const annualIncome = units * annualDistPerUnit;
  const monthlyIncome = annualIncome / 12;
  const holdingsValue = units * currentPrice;
  const effectiveYield =
    holdingsValue > 0 ? (annualIncome / holdingsValue) * 100 : 0;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">
        Income Estimator
      </h3>

      <div className="mb-4">
        <label className="block text-sm text-[var(--color-text-muted)] mb-1.5">
          VEQT units held
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full sm:w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 focus:border-[var(--color-brand)]"
        />
        {currentPrice > 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Holdings value: {formatDollars(holdingsValue)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--color-base)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
            Est. Annual Income
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-positive)]">
            {formatDollars(annualIncome)}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-base)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
            Est. Monthly
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
            {formatDollars(monthlyIncome)}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-base)] p-3">
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
            Effective Yield
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
            {effectiveYield.toFixed(2)}%
          </p>
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-text-muted)] mt-3 leading-relaxed">
        Based on trailing 12-month distributions. Future distributions are not
        guaranteed and may vary.
      </p>
    </div>
  );
}
