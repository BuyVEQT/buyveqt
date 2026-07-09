"use client";

import { useEffect, useState } from "react";
import type { VeqtQuote } from "@/lib/types";

interface FiftyTwoTrackProps {
  quote: VeqtQuote;
}

/**
 * 52-week range bar — fills the vertical space in the price block between
 * the change pill and the period subhead. Shows where the current price
 * sits between the trailing year's low and high as a horizontal gradient
 * bar (stamp-soft → paper-warm → green-soft, left to right) with a small
 * ink marker dot + label tag pointing at the current price.
 *
 * On mount the marker slides from `left: 0%` to its target % over 0.8s
 * via a CSS transition gated by a `mounted` state toggle (not rAF — that
 * pattern broke under StrictMode in earlier rounds).
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`.
 */
export default function FiftyTwoTrack({ quote }: FiftyTwoTrackProps) {
  const range = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
  const pctRaw =
    range > 0
      ? ((quote.price - quote.fiftyTwoWeekLow) / range) * 100
      : 50;
  const pct = Math.max(2, Math.min(98, pctRaw));

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const markerLeft = mounted ? pct : 0;

  return (
    <div className="ft52">
      <div className="ft52__head">
        <span className="ed-label">52-week range</span>
        <span className="ft52__day ed-numerals">
          Day{" "}
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>
            ${quote.dayLow.toFixed(2)} – ${quote.dayHigh.toFixed(2)}
          </span>
        </span>
      </div>

      <div className="ft52__bar">
        <div className="ft52__bar-fill" />
        <div
          className="ft52__marker"
          style={{
            left: `${markerLeft}%`,
            transition: "left 0.8s cubic-bezier(0.2, 0.7, 0.3, 1)",
          }}
        >
          <div className="ft52__marker-dot" />
          <div className="ft52__marker-label ed-numerals">
            ${quote.price.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="ft52__ends">
        <span className="ed-numerals">${quote.fiftyTwoWeekLow.toFixed(2)}</span>
        <span className="ed-numerals">${quote.fiftyTwoWeekHigh.toFixed(2)}</span>
      </div>

      <style jsx>{`
        .ft52 {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ft52__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
        }
        .ft52__day {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-mute);
          letter-spacing: 0.02em;
        }
        .ft52__bar {
          position: relative;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            var(--stamp-soft) 0%,
            var(--paper-warm) 50%,
            var(--green-soft) 100%
          );
          border: 1px solid var(--rule-soft);
          margin-top: 14px;
        }
        .ft52__bar-fill {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0 24%,
            var(--rule-hair) 24% 25%,
            transparent 25% 49%,
            var(--rule-hair) 49% 50%,
            transparent 50% 74%,
            var(--rule-hair) 74% 75%,
            transparent 75% 100%
          );
          opacity: 0.6;
        }
        .ft52__marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .ft52__marker-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--ink);
          border: 2px solid var(--paper);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
        }
        .ft52__marker-label {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: -22px;
          white-space: nowrap;
          padding: 2px 6px;
          background: var(--ink);
          color: var(--paper-light);
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-radius: 3px;
        }
        .ft52__marker-label::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -3px;
          transform: translateX(-50%) rotate(45deg);
          width: 5px;
          height: 5px;
          background: var(--ink);
        }
        .ft52__ends {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-mute);
          letter-spacing: 0.02em;
        }

        @media (max-width: 640px) {
          .ft52__head {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
}
