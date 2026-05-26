"use client";

import { useEffect, useState } from "react";
import type { Region } from "@/lib/useRegions";

interface TileSleevesProps {
  regions: readonly Region[];
}

/**
 * Sleeve weather — a 2×2 grid of mini compass-needle gauges, one per
 * region (VUN / VCN / VIU / VEE). Each needle rotates from straight-up
 * to ±intensity·90° where intensity = |Δ%| / max(|Δ%|). Green for up,
 * vermilion for down. Needles animate on mount with staggered delays.
 *
 * Hover-reveal detail panel shows total contribution today + a 4-up
 * breakdown of each sleeve's contribution in pp.
 */
export default function TileSleeves({ regions }: TileSleevesProps) {
  // Only consider regions with usable data — defensive guard for partial loads.
  const ready = regions.filter(
    (r): r is Region & { changePercent: number; contribution: number } =>
      r.changePercent !== null &&
      r.contribution !== null &&
      Number.isFinite(r.changePercent) &&
      Number.isFinite(r.contribution)
  );

  const max = Math.max(...ready.map((r) => Math.abs(r.changePercent)), 0.5);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [hovered, setHovered] = useState<number | null>(null);

  const totalContrib = ready.reduce((s, r) => s + r.contribution, 0);

  return (
    <div className="almTile almTile--sleeves">
      <div className="ed-label">Sleeve weather</div>

      <div className="almTile__sleeves" onMouseLeave={() => setHovered(null)}>
        {ready.map((r, i) => {
          const up = r.changePercent >= 0;
          const intensity = Math.min(1, Math.abs(r.changePercent) / max);
          const targetDeg = (up ? -1 : 1) * intensity * 90;
          const deg = mounted ? targetDeg : 0;
          const cx = 18;
          const cy = 18;
          const R = 14;
          return (
            <button
              key={r.ticker}
              type="button"
              className={`almTile__sleeve ${hovered === i ? "is-hover" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onClick={() => setHovered(hovered === i ? null : i)}
              aria-label={`${r.ticker} ${r.fullName}, ${
                r.changePercent >= 0 ? "+" : "−"
              }${Math.abs(r.changePercent).toFixed(2)}%`}
            >
              <svg viewBox="0 0 36 36" width="32" height="32">
                <circle
                  cx={cx}
                  cy={cy}
                  r={R}
                  fill="none"
                  stroke="var(--rule-soft)"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${cx} ${cy} L ${cx} ${cy - R}`}
                  stroke="var(--ink-mute)"
                  strokeWidth="0.5"
                />
                <g
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: `rotate(${deg}deg)`,
                    transition: `transform 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) ${
                      i * 80
                    }ms`,
                  }}
                >
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={cy - R}
                    stroke={up ? "var(--green)" : "var(--stamp)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
                <circle cx={cx} cy={cy} r="1.6" fill="var(--ink)" />
              </svg>
              <div className="almTile__sleeve-tick ed-numerals">{r.ticker}</div>
              <div
                className={`almTile__sleeve-val ed-numerals ${
                  up ? "is-pos" : "is-neg"
                }`}
              >
                {up ? "+" : "−"}
                {Math.abs(r.changePercent).toFixed(2)}%
              </div>
            </button>
          );
        })}
      </div>

      <div className="almTile__dot-readout">
        {hovered !== null && ready[hovered] ? (
          <>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>
              {ready[hovered].fullName}
            </span>
            <span className="ed-numerals" style={{ color: "var(--ink-soft)" }}>
              {ready[hovered].weight.toFixed(1)}% weight
            </span>
          </>
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>
            {ready.length} sleeves · hover for detail
          </span>
        )}
      </div>

      <div className="almTile__detail">
        <div className="almTile__row">
          <span>Today&apos;s drivers</span>
          <span className="ed-numerals">
            <span
              style={{
                color: totalContrib >= 0 ? "var(--green)" : "var(--stamp)",
              }}
            >
              {totalContrib >= 0 ? "+" : "−"}
              {Math.abs(totalContrib).toFixed(2)}%
            </span>
          </span>
        </div>
        <div className="almTile__drivers">
          {ready.map((r) => {
            const pos = r.contribution >= 0;
            return (
              <div key={r.ticker} className="almTile__driver">
                <span className="almTile__driver-tick ed-numerals">
                  {r.ticker}
                </span>
                <span
                  className={`almTile__driver-val ed-numerals ${
                    pos ? "is-pos" : "is-neg"
                  }`}
                >
                  {pos ? "+" : "−"}
                  {Math.abs(r.contribution).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
