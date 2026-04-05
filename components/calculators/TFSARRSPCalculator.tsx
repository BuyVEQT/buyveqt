"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";
import { CARD } from "@/lib/styles";
import { useAnimatedNumber } from "./useAnimatedNumber";
import ContributionGrowthChart from "./ContributionGrowthChart";
import MonteCarloChart from "./MonteCarloChart";
import ShareModal from "@/components/ShareModal";
import type { VolatilityStats } from "@/lib/data/volatility";

const VEQT_MER = 0.0024;
const INFLATION_RATE = 0.02;

interface TFSARRSPCalculatorProps {
  volatilityStats: VolatilityStats | null;
}

export default function TFSARRSPCalculator({ volatilityStats }: TFSARRSPCalculatorProps) {
  const [accountType, setAccountType] = useState<"TFSA" | "RRSP">("TFSA");
  const [startingBalance, setStartingBalance] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(7000);
  const [years, setYears] = useState(25);
  const [returnRate, setReturnRate] = useState(8);
  const [shareOpen, setShareOpen] = useState(false);

  // Enhancement toggles
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showInflation, setShowInflation] = useState(false);

  const { totalContributions, portfolioValue, totalGrowth, feeImpact, chartData } =
    useMemo(() => {
      const rate = returnRate / 100;
      const rateAfterFees = rate - VEQT_MER;

      const points: {
        year: number;
        contributions: number;
        growth: number;
        total: number;
        totalAfterFees?: number;
      }[] = [
        {
          year: 0,
          contributions: startingBalance,
          growth: 0,
          total: startingBalance,
          totalAfterFees: startingBalance,
        },
      ];

      let balance = startingBalance;
      let balanceAfterFees = startingBalance;

      for (let y = 1; y <= years; y++) {
        balance = (balance + annualContribution) * (1 + rate);
        balanceAfterFees = (balanceAfterFees + annualContribution) * (1 + rateAfterFees);
        const contrib = startingBalance + annualContribution * y;
        const inflationFactor = showInflation ? Math.pow(1 + INFLATION_RATE, y) : 1;

        points.push({
          year: y,
          contributions: Math.round(contrib / inflationFactor),
          growth: Math.round((balance - contrib) / inflationFactor),
          total: Math.round(balance / inflationFactor),
          totalAfterFees: Math.round(balanceAfterFees / inflationFactor),
        });
      }

      const totalContributions = startingBalance + annualContribution * years;
      const inflationFactor = showInflation ? Math.pow(1 + INFLATION_RATE, years) : 1;
      const adjustedBalance = balance / inflationFactor;
      const adjustedContrib = totalContributions / inflationFactor;

      return {
        totalContributions: Math.round(adjustedContrib),
        portfolioValue: Math.round(adjustedBalance),
        totalGrowth: Math.round(adjustedBalance - adjustedContrib),
        feeImpact: Math.round((balance - balanceAfterFees) / inflationFactor),
        chartData: points,
      };
    }, [startingBalance, annualContribution, years, returnRate, showInflation]);

  const animContrib = useAnimatedNumber(totalContributions);
  const animValue = useAnimatedNumber(portfolioValue);
  const animGrowth = useAnimatedNumber(totalGrowth);

  return (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        TFSA / RRSP Growth Projector
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Project how VEQT could grow inside your registered account over time.
      </p>

      {/* Account type toggle */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
          Account Type
        </label>
        <div className="flex gap-0.5 rounded-lg bg-[var(--color-base)] p-0.5 w-fit">
          {(["TFSA", "RRSP"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAccountType(type)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                accountType === type
                  ? "bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Starting Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={startingBalance}
              onChange={(e) => {
                const v = Math.max(0, Math.min(500000, Number(e.target.value) || 0));
                setStartingBalance(v);
              }}
              onBlur={() =>
                setStartingBalance(Math.round(startingBalance / 1000) * 1000)
              }
              min={0}
              max={500000}
              step={1000}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Annual Contribution
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={annualContribution}
              onChange={(e) => {
                const v = Math.max(0, Math.min(50000, Number(e.target.value) || 0));
                setAnnualContribution(v);
              }}
              onBlur={() =>
                setAnnualContribution(
                  Math.round(annualContribution / 500) * 500
                )
              }
              min={0}
              max={50000}
              step={500}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
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

      {/* Enhancement toggles */}
      <div className="flex flex-wrap gap-3 mb-6">
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={showMonteCarlo}
            onChange={(e) => setShowMonteCarlo(e.target.checked)}
            className="accent-[var(--color-brand)] w-3.5 h-3.5"
          />
          Show uncertainty
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={showFees}
            onChange={(e) => setShowFees(e.target.checked)}
            className="accent-[var(--color-brand)] w-3.5 h-3.5"
          />
          Show fee impact
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={showInflation}
            onChange={(e) => setShowInflation(e.target.checked)}
            className="accent-[var(--color-brand)] w-3.5 h-3.5"
          />
          Today&apos;s dollars
        </label>
      </div>

      {/* Main chart or Monte Carlo */}
      {showMonteCarlo ? (
        <div className="mb-6">
          <MonteCarloChart
            volatilityStats={volatilityStats}
            startingValue={startingBalance}
            annualContribution={annualContribution}
            years={years}
          />
        </div>
      ) : (
        <ContributionGrowthChart
          chartData={chartData}
          stats={[
            { label: showInflation ? "Contributions (real)" : "Total Contributions", value: animContrib },
            { label: showInflation ? "Est. Value (real)" : "Est. Portfolio Value", value: animValue },
            { label: "Total Growth", value: animGrowth, highlight: true },
          ]}
          showFees={showFees}
          showMilestones
        />
      )}

      {/* Fee impact callout */}
      {showFees && !showMonteCarlo && feeImpact > 0 && (
        <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-3 mb-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-negative)]">
              Estimated fee impact: {formatDollars(feeImpact)}
            </span>{" "}
            over {years} years at VEQT&apos;s 0.24% MER.
          </p>
        </div>
      )}

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
        tab="tfsa-rrsp"
        params={{
          account: accountType.toLowerCase(),
          starting: startingBalance,
          annual: annualContribution,
          horizon: years,
          rate: returnRate,
          result: Math.round(portfolioValue),
        }}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Account type info box */}
      <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-6">
        <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-1.5">
          {accountType} Details
        </p>
        {accountType === "TFSA" ? (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            In a TFSA, all investment growth is completely tax-free. You
            won&apos;t pay any tax when you withdraw funds. The current annual
            TFSA contribution limit is $7,000 (2026). Unused room accumulates
            and carries forward.
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            In an RRSP, contributions are tax-deductible — they reduce your
            taxable income in the year you contribute. Your investments grow
            tax-deferred. However, all withdrawals in retirement are taxed as
            regular income. The annual RRSP contribution limit is 18% of your
            previous year&apos;s earned income, up to a maximum (currently
            ~$33,810 for 2026).
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 border-t border-[var(--color-border)] pt-4">
        <p>
          This uses a simplified fixed annual return. Actual investment returns
          vary significantly year to year.
        </p>
        <p>
          TFSA and RRSP contribution limits change annually and depend on your
          individual situation. Check the CRA website for current limits.
        </p>
        {showInflation && (
          <p>
            Values shown in today&apos;s purchasing power, assuming 2% annual inflation.
          </p>
        )}
        <p>
          {showFees
            ? "Fee impact shown uses VEQT's 0.24% MER."
            : "This calculator does not model taxes, inflation, fees, or employer matching (for group RRSPs)."}
        </p>
        <p>
          The RRSP projection does not estimate the tax owed on withdrawal, which
          depends on your retirement income and province of residence.
        </p>
      </div>
    </div>
  );
}
