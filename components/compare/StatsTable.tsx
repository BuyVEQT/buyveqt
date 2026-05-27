"use client";

import { useState, useEffect, useMemo } from "react";
import { FUNDS, FUND_DATA_LAST_UPDATED } from "@/data/funds";
import type { DataSourceType } from "@/lib/types";
import type { RiskMetrics } from "@/lib/risk-metrics";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import Card from "@/components/ui/Card";

interface FundQuote {
  price: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  fiveYearReturn: number | null;
  risk: RiskMetrics | null;
  source?: DataSourceType;
  error: boolean;
}

interface PricePoint {
  date: string;
  close: number;
}

interface StatsTableProps {
  selected: string[];
}

type HighlightMode = "lowest" | "highest" | "none";

function fmtPctSigned(n: number | null | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

function fmtRecovery(days: number | null | undefined): string {
  if (days == null) return "still recovering";
  if (days < 60) return `${days}d`;
  const months = days / 30.44;
  if (months < 24) return `${months.toFixed(1)}mo`;
  return `${(days / 365.25).toFixed(1)}y`;
}

function MiniSpark({
  data,
  color,
  height = 22,
  width = 90,
}: {
  data: PricePoint[];
  color: string;
  height?: number;
  width?: number;
}) {
  if (!data || data.length < 2) return null;
  const closes = data.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => height - ((v - min) / range) * height;
  let path = "";
  closes.forEach((c, i) => {
    path += `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(c).toFixed(1)} `;
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width, height, display: "block", flexShrink: 0 }}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function StatsTable({ selected }: StatsTableProps) {
  const [quotes, setQuotes] = useState<Record<string, FundQuote>>({});
  const [histories, setHistories] = useState<Record<string, PricePoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch quotes
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

  // Fetch histories for sparklines (ALL range, then slice client-side)
  useEffect(() => {
    async function fetchHistories() {
      const results = await Promise.all(
        selected.map(async (ticker) => {
          try {
            const res = await fetch(`/api/funds/chart/${ticker}?range=ALL`);
            if (!res.ok) return { ticker, data: [] };
            const json = await res.json();
            return { ticker, data: (json.data ?? []) as PricePoint[] };
          } catch {
            return { ticker, data: [] as PricePoint[] };
          }
        })
      );
      const map: Record<string, PricePoint[]> = {};
      for (const { ticker, data } of results) {
        map[ticker] = data;
      }
      setHistories(map);
    }
    fetchHistories();
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

  // YTD slice helper: start of current year
  const ytdSlice = (ticker: string): PricePoint[] => {
    const h = histories[ticker] ?? [];
    const year = new Date().getFullYear();
    const cutoff = `${year}-01-01`;
    const idx = h.findIndex((p) => p.date >= cutoff);
    return idx >= 0 ? h.slice(idx) : h.slice(-60);
  };

  interface RowDef {
    label: string;
    highlight: HighlightMode;
    getNumeric: (t: string) => number | null;
    renderCell: (t: string) => React.ReactNode;
    skipSkeleton?: boolean;
  }

  const rows: RowDef[] = useMemo(() => [
    {
      label: "Price",
      highlight: "none" as HighlightMode,
      getNumeric: () => null,
      renderCell: (t) => {
        const p = quotes[t]?.price;
        return p != null ? `$${p.toFixed(2)}` : "—";
      },
    },
    {
      label: "MER",
      highlight: "lowest" as HighlightMode,
      getNumeric: (t) => FUNDS[t]?.mer ?? null,
      renderCell: (t) => {
        const m = FUNDS[t]?.mer ?? 0;
        const fill = Math.min((m / 0.25) * 100, 100);
        return (
          <span className="cell-bar">
            <span className="cell-bar__track" aria-hidden>
              <span className="cell-bar__fill" style={{ width: `${fill}%` }} />
            </span>
            <span className="cell-bar__val ed-numerals">{m.toFixed(2)}%</span>
          </span>
        );
      },
      skipSkeleton: true,
    },
    {
      label: "AUM",
      highlight: "none" as HighlightMode,
      getNumeric: () => null,
      renderCell: (t) => FUNDS[t]?.aum ?? "—",
      skipSkeleton: true,
    },
    {
      label: "YTD",
      highlight: "highest" as HighlightMode,
      getNumeric: (t) => quotes[t]?.ytdReturn ?? null,
      renderCell: (t) => {
        const v = quotes[t]?.ytdReturn ?? null;
        const fund = FUNDS[t];
        const slice = ytdSlice(t);
        return (
          <span className="cell-pct">
            {fund && slice.length >= 2 && (
              <MiniSpark data={slice} color={fund.chartColor} />
            )}
            <span
              className="ed-numerals cell-pct__val"
              style={{ color: (v ?? 0) >= 0 ? "var(--green)" : "var(--stamp)" }}
            >
              {fmtPctSigned(v)}
            </span>
          </span>
        );
      },
    },
    {
      label: "1Y",
      highlight: "highest" as HighlightMode,
      getNumeric: (t) => quotes[t]?.oneYearReturn ?? null,
      renderCell: (t) => {
        const v = quotes[t]?.oneYearReturn ?? null;
        const fund = FUNDS[t];
        const h = (histories[t] ?? []).slice(-252);
        return (
          <span className="cell-pct">
            {fund && h.length >= 2 && (
              <MiniSpark data={h} color={fund.chartColor} />
            )}
            <span
              className="ed-numerals cell-pct__val"
              style={{ color: (v ?? 0) >= 0 ? "var(--green)" : "var(--stamp)" }}
            >
              {fmtPctSigned(v)}
            </span>
          </span>
        );
      },
    },
    {
      label: "5Y",
      highlight: "highest" as HighlightMode,
      getNumeric: (t) => quotes[t]?.fiveYearReturn ?? null,
      renderCell: (t) => {
        const v = quotes[t]?.fiveYearReturn ?? null;
        const fund = FUNDS[t];
        const h = (histories[t] ?? []).slice(-252 * 5);
        return (
          <span className="cell-pct">
            {fund && h.length >= 2 && (
              <MiniSpark data={h} color={fund.chartColor} />
            )}
            <span
              className="ed-numerals cell-pct__val"
              style={{ color: (v ?? 0) >= 0 ? "var(--green)" : "var(--stamp)" }}
            >
              {fmtPctSigned(v)}
            </span>
          </span>
        );
      },
    },
    {
      label: "Max drawdown",
      highlight: "highest" as HighlightMode,
      getNumeric: (t) => quotes[t]?.risk?.maxDrawdownPct ?? null,
      renderCell: (t) => {
        const v = quotes[t]?.risk?.maxDrawdownPct;
        if (v == null) return "—";
        return (
          <span className="ed-numerals" style={{ color: "var(--stamp)" }}>
            {v.toFixed(1)}%
          </span>
        );
      },
    },
    {
      label: "Recovery time",
      highlight: "lowest" as HighlightMode,
      getNumeric: (t) => quotes[t]?.risk?.recoveryDays ?? null,
      renderCell: (t) => {
        const q = quotes[t];
        if (!q?.risk) return "—";
        if (q.risk.stillRecovering) {
          return `still recovering (${q.risk.currentDrawdownPct.toFixed(1)}%)`;
        }
        return fmtRecovery(q.risk.recoveryDays);
      },
    },
    {
      label: "Volatility",
      highlight: "lowest" as HighlightMode,
      getNumeric: (t) => quotes[t]?.risk?.annualVol ?? null,
      renderCell: (t) => {
        const v = quotes[t]?.risk?.annualVol;
        if (v == null) return "—";
        return `${v.toFixed(1)}%`;
      },
    },
    {
      label: "Inception",
      highlight: "none" as HighlightMode,
      getNumeric: () => null,
      renderCell: (t) => {
        const d = FUNDS[t]?.inceptionDate;
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
        });
      },
      skipSkeleton: true,
    },
    {
      label: "Equity / FI",
      highlight: "none" as HighlightMode,
      getNumeric: () => null,
      renderCell: (t) => {
        const f = FUNDS[t];
        if (!f) return "—";
        return `${f.equityAllocation}/${f.fixedIncomeAllocation}`;
      },
      skipSkeleton: true,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [quotes, histories]);

  function getBest(row: RowDef): string | null {
    if (row.highlight === "none") return null;
    let best: { ticker: string; value: number } | null = null;
    for (const t of selected) {
      const val = row.getNumeric(t);
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
      <div className="stats__head">
        <div>
          <div className="ed-stamp">The ledger</div>
          <h2 className="ed-display-italic stats__h2">Side by side on the metrics.</h2>
        </div>
        <p className="ed-caption stats__deck">
          Green dot marks the row leader. Drawdown and volatility are measured
          over each fund&apos;s full available history.
        </p>
      </div>

      <div className="stats__scroll">
        <table
          className="stats__table"
          style={{
            // Dynamic min-width: 140px per fund column + 140px label column,
            // capped at 480px so the 4-fund worst case stays scrollable but
            // a 2-fund table doesn't force a horizontal scrollbar on phones.
            minWidth: `${Math.min((selected.length + 1) * 140, 480)}px`,
          }}
        >
          <thead>
            <tr>
              <th className="ed-label stats__th-label">Metric</th>
              {selected.map((t) => {
                const isVeqt = t === "VEQT.TO";
                return (
                  <th key={t} className="stats__th">
                    <span
                      className="stats__th-ticker ed-display"
                      style={{ color: isVeqt ? "var(--stamp)" : "var(--ink)" }}
                    >
                      {FUNDS[t]?.shortName ?? t.replace(".TO", "")}
                    </span>
                    <span className="stats__th-sub">
                      {isVeqt ? "house" : (FUNDS[t]?.provider ?? "")}
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
                <tr key={row.label}>
                  <td className="stats__td-label">{row.label}</td>
                  {selected.map((t) => {
                    const isBest = bestTicker === t;
                    const isVeqt = t === "VEQT.TO";
                    const skeletalRow =
                      loading &&
                      !row.skipSkeleton &&
                      row.highlight !== "none";

                    return (
                      <td
                        key={t}
                        className={`stats__td${isBest ? " is-best" : ""}${isVeqt ? " is-veqt" : ""}`}
                      >
                        {isBest && row.highlight !== "none" && (
                          <span className="stats__dot" aria-hidden />
                        )}
                        <span className="stats__val">
                          {skeletalRow ? (
                            <div
                              className="skeleton"
                              style={{ height: 16, width: 56 }}
                            />
                          ) : (
                            row.renderCell(t)
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="stats__footer">
        {!loading && lastUpdated ? (
          <DataFreshness source={displaySource} fetchedAt={oldestFetchedAt} />
        ) : (
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: "var(--ink-soft)",
              margin: 0,
            }}
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
      </div>

      {hasCachedFund && oldestFetchedAt && (
        <div style={{ marginTop: 12 }}>
          <StaleBanner fetchedAt={oldestFetchedAt} />
        </div>
      )}

      <style jsx>{`
        .stats__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .stats__h2 {
          font-size: clamp(1.5rem, 2.4vw, 1.9rem);
          line-height: 1.05;
          margin: 4px 0 0;
          color: var(--ink);
        }
        .stats__deck {
          flex: 0 1 380px;
          max-width: 380px;
          font-size: 13px;
        }
        .stats__scroll {
          overflow-x: auto;
          margin: 0 -4px;
        }
        .stats__table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-sans);
          /* min-width is set inline based on selected.length so 2-fund
             tables don't force a horizontal scrollbar on phones. */
        }
        .stats__th-label {
          text-align: left;
          padding: 12px 14px 14px;
          border-bottom: 2px solid var(--ink);
          color: var(--ink-mute);
        }
        .stats__th {
          text-align: left;
          padding: 12px 14px 14px;
          vertical-align: bottom;
          border-bottom: 2px solid var(--ink);
        }
        .stats__th-ticker {
          display: block;
          font-size: 18px;
          line-height: 1;
          letter-spacing: -0.015em;
        }
        .stats__th-sub {
          display: block;
          margin-top: 4px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 11.5px;
          color: var(--ink-mute);
        }
        .stats__td-label {
          padding: 14px 14px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13px;
          color: var(--ink-soft);
          border-bottom: 1px solid var(--rule-soft);
        }
        :global(.stats__td) {
          padding: 14px 14px;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          border-bottom: 1px solid var(--rule-soft);
          position: relative;
        }
        :global(.stats__td.is-veqt) {
          background: color-mix(in oklab, var(--stamp) 4%, transparent);
        }
        :global(.stats__td.is-best) {
          color: var(--green);
        }
        :global(.stats__dot) {
          position: absolute;
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
        }
        :global(.stats__val) {
          display: inline-block;
        }
        :global(.cell-bar) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        :global(.cell-bar__track) {
          width: 50px;
          height: 4px;
          background: var(--paper-warm);
          border-radius: 2px;
          overflow: hidden;
        }
        :global(.cell-bar__fill) {
          display: block;
          height: 100%;
          background: var(--ink);
        }
        :global(.cell-bar__val) {
          font-weight: 700;
        }
        :global(.cell-pct) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        :global(.cell-pct__val) {
          font-weight: 700;
        }
        .stats__footer {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--rule-soft);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
      `}</style>
    </Card>
  );
}
