"use client";

import { useMemo } from "react";
import { useRegions } from "@/lib/useRegions";
import { FUNDS } from "@/data/funds";

// Identity-fill colors for the geography bars — see DATA-IDENTITY
// CONVENTION in app/globals.css. VUN uses --band-ink (invariant) not
// --ink so the cream overlay text stays legible when --ink flips to
// parchment in dark mode.
const GEO_TONE: Record<string, string> = {
  VUN: "var(--band-ink)",
  VCN: "var(--stamp)",
  VIU: "var(--amber)",
  VEE: "var(--rule)",
};

const GEO_LABEL: Record<string, string> = {
  VUN: "United States",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

/** Map from the geographyAllocation region string → sleeve ticker. */
const REGION_TO_TICKER: Record<string, string> = {
  "United States": "VUN",
  "Canada": "VCN",
  "International Developed": "VIU",
  "Emerging Markets": "VEE",
};

interface RegionWeight {
  ticker: string;
  weight: number;
}

/**
 * Full-width 4-segment stacked geography bar.
 *
 * Data: useRegions() live feed, fallback to FUNDS["VEQT.TO"].geographyAllocation.
 * Segment widths are proportional to weight. Wide segments show ticker +
 * italic name + big %. Narrow segments (weight/total < 12%) hide the name
 * inside but show it in the below-bar label row.
 * Mobile (<720px): flips to vertical stack, re-enables names, hides label row.
 */
export default function GeographyPanel() {
  const { payload } = useRegions();

  const regions = useMemo<RegionWeight[]>(() => {
    const TICKER_ORDER = ["VUN", "VCN", "VIU", "VEE"];

    if (payload?.regions && payload.regions.length > 0) {
      // Live feed — sort by canonical order
      const mapped = payload.regions
        .filter((r) => TICKER_ORDER.includes(r.ticker))
        .map((r) => ({ ticker: r.ticker, weight: r.weight }));
      mapped.sort(
        (a, b) => TICKER_ORDER.indexOf(a.ticker) - TICKER_ORDER.indexOf(b.ticker)
      );
      if (mapped.length === 4) return mapped;
    }

    // Fallback to factsheet data in data/funds.ts
    const geo = FUNDS["VEQT.TO"]?.geographyAllocation ?? [];
    const fallback: RegionWeight[] = geo
      .map((g) => {
        const ticker = REGION_TO_TICKER[g.region];
        if (!ticker) return null;
        return { ticker, weight: g.weight };
      })
      .filter((x): x is RegionWeight => x !== null);
    fallback.sort(
      (a, b) => TICKER_ORDER.indexOf(a.ticker) - TICKER_ORDER.indexOf(b.ticker)
    );
    return fallback;
  }, [payload]);

  const total = regions.reduce((s, r) => s + r.weight, 0) || 100;

  return (
    <section className="geo">
      <div className="geo__head">
        <div>
          <div className="ed-stamp">The geography</div>
          <h2 className="ed-display geo__h2">
            Where the <em style={{ fontStyle: "italic", fontWeight: 500 }}>dollars sit.</em>
          </h2>
        </div>
        <p className="ed-caption geo__deck">
          Four regional Vanguard ETFs, market-cap weighted. Vanguard rebalances
          quarterly to keep the geography close to the global equity market.
        </p>
      </div>

      <div className="geo__bar" role="img" aria-label="Regional weight breakdown">
        {regions.map((r, i) => {
          const w = (r.weight / total) * 100;
          const isNarrow = w < 12;
          return (
            <div
              key={r.ticker}
              className={`geo__seg${isNarrow ? " geo__seg--narrow" : ""}`}
              style={{
                width: `${w}%`,
                background: GEO_TONE[r.ticker] ?? "var(--rule)",
                borderRight:
                  i < regions.length - 1 ? "1px solid var(--paper)" : "none",
              }}
            >
              <div className="geo__seg-inner">
                <div className="ed-stamp geo__seg-ticker">{r.ticker}</div>
                <div className="geo__seg-name">{GEO_LABEL[r.ticker] ?? r.ticker}</div>
                <div className="ed-display ed-numerals geo__seg-pct">
                  {r.weight.toFixed(1)}
                  <span className="geo__seg-pct-sym">%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Below-bar label row — ensures narrow segments (VEE ~7%) still get a
          readable name. Each label tracks its segment width. */}
      <div className="geo__labels">
        {regions.map((r) => {
          const w = (r.weight / total) * 100;
          return (
            <div
              key={r.ticker}
              className="geo__label"
              style={{ width: `${w}%` }}
            >
              <span className="geo__label-name">
                {GEO_LABEL[r.ticker] ?? r.ticker}
              </span>
              <span className="geo__label-ticker">{r.ticker}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .geo {
          padding: 22px 0 30px;
        }
        .geo__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .geo__h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 6px 0 0;
        }
        .geo__deck {
          flex: 0 1 360px;
          max-width: 360px;
          font-size: 13px;
        }
        .geo__bar {
          display: flex;
          width: 100%;
          height: 180px;
          border: 1px solid var(--ink);
          border-radius: 4px;
          overflow: hidden;
        }
        .geo__seg {
          position: relative;
          height: 100%;
          overflow: hidden;
          min-width: 0;
        }
        .geo__seg-inner {
          position: absolute;
          inset: 16px 14px;
          color: var(--band-paper);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .geo__seg--narrow .geo__seg-name {
          display: none;
        }
        .geo__seg-ticker {
          color: var(--band-paper);
          letter-spacing: 0.22em;
          font-size: 10px;
          font-weight: 700;
          opacity: 0.7;
        }
        .geo__seg-name {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: clamp(0.85rem, 1.4vw, 1.05rem);
          color: var(--band-paper);
          opacity: 0.92;
          letter-spacing: -0.005em;
        }
        .geo__seg-pct {
          font-size: clamp(2rem, 4.4vw, 3.4rem);
          line-height: 0.95;
          color: var(--band-paper);
          letter-spacing: -0.025em;
          align-self: flex-start;
        }
        .geo__seg--narrow .geo__seg-pct {
          font-size: clamp(1.1rem, 2.4vw, 1.8rem);
        }
        .geo__seg-pct-sym {
          font-size: 0.5em;
          opacity: 0.7;
          margin-left: 2px;
        }
        .geo__labels {
          display: flex;
          width: 100%;
          margin-top: 10px;
        }
        .geo__label {
          min-width: 0;
          padding: 0 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-right: 1px solid var(--rule-hair);
        }
        .geo__label:last-child {
          border-right: none;
        }
        .geo__label-name {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          font-size: clamp(11px, 1.1vw, 13.5px);
          color: var(--ink);
          letter-spacing: -0.005em;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .geo__label-ticker {
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ink-mute);
        }

        @media (max-width: 720px) {
          .geo__bar {
            flex-direction: column;
            height: auto;
            /* No min-height on the stacked variant — each segment already
               sets its own min-height: 64px, so the bar wraps tightly
               around its content instead of reserving 220px above the
               fold on mobile. */
            min-height: 0;
          }
          .geo__seg {
            width: 100% !important;
            min-height: 64px;
            border-right: none !important;
            border-bottom: 1px solid var(--paper);
          }
          .geo__seg:last-child {
            border-bottom: none;
          }
          .geo__seg-inner {
            position: absolute;
            inset: 12px 14px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          /* Re-enable name on mobile even for narrow segments */
          .geo__seg--narrow .geo__seg-name {
            display: inline;
          }
          .geo__seg-pct {
            font-size: 1.5rem;
          }
          .geo__seg--narrow .geo__seg-pct {
            font-size: 1.5rem;
          }
          .geo__labels {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
