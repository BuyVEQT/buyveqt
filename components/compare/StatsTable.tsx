"use client";

import { useState, useEffect } from "react";
import { FUNDS } from "@/data/funds";

interface FundQuote {
  price: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
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
        }
      } catch (err) {
        console.error("Failed to fetch comparison data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, [selectedFunds]);

  const rows: Row[] = [
    {
      label: "Price",
      getValue: (t, q) => q?.price != null ? `$${q.price.toFixed(2)}` : "—",
      highlight: "none",
    },
    {
      label: "MER",
      getValue: (t) => `${FUNDS[t]?.mer ?? "—"}%`,
      highlight: "lowest",
      getNumericValue: (t) => FUNDS[t]?.mer ?? null,
    },
    {
      label: "AUM",
      getValue: (t) => FUNDS[t]?.aum ?? "—",
      highlight: "none",
    },
    {
      label: "Dividend Yield",
      getValue: (_, q) => q?.dividendYield != null ? `${q.dividendYield.toFixed(2)}%` : "—",
      highlight: "highest",
      getNumericValue: (_, q) => q?.dividendYield ?? null,
    },
    {
      label: "YTD Return",
      getValue: (_, q) =>
        q?.ytdReturn != null
          ? `${q.ytdReturn >= 0 ? "+" : ""}${q.ytdReturn.toFixed(2)}%`
          : "—",
      highlight: "highest",
      getNumericValue: (_, q) => q?.ytdReturn ?? null,
    },
    {
      label: "1Y Return",
      getValue: (_, q) =>
        q?.oneYearReturn != null
          ? `${q.oneYearReturn >= 0 ? "+" : ""}${q.oneYearReturn.toFixed(2)}%`
          : "—",
      highlight: "highest",
      getNumericValue: (_, q) => q?.oneYearReturn ?? null,
    },
    {
      label: "Holdings",
      getValue: (t) =>
        FUNDS[t]?.numberOfHoldings
          ? FUNDS[t].numberOfHoldings.toLocaleString() + "+"
          : "—",
      highlight: "highest",
      getNumericValue: (t) => FUNDS[t]?.numberOfHoldings ?? null,
    },
    {
      label: "Inception Date",
      getValue: (t) => {
        const d = FUNDS[t]?.inceptionDate;
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short" });
      },
      highlight: "none",
    },
    {
      label: "Equity / Fixed Income",
      getValue: (t) => {
        const f = FUNDS[t];
        if (!f) return "—";
        return `${f.equityAllocation}% / ${f.fixedIncomeAllocation}%`;
      },
      highlight: "none",
    },
    {
      label: "Distribution Freq.",
      getValue: (t) => FUNDS[t]?.distributionFrequency ?? "—",
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
    <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-x-auto">
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

      <p className="text-[11px] text-[var(--color-text-muted)] px-4 py-2 border-t border-[var(--color-border)]">
        Live data from Yahoo Finance &middot; Static data (MER, AUM, holdings) updated periodically
      </p>
    </div>
  );
}
