"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { FUNDS, FUND_DATA_LAST_UPDATED } from "@/data/funds";
import type { DataSourceType } from "@/lib/types";
import type { RiskMetrics } from "@/lib/risk-metrics";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import TiltBar from "@/components/compare/TiltBar";

interface FundQuote {
  price: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  risk: RiskMetrics | null;
  source?: DataSourceType;
  error: boolean;
}

interface StatsTableProps {
  selectedFunds: string[];
}

type HighlightMode = "lowest" | "highest" | "none";

interface Row {
  label: string;
  getValue: (ticker: string, quote: FundQuote | null) => string;
  highlight: HighlightMode;
  getNumericValue?: (ticker: string, quote: FundQuote | null) => number | null;
  render?: (ticker: string, quote: FundQuote | null) => ReactNode;
}

export default function StatsTable({ selectedFunds }: StatsTableProps) {
  const [quotes, setQuotes] = useState<Record<string, FundQuote>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/funds/compare?tickers=${selectedFunds.join(",")}`
        );
        if (res.ok) {
          const json = await res.json();
          setQuotes(json.data);
          setLastUpdated(json.lastUpdated ?? null);
        }
      } catch (err) {
        console.error("Failed to fetch comparison data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, [selectedFunds]);

  const quoteValues = Object.values(quotes);
  const uniqueSources = [
    ...new Set(
      quoteValues
        .map((q) => q.source)
        .filter((s): s is DataSourceType => !!s)
    ),
  ];
  const hasCachedFund = uniqueSources.includes("cache");
  const oldestFetchedAt = lastUpdated ?? new Date().toISOString();
  const displaySource: DataSourceType = hasCachedFund
    ? "cache"
    : uniqueSources[0] ?? "yahoo-finance";

  const rows: Row[] = [
    {
      label: "Price",
      getValue: (_t, q) =>
        q?.price != null ? `$${q.price.toFixed(2)}` : "\u2014",
      highlight: "none",
    },
    {
      label: "MER",
      getValue: (t) => {
        const f = FUNDS[t];
        if (!f) return "\u2014";
        return f.merFootnote ? `~${f.mer.toFixed(2)}%*` : `${f.mer.toFixed(2)}%`;
      },
      highlight: "lowest",
      getNumericValue: (t) => FUNDS[t]?.mer ?? null,
    },
    {
      label: "AUM",
      getValue: (t) => FUNDS[t]?.aum ?? "\u2014",
      highlight: "none",
    },
    {
      label: "YTD Return",
      getValue: (_, q) =>
        q?.ytdReturn != null
          ? `${q.ytdReturn >= 0 ? "+" : ""}${q.ytdReturn.toFixed(2)}%`
          : "\u2014",
      highlight: "highest",
      getNumericValue: (_, q) => q?.ytdReturn ?? null,
    },
    {
      label: "1Y Return",
      getValue: (_, q) =>
        q?.oneYearReturn != null
          ? `${q.oneYearReturn >= 0 ? "+" : ""}${q.oneYearReturn.toFixed(2)}%`
          : "\u2014",
      highlight: "highest",
      getNumericValue: (_, q) => q?.oneYearReturn ?? null,
    },
    {
      // Worst peak-to-trough drop in the fund's full history.
      // "Highest" wins — the smallest absolute drop is the easiest
      // hold. Always shown as a negative number with explicit sign so
      // the sign column reads consistently.
      label: "Max Drawdown",
      getValue: (_, q) =>
        q?.risk
          ? `${q.risk.maxDrawdownPct.toFixed(1)}%`
          : "\u2014",
      highlight: "highest", // less negative = better
      getNumericValue: (_, q) => q?.risk?.maxDrawdownPct ?? null,
    },
    {
      // Calendar days from trough to a new all-time high.
      // "Lowest" wins — fastest recovery is the least painful hold.
      // If the fund hasn't recovered, we show "still recovering" with
      // the current gap, and exclude it from "best" eligibility (we
      // ranked by recoveryDays, which is null when not recovered).
      label: "Recovery Time",
      getValue: (_, q) => {
        if (!q?.risk) return "\u2014";
        if (q.risk.stillRecovering) {
          const cur = q.risk.currentDrawdownPct;
          return `still recovering (${cur.toFixed(1)}%)`;
        }
        const days = q.risk.recoveryDays ?? 0;
        if (days < 60) return `${days}d`;
        const months = days / 30.44;
        if (months < 24) return `${months.toFixed(1)}mo`;
        const years = days / 365.25;
        return `${years.toFixed(1)}y`;
      },
      highlight: "lowest", // fewer days = better
      getNumericValue: (_, q) => q?.risk?.recoveryDays ?? null,
    },
    {
      label: "Inception",
      getValue: (t) => {
        const d = FUNDS[t]?.inceptionDate;
        if (!d) return "\u2014";
        return new Date(d).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
        });
      },
      highlight: "none",
    },
    {
      label: "Equity / FI",
      getValue: (t) => {
        const f = FUNDS[t];
        if (!f) return "\u2014";
        return `${f.equityAllocation}/${f.fixedIncomeAllocation}`;
      },
      highlight: "none",
    },
    {
      // Geographic stack-bar: US / Canada / Intl / EM. Matches the
      // segment colors locked in TASKS.md (ink tints + stamp for EM).
      label: "Tilt",
      getValue: () => "",
      highlight: "none",
      render: (t) => <TiltBar ticker={t} />,
    },
  ];

  function getBest(row: Row): string | null {
    if (row.highlight === "none" || !row.getNumericValue) return null;
    let best: { ticker: string; value: number } | null = null;
    for (const t of selectedFunds) {
      const val = row.getNumericValue(t, quotes[t] ?? null);
      if (val == null) continue;
      if (
        !best ||
        (row.highlight === "lowest" && val < best.value) ||
        (row.highlight === "highest" && val > best.value)
      ) {
        best = { ticker: t, value: val };
      }
    }
    return best?.ticker ?? null;
  }

  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-5"
      aria-labelledby="stats-heading"
    >
      <header className="mb-4">
        <p id="stats-heading" className="bs-stamp mb-1">
          The Ledger
        </p>
        <h2
          className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-tight"
          style={{ color: "var(--ink)" }}
        >
          <em className="bs-display-italic">Side-by-side</em> on the metrics
          that decide it
        </h2>
      </header>

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-sm border-collapse min-w-[420px]">
          <thead>
            <tr>
              <th
                className="bs-label text-left py-3 px-3 sm:px-4 text-[10.5px]"
                style={{
                  color: "var(--ink-soft)",
                  borderBottom: "2px solid var(--ink)",
                  letterSpacing: "0.14em",
                }}
              >
                Metric
              </th>
              {selectedFunds.map((t) => {
                const isVeqt = t === "VEQT.TO";
                return (
                  <th
                    key={t}
                    className="text-left py-3 px-3 sm:px-4 align-bottom"
                    style={{ borderBottom: "2px solid var(--ink)" }}
                  >
                    <span
                      className="bs-display block text-[15px] sm:text-base leading-none"
                      style={{
                        color: isVeqt ? "var(--stamp)" : "var(--ink)",
                      }}
                    >
                      {FUNDS[t]?.shortName ?? t}
                    </span>
                    <span
                      className="bs-caption italic block mt-1 text-[10.5px]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {isVeqt ? "house" : FUNDS[t]?.provider ?? ""}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const bestTicker = getBest(row);
              return (
                <tr
                  key={row.label}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <td
                    className="bs-caption italic py-3 px-3 sm:px-4 text-[12.5px]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {row.label}
                  </td>
                  {selectedFunds.map((t) => {
                    const isBest = bestTicker === t;
                    const isVeqt = t === "VEQT.TO";
                    const value = row.getValue(t, quotes[t] ?? null);
                    const skeletalRow =
                      loading &&
                      row.label !== "MER" &&
                      row.label !== "AUM" &&
                      row.label !== "Inception" &&
                      row.label !== "Equity / FI";

                    return (
                      <td
                        key={t}
                        className="bs-numerals py-3 px-3 sm:px-4 tabular-nums text-[13.5px] sm:text-[14px]"
                        style={{
                          color: isBest ? "var(--stamp)" : "var(--ink)",
                          backgroundColor: isVeqt
                            ? "color-mix(in oklab, var(--stamp) 4%, transparent)"
                            : undefined,
                        }}
                      >
                        {skeletalRow ? (
                          <div className="skeleton h-4 w-14" />
                        ) : row.render ? (
                          row.render(t, quotes[t] ?? null)
                        ) : (
                          <span
                            style={{
                              borderBottom: isBest
                                ? "2px solid var(--stamp)"
                                : undefined,
                              paddingBottom: isBest ? "1px" : undefined,
                            }}
                          >
                            {value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1">
        {!loading && lastUpdated ? (
          <DataFreshness source={displaySource} fetchedAt={oldestFetchedAt} />
        ) : (
          <p
            className="bs-caption italic text-[11px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Live data from Alpha Vantage / Yahoo Finance
          </p>
        )}
        <p
          className="bs-caption italic text-[11px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Fund data verified{" "}
          {new Date(FUND_DATA_LAST_UPDATED + "T00:00:00").toLocaleDateString(
            "en-CA",
            { year: "numeric", month: "short", day: "numeric" }
          )}
          . Sources: Vanguard Canada, BlackRock Canada, BMO ETF Centre.
        </p>
        <p
          className="bs-caption italic text-[11px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Vermilion underscore marks the leader on each row. Drawdown and
          recovery are measured over each fund&apos;s full available
          history — younger funds have lived through fewer storms.
        </p>
      </div>

      {hasCachedFund && oldestFetchedAt && (
        <div className="mt-3">
          <StaleBanner fetchedAt={oldestFetchedAt} />
        </div>
      )}
    </section>
  );
}
