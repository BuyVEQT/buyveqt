"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Link from "next/link";

function formatDollars(value: number): string {
  if (value < 100) return "$" + value.toFixed(2);
  return "$" + Math.round(value).toLocaleString("en-CA");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface TooltipPayloadItem {
  value: number;
  payload: { month: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[var(--color-text-muted)]">
        {payload[0].payload.month}
      </p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        {formatDollars(payload[0].value)}
      </p>
    </div>
  );
}

export default function DividendCalculator() {
  const [portfolio, setPortfolio] = useState(100000);
  const [yieldRate, setYieldRate] = useState(1.8);

  const { annual, quarterly, monthly, chartData } = useMemo(() => {
    const annual = portfolio * (yieldRate / 100);
    const quarterly = annual / 4;
    const monthly = annual / 12;
    const chartData = MONTHS.map((m) => ({ month: m, income: monthly }));
    return { annual, quarterly, monthly, chartData };
  }, [portfolio, yieldRate]);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        Dividend Income Estimator
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Estimate how much annual income a VEQT portfolio could generate from
        distributions.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Portfolio Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={portfolio}
              onChange={(e) => {
                const v = Math.max(1000, Math.min(5000000, Number(e.target.value) || 1000));
                setPortfolio(v);
              }}
              onBlur={() => setPortfolio(Math.round(portfolio / 1000) * 1000)}
              min={1000}
              max={5000000}
              step={1000}
              className="w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Dividend Yield
          </label>
          <div className="relative">
            <input
              type="number"
              value={yieldRate}
              onChange={(e) => {
                const v = Math.max(0.5, Math.min(5, Number(e.target.value) || 0.5));
                setYieldRate(v);
              }}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-3 pr-7 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              %
            </span>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            VEQT&apos;s trailing 12-month yield is approximately 1.5–2.0%.
          </p>
        </div>
      </div>

      {/* Outputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Est. Annual Income
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(annual)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Est. Quarterly
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(quarterly)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Est. Monthly
          </p>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {formatDollars(monthly)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--color-base)" }}
            />
            <Bar
              dataKey="income"
              fill="var(--color-brand)"
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Notes */}
      <div className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 border-t border-[var(--color-border)] pt-4">
        <p>
          VEQT distributes income to unitholders. The frequency and amount of
          distributions can vary.
        </p>
        <p>
          Dividend yield is calculated as trailing 12-month distributions divided
          by current unit price. It fluctuates as both distributions and price
          change.
        </p>
        <p>Distribution income is not guaranteed and will vary from year to year.</p>
        <p>
          In a TFSA, this income is tax-free. In an RRSP or non-registered
          account, tax treatment differs.{" "}
          <Link
            href="/learn/veqt-in-tfsa-vs-rrsp-vs-non-registered"
            className="underline hover:text-[var(--color-text-secondary)]"
          >
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}
