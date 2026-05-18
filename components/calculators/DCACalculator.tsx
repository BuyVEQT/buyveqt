"use client";

import { useState, useMemo, useEffect } from "react";
import { formatDollars } from "@/lib/chart-utils";
import { CARD } from "@/lib/styles";
import { useAnimatedNumber } from "./useAnimatedNumber";
import ContributionGrowthChart from "./ContributionGrowthChart";
import MonteCarloChart from "./MonteCarloChart";
import ShareModal from "@/components/ShareModal";
import type { VolatilityStats } from "@/lib/data/volatility";
import type { Handoff } from "@/lib/calculator-handoffs";
import { dcaToShelter } from "@/lib/calculator-handoffs";
import { expandParams } from "@/lib/share-params";
import type { NewPin } from "@/lib/usePinnedScenarios";
import PinScenarioButton from "@/components/invest/PinScenarioButton";

const VEQT_MER = 0.0024; // 0.24%
const INFLATION_RATE = 0.02; // 2%

interface DCACalculatorProps {
  volatilityStats: VolatilityStats | null;
  /** Cross-calc handoff. Renders a "Plan this in TFSA/RRSP" CTA after
   *  results when supplied. */
  onHandoff?: (handoff: Handoff) => void;
  /** Pin the current scenario to the compare bar. */
  onPin?: (input: NewPin) => void;
}

export default function DCACalculator({
  volatilityStats,
  onHandoff,
  onPin,
}: DCACalculatorProps) {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(8);
  const [shareOpen, setShareOpen] = useState(false);

  // Read URL params on mount — supports incoming cross-calc handoffs
  // (e.g. Lookback's "Use these inputs going forward" → DCA tab) and
  // share-link landings.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      raw[k] = v;
    });
    const p = expandParams(raw);
    const m = typeof p.monthly === "string" ? Number(p.monthly) : NaN;
    if (!isNaN(m) && m >= 50 && m <= 10000) setMonthly(Math.round(m / 50) * 50);
    const h = typeof p.horizon === "string" ? Number(p.horizon) : NaN;
    if (!isNaN(h) && h >= 1 && h <= 40) setYears(Math.round(h));
    const r = typeof p.rate === "string" ? Number(p.rate) : NaN;
    if (!isNaN(r) && r >= 1 && r <= 15) setReturnRate(r);
  }, []);

  // Enhancement toggles
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showInflation, setShowInflation] = useState(false);

  const { totalContributed, portfolioValue, investmentGrowth, feeImpact, chartData } =
    useMemo(() => {
      const monthlyRate = returnRate / 100 / 12;
      const monthlyRateAfterFees = (returnRate / 100 - VEQT_MER) / 12;
      const totalMonths = years * 12;
      const totalContributed = monthly * totalMonths;

      const points: {
        year: number;
        contributions: number;
        growth: number;
        total: number;
        totalAfterFees?: number;
      }[] = [{ year: 0, contributions: 0, growth: 0, total: 0, totalAfterFees: 0 }];

      for (let y = 1; y <= years; y++) {
        const months = y * 12;
        const fv =
          monthlyRate === 0
            ? monthly * months
            : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        const fvAfterFees =
          monthlyRateAfterFees === 0
            ? monthly * months
            : monthly * ((Math.pow(1 + monthlyRateAfterFees, months) - 1) / monthlyRateAfterFees);

        const contrib = monthly * months;
        const inflationFactor = showInflation ? Math.pow(1 + INFLATION_RATE, y) : 1;

        points.push({
          year: y,
          contributions: Math.round(contrib / inflationFactor),
          growth: Math.round((fv - contrib) / inflationFactor),
          total: Math.round(fv / inflationFactor),
          totalAfterFees: Math.round(fvAfterFees / inflationFactor),
        });
      }

      const finalValue = points[points.length - 1].total;
      const finalAfterFees = points[points.length - 1].totalAfterFees ?? finalValue;
      return {
        totalContributed: points[points.length - 1].contributions,
        portfolioValue: finalValue,
        investmentGrowth: finalValue - points[points.length - 1].contributions,
        feeImpact: finalValue - finalAfterFees,
        chartData: points,
      };
    }, [monthly, years, returnRate, showInflation]);

  // Animated numbers
  const animContributed = useAnimatedNumber(totalContributed);
  const animValue = useAnimatedNumber(portfolioValue);
  const animGrowth = useAnimatedNumber(investmentGrowth);

  return (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        Dollar-Cost Averaging Calculator
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        See how regular monthly investments in VEQT could grow over time.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mb-6">
        <div data-calc-hero-input>
          <label className="calc-section-label">
            Monthly contribution
          </label>
          <div className="relative flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                color: "var(--ink-mute)",
                lineHeight: 1,
              }}
            >
              $
            </span>
            <input
              type="number"
              aria-label="Monthly contribution amount"
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value) || 0)}
              onBlur={() => {
                const clamped = Math.max(50, Math.min(10000, monthly));
                setMonthly(Math.round(clamped / 50) * 50);
              }}
              min={50}
              max={10000}
              step={50}
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
            startingValue={0}
            annualContribution={monthly * 12}
            years={years}
          />
        </div>
      ) : (
        <ContributionGrowthChart
          chartData={chartData}
          stats={[
            { label: showInflation ? "Contributed (real)" : "Total Contributed", value: animContributed },
            { label: showInflation ? "Est. Value (real)" : "Est. Portfolio Value", value: animValue },
            { label: "Investment Growth", value: animGrowth, highlight: true },
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
            over {years} years at VEQT&apos;s 0.24% MER. Still far lower than
            most mutual funds (1-2% MER).
          </p>
        </div>
      )}

      {/* Next-step handoff + Pin + Share — handoff to the Shelter is
          the natural next question ("…in what account?"). */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onHandoff ? (
          <button
            type="button"
            onClick={() =>
              onHandoff(
                dcaToShelter({ monthly, horizon: years, rate: returnRate })
              )
            }
            className="text-sm italic underline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Plan this inside a TFSA or RRSP &rarr;
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          <PinScenarioButton
            onPin={onPin}
            build={() => ({
              tab: "dca",
              tabLabel: "DCA",
              label: `$${monthly.toLocaleString("en-CA")}/mo @ ${returnRate}% × ${years}yr`,
              highlight: formatDollars(portfolioValue),
              params: { monthly, horizon: years, rate: returnRate },
            })}
          />
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
          others may be -30%.{" "}
          {!showMonteCarlo && (
            <button
              onClick={() => setShowMonteCarlo(true)}
              className="underline hover:text-[var(--color-text-secondary)]"
            >
              Toggle &ldquo;Show uncertainty&rdquo; to see the range of outcomes.
            </button>
          )}
        </p>
        <p>
          The average historical return of global equity markets has been
          approximately 7-10% annually over long periods, but past performance
          does not guarantee future results.
        </p>
        {showInflation && (
          <p>
            Values shown in today&apos;s purchasing power, assuming 2% annual inflation.
          </p>
        )}
        {!showFees && (
          <p>Does not account for management fees (MER), taxes, or inflation.</p>
        )}
      </div>
    </div>
  );
}
