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

export default function DCACalculator() {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(8);

  const { totalContributed, portfolioValue, investmentGrowth, chartData } =
    useMemo(() => {
      const monthlyRate = returnRate / 100 / 12;
      const totalMonths = years * 12;
      const totalContributed = monthly * totalMonths;

      // Build chart data points per year
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
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 sm:p-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Contributed
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(totalContributed)}
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
            Investment Growth
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1 text-[var(--color-positive)]">
            {formatDollars(investmentGrowth)}
          </p>
        </div>
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
