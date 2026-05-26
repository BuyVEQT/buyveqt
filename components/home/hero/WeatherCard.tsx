"use client";

import type { SeverityReading } from "@/lib/severity";
import type { VeqtQuote } from "@/lib/types";
import WeatherGlyph from "./WeatherGlyph";
import WeatherBellCurve from "./WeatherBellCurve";

interface WeatherCardProps {
  quote: VeqtQuote;
  severity: SeverityReading;
}

/**
 * Hybrid weather card — illustrated glyph on top ("vibe"), bell curve
 * below with today's σ marker ("fidelity"), editorial sentence at the
 * bottom. Composition order is fixed:
 *
 *   header (label + Live pill)
 *   ──────────────────────────
 *   glyph (132px)
 *   zone label (italic display, 30px)
 *   stat strip (percentile · σ)
 *   ┄ hairline rule
 *   bell curve (260×110)
 *   caption ("Today vs. every daily move since {year}.")
 *   ──────────────────────────
 *   editorial line (zone-keyed copy)
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`.
 */
export default function WeatherCard({ quote, severity }: WeatherCardProps) {
  const up = quote.changePercent >= 0;
  // Bell curve takes a signed σ — left tail for down days, right for up.
  const signedZ = (up ? 1 : -1) * severity.sigmaRatio;

  const copy = (() => {
    switch (severity.zone) {
      case "Typical":
        return up
          ? "Fair weather over the markets."
          : "A passing cloud — nothing structural.";
      case "Notable":
        return up
          ? "Skies open up. A breezy session."
          : "A grey day, but the forecast holds.";
      case "Unusual":
        return up
          ? "Strong sun, rare for this latitude."
          : "A heavier shower than expected.";
      case "Rare":
        return up
          ? "A clear lightning-strike rally."
          : "Storm conditions in the broad index.";
      default:
        return "Ordinary weather.";
    }
  })();

  const zoneLabel = severity.zone === "Typical" ? "Calm" : severity.zone;
  const pctile = Math.round(severity.percentileRank * 100);

  return (
    <div className="wxCard">
      <div className="wxCard__label ed-label">
        <span>Today&apos;s weather</span>
        <span className="wxCard__live">
          <span className="wxCard__live-dot" aria-hidden /> Live
        </span>
      </div>

      <div className="wxCard__glyph">
        <WeatherGlyph zone={severity.zone} up={up} size={132} />
      </div>

      <div className="wxCard__zone ed-display-italic">{zoneLabel}</div>

      <div className="wxCard__stats ed-numerals">
        <span
          className="wxCard__pctile"
          style={{ color: up ? "var(--green)" : "var(--stamp)" }}
        >
          {up ? "↑" : "↓"} {pctile}
          <sup>th</sup> pct.
        </span>
        <span className="wxCard__dot" aria-hidden>
          ·
        </span>
        <span style={{ color: "var(--ink-soft)" }}>
          σ {Math.abs(severity.sigmaRatio).toFixed(2)}
        </span>
      </div>

      <div className="wxCard__curveWrap">
        <div className="wxCard__rule" />
        <WeatherBellCurve z={signedZ} width={260} height={110} />
        <div className="wxCard__cap">
          Today vs. every daily move since {severity.sampleFromYear}.
        </div>
      </div>

      <p className="wxCard__copy">{copy}</p>

      <style jsx>{`
        .wxCard {
          padding: 18px 20px 20px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          width: 100%;
        }
        .wxCard__label {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .wxCard__live {
          font-family: var(--font-sans);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--ink-mute);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .wxCard__live-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--stamp);
          animation: wxCard-pulse 2.4s ease-in-out infinite;
        }
        @keyframes wxCard-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .wxCard__glyph {
          align-self: center;
          margin: 4px 0 2px;
        }
        .wxCard__zone {
          align-self: center;
          font-size: 30px;
          color: var(--ink);
          line-height: 1;
          margin-top: 4px;
        }
        .wxCard__stats {
          align-self: center;
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
          letter-spacing: 0.02em;
        }
        .wxCard__pctile sup {
          font-size: 8px;
          font-weight: 700;
          color: inherit;
          opacity: 0.85;
          margin-left: 1px;
        }
        .wxCard__dot {
          color: var(--ink-faint);
        }
        .wxCard__curveWrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 8px;
        }
        .wxCard__rule {
          align-self: stretch;
          height: 0;
          border-top: 1px dashed var(--rule-hair);
          margin: 12px -4px 4px;
        }
        .wxCard__cap {
          text-align: center;
          margin-top: -2px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 11px;
          color: var(--ink-mute);
          line-height: 1.4;
        }
        .wxCard__copy {
          margin: 12px 0 0;
          padding-top: 12px;
          border-top: 1px solid var(--rule-hair);
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink-soft);
        }

        @media (max-width: 880px) {
          .wxCard {
            padding: 14px 16px 16px;
          }
          .wxCard__zone {
            font-size: 26px;
          }
          .wxCard__copy {
            font-size: 13px;
            line-height: 1.45;
          }
        }
        @media (max-width: 380px) {
          /* iPhone SE territory — pull the glyph in a notch so the card
             doesn't dominate the fold above the chart. */
          .wxCard__glyph :global(svg) {
            width: 116px;
            height: 116px;
          }
        }
      `}</style>
    </div>
  );
}
