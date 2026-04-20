"use client";

import type { Region } from "@/lib/useRegions";

interface RegionCardsProps {
  regions: readonly Region[];
  loading: boolean;
}

function formatPct(val: number | null): string {
  if (val === null || Number.isNaN(val)) return "—";
  const sign = val >= 0 ? "+" : "−";
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}

function formatBps(val: number | null): string {
  if (val === null || Number.isNaN(val)) return "—";
  const sign = val >= 0 ? "+" : "−";
  return `${sign}${Math.abs(val).toFixed(2)}pp`;
}

export default function RegionCards({ regions, loading }: RegionCardsProps) {
  if (loading && regions.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-[var(--ink)]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-r border-[var(--ink)] last:border-r-0 p-6 min-h-[220px]"
          >
            <div className="skeleton h-3 w-24 mb-4" />
            <div className="skeleton h-12 w-16 mb-6" />
            <div className="skeleton h-6 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative grid grid-cols-1 sm:grid-cols-2 border border-[var(--ink)] bg-[var(--paper)]">
        {regions.map((r, idx) => {
          const isPositive =
            r.changePercent !== null && r.changePercent >= 0;
          const color = isPositive
            ? "var(--print-green)"
            : "var(--print-red)";

          const onRight = idx % 2 === 1;
          const onBottom = idx >= 2;

          return (
            <div
              key={r.ticker}
              className={`p-6 sm:p-7 min-h-[200px] relative flex flex-col ${
                !onRight ? "sm:border-r" : ""
              } ${!onBottom ? "border-b sm:border-b" : ""} border-[var(--ink)]`}
            >
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <p className="bs-label">{r.label}</p>
                  <p className="bs-caption mt-0.5 italic">{r.fullName}</p>
                </div>
                <p className="bs-display bs-numerals text-4xl sm:text-5xl leading-none text-[var(--ink)]">
                  {r.weight}
                  <span className="text-2xl align-top">%</span>
                </p>
              </div>

              <p
                className="bs-label tracking-[0.35em] border-b border-[var(--ink)] pb-2 mb-4"
                style={{ letterSpacing: "0.35em" }}
              >
                {r.ticker}
              </p>

              <div className="mt-auto flex items-end justify-between gap-3 flex-wrap">
                <div>
                  {r.error || r.price === null ? (
                    <p className="bs-caption">data unavailable</p>
                  ) : (
                    <>
                      <p className="bs-display bs-numerals text-2xl sm:text-[1.75rem] leading-none">
                        ${r.price.toFixed(2)}
                      </p>
                      <p
                        className="bs-numerals text-sm mt-1"
                        style={{ color }}
                      >
                        {isPositive ? "▲" : "▼"}{" "}
                        {formatPct(r.changePercent)}
                      </p>
                    </>
                  )}
                </div>

                {r.contribution !== null && (
                  <p
                    className="bs-caption italic text-right shrink-0"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    adds{" "}
                    <span style={{ color }} className="bs-numerals not-italic">
                      {formatBps(r.contribution)}
                    </span>
                    <br />
                    to the day
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
