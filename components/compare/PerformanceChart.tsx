"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { FUNDS } from "@/data/funds";
import type { ChartPeriod } from "@/lib/types";
import { CHART_PERIODS } from "@/lib/constants";
import { ChartTooltipWrapper, GRID_PROPS, AXIS_PROPS } from "@/lib/chart-utils";
import { getCached, setCache } from "@/lib/cache";

interface PerformanceChartProps {
  selectedFunds: string[];
}

interface ChartDataPoint {
  date: string;
  [ticker: string]: number | string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const date = new Date(label + "T00:00:00");
  return (
    <ChartTooltipWrapper>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1">
        {date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="font-medium">{p.dataKey.replace(".TO", "")}</span>
          <span className="ml-auto tabular-nums">
            {p.value >= 0 ? "+" : ""}
            {p.value.toFixed(2)}%
          </span>
        </p>
      ))}
    </ChartTooltipWrapper>
  );
}

export default function PerformanceChart({ selectedFunds }: PerformanceChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("1Y");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        selectedFunds.map(async (ticker) => {
          const cacheKey = `chart:${ticker}:${period}`;
          try {
            const res = await fetch(`/api/funds/chart/${ticker}?range=${period}`);
            if (!res.ok) throw new Error("API error");
            const json = await res.json();
            const chartData = json.data as { date: string; close: number }[];
            setCache(cacheKey, chartData);
            return { ticker, data: chartData };
          } catch {
            const cached = getCached<{ date: string; close: number }[]>(cacheKey);
            return { ticker, data: cached || [] };
          }
        })
      );

      const normalized: Record<string, Record<string, number>> = {};
      const allDates = new Set<string>();

      for (const { ticker, data } of responses) {
        if (!data.length) continue;
        const startPrice = data[0].close;
        for (const point of data) {
          allDates.add(point.date);
          if (!normalized[point.date]) normalized[point.date] = {};
          normalized[point.date][ticker] =
            ((point.close - startPrice) / startPrice) * 100;
        }
      }

      const sortedDates = Array.from(allDates).sort();
      const merged: ChartDataPoint[] = sortedDates.map((date) => ({
        date,
        ...normalized[date],
      }));

      setChartData(merged);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedFunds, period]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Normalized Performance (% change)
        </h2>
        <div className="flex gap-0.5 rounded-lg bg-[var(--color-base)] p-0.5">
          {CHART_PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key as ChartPeriod)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                period === p.key
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="skeleton h-[320px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-sm text-[var(--color-text-muted)]">
            Chart data unavailable
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  const date = new Date(d + "T00:00:00");
                  return date.toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
                }}
                {...AXIS_PROPS}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`}
                {...AXIS_PROPS}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs font-medium">{value.replace(".TO", "")}</span>
                )}
              />
              {selectedFunds.map((ticker) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={FUNDS[ticker]?.chartColor || "#6b7280"}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
        Source: Yahoo Finance &middot; Normalized to % change from start of period
      </p>
    </div>
  );
}
