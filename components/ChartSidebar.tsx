"use client";

import { useState } from "react";
import Link from "next/link";
import type { VeqtQuote, HistoricalDataPoint, DataSourceType } from "@/lib/types";
import DataFreshness from "@/components/ui/DataFreshness";

interface ChartSidebarProps {
  quote: VeqtQuote | null;
  historical: HistoricalDataPoint[];
  loading: boolean;
  quoteSource?: DataSourceType;
  quoteFetchedAt?: string;
}

/* ── Return helpers (from TodaySnapshot) ── */

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

export default function ChartSidebar({
  quote,
  historical,
  loading,
  quoteSource,
  quoteFetchedAt,
}: ChartSidebarProps) {
  const [calcInput, setCalcInput] = useState(10000);

  const perfMetrics = [
    { label: "1D", value: calcReturn(historical, 1) },
    { label: "1W", value: calcReturn(historical, 5) },
    { label: "1M", value: calcReturn(historical, 22) },
    { label: "3M", value: calcReturn(historical, 66) },
    { label: "YTD", value: calcYTD(historical) },
    { label: "1Y", value: historical.length >= 252 ? calcReturn(historical, 252) : null },
  ];

  /* Use first available data point as inception price — accurate to the loaded history */
  const inceptionPrice = historical.length > 0 ? historical[0].close : null;
  const currentPrice = quote?.price ?? 0;
  const calcResult =
    currentPrice > 0 && inceptionPrice !== null && inceptionPrice > 0
      ? (calcInput / inceptionPrice) * currentPrice
      : null;
  const calcGainPct =
    calcResult !== null && calcInput > 0
      ? ((calcResult - calcInput) / calcInput) * 100
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Widget 1: Performance Returns ── */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Returns
          </h3>
          <Link
            href="/today"
            className="text-xs font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            Full dashboard &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : historical.length >= 2 ? (
          <div className="grid grid-cols-3 gap-2">
            {perfMetrics.map((m) => {
              const pos = m.value !== null && m.value >= 0;
              return (
                <div
                  key={m.label}
                  className="rounded-lg bg-[var(--color-base)] px-2.5 py-2 text-center"
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
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            Awaiting data&hellip;
          </p>
        )}

        {quoteSource && quoteFetchedAt && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
            <DataFreshness source={quoteSource} fetchedAt={quoteFetchedAt} />
          </div>
        )}
      </div>

      {/* ── Widget 2: New to VEQT? ── */}
      <Link
        href="/learn/what-is-veqt"
        className="group relative rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 overflow-hidden hover:border-[var(--color-brand)]/40 transition-all"
      >
        {/* Decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-brand)] via-[var(--color-chart-line)] to-[#8b5cf6]" />

        <div className="flex items-start gap-3 mt-1">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-[var(--color-brand)]/[0.08] flex items-center justify-center">
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="var(--color-brand)"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
              New to VEQT?
            </h3>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
              Learn why thousands of Canadians chose this single ETF for their
              entire portfolio.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center mt-3 text-sm font-medium text-[var(--color-brand)] group-hover:translate-x-0.5 transition-transform">
          Start here &rarr;
        </span>
      </Link>

      {/* ── Widget 3: Quick Calculator ── */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 w-9 h-9 rounded-lg bg-[var(--color-chart-line)]/[0.08] flex items-center justify-center">
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="var(--color-chart-line)"
            >
              <path d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.815a.75.75 0 01-.53-.919z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
              If you invested&hellip;
            </h3>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              {historical.length > 0 ? (
                <>
                  starting{" "}
                  {new Date(historical[0].date + "T00:00:00").toLocaleDateString("en-CA", { month: "short", year: "numeric" })}
                </>
              ) : (
                "based on chart range"
              )}
            </p>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-text-muted)]">
            $
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={calcInput}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0) setCalcInput(v);
            }}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] pl-7 pr-3 py-3 text-sm font-semibold tabular-nums text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-chart-line)]/40 focus:border-[var(--color-chart-line)] transition-colors"
          />
        </div>

        {loading ? (
          <div className="skeleton h-10 w-full rounded-lg mt-3" />
        ) : calcResult !== null ? (
          <div className="mt-3 rounded-lg bg-[var(--color-positive)]/[0.06] border border-[var(--color-positive)]/20 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">
                ${calcResult.toLocaleString("en-CA", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
              {calcGainPct !== null && (
                <span className="text-sm font-semibold tabular-nums text-[var(--color-positive)]">
                  +{calcGainPct.toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Price return only &middot; excludes dividends
            </p>
          </div>
        ) : null}

        <Link
          href="/invest"
          className="inline-flex items-center mt-3 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          See full calculator &rarr;
        </Link>
      </div>
    </div>
  );
}
