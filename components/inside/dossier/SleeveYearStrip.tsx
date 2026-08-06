"use client";

import { useMemo } from "react";
import { fmtSignedPct } from "@/lib/instrument-format";
import { useArmOnView } from "../useArmOnView";

/** The dossier judges every sleeve on VEQT's own frame. */
const SINCE_YEAR = 2019;

interface ChartPoint {
  date: string;
  close: number;
}

interface YearBar {
  label: string;
  sub: string | null;
  pct: number;
}

interface SleeveYearStripProps {
  ticker: string;
  /** Calendar-year NAV returns, newest first (from /api/sleeves). */
  annualReturns: Array<{ year: number; pct: number }>;
  /** Daily closes since 2019 (the dossier's chart fetch) — powers YTD. */
  points: ChartPoint[];
}

/**
 * THE YEARS — "Every year, printed." (dossier module).
 *
 * One column per calendar year since 2019: the sleeve's real NAV total
 * return drawn as a bar off a zero line — up years in ink rising, down
 * years in red falling, the current year appended as YTD from the same
 * daily closes the heat board reads. Bars sweep up/down on first view;
 * the un-armed frame is the finished chart.
 */
export default function SleeveYearStrip({
  ticker,
  annualReturns,
  points,
}: SleeveYearStripProps) {
  const { ref, armed } = useArmOnView<HTMLElement>();

  const bars = useMemo<YearBar[]>(() => {
    const out: YearBar[] = annualReturns
      .filter((r) => r.year >= SINCE_YEAR)
      .sort((a, b) => a.year - b.year)
      .map((r) => ({ label: String(r.year), sub: null, pct: r.pct }));

    // YTD — last close over the prior year's final close, from real dailies.
    const nowYear = new Date().getFullYear();
    if (points.length > 1 && !out.some((b) => b.label === String(nowYear))) {
      const jan1 = `${nowYear}-01-01`;
      let baseIdx = -1;
      for (let i = points.length - 1; i >= 0; i--) {
        if (points[i].date < jan1) {
          baseIdx = i;
          break;
        }
      }
      const base = baseIdx >= 0 ? points[baseIdx].close : null;
      const last = points[points.length - 1].close;
      if (base && base > 0 && last > 0 && baseIdx < points.length - 1) {
        out.push({
          label: String(nowYear),
          sub: "YTD",
          pct: +(((last - base) / base) * 100).toFixed(1),
        });
      }
    }
    return out;
  }, [annualReturns, points]);

  const maxAbs = bars.reduce((m, b) => Math.max(m, Math.abs(b.pct)), 0) || 1;
  const ready = bars.length > 0;

  return (
    <section
      ref={ref}
      className="yrs"
      aria-label={`${ticker} calendar-year returns since ${SINCE_YEAR}`}
      data-armed={armed && ready ? "true" : "false"}
    >
      <div className="yrs__head">
        <div>
          <div className="yrs__kicker">The years</div>
          <h2 className="yrs__display">Every year, printed.</h2>
        </div>
        <span className="yrs__caption">
          Calendar-year NAV total returns · via Yahoo Finance ·{" "}
          {String(new Date().getFullYear())} is year-to-date
        </span>
      </div>

      {ready ? (
        <div className="yrs__strip">
          {bars.map((b, i) => {
            const negative = b.pct < 0;
            const h = (Math.abs(b.pct) / maxAbs) * 100;
            return (
              <div className="yrs__col" key={b.label}>
                <span className={`yrs__value${negative ? " is-neg" : ""}`}>
                  {fmtSignedPct(b.pct, 1)}
                </span>
                <div className="yrs__plot">
                  <span className="yrs__zero" aria-hidden />
                  <span
                    className={`yrs__bar${negative ? " is-neg" : ""}`}
                    style={{
                      height: `${Math.max(h, 1.5)}%`,
                      animationDelay: `${0.1 + i * 0.08}s`,
                    }}
                    aria-hidden
                  />
                </div>
                <span className="yrs__year">
                  {b.label}
                  {b.sub && <span className="yrs__year-sub"> {b.sub}</span>}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="yrs__skeleton" aria-hidden />
      )}

      <style jsx>{`
        .yrs {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .yrs__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .yrs__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .yrs__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        /* EXPLANATORY CAPTION — what the bars are made of. */
        .yrs__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
          max-width: 300px;
        }

        .yrs__strip {
          display: flex;
          gap: 14px;
          margin-top: 18px;
        }
        .yrs__col {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        /* The printed figure — signed, so direction survives without colour. */
        .yrs__value {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }
        .yrs__value.is-neg {
          color: var(--ins-signal);
        }

        .yrs__plot {
          position: relative;
          width: 100%;
          height: 220px;
        }
        .yrs__zero {
          position: absolute;
          left: -7px;
          right: -7px;
          top: 50%;
          height: 1px;
          background: var(--ins-ink);
        }
        .yrs__bar {
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: 50%;
          max-height: 50%;
          background: var(--ins-ink);
          transform-origin: bottom center;
        }
        .yrs__bar.is-neg {
          bottom: auto;
          top: 50%;
          background: var(--ins-signal);
          transform-origin: top center;
        }
        /* Bars grow off the zero line once armed — un-armed is finished. */
        .yrs[data-armed="true"] .yrs__bar {
          animation: ins-yearGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ins-yearGrow {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }

        /* TRUE LABEL — the year under its column. */
        .yrs__year {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }
        .yrs__year-sub {
          font-weight: 600;
        }

        .yrs__skeleton {
          height: 260px;
          margin-top: 18px;
          background: rgba(17, 17, 17, 0.06);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .yrs {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .yrs__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .yrs__caption {
            display: none;
          }
          .yrs__strip {
            gap: 6px;
            margin-top: 12px;
          }
          .yrs__value {
            font-size: 10px;
          }
          .yrs__plot {
            height: 140px;
          }
          .yrs__bar {
            left: 12%;
            right: 12%;
          }
          .yrs__year {
            font-size: 10px;
            letter-spacing: 0.04em;
          }
          .yrs__skeleton {
            height: 170px;
          }
        }
      `}</style>
    </section>
  );
}
