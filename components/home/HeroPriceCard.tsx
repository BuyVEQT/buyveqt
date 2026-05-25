"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { VeqtApiResponse, ChartPeriod, HistoricalDataPoint } from "@/lib/types";
import type { SeverityReading } from "@/lib/severity";
import Pill from "@/components/ui/Pill";
import Sparkline from "@/components/charts/Sparkline";
import SeverityRing from "@/components/charts/SeverityRing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroPriceCardProps {
  data: VeqtApiResponse | null;
  loading: boolean;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
  severity: SeverityReading | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HERO_RANGES: ChartPeriod[] = ["1M", "3M", "1Y", "5Y", "ALL"];

const HERO_PERIOD_LABEL: Record<ChartPeriod, string> = {
  "1M": "1 month",
  "3M": "3 months",
  "6M": "6 months",
  YTD: "year-to-date",
  "1Y": "1 year",
  "3Y": "3 years",
  "5Y": "5 years",
  ALL: "since inception",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PeriodStats {
  startClose: number;
  endClose: number;
  high: number;
  low: number;
  returnPct: number;
  typicalDailyPct: number;
}

export function computePeriodStats(
  history: readonly HistoricalDataPoint[]
): PeriodStats | null {
  if (history.length < 2) return null;
  const startClose = history[0].close;
  const endClose = history[history.length - 1].close;
  let high = -Infinity;
  let low = Infinity;
  let absSum = 0;
  let absCount = 0;
  for (let i = 0; i < history.length; i++) {
    const c = history[i].close;
    if (c > high) high = c;
    if (c < low) low = c;
    if (i > 0) {
      const prev = history[i - 1].close;
      if (prev > 0) {
        absSum += Math.abs((c - prev) / prev) * 100;
        absCount += 1;
      }
    }
  }
  const returnPct =
    startClose > 0 ? ((endClose - startClose) / startClose) * 100 : 0;
  const typicalDailyPct = absCount > 0 ? absSum / absCount : 0;
  return { startClose, endClose, high, low, returnPct, typicalDailyPct };
}

// ---------------------------------------------------------------------------
// Weather rail helpers (ported from WeatherCard.tsx)
// ---------------------------------------------------------------------------

function zoneHeadline(reading: SeverityReading): string {
  const { zone, todayChangePercent } = reading;
  const dir = todayChangePercent >= 0 ? "rally" : "chop";
  switch (zone) {
    case "Typical":
      return `Below-average ${dir}.`;
    case "Notable":
      return `Above-average ${dir}.`;
    case "Unusual":
      return `An unusual ${todayChangePercent >= 0 ? "up day" : "down day"}.`;
    case "Rare":
      return `A rare ${todayChangePercent >= 0 ? "up day" : "down day"}.`;
    default:
      return "An ordinary session.";
  }
}

function blurb(reading: SeverityReading): string {
  const { percentileRank, sampleFromYear, zone } = reading;
  const pct = Math.round(percentileRank * 100);
  if (zone === "Typical")
    return `Quieter than ${100 - pct}% of all VEQT sessions since ${sampleFromYear}.`;
  if (zone === "Notable")
    return `Bigger than ${pct}% of sessions since ${sampleFromYear} — still inside the normal range.`;
  if (zone === "Unusual")
    return `Bigger than ${pct}% of sessions since ${sampleFromYear}. Worth noticing, not acting on.`;
  return `Bigger than ${pct}% of sessions since ${sampleFromYear} — a genuinely rare day.`;
}

function ctaHref(reading: SeverityReading): string {
  return reading.todayChangePercent < 0
    ? "/learn/veqt-is-down"
    : "/learn/why-stocks-go-up";
}

function ctaLabel(reading: SeverityReading): string {
  return reading.todayChangePercent < 0
    ? "Read · what to do when it's down"
    : "Read · why markets rise";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeroPriceCard({
  data,
  loading,
  period,
  onPeriodChange,
  severity,
}: HeroPriceCardProps) {
  const quote = data?.quote ?? null;
  const history = data?.historical ?? [];

  const up = (quote?.changePercent ?? 0) >= 0;

  const periodStats = useMemo(() => computePeriodStats(history), [history]);
  const periodUp = (periodStats?.returnPct ?? 0) >= 0;

  const showYearTicks = period === "ALL" || period === "5Y" || period === "3Y";
  const showExtrema = period !== "1M";

  // 52-week range track position (0–100%)
  const trackPct = useMemo(() => {
    if (!quote) return 50;
    const hi = quote.fiftyTwoWeekHigh;
    const lo = quote.fiftyTwoWeekLow;
    if (!hi || !lo || hi <= lo) return null;
    return ((quote.price - lo) / (hi - lo)) * 100;
  }, [quote]);

  // Weather rail derivations
  const signedZ = severity
    ? (severity.todayChangePercent >= 0 ? 1 : -1) * severity.sigmaRatio
    : 0;
  const zoneLabel =
    severity?.zone === "Typical" ? "Calm" : (severity?.zone ?? "—");

  return (
    <section className="hero hero--bonded">
      {/* ── Left column — price + chart ─────────────────────────────────── */}
      <div className="hero__main">
        {/* Eyebrow + price + change + 52w track */}
        <div className="hero__head">
          <div>
            <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
              VEQT.TO · Vanguard All-Equity ETF · TSX
            </div>

            <div className="hero__price ed-display ed-numerals">
              {loading && !quote ? (
                <span
                  className="skeleton"
                  style={{ display: "inline-block", width: "4ch", height: "1em" }}
                />
              ) : (
                quote ? `$${quote.price.toFixed(2)}` : "—"
              )}
            </div>

            <div className="hero__change">
              {quote ? (
                <>
                  <Pill tone={up ? "up" : "down"}>
                    {up ? "↑" : "↓"} {up ? "+" : "−"}
                    {Math.abs(quote.changePercent).toFixed(2)}%
                  </Pill>
                  <span
                    className="ed-numerals"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "var(--ink-mute)",
                    }}
                  >
                    {up ? "+" : "−"}${Math.abs(quote.change).toFixed(2)} today
                    {" · "}vs. ${quote.previousClose.toFixed(2)} prev close
                  </span>
                </>
              ) : (
                <span className="skeleton" style={{ width: 120, height: 22 }} />
              )}
            </div>
          </div>

          {/* 52-week range track */}
          {quote && trackPct !== null && (
            <div className="hero__track">
              <div
                className="ed-label"
                style={{ marginBottom: 8, color: "var(--ink-mute)" }}
              >
                52-week range
              </div>
              <div className="hero__track-bar">
                <div
                  className="hero__track-marker"
                  style={{ left: `${trackPct}%` }}
                />
              </div>
              <div className="hero__track-labels">
                <span className="ed-numerals">
                  ${quote.fiftyTwoWeekLow.toFixed(2)}
                </span>
                <span className="ed-numerals">
                  ${quote.fiftyTwoWeekHigh.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sparkline */}
        <div className="hero__chart">
          {history.length >= 2 ? (
            <Sparkline
              data={history}
              width={920}
              height={140}
              stroke="var(--ink)"
              gradient
              dot
              strokeWidth={1.6}
              showExtrema={showExtrema}
              yearTicks={showYearTicks}
              referencePrice={periodStats?.startClose ?? null}
              interactive
              dragSelect
              ariaLabel={`VEQT ${period} price chart`}
              style={{ height: "100%" }}
            />
          ) : (
            <div
              className="skeleton"
              style={{ height: "100%", width: "100%", borderRadius: 8 }}
            />
          )}
        </div>

        <div
          style={{
            marginTop: 6,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 12,
            color: "var(--ink-mute)",
            textAlign: "right",
          }}
        >
          Drag two points (or Tab + Shift +←→) to compare →
        </div>

        {/* Period stats ribbon */}
        {periodStats && (
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
                {period} return
              </span>
              <span
                className="ed-numerals hero__stat-val"
                style={{ color: periodUp ? "var(--green)" : "var(--stamp)" }}
              >
                {periodUp ? "+" : "−"}
                {Math.abs(periodStats.returnPct).toFixed(2)}%
              </span>
              <span className="ed-caption">
                {HERO_PERIOD_LABEL[period]}
              </span>
            </div>

            <div className="hero__stat-sep" />

            <div className="hero__stat">
              <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
                Range
              </span>
              <span className="ed-numerals hero__stat-val">
                ${periodStats.low.toFixed(2)}
                <span style={{ color: "var(--ink-mute)" }}> – </span>$
                {periodStats.high.toFixed(2)}
              </span>
              <span className="ed-caption">low to high</span>
            </div>

            <div className="hero__stat-sep" />

            <div className="hero__stat">
              <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
                Typical day
              </span>
              <span className="ed-numerals hero__stat-val">
                ±{periodStats.typicalDailyPct.toFixed(2)}%
              </span>
              <span className="ed-caption">avg close-to-close</span>
            </div>

            <div className="hero__stat-sep" />

            <div className="hero__tabs" role="tablist" aria-label="Chart range">
              {HERO_RANGES.map((p) => {
                const active = p === period;
                return (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onPeriodChange(p)}
                    className={`hero__tab${active ? " is-active" : ""}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right rail — weather ─────────────────────────────────────────── */}
      <aside className="hero__rail">
        <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
          Today&apos;s weather
        </div>

        <div className="hero__rail-ring">
          {loading && !severity ? (
            <div
              className="skeleton"
              style={{ width: 210, height: 210, borderRadius: "50%" }}
            />
          ) : (
            <SeverityRing z={signedZ} label={zoneLabel} size={210} />
          )}
        </div>

        {severity ? (
          <>
            <div className="ed-display-italic hero__rail-head">
              {zoneHeadline(severity)}
            </div>
            <p className="ed-body hero__rail-blurb">{blurb(severity)}</p>
            <Link
              href={ctaHref(severity)}
              /* Inline marginTop:auto as a belt-and-braces guarantee in
                 case styled-jsx scoping ever fails to attach to the Link's
                 rendered <a>. The .hero__rail-cta CSS still drives the
                 rest of the styling. */
              style={{ marginTop: "auto" }}
              className="hero__rail-cta"
            >
              <span>{ctaLabel(severity)}</span>
              <span aria-hidden>→</span>
            </Link>
          </>
        ) : (
          <>
            <div className="ed-display-italic hero__rail-head">
              Reading the tape…
            </div>
            <p className="ed-body hero__rail-blurb">
              Computing the day&apos;s distribution from since-inception sessions.
            </p>
          </>
        )}
      </aside>

      <style jsx global>{`
        .hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--gap, 22px);
          padding: 22px 0 30px;
        }
        @media (min-width: 920px) {
          .hero--bonded {
            grid-template-columns: minmax(0, 1.85fr) minmax(280px, 0.95fr);
            align-items: stretch;
          }
        }

        .hero__main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .hero__head {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 560px) {
          .hero__head {
            grid-template-columns: 1fr auto;
            align-items: end;
          }
        }

        .hero__price {
          font-size: clamp(3rem, 8vw, 6.6rem);
          line-height: 0.92;
          letter-spacing: -0.035em;
          margin-top: 10px;
          color: var(--ink);
        }

        .hero__change {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .hero__track {
          min-width: 220px;
        }
        .hero__track-bar {
          position: relative;
          height: 6px;
          background: linear-gradient(
            to right,
            var(--stamp-soft),
            var(--paper-warm),
            var(--green-soft)
          );
          border: 1px solid var(--rule-soft);
          border-radius: 3px;
        }
        .hero__track-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--ink);
          border: 2px solid var(--paper);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .hero__track-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-mute);
        }

        .hero__chart {
          width: 100%;
          /* Taller on desktop so the chart reads as the headline visual,
             not a thin caption below the price. The right-rail weather card
             still grid-stretches to match — the CTA pushes to the bottom
             via margin-top:auto so growth doesn't add dead space. */
          height: clamp(100px, 16vw, 200px);
          color: var(--ink);
        }
        .hero__chart :global(svg) {
          height: 100% !important;
        }

        .hero__stats {
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr 1px auto;
          align-items: center;
          gap: 14px;
          padding: 18px 6px 4px;
          border-top: 1px solid var(--rule-soft);
        }
        @media (max-width: 720px) {
          .hero__stats {
            grid-template-columns: 1fr 1fr;
            gap: 18px 14px;
          }
          .hero__stat-sep {
            display: none;
          }
          .hero__tabs {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }
        }

        .hero__stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .hero__stat-val {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 22px;
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .hero__stat-sep {
          width: 1px;
          height: 36px;
          background: var(--rule-soft);
        }

        .hero__tabs {
          display: flex;
          gap: 2px;
          justify-content: flex-end;
        }
        .hero__tab {
          appearance: none;
          border: 0;
          padding: 8px 12px;
          border-radius: 8px;
          background: transparent;
          color: var(--ink-soft);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .hero__tab.is-active {
          background: var(--ink);
          color: var(--paper-light);
        }
        .hero__tab:not(.is-active):hover {
          background: var(--paper-warm);
        }

        /* Weather rail — content groups at the top, CTA anchors at the
           bottom via margin-top:auto. When the grid stretches the rail
           to match the (now taller) left column, the extra room sits in
           the gap between blurb and CTA rather than as dead space below
           the link. */
        .hero__rail {
          padding: 18px 20px 16px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: var(--radius, 18px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .hero__rail-ring {
          align-self: center;
          margin: 4px 0 2px;
        }
        .hero__rail-head {
          /* Bigger than before so the headline carries weight against the
             larger ring — the rail now reads top-to-bottom as one solid
             editorial block: ring (210) → italic headline → blurb → black CTA. */
          font-size: clamp(1.55rem, 2.4vw, 2rem);
          line-height: 1.1;
          color: var(--ink);
          margin: 6px 0 0;
        }
        .hero__rail-blurb {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.55;
          color: var(--ink-soft);
          max-width: 36ch;
        }
        /* Solid ink-filled CTA card. Anchored to the bottom of the rail
           via margin-top:auto so it acts as the closing element of the
           weather block — the inline-style fallback in JSX guarantees the
           anchor in case styled-jsx scoping ever fails to attach the
           jsx hash to Next.js Link's rendered <a>. */
        .hero__rail-cta {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 14px 18px;
          background: var(--ink);
          border: 1px solid var(--ink);
          border-radius: 12px;
          color: var(--paper-light);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.18s, transform 0.18s;
        }
        .hero__rail-cta:hover {
          background: var(--stamp);
          transform: translateX(3px);
        }
        .hero__rail-cta > span:last-child {
          color: var(--paper-light);
        }
      `}</style>
    </section>
  );
}
