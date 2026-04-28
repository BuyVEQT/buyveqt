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
} from "recharts";
import { FUNDS } from "@/data/funds";
import type { ChartPeriod, DataSourceType } from "@/lib/types";
import { CHART_PERIODS } from "@/lib/constants";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import DataUnavailable from "@/components/ui/DataUnavailable";
import { getCached, setCache } from "@/lib/cache";

interface PerformanceChartProps {
  selectedFunds: string[];
  /** Bubble period changes up so The Gap can match. */
  onPeriodChange?: (period: ChartPeriod) => void;
  initialPeriod?: ChartPeriod;
}

interface ChartDataPoint {
  date: string;
  [ticker: string]: number | string;
}

interface ChartResponse {
  ticker: string;
  data: { date: string; close: number }[];
  source?: DataSourceType;
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
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
    <div
      className="px-3 py-2"
      style={{
        backgroundColor: "var(--paper)",
        border: "1px solid var(--ink)",
        boxShadow: "2px 2px 0 var(--ink)",
      }}
    >
      <p
        className="bs-caption italic text-[11px] mb-1.5"
        style={{ color: "var(--ink-soft)" }}
      >
        {date.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="flex items-center gap-2 text-sm tabular-nums bs-numerals"
        >
          <span
            className="w-3 h-[3px]"
            style={{ backgroundColor: p.color }}
          />
          <span style={{ color: "var(--ink)" }}>
            {p.dataKey.replace(".TO", "")}
          </span>
          <span className="ml-auto" style={{ color: "var(--ink)" }}>
            {p.value >= 0 ? "+" : ""}
            {p.value.toFixed(2)}%
          </span>
        </p>
      ))}
    </div>
  );
}

export default function PerformanceChart({
  selectedFunds,
  onPeriodChange,
  initialPeriod = "1Y",
}: PerformanceChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>(initialPeriod);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<DataSourceType[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [missingFunds, setMissingFunds] = useState<string[]>([]);

  const handlePeriodChange = (next: ChartPeriod) => {
    setPeriod(next);
    onPeriodChange?.(next);
  };

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      const responses: ChartResponse[] = await Promise.all(
        selectedFunds.map(async (ticker) => {
          const cacheKey = `chart:${ticker}:${period}`;
          try {
            const res = await fetch(`/api/funds/chart/${ticker}?range=${period}`);
            if (!res.ok) throw new Error("API error");
            const json = await res.json();
            const chartDataArr = json.data as { date: string; close: number }[];
            setCache(cacheKey, chartDataArr);
            return {
              ticker,
              data: chartDataArr,
              source: json.source as DataSourceType | undefined,
            };
          } catch {
            const cached = getCached<{ date: string; close: number }[]>(cacheKey);
            return { ticker, data: cached || [], source: "cache" as DataSourceType };
          }
        })
      );

      const allSources = responses
        .map((r) => r.source)
        .filter((s): s is DataSourceType => !!s);
      setSources([...new Set(allSources)]);
      setFetchedAt(new Date().toISOString());
      setMissingFunds(
        responses.filter((r) => r.data.length === 0).map((r) => r.ticker.replace(".TO", ""))
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

  const hasCached = sources.includes("cache");
  const displaySource: DataSourceType = hasCached
    ? "cache"
    : sources[0] ?? "yahoo-finance";
  const allUnavailable = !loading && chartData.length === 0;

  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-5"
      aria-labelledby="perf-heading"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3 mb-4">
        <div>
          <p id="perf-heading" className="bs-stamp mb-1">
            Performance Engraving
          </p>
          <h2
            className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-tight"
            style={{ color: "var(--ink)" }}
          >
            <em>Normalized return</em> from day one of the window
          </h2>
        </div>

        {/* Period dispatch — borrowed from the home chart's vocabulary */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {CHART_PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => handlePeriodChange(p.key as ChartPeriod)}
                className="bs-label transition-colors"
                style={{
                  color: active ? "var(--stamp)" : "var(--ink-soft)",
                  borderBottom: active
                    ? "2px solid var(--stamp)"
                    : "2px solid transparent",
                  paddingBottom: "2px",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                }}
                aria-pressed={active}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </header>

      {hasCached && fetchedAt && (
        <StaleBanner fetchedAt={fetchedAt} className="mb-3" />
      )}

      {loading ? (
        <div className="skeleton h-[300px] w-full" />
      ) : allUnavailable ? (
        <DataUnavailable type="chart" className="min-h-[300px]" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--ink)"
                opacity={0.12}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  const date = new Date(d + "T00:00:00");
                  return date.toLocaleDateString("en-CA", {
                    month: "short",
                    year: "2-digit",
                  });
                }}
                tick={{ fontSize: 10.5, fill: "var(--ink-soft)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--ink)", strokeOpacity: 0.4 }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  `${v >= 0 ? "+" : ""}${v.toFixed(0)}%`
                }
                tick={{ fontSize: 10.5, fill: "var(--ink-soft)" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--ink)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                  opacity: 0.4,
                }}
              />
              {selectedFunds.map((ticker) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={FUNDS[ticker]?.chartColor || "var(--ink)"}
                  strokeWidth={ticker === "VEQT.TO" ? 2.2 : 1.6}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Legend strip, broadsheet style */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {selectedFunds.map((ticker) => {
              const fund = FUNDS[ticker];
              if (!fund) return null;
              return (
                <span
                  key={ticker}
                  className="flex items-center gap-2 bs-caption text-[11.5px]"
                  style={{ color: "var(--ink)" }}
                >
                  <span
                    className="inline-block w-4 h-[3px]"
                    style={{ backgroundColor: fund.chartColor }}
                    aria-hidden
                  />
                  <span className="bs-numerals">{fund.shortName}</span>
                  <span
                    className="italic text-[10.5px]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {fund.provider}
                  </span>
                </span>
              );
            })}
          </div>

          {missingFunds.length > 0 && (
            <p
              className="bs-caption italic text-[11.5px] mt-2"
              style={{ color: "var(--ink-soft)" }}
            >
              {missingFunds.join(", ")} data temporarily unavailable.
            </p>
          )}
        </>
      )}

      {/* Data freshness footer */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
        {!loading && fetchedAt ? (
          <DataFreshness source={displaySource} fetchedAt={fetchedAt} />
        ) : (
          <p
            className="bs-caption italic text-[11px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Source: Alpha Vantage / Yahoo Finance
          </p>
        )}
      </div>
    </section>
  );
}
