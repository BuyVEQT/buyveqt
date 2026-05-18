"use client";

import { useMemo } from "react";
import { useVeqtData } from "@/lib/useVeqtData";
import { useRegions, type Region } from "@/lib/useRegions";
import { computeSeverity } from "@/lib/severity";

import HeroPriceCard from "./HeroPriceCard";
import WeatherCard from "./WeatherCard";
import RegionCarousel from "./RegionCarousel";
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
 * Round 4 home — dashboard-shaped layout against the new D2 system.
 *
 *  HeroPriceCard  →  WeatherCard
 *  RegionCarousel (mobile) / RegionGrid (desktop)
 *  HeatmapCard  →  InceptionBand
 *  ArticleStrip
 *
 * Two `useVeqtData` calls: one keyed to the period pill (hero sparkline)
 * and one pinned to "ALL" (severity + heatmap classification + inception
 * calc — all need the full distribution to mean anything).
 */
export default function HomeClient() {
  const hero = useVeqtData("1M");
  const full = useVeqtData("ALL");
  const { payload: regionsPayload, loading: regionsLoading } = useRegions();

  const orderedRegions = useMemo<Region[]>(() => {
    const rs = regionsPayload?.regions ?? [];
    return [...rs].sort(
      (a, b) =>
        REGION_ORDER.indexOf(a.ticker) - REGION_ORDER.indexOf(b.ticker)
    );
  }, [regionsPayload]);

  const leaderIdx = useMemo(() => leaderIndex(orderedRegions), [orderedRegions]);

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
        <HeroPriceCard
          data={hero.data}
          loading={hero.loading}
          period={hero.period}
          onPeriodChange={hero.setPeriod}
        />

        <WeatherCard reading={severity} loading={full.loading && !severity} />

        <div className="region-mobile">
          <RegionCarousel regions={orderedRegions} leaderIndex={leaderIdx} />
        </div>
        <div className="region-desktop">
          <RegionGrid regions={regionsLoading ? [] : orderedRegions} leaderIndex={leaderIdx} />
        </div>

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
        .region-mobile {
          display: block;
          /* Carousel escapes the page padding so cards can scroll flush to
             the viewport edges on small screens. */
          margin-left: -14px;
          margin-right: -14px;
        }
        .region-desktop {
          display: none;
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
          .region-mobile {
            display: none;
          }
          .region-desktop {
            display: block;
          }
          .two-up {
            grid-template-columns: 7fr 5fr;
          }
        }
      `}</style>
    </main>
  );
}
