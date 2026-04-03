"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";

function computeFV(monthly: number, annualReturn: number, years: number): number {
  const monthlyRate = annualReturn / 12;
  const n = years * 12;
  if (monthlyRate === 0) return monthly * n;
  return monthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
}

const INVEST_PCTS = [25, 50, 75, 100];

export function EarningPowerCalculator() {
  const [age, setAge] = useState(25);
  const [salary, setSalary] = useState(55000);
  const [raise, setRaise] = useState(10000);
  const [investPct, setInvestPct] = useState(100);

  const results = useMemo(() => {
    const yearsTo60 = Math.max(1, 60 - age);
    const extraAnnual = raise * (investPct / 100);
    const extraMonthly = extraAnnual / 12;
    const futureValue = Math.round(computeFV(extraMonthly, 0.085, yearsTo60));
    const totalContributed = Math.round(extraAnnual * yearsTo60);
    const growth = futureValue - totalContributed;

    return { yearsTo60, extraAnnual, totalContributed, futureValue, growth };
  }, [age, salary, raise, investPct]);

  const heroFormatted =
    results.futureValue >= 1_000_000
      ? `$${(results.futureValue / 1_000_000).toFixed(1)}M`
      : formatDollars(results.futureValue);

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Earning Power Calculator
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        See what happens when you invest 500 hours in your career instead of forex.
      </p>

      {/* Sliders */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Current age: {age}
            </label>
            <input
              type="range"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              min={20}
              max={45}
              step={1}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>20</span>
              <span>45</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Current salary: {formatDollars(salary)}
            </label>
            <input
              type="range"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              min={30000}
              max={150000}
              step={5000}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>$30K</span>
              <span>$150K</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Raise from 500 hrs: {formatDollars(raise)}
            </label>
            <input
              type="range"
              value={raise}
              onChange={(e) => setRaise(Number(e.target.value))}
              min={2000}
              max={25000}
              step={1000}
              className="calc-slider w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
              <span>$2K</span>
              <span>$25K</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              % of raise into VEQT: {investPct}%
            </label>
            <div className="flex gap-2 mt-1">
              {INVEST_PCTS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => setInvestPct(pct)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    investPct === pct
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero number */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-5 text-center mb-4">
        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          Your 500 hours could become
        </p>
        <p className="text-3xl sm:text-4xl font-bold tabular-nums text-[var(--color-positive)]">
          {heroFormatted}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          by age 60 ({results.yearsTo60} years of compounding)
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Extra/Year into VEQT
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
            {formatDollars(results.extraAnnual)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Total Contributed
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
            {formatDollars(results.totalContributed)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Growth from Compounding
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-positive)]">
            {formatDollars(results.growth)}
          </p>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-3">
        This assumes only the initial raise. In reality, future raises build on
        your higher base — making the real number even larger.
      </p>

      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] px-4 py-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Meanwhile, 500 hours of forex trading statistically returns:{" "}
          <span className="font-bold text-[var(--color-negative)]">&minus;$2,200</span>
        </p>
      </div>

      <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">
        Assumes 8.5% annualized VEQT return with monthly contributions.
        Raise scenario is illustrative. Actual career outcomes vary.
      </p>
    </div>
  );
}
