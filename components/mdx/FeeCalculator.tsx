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
import {
  formatDollars,
  ChartTooltipWrapper,
  GRID_PROPS,
  AXIS_PROPS,
} from "@/lib/chart-utils";

const VEQT_FEE = 0.0020; // 0.20%
const ROBO_FEE = 0.0070; // 0.70%

function computeFV(monthly: number, annualReturn: number, fee: number, years: number): number {
  const monthlyRate = (annualReturn / 100 - fee) / 12;
  const n = years * 12;
  if (monthlyRate === 0) return monthly * n;
  return monthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
}

interface ChartPoint {
  year: number;
  veqt: number;
  robo: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: number;
}

function FeeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const veqt = payload.find((p) => p.dataKey === "veqt")?.value ?? 0;
  const robo = payload.find((p) => p.dataKey === "robo")?.value ?? 0;
  return (
    <ChartTooltipWrapper>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1">Year {label}</p>
      <p className="text-[11px] text-[var(--color-positive)] font-semibold">
        VEQT: {formatDollars(veqt)}
      </p>
      <p className="text-[11px] text-[var(--color-text-muted)]">
        Robo: {formatDollars(robo)}
      </p>
    </ChartTooltipWrapper>
  );
}

export function FeeCalculator() {
  const [monthly, setMonthly] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(25);

  const { veqtFinal, roboFinal, diff, chartData } = useMemo(() => {
    const points: ChartPoint[] = [{ year: 0, veqt: 0, robo: 0 }];
    for (let y = 1; y <= years; y++) {
      points.push({
        year: y,
        veqt: Math.round(computeFV(monthly, annualReturn, VEQT_FEE, y)),
        robo: Math.round(computeFV(monthly, annualReturn, ROBO_FEE, y)),
      });
    }
    const last = points[points.length - 1];
    return {
      veqtFinal: last.veqt,
      roboFinal: last.robo,
      diff: last.veqt - last.robo,
      chartData: points,
    };
  }, [monthly, annualReturn, years]);

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Fee Impact Calculator
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        See how a 0.50% fee difference compounds over time.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Monthly contribution
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={monthly}
              onChange={(e) =>
                setMonthly(Math.max(100, Math.min(2000, Number(e.target.value) || 100)))
              }
              min={100}
              max={2000}
              step={50}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Annual return: {annualReturn}%
          </label>
          <input
            type="range"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            min={5}
            max={9}
            step={0.5}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>5%</span>
            <span>9%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Time horizon: {years} years
          </label>
          <input
            type="range"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min={5}
            max={35}
            step={1}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>5 yrs</span>
            <span>35 yrs</span>
          </div>
        </div>
      </div>

      {/* Result numbers */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            VEQT (0.20% MER)
          </p>
          <p className="text-xl font-bold tabular-nums text-[var(--color-positive)]">
            {formatDollars(veqtFinal)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Robo-advisor (0.70%)
          </p>
          <p className="text-xl font-bold tabular-nums text-[var(--color-text-secondary)]">
            {formatDollars(roboFinal)}
          </p>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-5">
        The fee difference costs you approximately{" "}
        <span className="font-semibold text-[var(--color-text-primary)]">
          {formatDollars(diff)}
        </span>{" "}
        over {years} years.
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            dataKey="year"
            {...AXIS_PROPS}
            tickFormatter={(v: number) => `${v}y`}
          />
          <YAxis
            {...AXIS_PROPS}
            tickFormatter={(v: number) => formatDollars(v)}
            width={72}
          />
          <Tooltip content={<FeeTooltip />} />
          <Area
            type="monotone"
            dataKey="robo"
            stroke="var(--color-text-muted)"
            fill="var(--color-border)"
            fillOpacity={0.4}
            strokeWidth={1.5}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="veqt"
            stroke="var(--color-positive)"
            fill="var(--color-positive)"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">
        Simplified illustration assuming fixed annual returns compounded monthly. VEQT MER ~0.20%, robo-advisor all-in ~0.70%. Actual returns vary. Does not account for taxes or inflation.
      </p>
    </div>
  );
}
