"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { FUNDS, FUND_DATA_LAST_UPDATED } from "@/data/funds";
import type { DataSourceType } from "@/lib/types";
import type { RiskMetrics } from "@/lib/risk-metrics";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import TiltBar from "@/components/compare/TiltBar";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

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
  selected: string[];
}

type HighlightMode = "lowest" | "highest" | "none";

interface Row {
  label: string;
  getValue: (ticker: string, quote: FundQuote | null) => string;
  highlight: HighlightMode;
  getNumericValue?: (ticker: string, quote: FundQuote | null) => number | null;
  render?: (ticker: string, quote: FundQuote | null) => ReactNode;
}

export default function StatsTable({ selected }: StatsTableProps) {
  const [quotes, setQuotes] = useState<Record<string, FundQuote>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/funds/compare?tickers=${selected.join(",")}`
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
  }, [selected]);

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
    for (const t of selected) {
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
    <Card>
      <SectionLabel>The ledger</SectionLabel>
      <div
        className="ed-display-italic"
        style={{
          fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)",
          lineHeight: 1.1,
          color: "var(--ink)",
          marginTop: 6,
          marginBottom: 18,
        }}
      >
        Side-by-side on the metrics.
      </div>

      <div style={{ overflowX: "auto", margin: "0 -4px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-sans)",
            minWidth: 420,
          }}
        >
          <thead>
            <tr>
              <th
                className="ed-label"
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--rule-soft)",
                  color: "var(--ink-mute)",
                }}
              >
                Metric
              </th>
              {selected.map((t) => {
                const isVeqt = t === "VEQT.TO";
                return (
                  <th
                    key={t}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      verticalAlign: "bottom",
                      borderBottom: "1px solid var(--rule-soft)",
                    }}
                  >
                    <span
                      className="ed-display"
                      style={{
                        display: "block",
                        fontSize: 16,
                        lineHeight: 1,
                        color: isVeqt ? "var(--stamp)" : "var(--ink)",
                        letterSpacing: "-0.012em",
                      }}
                    >
                      {FUNDS[t]?.shortName ?? t}
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        fontSize: 11,
                        color: "var(--ink-mute)",
                      }}
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
                    borderBottom: "1px solid var(--rule-soft)",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 14px",
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 13,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {row.label}
                  </td>
                  {selected.map((t) => {
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
                        className="ed-numerals"
                        style={{
                          padding: "14px 14px",
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          fontWeight: 600,
                          color: isBest ? "var(--stamp)" : "var(--ink)",
                          background: isVeqt
                            ? "color-mix(in oklab, var(--stamp) 4%, transparent)"
                            : undefined,
                        }}
                      >
                        {skeletalRow ? (
                          <div className="skeleton" style={{ height: 16, width: 56 }} />
                        ) : row.render ? (
                          row.render(t, quotes[t] ?? null)
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {isBest && (
                              <span
                                aria-hidden
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: "var(--green)",
                                  display: "inline-block",
                                }}
                              />
                            )}
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

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--rule-soft)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
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
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: "var(--ink-mute)",
            margin: 0,
          }}
        >
          Fund data verified{" "}
          {new Date(FUND_DATA_LAST_UPDATED + "T00:00:00").toLocaleDateString(
            "en-CA",
            { year: "numeric", month: "short", day: "numeric" }
          )}
          . Sources: Vanguard Canada, BlackRock Canada, BMO ETF Centre.
        </p>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 11,
            color: "var(--ink-mute)",
            margin: 0,
          }}
        >
          A green dot marks the leader on each row. Drawdown and recovery
          are measured over each fund&apos;s full available history —
          younger funds have lived through fewer storms.
        </p>
      </div>

      {hasCachedFund && oldestFetchedAt && (
        <div style={{ marginTop: 12 }}>
          <StaleBanner fetchedAt={oldestFetchedAt} />
        </div>
      )}
    </Card>
  );
}
