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
import type { HistoricalDataPoint, ChartPeriod } from "@/lib/types";
import { CHART_PERIODS } from "@/lib/constants";

interface PriceChartProps {
  data: HistoricalDataPoint[];
  loading: boolean;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
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

interface TooltipPayloadItem {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const date = new Date(label + "T00:00:00");
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[var(--color-text-muted)]">
        {date.toLocaleDateString("en-CA", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
        ${payload[0].value.toFixed(2)} CAD
      </p>
    </div>
  );
}

export default function PriceChart({
  data,
  loading,
  period,
  onPeriodChange,
}: PriceChartProps) {
  const prices = data.map((d) => d.close);
  const minPrice = prices.length ? Math.floor(Math.min(...prices) * 0.99) : 0;
  const maxPrice = prices.length ? Math.ceil(Math.max(...prices) * 1.01) : 100;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
          VEQT.TO Price History
        </h2>
        <div className="flex gap-0.5 rounded-lg bg-[var(--color-base)] p-0.5">
          {CHART_PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPeriodChange(p.key as ChartPeriod)}
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
        {loading || data.length === 0 ? (
          <div className="h-full min-h-[300px] flex items-center justify-center">
            {loading ? (
              <div className="skeleton h-[300px] w-full rounded-lg" />
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Chart data unavailable
              </p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-line)"
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-line)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDate(d, period)}
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--color-chart-line)"
                strokeWidth={2}
                fill="url(#colorClose)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-chart-line)",
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
        Source: Yahoo Finance &middot; Updated every 30 min
      </p>
    </div>
  );
}
