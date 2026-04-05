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
import type { HistoricalDataPoint, ChartPeriod, DataSourceType } from "@/lib/types";
import { CHART_PERIODS } from "@/lib/constants";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import DataUnavailable from "@/components/ui/DataUnavailable";

interface PriceChartProps {
  data: HistoricalDataPoint[];
  loading: boolean;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
  historySource?: DataSourceType;
  historyFetchedAt?: string;
}

function formatDate(dateStr: string, period: ChartPeriod): string {
  const date = new Date(dateStr + "T00:00:00");
  if (period === "1M") {
    return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-CA", {
    month: "short",
    year: "2-digit",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const date = new Date(label + "T00:00:00");
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[var(--color-text-muted)]">
        {date.toLocaleDateString("en-CA", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="font-serif text-base font-normal text-[var(--color-text-primary)]">
        ${payload[0].value.toFixed(2)} <span className="text-xs text-[var(--color-text-muted)]">CAD</span>
      </p>
    </div>
  );
}

export default function PriceChart({
  data,
  loading,
  period,
  onPeriodChange,
  historySource,
  historyFetchedAt,
}: PriceChartProps) {
  const prices = data.map((d) => d.close);
  const minPrice = prices.length ? Math.floor(Math.min(...prices) * 0.99) : 0;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices) * 1.01) : 100;

  const isCache = historySource === "cache";
  const chartUnavailable = !loading && data.length === 0;

  // Compute change across visible range for color coding
  const rangePositive =
    prices.length >= 2 ? prices[prices.length - 1] >= prices[0] : true;

  return (
    <div className="card-editorial p-0 overflow-hidden">
      {/* Chart header bar */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            VEQT.TO Price History
          </h2>
          {!loading && prices.length >= 2 && (
            <span
              className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md ${
                rangePositive
                  ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
                  : "text-[var(--color-negative)] bg-[var(--color-negative-bg)]"
              }`}
            >
              {rangePositive ? "+" : ""}
              {(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(1)}%
            </span>
          )}
        </div>
        <div className="flex gap-0.5 rounded-lg bg-[var(--color-base)] p-0.5">
          {CHART_PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPeriodChange(p.key as ChartPeriod)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                period === p.key
                  ? "bg-[var(--color-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isCache && historyFetchedAt && (
        <div className="px-5">
          <StaleBanner fetchedAt={historyFetchedAt} className="mb-3" />
        </div>
      )}

      {/* Chart area — flush edges for drama */}
      <div className="chart-atmosphere">
        {loading ? (
          <div className="skeleton h-[360px] w-full" />
        ) : chartUnavailable ? (
          <DataUnavailable type="chart" className="min-h-[360px]" />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-line)"
                    stopOpacity={0.20}
                  />
                  <stop
                    offset="40%"
                    stopColor="var(--color-chart-line)"
                    stopOpacity={0.08}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-line)"
                    stopOpacity={0}
                  />
                </linearGradient>
                {/* Subtle glow filter for the line */}
                <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDate(d, period)}
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
                dy={4}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                width={48}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--color-chart-line)"
                strokeWidth={2.5}
                fill="url(#colorClose)"
                dot={false}
                filter="url(#chartGlow)"
                activeDot={{
                  r: 5,
                  fill: "var(--color-chart-line)",
                  stroke: "var(--color-card)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--color-border)]">
        {historySource && historyFetchedAt ? (
          <DataFreshness source={historySource} fetchedAt={historyFetchedAt} />
        ) : (
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Source: Alpha Vantage / Yahoo Finance
          </p>
        )}
      </div>
    </div>
  );
}
