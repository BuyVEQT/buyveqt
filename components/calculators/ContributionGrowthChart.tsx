"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatDollars, ChartTooltipWrapper, GRID_PROPS, AXIS_PROPS } from "@/lib/chart-utils";
import { STAT_CARD } from "@/lib/styles";

export interface GrowthDataPoint {
  year: number;
  contributions: number;
  growth: number;
  total: number;
}

export interface StatItem {
  label: string;
  value: number;
  highlight?: boolean;
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: GrowthDataPoint;
}

function GrowthTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <ChartTooltipWrapper>
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
    </ChartTooltipWrapper>
  );
}

interface ContributionGrowthChartProps {
  chartData: GrowthDataPoint[];
  stats: StatItem[];
}

export default function ContributionGrowthChart({
  chartData,
  stats,
}: ContributionGrowthChartProps) {
  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={STAT_CARD}>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              {s.label}
            </p>
            <p
              className={`text-lg font-semibold tabular-nums mt-1 ${
                s.highlight ? "text-[var(--color-positive)]" : ""
              }`}
            >
              {formatDollars(s.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              dataKey="year"
              {...AXIS_PROPS}
              tickFormatter={(v: number) => (v === 0 ? "0" : `${v}`)}
            />
            <YAxis
              {...AXIS_PROPS}
              tickFormatter={(v: number) => formatDollars(v)}
              width={70}
            />
            <Tooltip content={<GrowthTooltip />} />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="var(--color-border-light)"
              fill="var(--color-border)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="growth"
              stackId="1"
              stroke="var(--color-positive)"
              fill="var(--color-positive)"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
