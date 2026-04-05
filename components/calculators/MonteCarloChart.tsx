"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { formatDollars, ChartTooltipWrapper, GRID_PROPS, AXIS_PROPS } from "@/lib/chart-utils";
import { DEFAULT_VOLATILITY, type VolatilityStats } from "@/lib/data/volatility";

const NUM_SIMULATIONS = 500;

interface MonteCarloChartProps {
  volatilityStats: VolatilityStats | null;
  startingValue: number;
  annualContribution: number;
  years: number;
  /** Optional target line (e.g. FIRE target portfolio) */
  targetValue?: number;
  height?: number;
}

interface PercentilePoint {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  /** Stacking bands for Recharts */
  base: number;
  band_10_25: number;
  band_25_50: number;
  band_50_75: number;
  band_75_90: number;
}

/**
 * Box-Muller transform: generate a standard normal random number.
 */
function randn(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Run Monte Carlo simulations and extract percentile bands per year.
 */
function simulate(
  mean: number,
  std: number,
  startingValue: number,
  annualContrib: number,
  years: number
): PercentilePoint[] {
  // Run all simulations: outcomes[year][sim] = portfolio value
  const outcomes: number[][] = Array.from({ length: years + 1 }, () => []);

  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    let balance = startingValue;
    outcomes[0].push(balance);

    for (let y = 1; y <= years; y++) {
      const annualReturn = mean + std * randn();
      balance = (balance + annualContrib) * (1 + annualReturn);
      // Floor at 0 — portfolio can't go negative
      balance = Math.max(0, balance);
      outcomes[y].push(balance);
    }
  }

  // Extract percentiles at each year
  return outcomes.map((values, year) => {
    const sorted = values.slice().sort((a, b) => a - b);
    const pct = (p: number) => sorted[Math.floor(p * sorted.length)] || 0;

    const p10 = pct(0.1);
    const p25 = pct(0.25);
    const p50 = pct(0.5);
    const p75 = pct(0.75);
    const p90 = pct(0.9);

    return {
      year,
      p10,
      p25,
      p50,
      p75,
      p90,
      // Stacked bands: base (invisible) + 4 visible bands
      base: p10,
      band_10_25: p25 - p10,
      band_25_50: p50 - p25,
      band_50_75: p75 - p50,
      band_75_90: p90 - p75,
    };
  });
}

function MCTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PercentilePoint }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <ChartTooltipWrapper>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1">
        Year {d.year}
      </p>
      <div className="space-y-0.5 text-[11px]">
        <p className="text-[var(--color-text-muted)]">
          90th %ile: <span className="font-medium text-[var(--color-text-primary)]">{formatDollars(d.p90)}</span>
        </p>
        <p className="text-[var(--color-text-muted)]">
          75th %ile: <span className="font-medium text-[var(--color-text-primary)]">{formatDollars(d.p75)}</span>
        </p>
        <p className="text-[var(--color-positive)] font-medium">
          Median: {formatDollars(d.p50)}
        </p>
        <p className="text-[var(--color-text-muted)]">
          25th %ile: <span className="font-medium text-[var(--color-text-primary)]">{formatDollars(d.p25)}</span>
        </p>
        <p className="text-[var(--color-text-muted)]">
          10th %ile: <span className="font-medium text-[var(--color-text-primary)]">{formatDollars(d.p10)}</span>
        </p>
      </div>
    </ChartTooltipWrapper>
  );
}

export default function MonteCarloChart({
  volatilityStats,
  startingValue,
  annualContribution,
  years,
  targetValue,
  height = 280,
}: MonteCarloChartProps) {
  const stats = volatilityStats ?? DEFAULT_VOLATILITY;

  const data = useMemo(
    () => simulate(stats.meanReturn, stats.stdDev, startingValue, annualContribution, years),
    [stats.meanReturn, stats.stdDev, startingValue, annualContribution, years]
  );

  return (
    <div>
      <p className="text-xs text-[var(--color-text-muted)] mb-2">
        Monte Carlo simulation ({NUM_SIMULATIONS} scenarios based on historical VEQT volatility)
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            dataKey="year"
            {...AXIS_PROPS}
            tickFormatter={(v: number) => (v === 0 ? "Now" : `${v}y`)}
          />
          <YAxis
            {...AXIS_PROPS}
            tickFormatter={(v: number) => formatDollars(v)}
            width={65}
          />
          <Tooltip content={<MCTooltip />} />

          {/* Invisible base (pushes bands up to p10) */}
          <Area
            type="monotone"
            dataKey="base"
            stackId="mc"
            fill="transparent"
            stroke="none"
          />
          {/* Outer band: 10th–25th */}
          <Area
            type="monotone"
            dataKey="band_10_25"
            stackId="mc"
            fill="var(--color-positive)"
            fillOpacity={0.06}
            stroke="none"
          />
          {/* Inner band: 25th–50th */}
          <Area
            type="monotone"
            dataKey="band_25_50"
            stackId="mc"
            fill="var(--color-positive)"
            fillOpacity={0.12}
            stroke="none"
          />
          {/* Inner band: 50th–75th */}
          <Area
            type="monotone"
            dataKey="band_50_75"
            stackId="mc"
            fill="var(--color-positive)"
            fillOpacity={0.12}
            stroke="none"
          />
          {/* Outer band: 75th–90th */}
          <Area
            type="monotone"
            dataKey="band_75_90"
            stackId="mc"
            fill="var(--color-positive)"
            fillOpacity={0.06}
            stroke="none"
          />

          {/* Median line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="var(--color-positive)"
            strokeWidth={2}
            dot={false}
          />

          {/* Target line (e.g. FIRE target) */}
          {targetValue && (
            <ReferenceLine
              y={targetValue}
              stroke="var(--color-brand)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Target: ${formatDollars(targetValue)}`,
                position: "right",
                fill: "var(--color-brand)",
                fontSize: 11,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-[var(--color-positive)]" />
          Median outcome
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-[var(--color-positive)] opacity-12 rounded-sm" />
          25th–75th percentile
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-[var(--color-positive)] opacity-6 rounded-sm" />
          10th–90th percentile
        </span>
      </div>
    </div>
  );
}
