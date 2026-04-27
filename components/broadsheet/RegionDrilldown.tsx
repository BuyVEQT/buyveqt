"use client";

import { useEffect, useState } from "react";
import { useRegions, type Region } from "@/lib/useRegions";
import {
  REGION_DRILL,
  type DrillRow,
  type RegionDrillReference,
} from "@/data/region-drilldown";

const ORDINAL = ["№ 01", "№ 02", "№ 03", "№ 04"];
// Bars never grow past 45% so the value labels in the empty half don't
// crash into the next column.
const MAX_BAR_PCT = 0.45;

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

function leaderIndex(items: { abs: number }[]): number {
  let bestIdx = 0;
  let bestAbs = -Infinity;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].abs > bestAbs) {
      bestAbs = items[i].abs;
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
}: RegionCardProps) {
  const [open, setOpen] = useState(true);

  // Default-open on desktop, default-collapsed on mobile.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setOpen(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
  const rowAbs = (drill?.rows ?? []).map((r) => Math.abs(r.pct));
  const rowMax = rowAbs.length > 0 ? Math.max(...rowAbs, 0.01) : 1;
  const drillLeaderIdx = drill
    ? leaderIndex(drill.rows.map((r) => ({ abs: Math.abs(r.pct) })))
    : -1;

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
        <span className="bs-region__ord" aria-hidden>
          {ORDINAL[ordinal - 1] ?? `№ ${pad2(ordinal)}`}
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
          <em>{drill?.drillNote ?? ""}</em>
        </h6>
        {(drill?.rows ?? []).map((row, idx) => {
          const w =
            (Math.abs(row.pct) / rowMax) * (MAX_BAR_PCT * 100);
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
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function RegionDrilldown() {
  const { payload, loading } = useRegions();
  const regions: Region[] = payload?.regions ?? [];

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

  // Sort regions to a deterministic order matching the mockup
  // (US, Canada, Intl Developed, Emerging) and find the leader.
  const ORDER = ["VUN", "VCN", "VIU", "VEE"];
  const ordered = [...regions].sort(
    (a, b) => ORDER.indexOf(a.ticker) - ORDER.indexOf(b.ticker)
  );

  const contribAbs = ordered.map((r) => Math.abs(r.contribution ?? 0));
  const leaderIdx = leaderIndex(contribAbs.map((a) => ({ abs: a })));
  const contribScale = contribAbs.reduce((m, x) => (x > m ? x : m), 0.01);

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
        {ordered.map((region, i) => (
          <RegionCard
            key={region.ticker}
            region={region}
            ordinal={i + 1}
            isLeader={i === leaderIdx}
            contribScale={contribScale}
            drill={REGION_DRILL.find((d) => d.ticker === region.ticker) ?? null}
          />
        ))}
      </div>

      <p className="bs-regions__footnote">
        Region-level returns and weights are live; sector and country rows
        below each card are reference allocations from the most recent
        Vanguard quarterly fact sheet, with daily moves illustrated for
        scale. Real-time sector attribution will land in a follow-up.
      </p>
    </section>
  );
}
