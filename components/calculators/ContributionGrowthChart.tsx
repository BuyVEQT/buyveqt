"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { formatDollars, ChartTooltipWrapper, GRID_PROPS, AXIS_PROPS } from "@/lib/chart-utils";
import { STAT_CARD } from "@/lib/styles";

export interface GrowthDataPoint {
  year: number;
  contributions: number;
  growth: number;
  total: number;
  /** Optional: after-MER total for fee impact overlay */
  totalAfterFees?: number;
}

export interface StatItem {
  label: string;
  value: number;
  highlight?: boolean;
}

const MILESTONE_THRESHOLDS = [100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000];

function formatMilestone(n: number): string {
  if (n >= 1_000_000) return `$${n / 1_000_000}M`;
  return `$${n / 1_000}K`;
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: GrowthDataPoint;
}

function GrowthTooltip({
  active,
  payload,
  showFees,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  showFees?: boolean;
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
      {showFees && d.totalAfterFees != null && (
        <p className="text-[11px] text-[var(--color-text-muted)]">
          After fees: {formatDollars(d.totalAfterFees)}
          <span className="text-[var(--color-negative)] ml-1">
            (-{formatDollars(d.total - d.totalAfterFees)})
          </span>
        </p>
      )}
    </ChartTooltipWrapper>
  );
}

interface ContributionGrowthChartProps {
  chartData: GrowthDataPoint[];
  stats: StatItem[];
  /** Show the after-fees dashed area (requires totalAfterFees in data) */
  showFees?: boolean;
  /** Show milestone markers at standard thresholds */
  showMilestones?: boolean;
}

export default function ContributionGrowthChart({
  chartData,
  stats,
  showFees = false,
  showMilestones = false,
}: ContributionGrowthChartProps) {
  // Find milestone crossing points
  const milestones: { year: number; total: number; label: string }[] = [];
  if (showMilestones) {
    for (const threshold of MILESTONE_THRESHOLDS) {
      const point = chartData.find((d) => d.total >= threshold);
      if (point && point.year > 0) {
        milestones.push({
          year: point.year,
          total: point.total,
          label: formatMilestone(threshold),
        });
      }
    }
  }

  const hasFeeData = showFees && chartData.some((d) => d.totalAfterFees != null);

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
            <Tooltip content={<GrowthTooltip showFees={hasFeeData} />} />
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
            {/* After-fees overlay line */}
            {hasFeeData && (
              <Area
                type="monotone"
                dataKey="totalAfterFees"
                stroke="var(--color-negative)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
              />
            )}
            {/* Milestone markers */}
            {milestones.map((m) => (
              <ReferenceDot
                key={m.label}
                x={m.year}
                y={m.total}
                r={4}
                fill="var(--color-brand)"
                stroke="var(--color-card)"
                strokeWidth={2}
                label={{
                  value: m.label,
                  position: "top",
                  fill: "var(--color-brand)",
                  fontSize: 10,
                  fontWeight: 600,
                  offset: 8,
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        {hasFeeData && (
          <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0 border-t-2 border-dashed border-[var(--color-negative)]" />
              After MER (0.24%)
            </span>
          </div>
        )}
      </div>
    </>
  );
}
