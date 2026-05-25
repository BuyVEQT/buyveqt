"use client";

import { useEffect, useMemo } from "react";
import { useRegions, type Region } from "@/lib/useRegions";
import {
  useSleeveComposition,
  useSectorReturns,
  useSleeveTopHoldings,
} from "@/lib/useSleeveAttribution";
import type { SleeveCompositionResponse } from "@/app/api/sleeve-composition/route";
import type { SectorReturnsResponse } from "@/app/api/sector-returns/route";
import { SLEEVE_SECTOR_SNAPSHOT_2026_Q1 } from "@/data/sleeve-sector-snapshot-2026-q1";
import InsideRegionDetail from "./InsideRegionDetail";

const REGION_ORDER = ["VUN", "VCN", "VIU", "VEE"];

interface SectorRow {
  name: string;
  pct: number;
}

/** Pick the live sector / country returns map for a given sleeve. */
function returnsForSleeve(
  ticker: string,
  returns: SectorReturnsResponse | null
): Record<string, number> {
  if (!returns) return {};
  switch (ticker) {
    case "VUN":
      return returns.usSectors;
    case "VCN":
      return returns.caSectors;
    case "VIU":
      return returns.intlCountries;
    case "VEE":
      return returns.emCountries;
    default:
      return {};
  }
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/\W+/g, "");
}

function lookupReturn(
  rowName: string,
  liveReturns: Record<string, number>
): number | null {
  const target = normalizeName(rowName);
  for (const [key, value] of Object.entries(liveReturns)) {
    const k = normalizeName(key);
    if (k === target || k.startsWith(target) || target.startsWith(k)) {
      return value;
    }
  }
  return null;
}

/**
 * Resolve the 4 sector rows for a sleeve. Prefers the live composition
 * (joined to live sector returns) over the static snapshot — but falls back
 * cleanly when the hooks haven't returned anything yet.
 */
function buildSleeveSectors(
  ticker: string,
  composition: SleeveCompositionResponse | null,
  returns: SectorReturnsResponse | null
): SectorRow[] {
  const liveReturns = returnsForSleeve(ticker, returns);
  const sleeve = composition?.sleeves[ticker];

  if (sleeve && sleeve.items.length > 0) {
    const live: SectorRow[] = sleeve.items
      .slice(0, 4)
      .map((item) => {
        const pct = lookupReturn(item.name, liveReturns);
        return pct === null ? null : { name: item.name, pct };
      })
      .filter((r): r is SectorRow => r !== null);
    if (live.length > 0) return live;
  }

  return SLEEVE_SECTOR_SNAPSHOT_2026_Q1[ticker] ?? [];
}

export default function InsideRegionGrid() {
  const { payload: regionsPayload, loading: regionsLoading } = useRegions();
  const { payload: composition } = useSleeveComposition();
  const { payload: sectorReturns } = useSectorReturns();
  const topHoldingsByTicker = useSleeveTopHoldings();

  const ordered = useMemo<Region[]>(() => {
    const rs = regionsPayload?.regions ?? [];
    return [...rs].sort(
      (a, b) => REGION_ORDER.indexOf(a.ticker) - REGION_ORDER.indexOf(b.ticker)
    );
  }, [regionsPayload]);

  const sectorsByTicker = useMemo(() => {
    const out = new Map<string, SectorRow[]>();
    for (const r of ordered) {
      out.set(r.ticker, buildSleeveSectors(r.ticker, composition, sectorReturns));
    }
    return out;
  }, [ordered, composition, sectorReturns]);

  // Home page region cards deep-link to `/inside-veqt#VUN` etc. Re-apply
  // hash scroll once `ordered` is populated and the DOM has the anchor target.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ordered.length === 0) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    if (!REGION_ORDER.includes(hash)) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [ordered]);

  return (
    <section className="ird-grid-section">
      {/* V2 section header: ed-stamp kicker + ed-display h2 with italic em */}
      <div className="ird-grid-section__head">
        <div>
          <div className="ed-stamp">Today&rsquo;s sleeves</div>
          <h2 className="ed-display ird-grid-section__h2">
            By region,{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>by sector.</em>
          </h2>
        </div>
        <p className="ed-caption ird-grid-section__deck">
          Four self-contained dossiers — what each sleeve holds, how it moved
          today, and which sectors carried it.
        </p>
      </div>

      <div className="rule-thick" />

      {regionsLoading && ordered.length === 0 ? (
        <div className="ird-grid">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 380, borderRadius: 18 }}
            />
          ))}
        </div>
      ) : (
        <div className="ird-grid">
          {ordered.map((region) => (
            <InsideRegionDetail
              key={region.ticker}
              region={region}
              sectors={sectorsByTicker.get(region.ticker) ?? []}
              topHoldings={topHoldingsByTicker.get(region.ticker) ?? []}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .ird-grid-section {
          padding: 30px 0 14px;
        }
        .ird-grid-section__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .ird-grid-section__h2 {
          font-size: clamp(2rem, 3.4vw, 2.5rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 6px 0 0;
        }
        .ird-grid-section__deck {
          flex: 0 1 380px;
          max-width: 380px;
          font-size: 13px;
        }
        .ird-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--gap, 14px);
          margin-top: 18px;
        }
        @media (min-width: 980px) {
          .ird-grid {
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }
        }
      `}</style>
    </section>
  );
}
