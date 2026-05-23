"use client";

import { useEffect, useMemo } from "react";
import SectionHead from "@/components/ui/SectionHead";
import { useRegions, type Region } from "@/lib/useRegions";
import {
  useSleeveComposition,
  useSectorReturns,
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

  // Live composition exists — pair items with live returns when available.
  if (sleeve && sleeve.items.length > 0) {
    const live: SectorRow[] = sleeve.items
      .slice(0, 4)
      .map((item) => {
        const pct = lookupReturn(item.name, liveReturns);
        return pct === null
          ? null
          : { name: item.name, pct };
      })
      .filter((r): r is SectorRow => r !== null);
    if (live.length > 0) return live;
  }

  // Fallback: static snapshot from Q1 2026 design.
  return SLEEVE_SECTOR_SNAPSHOT_2026_Q1[ticker] ?? [];
}

export default function InsideRegionGrid() {
  const { payload: regionsPayload, loading: regionsLoading } = useRegions();
  const { payload: composition } = useSleeveComposition();
  const { payload: sectorReturns } = useSectorReturns();

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

  // Home page region cards deep-link to `/inside-veqt#VUN` etc. The browser's
  // native hash-scroll happens before the regions hook has resolved, so the
  // target div doesn't exist at that moment. Once `ordered` is populated and
  // the DOM has the anchor target, re-apply the hash scroll once.
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
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "0 4px 16px",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <SectionHead
          kicker="Today's sleeves"
          title="By region, by sector."
          size="md"
        />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--ink-mute)",
          }}
        >
          Sparkline shows the sleeve&rsquo;s last ninety sessions.
        </span>
      </div>

      {regionsLoading && ordered.length === 0 ? (
        <div className="inside-region-grid">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 280, borderRadius: 18 }}
            />
          ))}
        </div>
      ) : (
        <div className="inside-region-grid">
          {ordered.map((region) => (
            // Anchor target so the home page's RegionCards can deep-link to
            // `/inside-veqt#VUN` (etc.) and the user lands on the right region.
            // scrollMarginTop clears the sticky mobile TopBar.
            <div
              key={region.ticker}
              id={region.ticker}
              style={{ scrollMarginTop: 80 }}
            >
              <InsideRegionDetail
                region={region}
                sectors={sectorsByTicker.get(region.ticker) ?? []}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .inside-region-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 1024px) {
          .inside-region-grid {
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }
        }
      `}</style>
    </section>
  );
}
