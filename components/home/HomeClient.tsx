"use client";

import { useEffect, useMemo } from "react";
import { useVeqtData } from "@/lib/useVeqtData";
import {
  useRegions,
  type Region,
  type RegionsPayload,
} from "@/lib/useRegions";
import type { VeqtApiResponse } from "@/lib/types";
import { computeSeverity } from "@/lib/severity";
import { useMarketClock } from "@/lib/market-clock";

import HeroToday, { HeroFactsMobile } from "./HeroToday";
import ConditionsBand from "./ConditionsBand";
import QuietDayStrip from "./QuietDayStrip";
import DuoChart from "./hero/DuoChart";
import RegionGrid from "./RegionGrid";
import HeatmapCard from "./HeatmapCard";
import InceptionBand from "./InceptionBand";
import ArticleStrip from "./ArticleStrip";
import Closer from "./Closer";

const REGION_ORDER = ["VUN", "VCN", "VIU", "VEE"];

function leaderIndex(regions: readonly Region[]): number {
  if (regions.length === 0) return -1;
  let best = -1;
  let bestAbs = -Infinity;
  regions.forEach((r, i) => {
    const c = r.contribution;
    if (c === null || c === undefined || !Number.isFinite(c)) return;
    const abs = Math.abs(c);
    if (abs > bestAbs) {
      bestAbs = abs;
      best = i;
    }
  });
  return best;
}

/**
 * The Instrument — home page composition (June 2026 redesign).
 *
 * A Swiss-poster instrument panel: white page, Archivo grotesk, ink rules,
 * red spent only on signal. Module order per the handoff artboard 3a:
 *
 *   HeroToday       — price poster + chip + micro-facts + facts column
 *   ConditionsBand  — seven-state weather: glyph · verdict · ruler gauge ·
 *                     week strip · verdict rail
 *   DuoChart        — ink line chart + drag-to-scrub + $10,000 what-if row
 *   RegionGrid      — four-sleeve ledger (leader + followers)
 *   two-up          — HeatmapCard (session board) | InceptionBand (almanac)
 *   ArticleStrip    — reading order, in three parts
 *   Closer          — "You've seen the number." + THE DAILY NOTE
 *
 * On P98+ days the page prints an edition *once that session has closed*:
 * data-ins-edition="red" (rally) tints the masthead/rules/chart line;
 * "ink" (gale) inverts the page via the --ins-* token overrides in
 * globals.css. Applied while mounted only, so other routes are untouched
 * until the skin extends to them.
 */
export default function HomeClient({
  initialData = null,
  initialRegions = null,
}: {
  /** Server-rendered payloads (app/page.tsx, ISR every 5 min). The client
      stores refetch fresh data on mount; these keep the first paint —
      server HTML and hydration alike — fully populated so nothing shifts.
      Null (a failed server fetch) degrades to the old skeleton behavior. */
  initialData?: VeqtApiResponse | null;
  initialRegions?: RegionsPayload | null;
}) {
  const full = useVeqtData("ALL");
  const { payload: liveRegionsPayload } = useRegions();

  const data = full.data ?? initialData;
  const loading = full.loading && !data;
  const regionsPayload = liveRegionsPayload ?? initialRegions;

  const orderedRegions = useMemo<Region[]>(() => {
    const rs = regionsPayload?.regions ?? [];
    return [...rs].sort(
      (a, b) =>
        REGION_ORDER.indexOf(a.ticker) - REGION_ORDER.indexOf(b.ticker)
    );
  }, [regionsPayload]);

  const leaderIdx = useMemo(
    () => leaderIndex(orderedRegions),
    [orderedRegions]
  );

  const severity = useMemo(() => {
    if (!data?.quote || !data.historical) return null;
    return computeSeverity(data.historical, data.quote.changePercent);
  }, [data]);

  // Editions trigger at the close only — intraday stays live (handoff).
  // A P98 move shows up immediately in the glyph, the verdict rail and the
  // gauge, because that is a live reading of a live tape. The page-level
  // edition ink is a different claim: it says the session is *on the
  // record*, and an intraday −3% that closes at −1.4% never was. So the
  // ink waits for the bell.
  //
  // "Closed" is the whole gate: every closed window holds a completed
  // session's quote — after 16:00 it is today's close, before 09:30 (and
  // all weekend, and on a holiday) it is the previous close. There is no
  // closed moment whose latest quote is provisional.
  const clock = useMarketClock();
  const edition =
    clock?.phase === "closed" ? severity?.edition ?? null : null;
  useEffect(() => {
    const root = document.documentElement;
    if (edition) {
      root.setAttribute("data-ins-edition", edition);
    } else {
      root.removeAttribute("data-ins-edition");
    }
    return () => {
      root.removeAttribute("data-ins-edition");
    };
  }, [edition]);

  const history = data?.historical ?? [];
  const quote = data?.quote ?? null;
  const changePercent = quote?.changePercent ?? null;

  return (
    <main className="ins-root ins-home">
      <div className="ins-page">
        {/* Visually hidden h1 — the poster price is the visual headline,
            but crawlers and screen readers need a top-level heading. */}
        <h1
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: 0,
          }}
        >
          BuyVEQT — VEQT.TO live price, today&apos;s market weather, regional
          sleeves, and the session board for Canadian passive investors.
        </h1>

        <HeroToday data={data} loading={loading} severity={severity} />

        <ConditionsBand severity={severity} history={history} quote={quote} />

        {/* Quiet-day strip, directly under the conditions band.
            Renders itself away on surge/squall/rally/gale — the band's
            weather presence owns those days. Reads the props this
            component already holds — no extra fetch. */}
        <QuietDayStrip severity={severity} history={history} quote={quote} />

        {/* Phones only — the 3a mobile artboard orders the facts grid
            between the conditions band and the chart. */}
        <HeroFactsMobile data={data} severity={severity} />

        <DuoChart history={history} loading={loading} />

        <RegionGrid
          regions={orderedRegions}
          leaderIndex={leaderIdx}
          fundChangePercent={changePercent}
        />

        <div className="ins-two-up">
          <HeatmapCard
            history={history}
            loading={loading && history.length === 0}
            todayChangePercent={changePercent}
          />
          <InceptionBand history={history} quote={quote} loading={loading} />
        </div>

        <ArticleStrip />

        <Closer changePercent={changePercent} />
      </div>

      <style jsx>{`
        .ins-home {
          background: var(--ins-paper);
          min-height: 100dvh;
          color: var(--ins-ink);
          font-family: var(--ins-font);
        }
        .ins-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 40px;
        }
        .ins-two-up {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 40px;
          align-items: stretch;
        }

        @media (max-width: 960px) {
          .ins-two-up {
            grid-template-columns: 1fr;
            gap: 26px;
          }
        }
        @media (max-width: 640px) {
          .ins-page {
            gap: 26px;
            padding: 0 20px 28px;
          }
        }
      `}</style>
    </main>
  );
}
