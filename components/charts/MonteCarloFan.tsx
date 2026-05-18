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
  ReferenceLine,
} from "recharts";
import { formatDollars, ChartTooltipWrapper, AXIS_PROPS } from "@/lib/chart-utils";
import { DEFAULT_VOLATILITY, type VolatilityStats } from "@/lib/data/volatility";

const NUM_SIMULATIONS = 500;
const INFLATION_RATE = 0.02;

interface MonteCarloFanProps {
  volatilityStats: VolatilityStats | null;
  startingValue: number;
  annualContribution: number;
  years: number;
  targetValue?: number;
  height?: number;
  deflateInflation?: boolean;
  /** Render dark variant (sits inside <Card dark>). */
  dark?: boolean;
}

interface FanPoint {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  base: number;
  band_10_25: number;
  band_25_50: number;
  band_50_75: number;
  band_75_90: number;
}

function randn(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function simulate(
  mean: number,
  std: number,
  startingValue: number,
  annualContrib: number,
  years: number,
  deflateInflation: boolean
): FanPoint[] {
  const outcomes: number[][] = Array.from({ length: years + 1 }, () => []);

  for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
    let balance = startingValue;
    outcomes[0].push(balance);
    for (let y = 1; y <= years; y++) {
      const annualReturn = mean + std * randn();
      balance = Math.max(0, (balance + annualContrib) * (1 + annualReturn));
      outcomes[y].push(balance);
    }
  }

  return outcomes.map((values, year) => {
    const deflator = deflateInflation ? Math.pow(1 + INFLATION_RATE, year) : 1;
    const sorted = values.slice().sort((a, b) => a - b);
    const pct = (p: number) => (sorted[Math.floor(p * sorted.length)] || 0) / deflator;
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
      base: p10,
      band_10_25: p25 - p10,
      band_25_50: p50 - p25,
      band_50_75: p75 - p50,
      band_75_90: p90 - p75,
    };
  });
}

interface FanTooltipProps {
  active?: boolean;
  payload?: { payload: FanPoint }[];
  dark?: boolean;
}

function FanTooltip({ active, payload, dark }: FanTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const fg = dark ? "var(--paper)" : "var(--ink)";
  const mute = dark ? "rgba(246,239,220,0.55)" : "var(--ink-mute)";
  return (
    <ChartTooltipWrapper>
      <p style={{ fontSize: 11, color: mute, marginBottom: 4 }}>Year {d.year}</p>
      <div style={{ fontSize: 11, lineHeight: 1.5 }}>
        <p style={{ color: mute }}>
          90th: <span style={{ color: fg, fontWeight: 600 }}>{formatDollars(d.p90)}</span>
        </p>
        <p style={{ color: "var(--green)", fontWeight: 600 }}>Median: {formatDollars(d.p50)}</p>
        <p style={{ color: mute }}>
          10th: <span style={{ color: fg, fontWeight: 600 }}>{formatDollars(d.p10)}</span>
        </p>
      </div>
    </ChartTooltipWrapper>
  );
}

/**
 * Monte Carlo fan chart for the Reckoner Exit tab. Renders nested percentile
 * bands (p10–p90) with the median line, plus an optional vermilion dashed
 * target line. New D2 system colors (green for the bands, stamp for target).
 */
export default function MonteCarloFan({
  volatilityStats,
  startingValue,
  annualContribution,
  years,
  targetValue,
  height = 280,
  deflateInflation = false,
  dark = false,
}: MonteCarloFanProps) {
  const stats = volatilityStats ?? DEFAULT_VOLATILITY;

  const data = useMemo(
    () =>
      simulate(
        stats.meanReturn,
        stats.stdDev,
        startingValue,
        annualContribution,
        years,
        deflateInflation
      ),
    [stats.meanReturn, stats.stdDev, startingValue, annualContribution, years, deflateInflation]
  );

  const axisColor = dark ? "rgba(246,239,220,0.55)" : undefined;
  const medianColor = dark ? "#7cc095" : "var(--green)";
  const bandColor = dark ? "#7cc095" : "var(--green)";

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <XAxis
            dataKey="year"
            {...AXIS_PROPS}
            tickFormatter={(v: number) => (v === 0 ? "Now" : `${v}y`)}
            stroke={axisColor}
          />
          <YAxis
            {...AXIS_PROPS}
            tickFormatter={(v: number) => formatDollars(v)}
            width={65}
            stroke={axisColor}
          />
          <Tooltip content={<FanTooltip dark={dark} />} />

          <Area type="monotone" dataKey="base" stackId="mc" fill="transparent" stroke="none" />
          <Area
            type="monotone"
            dataKey="band_10_25"
            stackId="mc"
            fill={bandColor}
            fillOpacity={dark ? 0.10 : 0.06}
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="band_25_50"
            stackId="mc"
            fill={bandColor}
            fillOpacity={dark ? 0.18 : 0.12}
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="band_50_75"
            stackId="mc"
            fill={bandColor}
            fillOpacity={dark ? 0.18 : 0.12}
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="band_75_90"
            stackId="mc"
            fill={bandColor}
            fillOpacity={dark ? 0.10 : 0.06}
            stroke="none"
          />

          <Line type="monotone" dataKey="p50" stroke={medianColor} strokeWidth={2} dot={false} />

          {targetValue && (
            <ReferenceLine
              y={targetValue}
              stroke="var(--stamp)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Target: ${formatDollars(targetValue)}`,
                position: "right",
                fill: "var(--stamp)",
                fontSize: 11,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
