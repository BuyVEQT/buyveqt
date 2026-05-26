"use client";

import Link from "next/link";
import type { Region } from "@/lib/useRegions";
import Sparkline from "@/components/charts/Sparkline";

/** Canonical, geography-first sleeve names. Used regardless of what the
 *  live API labels a region (e.g. "US Total Market") so the cards read as
 *  a cohesive geographic grouping. */
const REGION_LABEL: Record<string, string> = {
  VUN: "United States",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

interface LeaderSleeveCardProps {
  region: Region;
  rankBadge?: string;
}

/**
 * Leader card — the big editorial anchor of the "Four sleeves, one fund."
 * section. Sits in the left column on desktop (~62% width), full width on
 * mobile.
 *
 * Structure (top → bottom):
 *   1. Chrome row: vermilion-outlined "● LEADER" pill | TICKER · WEIGHT
 *   2. Huge italic Fraunces region name (clamp 2.8–4.6rem)
 *   3. Numbers row: big % change (green/vermilion) | CONTRIBUTION sub-block
 *      (label + pp number + "in today's move" caption)
 *   4. Wide 30-day sparkline (monochrome, sign-toned, soft fill)
 *   5. "30 trading days" caption beneath the chart
 *
 * The card adopts the sign-based tone (green positive / vermilion negative)
 * for all numeric chrome so the section visibly registers the day's direction
 * at a glance.
 */
export default function LeaderSleeveCard({
  region,
  rankBadge = "Leader",
}: LeaderSleeveCardProps) {
  const up = (region.changePercent ?? 0) >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const regionName = REGION_LABEL[region.ticker] ?? region.fullName;
  const pctAbs = Math.abs(region.changePercent ?? 0).toFixed(2);
  const contribAbs = Math.abs(region.contribution ?? 0).toFixed(2);
  const contribSign = (region.contribution ?? 0) >= 0 ? "+" : "−";

  return (
    <Link
      href={`/inside-veqt#${region.ticker}`}
      className="leader-link"
      aria-label={`Leader: ${regionName} — view inside VEQT details`}
    >
      <article className="leader">
        <div className="leader__chrome">
          <span className="leader__badge">
            <span className="leader__badge-dot" aria-hidden />
            {rankBadge}
          </span>
          <span className="ed-stamp leader__ticker">
            {region.ticker}
            <span className="leader__sep"> · </span>
            <span className="leader__ticker-weight">
              Weight {region.weight.toFixed(1)}%
            </span>
          </span>
        </div>

        <h3 className="ed-display-italic leader__name">{regionName}</h3>

        <div className="leader__numbers">
          <div
            className="leader__pct ed-display ed-numerals"
            style={{ color: tone }}
          >
            {up ? "+" : "−"}
            {pctAbs}
            <span className="leader__pct-pct">%</span>
          </div>
          <div className="leader__contrib">
            <span className="ed-stamp leader__contrib-label">Contribution</span>
            <span
              className="ed-numerals leader__contrib-val"
              style={{ color: tone }}
            >
              {contribSign}
              {contribAbs}
              <span className="leader__contrib-unit">pp</span>
            </span>
            <span className="ed-caption leader__contrib-cap">
              in today&apos;s move
            </span>
          </div>
        </div>

        {region.history.length >= 2 && (
          <div className="leader__spark">
            <Sparkline
              data={region.history}
              width={640}
              height={92}
              stroke={tone}
              fill={`color-mix(in oklab, ${tone} 10%, transparent)`}
              strokeWidth={1.6}
              dot={false}
              ariaLabel={`${region.ticker} 30-day price`}
            />
            <div className="ed-caption leader__spark-cap">30 trading days</div>
          </div>
        )}

        <style jsx global>{`
          .leader-link {
            display: block;
            text-decoration: none;
            color: inherit;
            border-radius: 22px;
            height: 100%;
          }
          .leader-link:focus-visible {
            outline: 2px solid var(--stamp);
            outline-offset: 4px;
          }
          .leader-link:hover .leader {
            transform: translateY(-2px);
            border-color: var(--rule);
            box-shadow: 0 14px 32px rgba(15, 13, 10, 0.08);
          }
          .leader {
            position: relative;
            transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
            background: var(--paper-light);
            border: 1px solid var(--rule-soft);
            border-radius: 22px;
            padding: 28px 30px 22px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 18px;
            height: 100%;
            min-height: 100%;
          }
          @media (min-width: 1024px) {
            .leader {
              padding: 32px 36px 26px;
              gap: 20px;
            }
          }
          .leader__chrome {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
          }
          .leader__badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-family: var(--font-sans);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: var(--stamp);
            background: transparent;
            border: 1px solid var(--stamp);
            padding: 5px 11px;
            border-radius: 999px;
            white-space: nowrap;
            line-height: 1;
          }
          .leader__badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--stamp);
            flex-shrink: 0;
          }
          .leader__ticker {
            color: var(--ink-mute);
            white-space: nowrap;
          }
          .leader__sep {
            color: var(--rule-soft);
          }
          .leader__ticker-weight {
            color: var(--ink-mute);
          }
          .leader__name {
            margin: 2px 0 4px;
            font-size: clamp(2.8rem, 6vw, 4.6rem);
            line-height: 0.98;
            letter-spacing: -0.028em;
            color: var(--ink);
          }
          .leader__numbers {
            display: grid;
            grid-template-columns: auto auto;
            gap: 32px;
            align-items: end;
            margin-top: 2px;
          }
          @media (max-width: 520px) {
            .leader__numbers {
              grid-template-columns: 1fr;
              gap: 14px;
              align-items: start;
            }
          }
          .leader__pct {
            font-size: clamp(3.2rem, 6.5vw, 4.6rem);
            line-height: 0.92;
            letter-spacing: -0.035em;
            font-weight: 500;
          }
          .leader__pct-pct {
            font-size: 0.5em;
            margin-left: 4px;
            opacity: 0.7;
          }
          .leader__contrib {
            display: flex;
            flex-direction: column;
            gap: 4px;
            min-width: 0;
          }
          .leader__contrib-label {
            color: var(--ink-mute);
            font-size: 10px;
          }
          .leader__contrib-val {
            font-family: var(--font-display);
            font-weight: 500;
            font-size: clamp(1.8rem, 3.2vw, 2.6rem);
            line-height: 1;
            letter-spacing: -0.02em;
            display: inline-flex;
            align-items: baseline;
            gap: 5px;
          }
          .leader__contrib-unit {
            font-family: var(--font-sans);
            font-size: 0.5em;
            font-weight: 600;
            letter-spacing: 0.04em;
            opacity: 0.75;
          }
          .leader__contrib-cap {
            font-family: var(--font-serif);
            font-style: italic;
            font-size: 13px;
            color: var(--ink-mute);
            margin-top: 1px;
          }
          .leader__spark {
            margin-top: auto;
            padding-top: 12px;
            border-top: 1px solid var(--rule-soft);
          }
          .leader__spark-cap {
            font-family: var(--font-serif);
            font-style: italic;
            font-size: 12px;
            color: var(--ink-mute);
            margin-top: 6px;
          }
        `}</style>
      </article>
    </Link>
  );
}
