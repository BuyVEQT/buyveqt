"use client";

import Link from "next/link";
import type { Region } from "@/lib/useRegions";
import { getComposition } from "@/data/sleeve-composition";
import RegionSparkline from "@/components/broadsheet/RegionSparkline";

interface RegionCardsProps {
  regions: readonly Region[];
  loading: boolean;
}

function formatPct(val: number | null): string {
  if (val === null || Number.isNaN(val)) return "—";
  const sign = val >= 0 ? "+" : "−";
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}

function formatPp(val: number | null): string {
  if (val === null || Number.isNaN(val)) return "—";
  const sign = val >= 0 ? "+" : "−";
  return `${sign}${Math.abs(val).toFixed(2)}pp`;
}

/**
 * Identify the single "leader" of the day — whichever sleeve contributed the
 * largest *absolute* amount to VEQT's move. That card gets a vermilion
 * underscore so the reader can visually verify the Lead headline
 * ("Led by the U.S.", etc.) in the section below.
 */
function findLeaderTicker(regions: readonly Region[]): string | null {
  let best: Region | null = null;
  for (const r of regions) {
    if (r.error || r.contribution === null) continue;
    if (!best || Math.abs(r.contribution) > Math.abs(best.contribution ?? 0)) {
      best = r;
    }
  }
  // Only call someone the leader if their move is non-trivial.
  if (!best || Math.abs(best.contribution ?? 0) < 0.02) return null;
  return best.ticker;
}

export default function RegionCards({ regions, loading }: RegionCardsProps) {
  if (loading && regions.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 sm:gap-y-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-t-2 border-[var(--ink)] pt-5 min-h-[360px]"
          >
            <div className="skeleton h-3 w-24 mb-3" />
            <div className="skeleton h-5 w-32 mb-6" />
            <div className="skeleton h-10 w-40 mb-4" />
            <div className="skeleton h-3 w-56 mb-6" />
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

  const leaderTicker = findLeaderTicker(regions);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-8 sm:gap-y-10">
      {regions.map((r, idx) => {
        const isPositive = r.changePercent !== null && r.changePercent >= 0;
        const color = isPositive ? "var(--print-green)" : "var(--print-red)";
        const composition = getComposition(r.ticker);
        const isLeader = r.ticker === leaderTicker;
        const hasHistory = r.history && r.history.length >= 2;

        // Scale bars relative to the heaviest item so the biggest always fills
        // the same fraction of its lane regardless of absolute weights.
        const maxWeight = composition
          ? Math.max(
              ...composition.items.map((i) => i.weight),
              composition.other
            )
          : 1;

        const dispatchNumber = String(idx + 1).padStart(2, "0");

        const slug = r.ticker.replace(/\.TO$/i, "").toLowerCase();
        return (
          <Link
            key={r.ticker}
            href={`/inside-veqt#regions-${slug}`}
            className="bs-region-card-link relative pt-5 border-t-2 border-[var(--ink)] flex flex-col"
            aria-label={`See ${r.label} drilldown on Inside VEQT`}
          >
            {/* ── Identity strip ── */}
            <header className="flex items-start gap-3 mb-4">
              <span
                className="bs-display bs-numerals text-[1.25rem] leading-none shrink-0"
                style={{ color: "var(--stamp)" }}
                aria-hidden
              >
                {dispatchNumber}
              </span>
              <div className="min-w-0 flex-1">
                <h3
                  className={`bs-display text-[1.5rem] sm:text-[1.75rem] leading-none tracking-[-0.01em] ${
                    isLeader ? "inline-block" : ""
                  }`}
                  style={{
                    color: "var(--ink)",
                    borderBottom: isLeader
                      ? "2px solid var(--stamp)"
                      : undefined,
                    paddingBottom: isLeader ? "2px" : undefined,
                  }}
                >
                  {r.label}
                </h3>
                <p
                  className="bs-caption italic mt-1 text-[13px]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {r.fullName}{" "}
                  <span className="not-italic bs-label text-[11px] align-baseline ml-1">
                    · {r.ticker}
                  </span>
                </p>
              </div>
            </header>

            {/* ── Today's move: hero stat + sparkline ── */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap mb-3">
              <div className="min-w-0">
                {r.error || r.changePercent === null ? (
                  <p className="bs-display bs-numerals text-[2rem] leading-none text-[var(--ink-soft)]">
                    —
                  </p>
                ) : (
                  <p
                    className="bs-display bs-numerals text-[2rem] sm:text-[2.5rem] leading-[0.95] tabular-nums"
                    style={{ color }}
                  >
                    {isPositive ? "▲" : "▼"} {formatPct(r.changePercent)}
                  </p>
                )}
              </div>

              {hasHistory && (
                <div className="shrink-0" aria-hidden>
                  <RegionSparkline
                    points={r.history}
                    directional
                    width={90}
                    height={28}
                    ariaLabel={`${r.label} 30-day price trend`}
                  />
                  <p
                    className="bs-caption italic text-[10.5px] mt-0.5 text-right"
                    style={{
                      color: "var(--ink-soft)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    30d
                  </p>
                </div>
              )}
            </div>

            {/* ── Stat row: weight · contribution ── */}
            {!r.error && r.contribution !== null && (
              <p
                className="bs-caption text-[12px] sm:text-[13px] mb-5 pb-4 border-b border-[var(--color-border)]"
                style={{ color: "var(--ink-soft)" }}
              >
                <span className="bs-numerals not-italic text-[var(--ink)]">
                  {r.weight}%
                </span>{" "}
                of VEQT{" "}
                <span className="opacity-50 mx-1">·</span>{" "}
                <span
                  className="bs-numerals not-italic"
                  style={{ color }}
                >
                  {formatPp(r.contribution)}
                </span>{" "}
                to the day
              </p>
            )}

            {/* ── Composition breakdown — a lightened league table ── */}
            {composition && (
              <div className="mt-auto">
                <p
                  className="bs-caption italic text-[11.5px] mb-2.5"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {composition.breakdownLabel.toLowerCase()}
                </p>
                <ul className="space-y-[5px]">
                  {composition.items.map((item, itemIdx) => {
                    const barPct = (item.weight / maxWeight) * 100;
                    // Top two rows get full ink weight; the rest fade a touch
                    // so the eye lands on the heavyweights.
                    const emphasis = itemIdx < 2 ? 1 : 0.72;
                    return (
                      <li
                        key={item.name}
                        className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3"
                      >
                        <span
                          className="bs-numerals text-[12.5px] truncate"
                          style={{ color: "var(--ink)", opacity: emphasis }}
                        >
                          {item.name}
                        </span>
                        <div
                          className="relative h-[6px] overflow-hidden"
                          style={{
                            backgroundColor:
                              "color-mix(in oklab, var(--ink) 4%, transparent)",
                          }}
                        >
                          <span
                            className="absolute left-0 top-0 bottom-0"
                            style={{
                              width: `${barPct}%`,
                              backgroundColor: "var(--ink)",
                              opacity: emphasis,
                            }}
                          />
                          <span
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              width: `${barPct}%`,
                              backgroundImage:
                                "repeating-linear-gradient(90deg, color-mix(in oklab, var(--paper) 40%, transparent) 0 1px, transparent 1px 5px)",
                            }}
                          />
                        </div>
                        <span
                          className="bs-numerals text-[12px] tabular-nums text-right w-8"
                          style={{
                            color: "var(--ink-soft)",
                            opacity: emphasis,
                          }}
                        >
                          {item.weight}%
                        </span>
                      </li>
                    );
                  })}
                  {composition.other > 0 && (
                    <li
                      className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3 italic pt-[2px]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      <span className="text-[11.5px]">Other</span>
                      <div
                        className="relative h-[4px] overflow-hidden"
                        style={{
                          backgroundColor:
                            "color-mix(in oklab, var(--ink) 3%, transparent)",
                        }}
                      >
                        <span
                          className="absolute left-0 top-0 bottom-0"
                          style={{
                            width: `${(composition.other / maxWeight) * 100}%`,
                            backgroundColor: "var(--ink)",
                            opacity: 0.35,
                          }}
                        />
                      </div>
                      <span className="bs-numerals text-[11.5px] tabular-nums text-right w-8 not-italic">
                        {composition.other}%
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
