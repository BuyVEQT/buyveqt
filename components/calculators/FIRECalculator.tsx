"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";
import { CARD, STAT_CARD } from "@/lib/styles";
import { useAnimatedNumber } from "./useAnimatedNumber";
import MonteCarloChart from "./MonteCarloChart";
import ShareModal from "@/components/ShareModal";
import type { VolatilityStats } from "@/lib/data/volatility";

interface FIRECalculatorProps {
  volatilityStats: VolatilityStats | null;
}

export default function FIRECalculator({ volatilityStats }: FIRECalculatorProps) {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(55);
  const [portfolioValue, setPortfolioValue] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [annualExpenses, setAnnualExpenses] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [shareOpen, setShareOpen] = useState(false);

  const {
    targetPortfolio,
    yearsToFire,
    coastFIRE,
    progressPct,
    alreadyFIRE,
    coastFIREAchieved,
    projectedFireYear,
  } = useMemo(() => {
    const target = annualExpenses / (withdrawalRate / 100);
    const years = Math.max(1, retirementAge - currentAge);
    const rate = expectedReturn / 100;
    const annualContrib = monthlyContribution * 12;

    // Coast FIRE: amount needed today such that growth alone reaches target
    const coast = target / Math.pow(1 + rate, years);

    const already = portfolioValue >= target;
    const coastAchieved = portfolioValue >= coast;

    // Find the year the portfolio hits the target
    let projectedYear: number | null = null;
    let balance = portfolioValue;
    for (let y = 1; y <= years; y++) {
      balance = (balance + annualContrib) * (1 + rate);
      if (balance >= target && projectedYear === null) {
        projectedYear = y;
      }
    }

    return {
      targetPortfolio: target,
      yearsToFire: projectedYear,
      coastFIRE: coast,
      progressPct: Math.min(100, (portfolioValue / target) * 100),
      alreadyFIRE: already,
      coastFIREAchieved: coastAchieved,
      projectedFireYear: projectedYear,
    };
  }, [currentAge, retirementAge, portfolioValue, monthlyContribution, annualExpenses, expectedReturn, withdrawalRate]);

  // Animated stat values
  const animTarget = useAnimatedNumber(targetPortfolio);
  const animCoast = useAnimatedNumber(coastFIRE);
  const animProgress = useAnimatedNumber(Math.round(progressPct));
  const animYears = useAnimatedNumber(yearsToFire ?? 0);

  const yearsToRetirement = Math.max(1, retirementAge - currentAge);

  return (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        FIRE Calculator
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Find your Financial Independence, Retire Early target — and when you
        could reach it investing in VEQT.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Current Age */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Current Age
          </label>
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(Math.max(18, Math.min(70, Number(e.target.value) || 18)))}
            min={18}
            max={70}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 px-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>

        {/* Retirement Age */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Target Retirement Age: {retirementAge}
          </label>
          <input
            type="range"
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
            min={Math.max(currentAge + 1, 30)}
            max={80}
            step={1}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>{Math.max(currentAge + 1, 30)}</span>
            <span>80</span>
          </div>
        </div>

        {/* Current Portfolio */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Current Portfolio
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(Math.max(0, Math.min(10000000, Number(e.target.value) || 0)))}
              onBlur={() => setPortfolioValue(Math.round(portfolioValue / 1000) * 1000)}
              min={0}
              max={10000000}
              step={1000}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        {/* Monthly Contribution */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Monthly Contribution
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Math.max(0, Math.min(50000, Number(e.target.value) || 0)))}
              onBlur={() => setMonthlyContribution(Math.round(monthlyContribution / 50) * 50)}
              min={0}
              max={50000}
              step={50}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        {/* Annual Expenses */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Annual Expenses in Retirement
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
            <input
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Math.max(10000, Math.min(500000, Number(e.target.value) || 10000)))}
              onBlur={() => setAnnualExpenses(Math.round(annualExpenses / 1000) * 1000)}
              min={10000}
              max={500000}
              step={1000}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        {/* Expected Return */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Expected Return: {expectedReturn.toFixed(1)}%
          </label>
          <input
            type="range"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
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

        {/* Withdrawal Rate */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Safe Withdrawal Rate: {withdrawalRate.toFixed(1)}%
          </label>
          <input
            type="range"
            value={withdrawalRate}
            onChange={(e) => setWithdrawalRate(Number(e.target.value))}
            min={2}
            max={5}
            step={0.1}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>2% (conservative)</span>
            <span>4% (traditional)</span>
            <span>5% (aggressive)</span>
          </div>
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className={STAT_CARD}>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            FIRE Target
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(animTarget)}
          </p>
        </div>
        <div className={STAT_CARD}>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            {alreadyFIRE ? "Status" : "Years to FIRE"}
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1 text-[var(--color-positive)]">
            {alreadyFIRE
              ? "FIRE achieved!"
              : projectedFireYear
              ? `~${animYears} years`
              : `${yearsToRetirement}+ years`}
          </p>
        </div>
        <div className={STAT_CARD}>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Coast FIRE Number
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(animCoast)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-1.5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Progress to FIRE
          </p>
          <p className="text-sm font-semibold tabular-nums">
            {animProgress}%
          </p>
        </div>
        <div className="h-3 rounded-full bg-[var(--color-base)] border border-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              backgroundColor: alreadyFIRE
                ? "var(--color-positive)"
                : progressPct >= 75
                ? "var(--color-positive)"
                : progressPct >= 50
                ? "var(--color-accent)"
                : "var(--color-brand)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
          <span>{formatDollars(portfolioValue)}</span>
          <span>{formatDollars(targetPortfolio)}</span>
        </div>
      </div>

      {/* Conditional callouts */}
      {alreadyFIRE && (
        <div className="rounded-lg bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/20 p-4 mb-6">
          <p className="text-sm font-medium text-[var(--color-positive)]">
            Congratulations — you&apos;ve reached your FIRE number!
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Your portfolio of {formatDollars(portfolioValue)} exceeds your target
            of {formatDollars(targetPortfolio)}. At a {withdrawalRate}% withdrawal
            rate, you could withdraw {formatDollars(annualExpenses)}/year
            indefinitely.
          </p>
        </div>
      )}
      {!alreadyFIRE && coastFIREAchieved && (
        <div className="rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 p-4 mb-6">
          <p className="text-sm font-medium text-[var(--color-accent)]">
            Coast FIRE achieved!
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Your portfolio of {formatDollars(portfolioValue)} exceeds the Coast
            FIRE number of {formatDollars(Math.round(coastFIRE))}. Even if you
            stopped contributing today, your portfolio would grow to your target
            of {formatDollars(targetPortfolio)} by age {retirementAge}.
          </p>
        </div>
      )}

      {/* Monte Carlo chart — always on for FIRE */}
      <div className="mb-6">
        <MonteCarloChart
          volatilityStats={volatilityStats}
          startingValue={portfolioValue}
          annualContribution={monthlyContribution * 12}
          years={yearsToRetirement}
          targetValue={targetPortfolio}
          height={300}
        />
      </div>

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
        tab="fire"
        params={{
          portfolio: portfolioValue,
          monthly: monthlyContribution,
          rate: expectedReturn,
          expenses: annualExpenses,
          withdrawalRate,
          result: Math.round(targetPortfolio),
          coastFire: Math.round(coastFIRE),
          yearsToFire: projectedFireYear ?? yearsToRetirement,
          currentAge,
          retirementAge,
        }}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Notes */}
      <div className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 border-t border-[var(--color-border)] pt-4">
        <p>
          The &ldquo;4% rule&rdquo; comes from the Trinity Study, which found
          that a 4% initial withdrawal rate (adjusted for inflation) historically
          sustained a 30-year retirement in most market conditions. Your mileage
          may vary.
        </p>
        <p>
          Coast FIRE is the portfolio value where growth alone (no further
          contributions) would reach your target by retirement age, assuming the
          expected return rate.
        </p>
        <p>
          The Monte Carlo simulation uses historical VEQT return distribution to
          model uncertainty. Each scenario randomly samples annual returns. This
          is not a prediction — it shows the range of possible outcomes.
        </p>
        <p>
          Does not account for taxes, inflation, changes in expenses, or
          government benefits (CPP/OAS/GIS).
        </p>
      </div>
    </div>
  );
}
