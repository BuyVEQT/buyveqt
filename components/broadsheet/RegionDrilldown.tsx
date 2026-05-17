"use client";

import { useEffect, useMemo, useState } from "react";
import { useRegions, type Region } from "@/lib/useRegions";
import {
  useSleeveComposition,
  useSectorReturns,
} from "@/lib/useSleeveAttribution";
import {
  REGION_DRILL,
  type RegionDrillReference,
} from "@/data/region-drilldown";
import type { SleeveCompositionResponse } from "@/app/api/sleeve-composition/route";
import type { SectorReturnsResponse } from "@/app/api/sector-returns/route";

const ORDINAL = ["№ 01", "№ 02", "№ 03", "№ 04"];
// Bars never grow past 45% so the value labels in the empty half don't
// crash into the next column.
const MAX_BAR_PCT = 0.45;
const REGION_ORDER = ["VUN", "VCN", "VIU", "VEE"];
const DRILL_BY_TICKER = new Map<string, RegionDrillReference>(
  REGION_DRILL.map((d) => [d.ticker, d])
);

/** Pick the sector-returns map that matches a sleeve's drill scope. */
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

/** Tolerant name match — "Tech" ↔ "Technology", "U.K." ↔ "United Kingdom". */
function normalizeRowName(s: string): string {
  return s.toLowerCase().replace(/\W+/g, "");
}

/** Find today's return for a drill row by matching against the live map. */
function lookupReturn(
  rowName: string,
  liveReturns: Record<string, number>
): number | null {
  const target = normalizeRowName(rowName);
  for (const [key, value] of Object.entries(liveReturns)) {
    const k = normalizeRowName(key);
    if (k === target || k.startsWith(target) || target.startsWith(k)) {
      return value;
    }
  }
  return null;
}

interface ResolvedRow {
  name: string;
  weight: number;
  pct: number;
  isLive: boolean;
}

/**
 * Resolve the drill rows we'll render for a sleeve, preferring live data
 * but holding the hardcoded fallback rows when the API is silent. The
 * `isLive` flag drives whether the row gets a "live" or "reference"
 * affordance in the UI.
 */
function buildDrillRows(
  ticker: string,
  composition: SleeveCompositionResponse | null,
  returns: SectorReturnsResponse | null
): { rows: ResolvedRow[]; anyLive: boolean } {
  const liveReturns = returnsForSleeve(ticker, returns);
  const sleeve = composition?.sleeves[ticker];
  const fallback = DRILL_BY_TICKER.get(ticker);

  // When we have live composition, use it (weights are integer % already).
  // Otherwise the hardcoded drill rows are our weights source.
  const weightSource =
    sleeve && sleeve.items.length > 0
      ? sleeve.items
      : (fallback?.rows ?? []).map((r) => ({ name: r.name, weight: r.weight }));

  const rows: ResolvedRow[] = weightSource.map((item) => {
    const live = lookupReturn(item.name, liveReturns);
    if (live !== null) {
      return { name: item.name, weight: item.weight, pct: live, isLive: true };
    }
    // Fall back to the hardcoded illustrative % when the live feed misses
    // (e.g. a sector we don't have a proxy ETF for).
    const fallbackRow = fallback?.rows.find(
      (r) => normalizeRowName(r.name) === normalizeRowName(item.name)
    );
    return {
      name: item.name,
      weight: item.weight,
      pct: fallbackRow?.pct ?? 0,
      isLive: false,
    };
  });

  const anyLive = rows.some((r) => r.isLive);
  return { rows, anyLive };
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function fmtPct(n: number, digits = 2): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function fmtPp(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}pp`;
}

function leaderIndex(values: number[]): number {
  let bestIdx = 0;
  let bestAbs = -Infinity;
  for (let i = 0; i < values.length; i += 1) {
    const abs = Math.abs(values[i]);
    if (abs > bestAbs) {
      bestAbs = abs;
      bestIdx = i;
    }
  }
  return bestIdx;
}

interface RegionCardProps {
  region: Region;
  ordinal: number;
  isLeader: boolean;
  contribScale: number; // max |contribution| across the 4 regions
  drill: RegionDrillReference | null;
  drillRows: ResolvedRow[];
  drillAllLive: boolean;
  isMobile: boolean;
}

function DirectionalBar({
  pct,
  scale,
  isLead,
  width,
}: {
  pct: number;
  scale: number;
  isLead: boolean;
  width: number;
}) {
  const isUp = pct >= 0;
  return (
    <div className="bs-region__dbar">
      <span className="bs-region__dbar-axis" />
      <span
        className={`bs-region__dbar-fill ${isUp ? "is-up" : "is-dn"} ${
          isLead ? "is-lead" : ""
        }`}
        style={{ width: `${width}%` }}
      />
      <span className={`bs-region__dbar-num ${isUp ? "is-up" : "is-dn"}`}>
        {fmtPct(pct)}
      </span>
    </div>
  );
}

function RegionCard({
  region,
  ordinal,
  isLeader,
  contribScale,
  drill,
  drillRows,
  drillAllLive,
  isMobile,
}: RegionCardProps) {
  // Default-open on every viewport. The accordion behavior is opt-in for users
  // who want to collapse a card; nothing is hidden by default so the data is
  // always visible without an extra tap.
  const [open, setOpen] = useState(true);

  const pct = region.changePercent ?? 0;
  const contribution = region.contribution ?? 0;
  const isUp = pct >= 0;

  const slug = drill?.slug ?? region.ticker.toLowerCase().replace(".to", "");
  const fullName = region.fullName ?? region.label ?? region.region;

  // Region contribution bar width — scale to the largest absolute pp impact
  // across the four sleeves so the visual ranks at a glance.
  const contribWidth =
    contribScale > 0
      ? Math.min(MAX_BAR_PCT * 100, (Math.abs(contribution) / contribScale) * MAX_BAR_PCT * 100)
      : 0;

  // Per-row scale: max |pct| within this region's drill rows.
  const rowAbs = drillRows.map((r) => Math.abs(r.pct));
  const rowMax = rowAbs.length > 0 ? Math.max(...rowAbs, 0.01) : 1;
  const drillLeaderIdx =
    drillRows.length > 0 ? leaderIndex(drillRows.map((r) => r.pct)) : -1;

  return (
    <article
      id={`regions-${slug}`}
      className={`bs-region ${isLeader ? "is-leader" : ""}`}
    >
      <button
        type="button"
        className="bs-region__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`regions-${slug}-body`}
      >
        <span className="bs-region__name">
          {region.label ?? region.region}
        </span>
        <span className="bs-region__head-right">
          <span className="bs-region__ord" aria-hidden>
            {ORDINAL[ordinal - 1] ?? `№ ${pad2(ordinal)}`}
          </span>
          {isMobile && (
            <span
              className={`bs-region__chev ${open ? "is-open" : ""}`}
              aria-hidden
            >
              ▾
            </span>
          )}
        </span>
      </button>
      <p className="bs-region__full">
        {fullName}
        <span className="bs-region__tic">{region.ticker.replace(".TO", "")}</span>
      </p>

      <div className={`bs-region__pct ${isUp ? "is-up" : "is-dn"}`}>
        <span className="bs-region__pct-arr" aria-hidden>
          {isUp ? "▲" : "▼"}
        </span>{" "}
        {fmtPct(pct)}
      </div>
      <p className="bs-region__stat">
        <span className="bs-region__stat-num">{region.weight}%</span> of VEQT ·
        contributed{" "}
        <span
          className={`bs-region__stat-pp ${
            contribution >= 0 ? "is-up" : "is-dn"
          }`}
        >
          {fmtPp(contribution)}
        </span>{" "}
        to the day
      </p>
      <div className="bs-region__contrib">
        <span className="bs-region__contrib-axis" />
        <span
          className={`bs-region__contrib-fill ${
            contribution >= 0 ? "is-up" : "is-dn"
          }`}
          style={{ width: `${contribWidth}%` }}
        />
      </div>

      <div
        id={`regions-${slug}-body`}
        className={`bs-region__drill ${open ? "is-open" : ""}`}
        hidden={!open}
      >
        <h6 className="bs-region__drill-head">
          <span>{drill?.drillLabel ?? "Drilldown"}</span>
          <em>
            {drill?.drillNote ?? ""}
            {drillAllLive ? "" : drillRows.length > 0 ? " · reference" : ""}
          </em>
        </h6>
        {drillRows.length > 0 && (
          <div className="bs-region__drow bs-region__drow--head" aria-hidden>
            <span className="bs-region__row-name">
              <span style={{ opacity: 0.55 }}>Wt · today</span>
            </span>
            <span />
            <span
              className="bs-region__dcontrib"
              style={{ opacity: 0.55 }}
            >
              To sleeve
            </span>
          </div>
        )}
        {drillRows.map((row, idx) => {
          const w =
            (Math.abs(row.pct) / rowMax) * (MAX_BAR_PCT * 100);
          // Contribution to this sleeve's daily move (in pp). `weight`
          // is already an integer %; sector return is in %, so the
          // weighted contribution is (weight/100 × pct), which yields
          // pp. e.g. 31% × −1.81% = −0.56pp.
          const contribution = (row.weight / 100) * row.pct;
          const contribStr = fmtPp(contribution);
          const contribClass =
            Math.abs(contribution) < 0.005
              ? ""
              : contribution >= 0
                ? "is-up"
                : "is-dn";
          return (
            <div className="bs-region__drow" key={`${row.name}-${idx}`}>
              <span className="bs-region__row-name">
                {row.name}
                <span className="bs-region__row-wt">{row.weight}%</span>
              </span>
              <DirectionalBar
                pct={row.pct}
                scale={rowMax}
                isLead={idx === drillLeaderIdx}
                width={w}
              />
              <span
                className={`bs-region__dcontrib ${contribClass}`}
                title={`${row.weight}% × ${fmtPct(row.pct)} = ${contribStr} to ${region.label ?? region.region}`}
              >
                {contribStr}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function RegionDrilldown() {
  const { payload, loading } = useRegions();
  const { payload: composition } = useSleeveComposition();
  const { payload: sectorReturns } = useSectorReturns();
  const regions: Region[] = payload?.regions ?? [];

  // Single matchMedia listener shared across all four cards.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { ordered, leaderIdx, contribScale } = useMemo(() => {
    if (regions.length === 0) {
      return { ordered: [] as Region[], leaderIdx: -1, contribScale: 0.01 };
    }
    const ord = [...regions].sort(
      (a, b) => REGION_ORDER.indexOf(a.ticker) - REGION_ORDER.indexOf(b.ticker)
    );
    const contribs = ord.map((r) => r.contribution ?? 0);
    return {
      ordered: ord,
      leaderIdx: leaderIndex(contribs),
      contribScale: contribs.reduce((m, x) => (Math.abs(x) > m ? Math.abs(x) : m), 0.01),
    };
  }, [regions]);

  // Per-sleeve drill rows — composition (weights) joined to returns.
  const drillsByTicker = useMemo(() => {
    const out = new Map<string, { rows: ResolvedRow[]; anyLive: boolean }>();
    for (const r of ordered) {
      out.set(r.ticker, buildDrillRows(r.ticker, composition, sectorReturns));
    }
    return out;
  }, [ordered, composition, sectorReturns]);

  const allSleevesLive = ordered.every(
    (r) => drillsByTicker.get(r.ticker)?.anyLive ?? false
  );
  const sectorReturnsFetchedAt = sectorReturns?.fetchedAt ?? null;

  if (loading || regions.length === 0) {
    return (
      <section className="bs-regions">
        <header className="bs-regions__head">
          <div>
            <h3 className="bs-regions__h3">
              The four <em>ETFs that make VEQT.</em>
            </h3>
            <p className="bs-regions__deck">
              VEQT holds nothing directly. It owns four other Vanguard funds
              — one per region — in fixed weights. Today&rsquo;s move is the
              weight-blended sum of theirs.
            </p>
          </div>
        </header>
        <div className="bs-regions__grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bs-region">
              <div className="skeleton h-[28px] w-2/3 mb-3" />
              <div className="skeleton h-[16px] w-1/2 mb-4" />
              <div className="skeleton h-[44px] w-1/3 mb-3" />
              <div className="skeleton h-[12px] w-3/4 mb-2" />
              <div className="skeleton h-[200px] w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bs-regions">
      <header className="bs-regions__head">
        <div>
          <h3 className="bs-regions__h3">
            The four <em>ETFs that make VEQT.</em>
          </h3>
          <p className="bs-regions__deck">
            VEQT holds nothing directly. It owns four other Vanguard funds —
            one per region — in fixed weights. Today&rsquo;s move is the
            weight-blended sum of theirs.
          </p>
        </div>
      </header>

      <div className="bs-regions__grid">
        {ordered.map((region, i) => {
          const drillBundle = drillsByTicker.get(region.ticker) ?? {
            rows: [] as ResolvedRow[],
            anyLive: false,
          };
          return (
            <RegionCard
              key={region.ticker}
              region={region}
              ordinal={i + 1}
              isLeader={i === leaderIdx}
              contribScale={contribScale}
              drill={DRILL_BY_TICKER.get(region.ticker) ?? null}
              drillRows={drillBundle.rows}
              drillAllLive={drillBundle.anyLive}
              isMobile={isMobile}
            />
          );
        })}
      </div>

      <p className="bs-regions__footnote">
        Region-level returns and weights are live. Sector and country
        rows use sector/country index ETFs as proxies for today&rsquo;s
        move — close to each sleeve&rsquo;s actual basket but not
        identical. Rows tagged &ldquo;reference&rdquo; are quarterly
        fact-sheet values where a live proxy isn&rsquo;t available.
        {sectorReturnsFetchedAt && (
          <>
            {" "}
            <span style={{ opacity: 0.7 }}>
              Updated{" "}
              {new Date(sectorReturnsFetchedAt).toLocaleTimeString("en-CA", {
                hour: "numeric",
                minute: "2-digit",
              })}
              {" "}ET.
            </span>
          </>
        )}
        {!allSleevesLive && ordered.length > 0 && (
          <span style={{ opacity: 0.7 }}> Some rows show reference data.</span>
        )}
      </p>
    </section>
  );
}
