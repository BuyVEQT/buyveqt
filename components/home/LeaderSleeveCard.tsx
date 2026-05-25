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
 * The big leader card — 1.5fr column on desktop, full-width on mobile.
 * 5px left stripe, "Leader" pill themed to the leading region's tone,
 * italic Fraunces name, big colored % change, contribution block,
 * wide sparkline footer.
 *
 * The card chrome (stripe, badge border, badge dot, faint background
 * tint) all adopt the leading region's color so the section visibly
 * shifts identity day-to-day based on which sleeve carried the move.
 */
export default function LeaderSleeveCard({
  region,
  rankBadge = "Leader",
}: LeaderSleeveCardProps) {
  const up = (region.changePercent ?? 0) >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const regionTone = REGION_TONE[region.ticker] ?? "var(--ink)";
  const regionName = REGION_LABEL[region.ticker] ?? region.fullName;
  const pctAbs = Math.abs(region.changePercent ?? 0).toFixed(2);
  const contribAbs = Math.abs(region.contribution ?? 0).toFixed(2);
  const contribSign = (region.contribution ?? 0) >= 0 ? "+" : "−";

  // Inline custom-property handles for the region-themed accents (stripe,
  // badge border/dot, faint card tint). Keeping them in CSS variables so the
  // <style jsx> selectors can pick them up uniformly.
  const themeStyle = {
    ["--leader-tone" as string]: regionTone,
  } as React.CSSProperties;

  return (
    <Link
      href={`/inside-veqt#${region.ticker}`}
      className="leader-link"
      aria-label={`Leader: ${regionName} — view inside VEQT details`}
    >
    <article
      className="leader"
      style={themeStyle}
    >
      <div className="leader__stripe" aria-hidden />
      <div className="leader__chrome">
        <span className="leader__badge">
          <span className="leader__badge-dot" aria-hidden />
          {rankBadge}
        </span>
        <span className="ed-label leader__ticker">
          {region.ticker}
          <span className="leader__sep"> · </span>WEIGHT{" "}
          {region.weight.toFixed(1)}%
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
          <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
            Contribution
          </span>
          <span
            className="ed-numerals leader__contrib-val"
            style={{ color: tone }}
          >
            {contribSign}
            {contribAbs} pp
          </span>
          <span className="ed-caption">to today&apos;s move</span>
        </div>
      </div>

      {region.history.length >= 2 && (
        <div className="leader__spark">
          <Sparkline
            data={region.history}
            width={520}
            height={66}
            stroke={tone}
            fill={`color-mix(in oklab, ${tone} 9%, transparent)`}
            strokeWidth={1.5}
            dot
            ariaLabel={`${region.ticker} 30-day price`}
          />
          <div className="ed-caption leader__spark-cap">30 trading days →</div>
        </div>
      )}

      <style jsx global>{`
        .leader-link {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: var(--radius, 18px);
        }
        .leader-link:focus-visible {
          outline: 2px solid var(--stamp);
          outline-offset: 4px;
        }
        .leader-link:hover .leader {
          transform: translateY(-2px);
          border-color: var(--leader-tone);
          box-shadow: 0 12px 28px rgba(15, 13, 10, 0.08);
        }
        .leader {
          position: relative;
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
          /* Faint region-toned wash on top of the paper-light surface */
          background: color-mix(
            in oklab,
            var(--leader-tone) 4%,
            var(--paper-light)
          );
          border: 1px solid var(--rule-soft);
          border-radius: var(--radius, 18px);
          padding: 26px 26px 22px 30px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 100%;
        }
        .leader__stripe {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: var(--leader-tone);
        }
        .leader__chrome {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
        }
        .leader__badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--leader-tone);
          background: color-mix(
            in oklab,
            var(--leader-tone) 8%,
            var(--paper-warm)
          );
          border: 1px solid var(--leader-tone);
          padding: 4px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .leader__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--leader-tone);
          flex-shrink: 0;
        }
        .leader__sep {
          color: var(--rule);
        }
        .leader__name {
          margin: 4px 0 0;
          font-size: clamp(2.4rem, 5.2vw, 3.6rem);
          line-height: 1;
          letter-spacing: -0.025em;
          color: var(--ink);
        }
        .leader__numbers {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 22px;
          align-items: end;
          margin-top: 14px;
        }
        @media (max-width: 480px) {
          .leader__numbers {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
        .leader__pct {
          font-size: clamp(3rem, 7.5vw, 5rem);
          line-height: 0.95;
          letter-spacing: -0.035em;
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
        }
        .leader__contrib-val {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.5rem, 2.6vw, 2rem);
          line-height: 1;
          letter-spacing: -0.015em;
        }
        .leader__spark {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--rule-soft);
        }
        .leader__spark-cap {
          font-size: 11px;
          color: var(--ink-mute);
          margin-top: 4px;
        }
      `}</style>
    </article>
    </Link>
  );
}
