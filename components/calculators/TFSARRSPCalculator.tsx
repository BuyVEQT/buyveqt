"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";
import { CARD, STAT_CARD } from "@/lib/styles";
import { useAnimatedNumber } from "./useAnimatedNumber";
import ContributionGrowthChart from "./ContributionGrowthChart";
import MonteCarloChart from "./MonteCarloChart";
import ShareModal from "@/components/ShareModal";
import { computeTFSARoom } from "@/data/tfsa-limits";
import type { VolatilityStats } from "@/lib/data/volatility";

const VEQT_MER = 0.0024;
const INFLATION_RATE = 0.02;

interface TFSARRSPCalculatorProps {
  volatilityStats: VolatilityStats | null;
}

export default function TFSARRSPCalculator({ volatilityStats }: TFSARRSPCalculatorProps) {
  const [accountType, setAccountType] = useState<"TFSA" | "RRSP">("TFSA");

  // Shared inputs
  const [startingBalance, setStartingBalance] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(7000);
  const [years, setYears] = useState(25);
  const [returnRate, setReturnRate] = useState(8);
  const [shareOpen, setShareOpen] = useState(false);

  // Enhancement toggles
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showInflation, setShowInflation] = useState(false);

  // TFSA-specific
  const [birthYear, setBirthYear] = useState(1990);
  const [pastContributions, setPastContributions] = useState(0);

  // RRSP-specific
  const [marginalRate, setMarginalRate] = useState(33);
  const [retirementRate, setRetirementRate] = useState(20);
  const [reinvestRefund, setReinvestRefund] = useState(false);

  // ─── TFSA room computation ──────────────────────────────────
  const tfsaRoom = useMemo(
    () => computeTFSARoom(birthYear, pastContributions),
    [birthYear, pastContributions]
  );

  const exceedsRoom =
    accountType === "TFSA" && annualContribution > tfsaRoom.remaining;

  // ─── RRSP tax computations ──────────────────────────────────
  const rrspRefund = annualContribution * (marginalRate / 100);
  const effectiveContribution = reinvestRefund
    ? annualContribution + rrspRefund
    : annualContribution;

  // ─── Growth projection ──────────────────────────────────────
  const {
    totalContributions,
    portfolioValue,
    totalGrowth,
    feeImpact,
    afterTaxValue,
    taxSaved,
    chartData,
  } = useMemo(() => {
    const rate = returnRate / 100;
    const rateAfterFees = rate - VEQT_MER;
    const contrib = accountType === "RRSP" ? effectiveContribution : annualContribution;

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
      balance = (balance + contrib) * (1 + rate);
      balanceAfterFees = (balanceAfterFees + contrib) * (1 + rateAfterFees);
      const totalContrib = startingBalance + contrib * y;
      const inflationFactor = showInflation ? Math.pow(1 + INFLATION_RATE, y) : 1;

      points.push({
        year: y,
        contributions: Math.round(totalContrib / inflationFactor),
        growth: Math.round((balance - totalContrib) / inflationFactor),
        total: Math.round(balance / inflationFactor),
        totalAfterFees: Math.round(balanceAfterFees / inflationFactor),
      });
    }

    const totalContributions = startingBalance + contrib * years;
    const inflationFactor = showInflation ? Math.pow(1 + INFLATION_RATE, years) : 1;
    const adjustedBalance = balance / inflationFactor;
    const adjustedContrib = totalContributions / inflationFactor;

    // TFSA: tax saved = capital gains tax on growth in a taxable account
    // Simplified: 50% inclusion rate × marginal rate (use 30% default)
    const growth = adjustedBalance - adjustedContrib;
    const taxSavedTFSA = accountType === "TFSA" ? growth * 0.5 * 0.30 : 0;

    // RRSP: after-tax value on withdrawal
    const afterTax = accountType === "RRSP"
      ? adjustedBalance * (1 - retirementRate / 100)
      : adjustedBalance;

    return {
      totalContributions: Math.round(adjustedContrib),
      portfolioValue: Math.round(adjustedBalance),
      totalGrowth: Math.round(growth),
      feeImpact: Math.round((balance - balanceAfterFees) / inflationFactor),
      afterTaxValue: Math.round(afterTax),
      taxSaved: Math.round(taxSavedTFSA),
      chartData: points,
    };
  }, [startingBalance, annualContribution, effectiveContribution, years, returnRate, accountType, showInflation, retirementRate]);

  const animContrib = useAnimatedNumber(totalContributions);
  const animValue = useAnimatedNumber(
    accountType === "RRSP" ? afterTaxValue : portfolioValue
  );
  const animGrowth = useAnimatedNumber(totalGrowth);
  const animRoom = useAnimatedNumber(tfsaRoom.remaining);
  const animRefund = useAnimatedNumber(Math.round(rrspRefund));

  return (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        TFSA / RRSP Growth Projector
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        {accountType === "TFSA"
          ? "Track your contribution room and project tax-free growth with VEQT."
          : "See your tax refund advantage and project tax-deferred growth with VEQT."}
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

      {/* ─── TFSA: Contribution Room Tracker ─────────────── */}
      {accountType === "TFSA" && (
        <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-6">
          <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-3">
            TFSA Contribution Room
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Birth Year
              </label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) =>
                  setBirthYear(Math.max(1940, Math.min(2008, Number(e.target.value) || 1990)))
                }
                min={1940}
                max={2008}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 px-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Total Past Contributions
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
                <input
                  type="number"
                  value={pastContributions}
                  onChange={(e) =>
                    setPastContributions(Math.max(0, Math.min(200000, Number(e.target.value) || 0)))
                  }
                  onBlur={() =>
                    setPastContributions(Math.round(pastContributions / 500) * 500)
                  }
                  min={0}
                  max={200000}
                  step={500}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
              </div>
            </div>
          </div>

          {/* Room progress bar */}
          <div className="mb-2">
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-xs text-[var(--color-text-muted)]">
                Room used: {formatDollars(pastContributions)} of {formatDollars(tfsaRoom.lifetimeLimit)}
              </p>
              <p className="text-sm font-semibold tabular-nums text-[var(--color-positive)]">
                {formatDollars(animRoom)} remaining
              </p>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, tfsaRoom.usedPct)}%`,
                  backgroundColor: tfsaRoom.isOverContributed
                    ? "var(--color-negative)"
                    : tfsaRoom.usedPct > 90
                    ? "var(--color-accent)"
                    : "var(--color-brand)",
                }}
              />
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              Eligible since {tfsaRoom.firstEligibleYear} &middot; {tfsaRoom.currentYearLimit.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}/year limit for {new Date().getFullYear()}
            </p>
          </div>

          {/* Over-contribution warning */}
          {tfsaRoom.isOverContributed && (
            <div className="rounded-md bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/20 p-2.5 mt-2">
              <p className="text-xs font-medium text-[var(--color-negative)]">
                Over-contribution detected. CRA charges 1% per month on excess amounts.
              </p>
            </div>
          )}

          {/* Exceeds remaining room warning */}
          {!tfsaRoom.isOverContributed && exceedsRoom && (
            <div className="rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 p-2.5 mt-2">
              <p className="text-xs font-medium text-[var(--color-accent)]">
                Your annual contribution of {formatDollars(annualContribution)} exceeds your remaining room of {formatDollars(tfsaRoom.remaining)}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── RRSP: Tax Rate Inputs ───────────────────────── */}
      {accountType === "RRSP" && (
        <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-6">
          <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-3">
            RRSP Tax Advantage
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Current Marginal Tax Rate: {marginalRate}%
              </label>
              <input
                type="range"
                value={marginalRate}
                onChange={(e) => setMarginalRate(Number(e.target.value))}
                min={20}
                max={53}
                step={1}
                className="calc-slider w-full"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
                <span>20%</span>
                <span>53%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Expected Retirement Tax Rate: {retirementRate}%
              </label>
              <input
                type="range"
                value={retirementRate}
                onChange={(e) => setRetirementRate(Number(e.target.value))}
                min={15}
                max={45}
                step={1}
                className="calc-slider w-full"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
                <span>15% (lower income)</span>
                <span>45%</span>
              </div>
            </div>
          </div>

          {/* Tax refund callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className={STAT_CARD}>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Annual Tax Refund
              </p>
              <p className="text-lg font-semibold tabular-nums mt-1 text-[var(--color-positive)]">
                {formatDollars(animRefund)}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {formatDollars(annualContribution)} &times; {marginalRate}%
              </p>
            </div>
            <div className={STAT_CARD}>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Tax Rate Spread
              </p>
              <p className={`text-lg font-semibold tabular-nums mt-1 ${
                marginalRate > retirementRate ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
              }`}>
                {marginalRate > retirementRate ? "+" : ""}{marginalRate - retirementRate}%
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {marginalRate > retirementRate
                  ? "RRSP advantage — you save at a higher rate"
                  : marginalRate === retirementRate
                  ? "Break even — consider TFSA instead"
                  : "TFSA may be better at this spread"}
              </p>
            </div>
          </div>

          {/* Reinvest refund toggle */}
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={reinvestRefund}
              onChange={(e) => setReinvestRefund(e.target.checked)}
              className="accent-[var(--color-brand)] w-3.5 h-3.5"
            />
            Reinvest tax refund each year
            {reinvestRefund && (
              <span className="text-[var(--color-positive)]">
                (+{formatDollars(Math.round(rrspRefund))}/yr)
              </span>
            )}
          </label>
        </div>
      )}

      {/* ─── Shared Inputs ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Starting Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
            <input
              type="number"
              value={startingBalance}
              onChange={(e) => {
                const v = Math.max(0, Math.min(500000, Number(e.target.value) || 0));
                setStartingBalance(v);
              }}
              onBlur={() => setStartingBalance(Math.round(startingBalance / 1000) * 1000)}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
            <input
              type="number"
              value={annualContribution}
              onChange={(e) => {
                const v = Math.max(0, Math.min(50000, Number(e.target.value) || 0));
                setAnnualContribution(v);
              }}
              onBlur={() => setAnnualContribution(Math.round(annualContribution / 500) * 500)}
              min={0}
              max={50000}
              step={500}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
            />
          </div>
          {accountType === "RRSP" && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              RRSP limit: 18% of earned income, up to ~$33,810 for 2026
            </p>
          )}
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
            annualContribution={accountType === "RRSP" ? effectiveContribution : annualContribution}
            years={years}
          />
        </div>
      ) : (
        <ContributionGrowthChart
          chartData={chartData}
          stats={
            accountType === "TFSA"
              ? [
                  { label: showInflation ? "Contributions (real)" : "Total Contributions", value: animContrib },
                  { label: showInflation ? "Tax-Free Value (real)" : "Tax-Free Portfolio Value", value: animValue },
                  { label: "Tax-Free Growth", value: animGrowth, highlight: true },
                ]
              : [
                  { label: showInflation ? "Contributions (real)" : "Total Contributions", value: animContrib },
                  { label: "After-Tax Retirement Value", value: animValue },
                  { label: `Growth (taxed at ${retirementRate}%)`, value: animGrowth, highlight: true },
                ]
          }
          showFees={showFees}
          showMilestones
        />
      )}

      {/* TFSA: Tax savings callout */}
      {accountType === "TFSA" && taxSaved > 0 && !showMonteCarlo && (
        <div className="rounded-lg bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/20 p-3 mb-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-positive)]">
              Estimated tax saved: {formatDollars(taxSaved)}
            </span>{" "}
            compared to holding the same investment in a taxable account (assuming 50%
            capital gains inclusion at a 30% marginal rate).
          </p>
        </div>
      )}

      {/* RRSP: After-tax retirement callout */}
      {accountType === "RRSP" && !showMonteCarlo && (
        <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-3 mb-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Pre-tax portfolio: <span className="font-medium">{formatDollars(portfolioValue)}</span>
            {" "}&rarr;{" "}
            After tax at {retirementRate}%: <span className="font-medium text-[var(--color-positive)]">{formatDollars(afterTaxValue)}</span>
            {" "}
            <span className="text-[var(--color-negative)]">
              (-{formatDollars(portfolioValue - afterTaxValue)} in tax)
            </span>
          </p>
          {reinvestRefund && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              Includes reinvested tax refunds of {formatDollars(Math.round(rrspRefund))}/year
            </p>
          )}
        </div>
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
          result: Math.round(accountType === "RRSP" ? afterTaxValue : portfolioValue),
        }}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Notes */}
      <div className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 border-t border-[var(--color-border)] pt-4">
        {accountType === "TFSA" ? (
          <>
            <p>
              In a TFSA, all investment growth is completely tax-free. You
              won&apos;t pay any tax when you withdraw funds.
            </p>
            <p>
              Contribution room calculation is simplified. Real TFSA room also includes
              re-contribution room from prior-year withdrawals. Check your CRA My Account
              for your exact room.
            </p>
            <p>
              The {new Date().getFullYear()} annual TFSA contribution limit is{" "}
              {tfsaRoom.currentYearLimit.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}.
              Unused room accumulates and carries forward.
            </p>
          </>
        ) : (
          <>
            <p>
              RRSP contributions are tax-deductible at your current marginal rate.
              Investments grow tax-deferred. All withdrawals are taxed as regular
              income at your retirement tax rate.
            </p>
            <p>
              The RRSP is most advantageous when your current tax rate is higher than
              your expected retirement tax rate. If they&apos;re similar, a TFSA may
              be more flexible.
            </p>
            <p>
              The RRSP contribution limit for {new Date().getFullYear()} is 18% of
              your previous year&apos;s earned income, up to ~$33,810.
            </p>
          </>
        )}
        {showInflation && (
          <p>Values shown in today&apos;s purchasing power, assuming 2% annual inflation.</p>
        )}
        <p>This calculator uses simplified assumptions. Not financial advice.</p>
      </div>
    </div>
  );
}
