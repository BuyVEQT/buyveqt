"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";
import { CARD } from "@/lib/styles";
import ContributionGrowthChart from "./ContributionGrowthChart";
import ShareModal from "@/components/ShareModal";

export default function DCACalculator() {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(8);
  const [shareOpen, setShareOpen] = useState(false);

  const { totalContributed, portfolioValue, investmentGrowth, chartData } =
    useMemo(() => {
      const monthlyRate = returnRate / 100 / 12;
      const totalMonths = years * 12;
      const totalContributed = monthly * totalMonths;

      const points: {
        year: number;
        contributions: number;
        growth: number;
        total: number;
      }[] = [{ year: 0, contributions: 0, growth: 0, total: 0 }];

      for (let y = 1; y <= years; y++) {
        const months = y * 12;
        const fv =
          monthlyRate === 0
            ? monthly * months
            : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        const contrib = monthly * months;
        points.push({
          year: y,
          contributions: contrib,
          growth: fv - contrib,
          total: fv,
        });
      }

      const finalValue = points[points.length - 1].total;
      return {
        totalContributed,
        portfolioValue: finalValue,
        investmentGrowth: finalValue - totalContributed,
        chartData: points,
      };
    }, [monthly, years, returnRate]);

  return (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        Dollar-Cost Averaging Calculator
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        See how regular monthly investments in VEQT could grow over time.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Monthly Contribution
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={monthly}
              onChange={(e) => {
                const v = Math.max(50, Math.min(10000, Number(e.target.value) || 50));
                setMonthly(v);
              }}
              onBlur={() => setMonthly(Math.round(monthly / 50) * 50)}
              min={50}
              max={10000}
              step={50}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Time Horizon: {years} years
          </label>
          <input
            type="range"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min={1}
            max={40}
            step={1}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>1 yr</span>
            <span>40 yrs</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Annual Return: {returnRate.toFixed(1)}%
          </label>
          <input
            type="range"
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            min={1}
            max={15}
            step={0.5}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>1%</span>
            <span>15%</span>
          </div>
        </div>
      </div>

      <ContributionGrowthChart
        chartData={chartData}
        stats={[
          { label: "Total Contributed", value: totalContributed },
          { label: "Est. Portfolio Value", value: portfolioValue },
          { label: "Investment Growth", value: investmentGrowth, highlight: true },
        ]}
      />

      {/* Share Results */}
      <div className="flex justify-end">
        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-base)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share Results
        </button>
      </div>
      <ShareModal
        tab="dca"
        params={{
          monthly,
          horizon: years,
          rate: returnRate,
          result: Math.round(portfolioValue),
          contributions: Math.round(totalContributed),
          growth: Math.round(investmentGrowth),
        }}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Notes */}
      <div className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 border-t border-[var(--color-border)] pt-4">
        <p>
          This calculator uses a fixed annual return compounded monthly. Actual
          VEQT returns vary significantly year to year — some years may be +25%,
          others may be -30%.
        </p>
        <p>
          The average historical return of global equity markets has been
          approximately 7-10% annually over long periods, but past performance
          does not guarantee future results.
        </p>
        <p>Does not account for management fees (MER), taxes, or inflation.</p>
      </div>
    </div>
  );
}
