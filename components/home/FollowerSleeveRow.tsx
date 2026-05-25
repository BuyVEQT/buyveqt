"use client";

import Link from "next/link";
import type { Region } from "@/lib/useRegions";
import Sparkline from "@/components/charts/Sparkline";

const REGION_TONE: Record<string, string> = {
  VUN: "var(--ink)",
  VCN: "var(--stamp)",
  VIU: "var(--amber)",
  VEE: "var(--rule)",
};

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
 * Compact follower row — 4px left stripe, rank+name on left, big % on right,
 * mini 180×26 sparkline + contribution pp inline below.
 */
export default function FollowerSleeveRow({
  region,
  rank,
}: FollowerSleeveRowProps) {
  const up = (region.changePercent ?? 0) >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const stripe = REGION_TONE[region.ticker] ?? "var(--ink)";
  const regionName = REGION_LABEL[region.ticker] ?? region.fullName;
  const contribAbs = Math.abs(region.contribution ?? 0).toFixed(2);
  const contribSign = (region.contribution ?? 0) >= 0 ? "+" : "−";

  return (
    <Link
      href={`/inside-veqt#${region.ticker}`}
      className="follower-link"
      aria-label={`${regionName} — view inside VEQT details`}
    >
    <article className="follower">
      <div
        className="follower__stripe"
        style={{ background: stripe }}
        aria-hidden
      />
      <div className="follower__head">
        <div className="follower__name">
          <span className="follower__rank ed-display">{rank}</span>
          <div>
            <div className="ed-display-italic follower__name-text">
              {regionName}
            </div>
            <div className="ed-label follower__ticker">
              {region.ticker} · {region.weight.toFixed(1)}%
            </div>
          </div>
        </div>
        <div
          className="follower__pct ed-display ed-numerals"
          style={{ color: tone }}
        >
          {up ? "+" : "−"}
          {Math.abs(region.changePercent ?? 0).toFixed(2)}%
        </div>
      </div>

      <div className="follower__foot">
        {region.history.length >= 2 && (
          <div className="follower__spark">
            <Sparkline
              data={region.history}
              width={180}
              height={26}
              stroke={tone}
              fill={`color-mix(in oklab, ${tone} 8%, transparent)`}
              strokeWidth={1.2}
              ariaLabel={`${region.ticker} 30-day price`}
            />
          </div>
        )}
        <div className="follower__contrib" style={{ color: tone }}>
          <span className="ed-numerals follower__contrib-val">
            {contribSign}
            {contribAbs}
          </span>
          <span className="follower__contrib-unit">pp</span>
        </div>
      </div>

      <style jsx global>{`
        .follower-link {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: 12px;
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
          border-radius: 12px;
          padding: 14px 16px 12px 22px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .follower__stripe {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }
        .follower__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }
        .follower__name {
          display: flex;
          align-items: baseline;
          gap: 12px;
          min-width: 0;
        }
        .follower__rank {
          font-size: 20px;
          color: var(--ink-mute);
          font-variant-numeric: lining-nums;
          flex-shrink: 0;
        }
        .follower__name-text {
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          line-height: 1.1;
          color: var(--ink);
        }
        .follower__ticker {
          margin-top: 3px;
          color: var(--ink-mute);
          font-size: 9px;
        }
        .follower__pct {
          font-size: clamp(1.5rem, 2.4vw, 1.8rem);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .follower__foot {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .follower__spark {
          flex: 1;
          min-width: 0;
        }
        .follower__contrib {
          display: inline-flex;
          align-items: baseline;
          gap: 3px;
          font-family: var(--font-display);
          font-weight: 500;
        }
        .follower__contrib-val {
          font-size: 16px;
          letter-spacing: -0.01em;
        }
        .follower__contrib-unit {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
          opacity: 0.7;
        }
      `}</style>
    </article>
    </Link>
  );
}
