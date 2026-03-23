"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function formatDollars(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-CA");
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: { year: number; contributions: number; growth: number; total: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[var(--color-text-muted)]">Year {d.year}</p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {formatDollars(d.total)}
      </p>
      <p className="text-[11px] text-[var(--color-text-muted)]">
        Contributed: {formatDollars(d.contributions)}
      </p>
      <p className="text-[11px] text-[var(--color-positive)]">
        Growth: {formatDollars(d.growth)}
      </p>
    </div>
  );
}

export default function TFSARRSPCalculator() {
  const [accountType, setAccountType] = useState<"TFSA" | "RRSP">("TFSA");
  const [startingBalance, setStartingBalance] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(7000);
  const [years, setYears] = useState(25);
  const [returnRate, setReturnRate] = useState(8);

  const { totalContributions, portfolioValue, totalGrowth, chartData } =
    useMemo(() => {
      const rate = returnRate / 100;
      const totalContributions = startingBalance + annualContribution * years;

      const points: {
        year: number;
        contributions: number;
        growth: number;
        total: number;
      }[] = [
        {
          year: 0,
          contributions: startingBalance,
          growth: 0,
          total: startingBalance,
        },
      ];

      let balance = startingBalance;
      for (let y = 1; y <= years; y++) {
        balance = (balance + annualContribution) * (1 + rate);
        const contrib = startingBalance + annualContribution * y;
        points.push({
          year: y,
          contributions: contrib,
          growth: balance - contrib,
          total: balance,
        });
      }

      return {
        totalContributions,
        portfolioValue: balance,
        totalGrowth: balance - totalContributions,
        chartData: points,
      };
    }, [startingBalance, annualContribution, years, returnRate]);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 sm:p-6">
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
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
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
              className="w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
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
              className="w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
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

      {/* Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Contributions
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(totalContributions)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Est. Portfolio Value
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(portfolioValue)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Growth
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1 text-[var(--color-positive)]">
            {formatDollars(totalGrowth)}
          </p>
        </div>
      </div>

      {/* Account type info box */}
      <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-6">
        <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-1.5">
          {accountType} Details
        </p>
        {accountType === "TFSA" ? (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            In a TFSA, all investment growth is completely tax-free. You
            won&apos;t pay any tax when you withdraw funds. The current annual
            TFSA contribution limit is $7,000 (2025). Unused room accumulates
            and carries forward.
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            In an RRSP, contributions are tax-deductible — they reduce your
            taxable income in the year you contribute. Your investments grow
            tax-deferred. However, all withdrawals in retirement are taxed as
            regular income. The annual RRSP contribution limit is 18% of your
            previous year&apos;s earned income, up to a maximum (currently
            ~$32,490 for 2025).
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => (v === 0 ? "0" : `${v}`)}
            />
            <YAxis
              tickFormatter={(v: number) => formatDollars(v)}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="#d1d5db"
              fill="#e5e7eb"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="growth"
              stackId="1"
              stroke="var(--color-brand)"
              fill="var(--color-brand)"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
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
        <p>
          This calculator does not model taxes, inflation, fees, or employer
          matching (for group RRSPs).
        </p>
        <p>
          The RRSP projection does not estimate the tax owed on withdrawal, which
          depends on your retirement income and province of residence.
        </p>
      </div>
    </div>
  );
}
