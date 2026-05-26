"use client";

import { useMemo } from "react";
import { useVeqtData } from "@/lib/useVeqtData";
import { useRegions, type Region } from "@/lib/useRegions";
import { computeSeverity } from "@/lib/severity";

import HeroToday from "./HeroToday";
import RegionGrid from "./RegionGrid";
import HeatmapCard from "./HeatmapCard";
import InceptionBand from "./InceptionBand";
import ArticleStrip from "./ArticleStrip";

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
 * Round 4 home V2 — Editorial Almanac hero + four-sleeves + session board + Almanac + course.
 *
 *  HeroToday        — price + 52w track + duotone chart + hybrid weather card
 *                     + period stats ribbon + 4 companion tiles
 *  RegionGrid       — leader + followers (handles mobile internally)
 *  two-up           — HeatmapCard (calendar session board) | InceptionBand (Almanac)
 *  ArticleStrip     — editor column + three course rows
 *
 * The hero drives its own period state from a single `useVeqtData("ALL")`
 * fetch and slices client-side — no separate period-keyed fetch.
 */
export default function HomeClient() {
  const full = useVeqtData("ALL");
  const { payload: regionsPayload, loading: regionsLoading } = useRegions();

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
    if (!full.data?.quote || !full.data.historical) return null;
    return computeSeverity(full.data.historical, full.data.quote.changePercent);
  }, [full.data]);

  return (
    <main
      style={{
        background: "var(--paper)",
        minHeight: "100dvh",
        color: "var(--ink)",
      }}
    >
      <div className="home-stack">
        {/* Visually hidden h1 — the dashboard layout has no natural display
            headline, but search engines and screen readers need a top-level
            heading to identify the page. */}
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
          BuyVEQT — VEQT.TO live price, regional sleeves, and weather signal
          for Canadian passive investors.
        </h1>

        {/* Editorial Almanac hero — price · duotone chart · weather card · tiles */}
        <HeroToday
          data={full.data}
          loading={full.loading}
          severity={severity}
          regions={regionsLoading ? [] : orderedRegions}
        />

        {/* Region sleeves — leader + followers (handles mobile internally) */}
        <RegionGrid
          regions={regionsLoading ? [] : orderedRegions}
          leaderIndex={leaderIdx}
        />

        {/* Two-up: session-board calendar + Almanac (dark band) */}
        <div className="two-up">
          <HeatmapCard
            history={full.data?.historical ?? []}
            loading={full.loading && (full.data?.historical?.length ?? 0) === 0}
          />
          <InceptionBand
            history={full.data?.historical ?? []}
            quote={full.data?.quote ?? null}
            loading={full.loading}
          />
        </div>

        <ArticleStrip />
      </div>

      <style jsx>{`
        .home-stack {
          display: flex;
          flex-direction: column;
          gap: 22px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 14px 40px;
        }
        .two-up {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
        }

        @media (min-width: 1024px) {
          .home-stack {
            gap: 28px;
            padding: 32px 26px 48px;
          }
          .two-up {
            grid-template-columns: 7fr 5fr;
          }
        }
      `}</style>
    </main>
  );
}
