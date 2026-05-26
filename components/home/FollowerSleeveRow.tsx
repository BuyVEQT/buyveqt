"use client";

import Link from "next/link";
import type { Region } from "@/lib/useRegions";
import Sparkline from "@/components/charts/Sparkline";

/** Canonical sleeve names — matches LeaderSleeveCard so the section reads
 *  as a cohesive geographic grouping regardless of API labels. */
const REGION_LABEL: Record<string, string> = {
  VUN: "United States",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

interface FollowerSleeveRowProps {
  region: Region;
  rank: number;
}

/**
 * Follower card — sits in the right-column stack of the "Four sleeves, one
 * fund." section. Smaller and tighter than the leader, but visually a member
 * of the same family (paper-light background, soft border, shared radii).
 *
 * Inner 2-column grid:
 *   ┌──────────────────────┬──────────────────┐
 *   │ 2  Canada            │      +0.41%      │
 *   │    VCN · 28.4%       │      ╱╲╱╲╱╲      │
 *   │                      │      +0.12 pp    │
 *   └──────────────────────┴──────────────────┘
 *
 * All numbers + the mini-sparkline adopt the sign-based tone (green when
 * positive, vermilion when negative) so each follower card visually echoes
 * its own direction.
 */
export default function FollowerSleeveRow({
  region,
  rank,
}: FollowerSleeveRowProps) {
  const up = (region.changePercent ?? 0) >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const regionName = REGION_LABEL[region.ticker] ?? region.fullName;
  const pctAbs = Math.abs(region.changePercent ?? 0).toFixed(2);
  const contribAbs = Math.abs(region.contribution ?? 0).toFixed(2);
  const contribSign = (region.contribution ?? 0) >= 0 ? "+" : "−";

  return (
    <Link
      href={`/inside-veqt#${region.ticker}`}
      className="follower-link"
      aria-label={`${regionName} — view inside VEQT details`}
    >
      <article className="follower">
        <div className="follower__id">
          <span className="follower__rank ed-numerals">{rank}</span>
          <div className="follower__id-text">
            <div className="ed-display-italic follower__name-text">
              {regionName}
            </div>
            <div className="ed-stamp follower__ticker">
              {region.ticker}
              <span className="follower__sep"> · </span>
              {region.weight.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="follower__data">
          <div
            className="follower__pct ed-display ed-numerals"
            style={{ color: tone }}
          >
            {up ? "+" : "−"}
            {pctAbs}
            <span className="follower__pct-pct">%</span>
          </div>
          {region.history.length >= 2 && (
            <div className="follower__spark">
              <Sparkline
                data={region.history}
                width={180}
                height={36}
                stroke={tone}
                fill={`color-mix(in oklab, ${tone} 10%, transparent)`}
                strokeWidth={1.3}
                dot={false}
                ariaLabel={`${region.ticker} 30-day price`}
              />
            </div>
          )}
          <div
            className="follower__contrib ed-numerals"
            style={{ color: tone }}
          >
            {contribSign}
            {contribAbs}
            <span className="follower__contrib-unit"> pp</span>
          </div>
        </div>

        <style jsx global>{`
          .follower-link {
            display: block;
            text-decoration: none;
            color: inherit;
            border-radius: 16px;
            height: 100%;
          }
          .follower-link:focus-visible {
            outline: 2px solid var(--stamp);
            outline-offset: 4px;
          }
          .follower-link:hover .follower {
            transform: translateY(-2px);
            border-color: var(--rule);
            box-shadow: 0 8px 18px rgba(15, 13, 10, 0.06);
          }
          .follower {
            position: relative;
            background: var(--paper-light);
            border: 1px solid var(--rule-soft);
            border-radius: 16px;
            padding: 16px 18px;
            overflow: hidden;
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: 14px;
            align-items: center;
            height: 100%;
            min-height: 100%;
            transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
          }
          .follower__id {
            display: flex;
            align-items: baseline;
            gap: 12px;
            min-width: 0;
          }
          .follower__rank {
            font-family: var(--font-sans);
            font-size: 22px;
            font-weight: 400;
            color: var(--ink-mute);
            line-height: 1;
            flex-shrink: 0;
            letter-spacing: -0.01em;
          }
          .follower__id-text {
            min-width: 0;
          }
          .follower__name-text {
            font-size: clamp(1.05rem, 1.4vw, 1.25rem);
            line-height: 1.1;
            color: var(--ink);
            letter-spacing: -0.018em;
          }
          .follower__ticker {
            margin-top: 4px;
            color: var(--ink-mute);
            font-size: 10px;
          }
          .follower__sep {
            color: var(--rule-soft);
          }
          .follower__data {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
            min-width: 0;
          }
          .follower__pct {
            font-size: clamp(1.5rem, 2vw, 1.8rem);
            line-height: 1;
            letter-spacing: -0.025em;
            font-weight: 500;
          }
          .follower__pct-pct {
            font-size: 0.55em;
            margin-left: 2px;
            opacity: 0.7;
          }
          .follower__spark {
            width: 100%;
            max-width: 160px;
            margin-top: 4px;
          }
          .follower__contrib {
            font-family: var(--font-sans);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.02em;
            margin-top: 2px;
          }
          .follower__contrib-unit {
            font-weight: 500;
            opacity: 0.75;
            letter-spacing: 0.04em;
          }

          @media (max-width: 480px) {
            .follower {
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
              gap: 10px;
              padding: 14px 16px;
            }
            .follower__spark {
              max-width: 120px;
            }
          }
        `}</style>
      </article>
    </Link>
  );
}
