"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDollars, GRID_PROPS, AXIS_PROPS, ChartTooltipWrapper } from "@/lib/chart-utils";

const STRATEGIES = [
  { id: "constant", label: "Constant dollar", description: "Withdraw the same dollar amount each year, adjusted for inflation" },
  { id: "percentage", label: "Variable %", description: "Withdraw a fixed percentage of whatever the portfolio is worth each year" },
] as const;

type Strategy = (typeof STRATEGIES)[number]["id"];

function simulate(
  portfolio: number,
  annualSpend: number,
  returnRate: number,
  inflation: number,
  years: number,
  strategy: Strategy
): { year: number; balance: number; withdrawal: number }[] {
  const data: { year: number; balance: number; withdrawal: number }[] = [];
  let balance = portfolio;
  let spend = annualSpend;
  const withdrawalPct = annualSpend / portfolio;

  for (let y = 0; y <= years; y++) {
    const withdrawal = y === 0 ? 0 : strategy === "constant" ? spend : balance * withdrawalPct;
    balance = Math.max(0, balance - withdrawal);
    if (y > 0) balance = balance * (1 + returnRate);
    data.push({
      year: y,
      balance: Math.round(balance),
      withdrawal: Math.round(withdrawal),
    });
    if (strategy === "constant") spend = spend * (1 + inflation);
  }
  return data;
}

export function WithdrawalSimulator() {
  const [portfolio, setPortfolio] = useState(1000000);
  const [annualSpend, setAnnualSpend] = useState(40000);
  const [strategy, setStrategy] = useState<Strategy>("constant");

  const nominalReturn = 0.07;
  const inflation = 0.02;
  const years = 35;

  const rate = annualSpend / portfolio;
  const ratePct = (rate * 100).toFixed(1);

  const optimistic = useMemo(
    () => simulate(portfolio, annualSpend, 0.09, inflation, years, strategy),
    [portfolio, annualSpend, strategy]
  );
  const expected = useMemo(
    () => simulate(portfolio, annualSpend, nominalReturn, inflation, years, strategy),
    [portfolio, annualSpend, strategy]
  );
  const pessimistic = useMemo(
    () => simulate(portfolio, annualSpend, 0.04, inflation, years, strategy),
    [portfolio, annualSpend, strategy]
  );

  const depleted = expected.find((d) => d.balance <= 0);
  const depletedYear = depleted ? depleted.year : null;

  const chartData = expected.map((d, i) => ({
    year: d.year,
    optimistic: optimistic[i].balance,
    expected: d.balance,
    pessimistic: pessimistic[i].balance,
  }));

  const portfolioOptions = [500000, 750000, 1000000, 1500000, 2000000];
  const spendOptions = [20000, 30000, 40000, 50000, 60000, 80000];

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Withdrawal Simulator
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        How long will your portfolio last? Adjust the inputs to see projected
        outcomes over {years} years.
      </p>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Portfolio at retirement
          </p>
          <div className="flex flex-wrap gap-1.5">
            {portfolioOptions.map((p) => (
              <button
                key={p}
                onClick={() => setPortfolio(p)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  portfolio === p
                    ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)]"
                }`}
              >
                ${(p / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Annual spending
          </p>
          <div className="flex flex-wrap gap-1.5">
            {spendOptions.map((s) => (
              <button
                key={s}
                onClick={() => setAnnualSpend(s)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  annualSpend === s
                    ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)]"
                }`}
              >
                ${(s / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Withdrawal strategy
          </p>
          <div className="flex flex-col gap-1.5">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors text-left ${
                  strategy === s.id
                    ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Withdrawal rate indicator */}
      <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-3 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            Initial withdrawal rate
          </p>
          <p
            className="text-lg font-bold tabular-nums"
            style={{
              color:
                rate <= 0.035
                  ? "var(--color-positive)"
                  : rate <= 0.045
                    ? "var(--color-brand)"
                    : rate <= 0.055
                      ? "var(--color-chart-orange, #f59e0b)"
                      : "var(--color-negative)",
            }}
          >
            {ratePct}%
          </p>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
          {rate <= 0.035
            ? "Conservative — high probability of portfolio survival over 30+ years."
            : rate <= 0.045
              ? "Moderate — historically sustainable for most 30-year periods."
              : rate <= 0.055
                ? "Aggressive — portfolio may deplete if returns are below average."
                : "Very aggressive — significant risk of running out of money."}
        </p>
      </div>

      {/* Chart */}
      <div className="h-56 sm:h-64 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              dataKey="year"
              {...AXIS_PROPS}
              tickFormatter={(v: number) => `Yr ${v}`}
            />
            <YAxis
              {...AXIS_PROPS}
              tickFormatter={(v: number) => formatDollars(v)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltipWrapper>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">
                      Year {label}
                    </p>
                    {payload.map((entry) => (
                      <p
                        key={entry.name}
                        className="text-xs text-[var(--color-text-secondary)]"
                      >
                        {entry.name}: {formatDollars(entry.value as number)}
                      </p>
                    ))}
                  </ChartTooltipWrapper>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="optimistic"
              name="Optimistic (9%)"
              stroke="var(--color-positive)"
              fill="var(--color-positive)"
              fillOpacity={0.08}
              strokeWidth={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="expected"
              name="Expected (7%)"
              stroke="var(--color-brand)"
              fill="var(--color-brand)"
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="pessimistic"
              name="Pessimistic (4%)"
              stroke="var(--color-negative)"
              fill="var(--color-negative)"
              fillOpacity={0.08}
              strokeWidth={1}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Depletion warning */}
      {depletedYear && (
        <div className="rounded-md bg-[var(--color-negative-bg)] border border-[var(--color-negative)]/20 p-3 mb-3">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong className="text-[var(--color-negative)]">
              Warning:
            </strong>{" "}
            At a {ratePct}% withdrawal rate with 7% returns, the portfolio
            depletes around year {depletedYear}. Consider reducing annual
            spending or using a variable withdrawal strategy.
          </p>
        </div>
      )}

      <p className="text-[11px] text-[var(--color-text-muted)]">
        Assumes {(nominalReturn * 100).toFixed(0)}% nominal return (expected
        scenario), {(inflation * 100).toFixed(0)}% inflation for constant-dollar
        withdrawals. Optimistic and pessimistic scenarios show 9% and 4%
        returns. This is a simplified model — real-world returns vary year to
        year. Not financial advice.
      </p>
    </div>
  );
}
