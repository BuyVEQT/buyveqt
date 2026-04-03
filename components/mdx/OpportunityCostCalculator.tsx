"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";

const MIN_WAGE = 17.2; // Ontario 2026

function computeDCA(monthlyAmount: number, annualReturn: number, months: number): number {
  const monthlyRate = annualReturn / 12;
  if (monthlyRate === 0) return monthlyAmount * months;
  return (
    monthlyAmount *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

export function OpportunityCostCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [courseSpend, setCourseSpend] = useState(1500);
  const [capital, setCapital] = useState(3000);
  const [lossPercent, setLossPercent] = useState(60);
  const [months, setMonths] = useState(12);

  const results = useMemo(() => {
    const totalHours = hoursPerWeek * 4.33 * months;
    const timeCost = Math.round(totalHours * MIN_WAGE);
    const tradingLoss = Math.round(capital * (lossPercent / 100));
    const totalForexCost = timeCost + courseSpend + tradingLoss;

    // VEQT path: invest (capital + courses) as monthly DCA at 8.5%
    const totalInvestable = capital + courseSpend;
    const monthlyDCA = totalInvestable / months;
    const veqtValue = Math.round(computeDCA(monthlyDCA, 0.085, months));
    const veqtGain = veqtValue - totalInvestable;

    const totalSwing = totalForexCost + veqtGain;

    return { totalHours: Math.round(totalHours), timeCost, tradingLoss, totalForexCost, totalInvestable, veqtValue, veqtGain, totalSwing };
  }, [hoursPerWeek, courseSpend, capital, lossPercent, months]);

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Forex Opportunity Cost Calculator
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Drag the sliders to see the true cost of forex trading vs. investing in VEQT.
      </p>

      {/* Sliders */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Hours per week on forex: {hoursPerWeek}
          </label>
          <input
            type="range"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            min={2}
            max={30}
            step={1}
            className="calc-slider w-full"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>2 hrs</span>
            <span>30 hrs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Courses & tools: {formatDollars(courseSpend)}
            </label>
            <input
              type="range"
              value={courseSpend}
              onChange={(e) => setCourseSpend(Number(e.target.value))}
              min={0}
              max={10000}
              step={100}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>$0</span>
              <span>$10K</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Trading capital: {formatDollars(capital)}
            </label>
            <input
              type="range"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              min={500}
              max={25000}
              step={500}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>$500</span>
              <span>$25K</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Capital lost: {lossPercent}%
            </label>
            <input
              type="range"
              value={lossPercent}
              onChange={(e) => setLossPercent(Number(e.target.value))}
              min={0}
              max={100}
              step={5}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Months trading: {months}
            </label>
            <input
              type="range"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              min={3}
              max={36}
              step={1}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>3 mo</span>
              <span>36 mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Forex path */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-negative)] mb-3">
            Forex Path
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Time cost ({results.totalHours} hrs)</span>
              <span className="font-medium tabular-nums text-[var(--color-text-secondary)]">
                {formatDollars(results.timeCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Courses & tools</span>
              <span className="font-medium tabular-nums text-[var(--color-text-secondary)]">
                {formatDollars(courseSpend)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Trading losses</span>
              <span className="font-medium tabular-nums text-[var(--color-text-secondary)]">
                {formatDollars(results.tradingLoss)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-primary)]">Total cost</span>
              <span className="font-bold tabular-nums text-[var(--color-negative)]">
                &minus;{formatDollars(results.totalForexCost)}
              </span>
            </div>
          </div>
        </div>

        {/* VEQT path */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-positive)] mb-3">
            VEQT Path
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Money invested</span>
              <span className="font-medium tabular-nums text-[var(--color-text-secondary)]">
                {formatDollars(results.totalInvestable)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Portfolio value</span>
              <span className="font-medium tabular-nums text-[var(--color-text-secondary)]">
                {formatDollars(results.veqtValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Investment gain</span>
              <span className="font-medium tabular-nums text-[var(--color-positive)]">
                +{formatDollars(results.veqtGain)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
              <span className="font-semibold text-[var(--color-text-primary)]">Time spent</span>
              <span className="font-bold tabular-nums text-[var(--color-positive)]">
                0.5 hours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total swing callout */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4 text-center">
        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          The total swing between paths
        </p>
        <p className="text-2xl font-bold tabular-nums text-[var(--color-negative)]">
          &minus;{formatDollars(results.totalSwing)}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          forex losses + missed VEQT gains
        </p>
      </div>

      <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">
        Time valued at Ontario minimum wage ($17.20/hr). VEQT assumes 8.5%
        annualized return with monthly DCA. Illustrative only — actual results vary.
      </p>
    </div>
  );
}
