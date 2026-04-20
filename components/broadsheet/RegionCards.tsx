"use client";

import type { Region } from "@/lib/useRegions";
import { getComposition } from "@/data/sleeve-composition";

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
            className="border-b border-r border-[var(--ink)] last:border-r-0 p-6 min-h-[320px]"
          >
            <div className="skeleton h-3 w-24 mb-4" />
            <div className="skeleton h-12 w-16 mb-6" />
            <div className="skeleton h-6 w-28 mb-6" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="skeleton h-2 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-2 border border-[var(--ink)] bg-[var(--paper)]">
      {regions.map((r, idx) => {
        const isPositive = r.changePercent !== null && r.changePercent >= 0;
        const color = isPositive ? "var(--print-green)" : "var(--print-red)";
        const composition = getComposition(r.ticker);

        const onRight = idx % 2 === 1;
        const onBottom = idx >= 2;

        // Scale bars so the biggest item in this sleeve fills ~95%; keeps
        // the visual dynamic regardless of what the top weight actually is.
        const maxWeight = composition
          ? Math.max(
              ...composition.items.map((i) => i.weight),
              composition.other
            )
          : 1;

        return (
          <div
            key={r.ticker}
            className={`p-6 sm:p-7 relative flex flex-col ${
              !onRight ? "sm:border-r" : ""
            } ${!onBottom ? "border-b sm:border-b" : ""} border-[var(--ink)]`}
          >
            {/* Header — region label + weight */}
            <div className="flex items-baseline justify-between mb-4">
              <div className="min-w-0 flex-1 pr-3">
                <p className="bs-label">{r.label}</p>
                <p className="bs-caption mt-0.5 italic truncate">
                  {r.fullName}
                </p>
              </div>
              <p className="bs-display bs-numerals text-4xl sm:text-5xl leading-none text-[var(--ink)] shrink-0">
                {r.weight}
                <span className="text-2xl align-top">%</span>
              </p>
            </div>

            {/* Ticker, underlined */}
            <p
              className="bs-label border-b border-[var(--ink)] pb-2 mb-4"
              style={{ letterSpacing: "0.35em" }}
            >
              {r.ticker}
            </p>

            {/* Price + daily change + contribution */}
            <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
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
                      {isPositive ? "▲" : "▼"} {formatPct(r.changePercent)}
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

            {/* Composition breakdown — the xeqtbrief move, broadsheet-ified */}
            {composition && (
              <div className="pt-4 mt-auto border-t border-[var(--color-border)]">
                <p className="bs-label mb-3">{composition.breakdownLabel}</p>
                <ul className="space-y-[6px]">
                  {composition.items.map((item) => (
                    <li
                      key={item.name}
                      className="grid grid-cols-[1fr_auto] items-center gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="bs-numerals text-[13px] text-[var(--ink)] shrink-0">
                          {item.name}
                        </span>
                        <span
                          className="h-[2px] bg-[var(--ink)] opacity-70 min-w-[4px]"
                          style={{
                            width: `${(item.weight / maxWeight) * 60}%`,
                          }}
                        />
                      </div>
                      <span className="bs-numerals text-[13px] tabular-nums text-[var(--ink-soft)] w-9 text-right">
                        {item.weight}%
                      </span>
                    </li>
                  ))}
                  {composition.other > 0 && (
                    <li className="grid grid-cols-[1fr_auto] items-center gap-3 italic">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="text-[12px] shrink-0"
                          style={{ color: "var(--ink-soft)" }}
                        >
                          Other
                        </span>
                        <span
                          className="h-[1px] bg-[var(--ink)] opacity-30 min-w-[4px]"
                          style={{
                            width: `${(composition.other / maxWeight) * 60}%`,
                          }}
                        />
                      </div>
                      <span
                        className="bs-numerals text-[12px] tabular-nums w-9 text-right"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        {composition.other}%
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
