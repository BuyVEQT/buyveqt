"use client";

import { useState, useEffect } from "react";
import { FUNDS } from "@/data/funds";
import type { DataSourceType } from "@/lib/types";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";

interface FundQuote {
  price: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
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

  // Compute aggregated source info from all quotes
  const quoteValues = Object.values(quotes);
  const uniqueSources = [
    ...new Set(
      quoteValues
        .map((q) => q.source)
        .filter((s): s is DataSourceType => !!s)
    ),
  ];
  const hasCachedFund = uniqueSources.includes("cache");
  // Find the oldest fetchedAt among all funds (use lastUpdated as proxy)
  const oldestFetchedAt = lastUpdated ?? new Date().toISOString();
  // Pick a representative source for DataFreshness display
  const displaySource: DataSourceType = hasCachedFund
    ? "cache"
    : uniqueSources[0] ?? "yahoo-finance";

  const rows: Row[] = [
    {
      label: "Price",
      getValue: (t, q) => q?.price != null ? `$${q.price.toFixed(2)}` : "\u2014",
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
      label: "Dividend Yield",
      getValue: (_, q) => q?.dividendYield != null ? `${q.dividendYield.toFixed(2)}%` : "\u2014",
      highlight: "highest",
      getNumericValue: (_, q) => q?.dividendYield ?? null,
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
      label: "Holdings",
      getValue: (t) =>
        FUNDS[t]?.numberOfHoldings
          ? FUNDS[t].numberOfHoldings.toLocaleString() + "+"
          : "\u2014",
      highlight: "highest",
      getNumericValue: (t) => FUNDS[t]?.numberOfHoldings ?? null,
    },
    {
      label: "Inception Date",
      getValue: (t) => {
        const d = FUNDS[t]?.inceptionDate;
        if (!d) return "\u2014";
        return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short" });
      },
      highlight: "none",
    },
    {
      label: "Equity / Fixed Income",
      getValue: (t) => {
        const f = FUNDS[t];
        if (!f) return "\u2014";
        return `${f.equityAllocation}% / ${f.fixedIncomeAllocation}%`;
      },
      highlight: "none",
    },
    {
      label: "Distribution Freq.",
      getValue: (t) => FUNDS[t]?.distributionFrequency ?? "\u2014",
      highlight: "none",
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
    <div className="space-y-3">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider w-40">
                Metric
              </th>
              {selectedFunds.map((t) => (
                <th
                  key={t}
                  className="text-left py-3 px-4 text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider"
                >
                  {FUNDS[t]?.shortName ?? t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const bestTicker = getBest(row);
              return (
                <tr key={row.label} className="border-b last:border-b-0 border-[var(--color-border)]">
                  <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                    {row.label}
                  </td>
                  {selectedFunds.map((t) => {
                    const isBest = bestTicker === t;
                    const value = row.getValue(t, quotes[t] ?? null);
                    return (
                      <td
                        key={t}
                        className={`py-2.5 px-4 tabular-nums font-medium ${
                          loading
                            ? ""
                            : isBest
                            ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {loading && row.label !== "MER" && row.label !== "AUM" && row.label !== "Holdings" && row.label !== "Inception Date" && row.label !== "Equity / Fixed Income" && row.label !== "Distribution Freq." ? (
                          <div className="skeleton h-4 w-16" />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Data freshness footer */}
        <div className="px-4 py-2 border-t border-[var(--color-border)]">
          {!loading && lastUpdated ? (
            <DataFreshness source={displaySource} fetchedAt={oldestFetchedAt} />
          ) : (
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Live data from Alpha Vantage / Yahoo Finance
            </p>
          )}
        </div>
      </div>

      {/* Stale banner if any fund is cached */}
      {hasCachedFund && oldestFetchedAt && (
        <StaleBanner fetchedAt={oldestFetchedAt} />
      )}
    </div>
  );
}
