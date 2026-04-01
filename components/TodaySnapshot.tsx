"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";
import type { VeqtQuote, HistoricalDataPoint, DataSourceType } from "@/lib/types";
import DataFreshness from "@/components/ui/DataFreshness";
import DataUnavailable from "@/components/ui/DataUnavailable";

interface TodaySnapshotProps {
  quote: VeqtQuote | null;
  historical: HistoricalDataPoint[];
  loading: boolean;
  quoteSource?: DataSourceType;
  quoteFetchedAt?: string;
}

function calcReturn(data: HistoricalDataPoint[], daysBack: number): number | null {
  if (data.length < 2) return null;
  const latest = data[data.length - 1];
  const idx = Math.max(0, data.length - 1 - daysBack);
  const earlier = data[idx];
  if (!earlier || !latest || earlier.close <= 0) return null;
  return ((latest.close - earlier.close) / earlier.close) * 100;
}

function calcYTD(data: HistoricalDataPoint[]): number | null {
  if (data.length < 2) return null;
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const startPoint = data.find((d) => d.date >= yearStart);
  const latest = data[data.length - 1];
  if (!startPoint || !latest || startPoint.close <= 0) return null;
  return ((latest.close - startPoint.close) / startPoint.close) * 100;
}

function formatPct(val: number | null): string {
  if (val === null) return "\u2014";
  const sign = val >= 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}

export default function TodaySnapshot({
  quote,
  historical,
  loading,
  quoteSource,
  quoteFetchedAt,
}: TodaySnapshotProps) {
  if (loading) {
    return (
      <div className="space-y-4 py-10 sm:py-14">
        <div className="skeleton h-16 w-48" />
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-[180px] w-full rounded-lg" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-10 sm:py-14">
        <DataUnavailable type="quote" />
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  const perfMetrics = [
    { label: "1D", value: calcReturn(historical, 1) },
    { label: "1W", value: calcReturn(historical, 5) },
    { label: "1M", value: calcReturn(historical, 22) },
    { label: "3M", value: calcReturn(historical, 66) },
    { label: "YTD", value: calcYTD(historical) },
    { label: "1Y", value: historical.length >= 252 ? calcReturn(historical, 252) : null },
  ];

  // Mini chart — last ~66 data points (~3 months)
  const chartSlice = historical.slice(-66);
  const chartPositive =
    chartSlice.length >= 2
      ? chartSlice[chartSlice.length - 1].close >= chartSlice[0].close
      : true;

  const chartMin = chartSlice.length
    ? Math.floor(Math.min(...chartSlice.map((d) => d.close)) * 0.995)
    : 0;
  const chartMax = chartSlice.length
    ? Math.ceil(Math.max(...chartSlice.map((d) => d.close)) * 1.005)
    : 100;

  return (
    <div className="py-10 sm:py-14 space-y-6">
      {/* Price */}
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl sm:text-5xl font-bold tabular-nums">
            ${quote.price.toFixed(2)}
          </span>
          <span
            className={`text-lg sm:text-xl font-semibold tabular-nums ${
              isPositive
                ? "text-[var(--color-positive)]"
                : "text-[var(--color-negative)]"
            }`}
          >
            {isPositive ? "+" : "\u2212"}${Math.abs(quote.change).toFixed(2)} (
            {isPositive ? "+" : "\u2212"}
            {Math.abs(quote.changePercent).toFixed(2)}%)
          </span>
        </div>
        {quoteSource && quoteFetchedAt && (
          <div className="mt-1.5">
            <DataFreshness source={quoteSource} fetchedAt={quoteFetchedAt} />
          </div>
        )}
      </div>

      {/* Performance row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {perfMetrics.map((m) => {
          const pos = m.value !== null && m.value >= 0;
          return (
            <div
              key={m.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-2.5 text-center"
            >
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-0.5">
                {m.label}
              </p>
              <p
                className={`text-sm font-bold tabular-nums ${
                  m.value === null
                    ? "text-[var(--color-text-muted)]"
                    : pos
                    ? "text-[var(--color-positive)]"
                    : "text-[var(--color-negative)]"
                }`}
              >
                {formatPct(m.value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mini chart */}
      {chartSlice.length >= 2 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Last 3 Months
            </h3>
            <Link
              href="/today"
              className="text-xs font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
            >
              Full dashboard &rarr;
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={chartSlice}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="snapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={
                      chartPositive
                        ? "var(--color-positive)"
                        : "var(--color-negative)"
                    }
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor={
                      chartPositive
                        ? "var(--color-positive)"
                        : "var(--color-negative)"
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  const date = new Date(d + "T00:00:00");
                  return date.toLocaleDateString("en-CA", { month: "short" });
                }}
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                domain={[chartMin, chartMax]}
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={
                  chartPositive
                    ? "var(--color-positive)"
                    : "var(--color-negative)"
                }
                strokeWidth={1.5}
                fill="url(#snapGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
