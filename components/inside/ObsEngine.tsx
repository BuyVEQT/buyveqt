"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRegions } from "@/lib/useRegions";
import { useVeqtData } from "@/lib/useVeqtData";
import { SLEEVE_TICKERS } from "@/data/sleeves";
import {
  UP,
  DOWN,
  MINUS,
  fmtSignedPct,
  fmtSignedPp,
  fmtChipDate,
  parseSessionDate,
} from "@/lib/instrument-format";
import { useArmOnView } from "./useArmOnView";

/** The biggest bar reaches 33% of the half-track — the 10b scale. */
const BAR_MAX_PCT = 33;
const COUNT_MS = 1400;

interface EngineRow {
  ticker: string;
  movePercent: number | null;
  contribution: number | null;
}

function fmtAssembled(value: number): string {
  const sign = value < 0 ? MINUS : "+";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

/**
 * TODAY'S ENGINE — "Who moved the needle today." (artboard 10b).
 *
 * One row per sleeve: weight × move = contribution, drawn as a bar off a
 * centre spine (negative goes left, in red). The summary card assembles
 * the day — its number counts up as the bars land, first time the section
 * scrolls into view. Rows keep the floor plan's fixed order; the equation
 * lives in the head caption, so the module never has to explain itself.
 */
export default function ObsEngine() {
  const { payload } = useRegions();
  const { data: veqtData } = useVeqtData("ALL");
  const { ref, armed } = useArmOnView<HTMLElement>();

  const rows = useMemo<EngineRow[]>(() => {
    return SLEEVE_TICKERS.map((ticker) => {
      const region = payload?.regions.find((r) => r.ticker === ticker);
      return {
        ticker,
        movePercent: region?.changePercent ?? null,
        contribution: region?.contribution ?? null,
      };
    });
  }, [payload]);

  const assembled = useMemo(() => {
    if (rows.some((r) => r.contribution === null)) return null;
    return rows.reduce((sum, r) => sum + (r.contribution ?? 0), 0);
  }, [rows]);

  const maxAbs =
    rows.reduce((m, r) => Math.max(m, Math.abs(r.contribution ?? 0)), 0) || 1;

  const dateline = veqtData?.quote.latestTradingDay
    ? fmtChipDate(parseSessionDate(veqtData.quote.latestTradingDay))
    : null;

  // ── Assembled count-up — runs once, when armed, bars landing under it.
  const sumRef = useRef<HTMLSpanElement>(null);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = sumRef.current;
    if (!el || assembled === null) return;

    if (!armed || countedRef.current) {
      el.textContent = fmtAssembled(assembled);
      return;
    }
    countedRef.current = true;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmtAssembled(assembled);
      return;
    }

    const target = assembled;
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmtAssembled(target * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [armed, assembled]);

  return (
    <section
      ref={ref}
      className="eng"
      aria-label="Who moved the needle today"
      data-armed={armed ? "true" : "false"}
    >
      <div className="eng__head">
        <div>
          <div className="eng__kicker">
            Today&rsquo;s engine
            {assembled !== null && (
              <span className="eng-mob"> · sums to {fmtAssembled(assembled)}</span>
            )}
          </div>
          <h2 className="eng__display">Who moved the needle today.</h2>
        </div>
        <span className="eng__caption eng-desk">
          Sleeve weight × sleeve move = contribution · sums to the day
        </span>
      </div>

      <div className="eng__grid">
        <div className="eng__rows">
          {rows.map((row, i) => {
            const pp = row.contribution;
            const negative = pp != null && pp < 0;
            const width =
              pp == null ? 0 : (Math.abs(pp) / maxAbs) * BAR_MAX_PCT;
            return (
              <div
                className={`eng__row${i === rows.length - 1 ? " is-last" : ""}`}
                key={row.ticker}
              >
                <span className="eng__name">
                  {row.ticker}{" "}
                  <span className={`eng__move${negative ? " is-neg" : ""}`}>
                    {row.movePercent == null
                      ? "—"
                      : `${negative ? DOWN : UP} ${fmtSignedPct(row.movePercent)}`}
                  </span>
                </span>
                <span className="eng__spine">
                  <span className="eng__spine-line" />
                  {pp != null && (
                    <span
                      className={`eng__bar${negative ? " is-neg" : ""}`}
                      style={{
                        width: `${Math.max(width, 0.75)}%`,
                        animationDelay: `${0.1 + i * 0.15}s`,
                      }}
                    />
                  )}
                </span>
                <span className={`eng__pp${negative ? " is-neg" : ""}`}>
                  {pp == null ? "—" : fmtSignedPp(pp)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="eng__card eng-desk">
          <div className="eng__card-label">The day, assembled</div>
          <div className="eng__card-value" suppressHydrationWarning>
            <span ref={sumRef}>
              {assembled === null ? "—" : fmtAssembled(assembled)}
            </span>
          </div>
          <div className="eng__card-sub" suppressHydrationWarning>
            VEQT{dateline ? ` · ${dateline}` : ""} · WEIGHT × MOVE, SUMMED
          </div>
        </div>
      </div>

      <style jsx>{`
        .eng {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .eng-mob {
          display: none;
        }

        .eng__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .eng__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .eng__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        /* EXPLANATORY CAPTION — the whole module's equation. */
        .eng__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
        }

        .eng__grid {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 40px;
          margin-top: 18px;
          align-items: center;
        }

        .eng__row {
          display: grid;
          grid-template-columns: 110px 1fr 90px;
          gap: 16px;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
        }
        .eng__row.is-last {
          border-bottom-color: var(--ins-ink);
        }
        /* TRUE LABEL — ticker + its signed move (direction never
           colour-only: red always rides ▼). */
        .eng__name {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .eng__move {
          font-size: 10px;
          font-weight: 600;
          color: var(--ins-gray-600);
        }
        .eng__move.is-neg {
          color: var(--ins-signal);
        }

        .eng__spine {
          position: relative;
          display: block;
          height: 14px;
        }
        .eng__spine-line {
          position: absolute;
          left: 50%;
          top: -4px;
          bottom: -4px;
          width: 1px;
          background: var(--ins-ink);
        }
        .eng__bar {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          background: var(--ins-ink);
          transform-origin: left center;
        }
        .eng__bar.is-neg {
          left: auto;
          right: 50%;
          background: var(--ins-signal);
          transform-origin: right center;
        }
        /* Bars sweep from the spine once armed — un-armed is finished. */
        .eng[data-armed="true"] .eng__bar {
          animation: ins-engTapeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ins-engTapeIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .eng__pp {
          font-size: 15px;
          font-weight: 700;
          text-align: right;
          white-space: nowrap;
        }
        .eng__pp.is-neg {
          color: var(--ins-signal);
        }

        /* ── The assembled card ────────────────────────────────── */
        .eng__card {
          border: 1px solid var(--ins-ink);
          padding: 20px 22px;
          text-align: center;
        }
        /* TRUE LABEL. */
        .eng__card-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .eng__card-value {
          margin-top: 8px;
          font-size: 44px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        /* TRUE LABEL — the stamp under the figure. */
        .eng__card-sub {
          margin-top: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 960px) {
          .eng__grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .eng__card {
            justify-self: start;
            text-align: left;
          }
        }

        @media (max-width: 640px) {
          .eng {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .eng-desk {
            display: none;
          }
          .eng-mob {
            display: inline;
          }
          .eng__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .eng__grid {
            margin-top: 10px;
            gap: 0;
          }
          .eng__row {
            grid-template-columns: 34px 1fr 62px;
            gap: 10px;
            padding: 9px 0;
          }
          .eng__name {
            font-size: 10px;
          }
          .eng__move {
            display: none;
          }
          .eng__spine {
            height: 10px;
          }
          .eng__spine-line {
            top: -3px;
            bottom: -3px;
          }
          .eng__pp {
            font-size: 11px;
          }
        }
      `}</style>
    </section>
  );
}
