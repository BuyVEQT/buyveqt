"use client";

import { useMemo, useState } from "react";
import type { VeqtApiResponse, HistoricalDataPoint } from "@/lib/types";
import type { SeverityReading } from "@/lib/severity";
import type { Region } from "@/lib/useRegions";

import DuoChart from "./hero/DuoChart";
import FiftyTwoTrack from "./hero/FiftyTwoTrack";
import WeatherCard from "./hero/WeatherCard";
import PeriodStatsRibbon, {
  computePeriodStats,
  sliceHistoryForPeriod,
  periodSuffix,
  type HeroPeriod,
} from "./hero/PeriodStatsRibbon";
import TileStreak from "./hero/TileStreak";
import TileDistribution from "./hero/TileDistribution";
import TileSleeves from "./hero/TileSleeves";
import TileAlmanac from "./hero/TileAlmanac";
import TileStyles from "./hero/tileStyles";

export interface HeroTodayProps {
  data: VeqtApiResponse | null;
  loading: boolean;
  severity: SeverityReading | null;
  regions: readonly Region[];
}

/**
 * HeroToday — the "Editorial Almanac" hero for the home page.
 *
 * Replaces `HeroPriceCard` + `WeatherCard`. Single composition:
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │  Price block (price · change · 52w track · period sub)      │   Hybrid weather
 *   │                                                              │   (glyph + bell)
 *   ├──────────────────────────────────────────────────────────────┴───────────┤
 *   │  Duotone chart (green above period start, vermilion below)              │
 *   ├─────────────────────────────────────────────────────────────────────────┤
 *   │  {Period} return · Range · Typical day · [1M 3M 1Y 5Y ALL]              │
 *   ├─────────────────────────────────────────────────────────────────────────┤
 *   │  Streak · Distribution · Sleeve weather · On this day                   │
 *   └─────────────────────────────────────────────────────────────────────────┘
 *
 * Hero drives its own period state from a single ALL fetch (sliced
 * client-side). Below 880px the top stacks, ribbon collapses to a 2×2
 * grid, tiles drop to 2-up; below 520px tiles drop to 1-up.
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`.
 */
export default function HeroToday({
  data,
  loading,
  severity,
  regions,
}: HeroTodayProps) {
  const [period, setPeriod] = useState<HeroPeriod>("1Y");

  const historical = data?.historical ?? [];
  const quote = data?.quote ?? null;

  const slice = useMemo<readonly HistoricalDataPoint[]>(
    () => sliceHistoryForPeriod(historical, period),
    [historical, period]
  );

  const stats = useMemo(() => computePeriodStats(slice), [slice]);

  // Loading skeleton — only when we genuinely have no quote yet.
  if (loading && !quote) {
    return (
      <section className="heroC heroC--loading">
        <div className="heroC__top">
          <div className="heroC__price-block">
            <div
              className="skeleton"
              style={{ height: 12, width: 200, borderRadius: 4 }}
            />
            <div
              className="skeleton"
              style={{
                height: 80,
                width: "60%",
                marginTop: 18,
                borderRadius: 8,
              }}
            />
            <div
              className="skeleton"
              style={{ height: 18, width: 240, marginTop: 18, borderRadius: 4 }}
            />
            <div
              className="skeleton"
              style={{ height: 60, marginTop: 32, borderRadius: 6 }}
            />
          </div>
          <div className="heroC__weather-block">
            <div
              className="skeleton"
              style={{
                height: 380,
                width: "100%",
                borderRadius: 16,
              }}
            />
          </div>
        </div>
        <div
          className="skeleton heroC__chart-skel"
          style={{ borderRadius: 6 }}
          aria-label="Loading chart"
        />
        <HeroStyles />
      </section>
    );
  }

  if (!quote || !data) {
    return null;
  }

  const up = quote.changePercent >= 0;
  const periodRet = stats?.returnPct ?? 0;
  const suffix = periodSuffix(period);

  return (
    <section className="heroC">
      {/* Top — price block + hybrid weather card */}
      <div className="heroC__top">
        <div className="heroC__price-block">
          <div className="ed-label heroC__ticker-row">
            <span className="heroC__live-dot" aria-hidden />
            VEQT.TO · Vanguard All-Equity ETF · TSX
          </div>

          <div className="heroC__price ed-display ed-numerals">
            ${quote.price.toFixed(2)}
          </div>

          <div className="heroC__change">
            <span className={`heroC__pill ${up ? "is-up" : "is-down"}`}>
              {up ? "↑" : "↓"} {up ? "+" : "−"}
              {Math.abs(quote.changePercent).toFixed(2)}%
            </span>
            <span className="heroC__change-aux ed-numerals">
              {up ? "+" : "−"}${Math.abs(quote.change).toFixed(2)} today · vs. $
              {quote.previousClose.toFixed(2)} prev close
            </span>
          </div>

          <FiftyTwoTrack quote={quote} />

          <div className="heroC__sub ed-display-italic">
            <span
              className="heroC__sub-num ed-numerals"
              style={{
                color: periodRet >= 0 ? "var(--green)" : "var(--stamp)",
              }}
            >
              {periodRet >= 0 ? "+" : "−"}
              {Math.abs(periodRet).toFixed(1)}%
            </span>{" "}
            over the {suffix}.
          </div>
        </div>

        {severity && (
          <div className="heroC__weather-block">
            <WeatherCard quote={quote} severity={severity} />
          </div>
        )}
      </div>

      {/* Duotone chart */}
      <div className="heroC__chartwrap">
        <DuoChart data={slice} width={920} height={220} />
      </div>

      {/* Period stats ribbon */}
      {stats && (
        <PeriodStatsRibbon
          stats={stats}
          period={period}
          onPeriodChange={setPeriod}
        />
      )}

      {/* Companion tiles */}
      <div className="heroC__tiles">
        <TileStreak historical={historical} />
        {severity && (
          <TileDistribution
            historical={historical}
            severity={severity}
            quote={quote}
          />
        )}
        {regions.length > 0 && <TileSleeves regions={regions} />}
        <TileAlmanac historical={historical} />
      </div>

      <TileStyles />
      <HeroStyles />
    </section>
  );
}

/**
 * Hero shell styles. Class names mirror the prototype's `.heroC*`
 * pattern so the spec maps 1:1 (and `RegionGrid` etc. keep using their
 * own `.ledger*` prefix without collision).
 */
function HeroStyles() {
  return (
    <style jsx global>{`
      .heroC {
        padding: 22px 0 30px;
        display: flex;
        flex-direction: column;
        gap: 22px;
      }
      .heroC__top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(300px, auto);
        gap: 36px;
        align-items: stretch;
        padding-bottom: 22px;
        border-bottom: 1px solid var(--rule-soft);
      }
      .heroC__price-block {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-width: 0;
      }
      .heroC__ticker-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .heroC__live-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--stamp);
        animation: heroC-pulse 2.4s ease-in-out infinite;
      }
      @keyframes heroC-pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }
      .heroC__price {
        font-size: clamp(3rem, 8vw, 6.4rem);
        line-height: 0.9;
        letter-spacing: -0.035em;
        margin-top: 10px;
        color: var(--ink);
      }
      .heroC__change {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .heroC__pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 999px;
        font-family: var(--font-sans);
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.02em;
      }
      .heroC__pill.is-up {
        background: var(--green-soft);
        color: var(--green);
      }
      .heroC__pill.is-down {
        background: var(--stamp-soft);
        color: var(--stamp);
      }
      .heroC__change-aux {
        font-family: var(--font-sans);
        font-size: 13px;
        color: var(--ink-mute);
      }
      .heroC__sub {
        font-size: clamp(1.1rem, 1.6vw, 1.45rem);
        color: var(--ink-soft);
        margin-top: 14px;
        max-width: 36ch;
      }
      .heroC__sub-num {
        font-family: var(--font-display);
        font-weight: 600;
        font-style: normal;
      }
      .heroC__weather-block {
        min-width: 300px;
        display: flex;
      }
      .heroC__weather-block > * {
        flex: 1;
      }
      .heroC__chartwrap {
        height: clamp(180px, 23vw, 240px);
        color: var(--ink);
      }
      .heroC__chart-skel {
        height: clamp(180px, 23vw, 240px);
      }

      @media (max-width: 880px) {
        .heroC {
          padding: 14px 0 18px;
          gap: 16px;
        }
        .heroC__top {
          grid-template-columns: 1fr;
          gap: 18px;
          padding-bottom: 16px;
        }
        .heroC__weather-block {
          min-width: 0;
        }
        .heroC__change-aux {
          font-size: 12px;
        }
        .heroC__chartwrap {
          /* Slightly taller floor on mobile so labels in the HTML overlay
             have breathing room above and below the chart line. */
          height: clamp(200px, 50vw, 240px);
        }
      }
      @media (max-width: 520px) {
        .heroC__sub {
          font-size: 1.05rem;
        }
        .heroC__change {
          gap: 8px;
        }
      }
    `}</style>
  );
}
