"use client";

import { useMemo } from "react";
import { useSleeves } from "@/lib/useSleeves";
import { SLEEVES } from "@/data/sleeves";
import { VEQT_DISTRIBUTIONS } from "@/data/distributions";
import { parseSessionDate } from "@/lib/instrument-format";
import { useArmOnView } from "./useArmOnView";

/** The highest-yield sleeve's bar reaches 78% of its track (10b scale). */
const BAR_MAX_PCT = 78;
const DAY_MS = 86_400_000;

function fmtMonthYear(iso: string): string {
  return parseSessionDate(iso)
    .toLocaleDateString("en-CA", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

/**
 * THE PAYOUT — "What the machine pays." (artboard 10b).
 *
 * Trailing-12-month cash yield per sleeve (the year of distributions over
 * the live price, via /api/sleeves) with bars to scale, and the ink card
 * counting down to VEQT's own annual distribution — dates and per-unit
 * amounts from the curated ledger in data/distributions.ts.
 */
export default function ObsPayout() {
  const { data } = useSleeves();
  const { ref, armed } = useArmOnView<HTMLElement>();

  const yields = SLEEVES.map((meta) => ({
    meta,
    ttmYield:
      data?.sleeves.find((s) => s.ticker === meta.ticker)?.ttmYield ?? null,
  }));
  const maxYield =
    yields.reduce((m, y) => Math.max(m, y.ttmYield ?? 0), 0) || 1;

  const distribution = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const next = [...VEQT_DISTRIBUTIONS.distributions]
      .filter((d) => d.estimated && d.exDate >= today)
      .sort((a, b) => a.exDate.localeCompare(b.exDate))[0];
    const last = VEQT_DISTRIBUTIONS.distributions.find((d) => !d.estimated);

    const days = next
      ? Math.max(
          0,
          Math.ceil(
            (parseSessionDate(next.exDate).getTime() - Date.now()) / DAY_MS
          )
        )
      : null;

    return {
      days,
      last: last
        ? { amount: last.amount, monthYear: fmtMonthYear(last.exDate) }
        : null,
    };
  }, []);

  return (
    <section
      ref={ref}
      className="pay"
      aria-label="What the machine pays"
      data-armed={armed ? "true" : "false"}
    >
      <div className="pay__head">
        <div>
          <div className="pay__kicker">The payout</div>
          <h2 className="pay__display">What the machine pays.</h2>
        </div>
        <span className="pay__caption">
          Trailing-12-month cash yield by sleeve · VEQT itself pays annually
        </span>
      </div>

      <div className="pay__grid">
        {yields.map(({ meta, ttmYield }, i) => (
          <div className="pay__cell" key={meta.ticker}>
            <div className="pay__cell-label">
              {meta.ticker} <span>{meta.shortLabel}</span>
            </div>
            <div className="pay__cell-value">
              {ttmYield == null ? "—" : `${ttmYield.toFixed(1)}%`}
            </div>
            <div className="pay__cell-track">
              {ttmYield != null && (
                <span
                  className="pay__cell-fill"
                  style={{
                    width: `${(ttmYield / maxYield) * BAR_MAX_PCT}%`,
                    animationDelay: `${0.1 + i * 0.15}s`,
                  }}
                />
              )}
            </div>
          </div>
        ))}

        <div className="pay__card">
          <div className="pay__card-kicker">Next distribution</div>
          <div className="pay__card-value" suppressHydrationWarning>
            {distribution.days == null ? "—" : `${distribution.days} DAYS`}
          </div>
          <div className="pay__card-sub">
            VEQT PAYS ANNUALLY
            {distribution.last &&
              ` · LAST $${distribution.last.amount.toFixed(2)}/UNIT · ${distribution.last.monthYear}`}
          </div>
        </div>
      </div>

      <style jsx>{`
        .pay {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }

        .pay__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .pay__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .pay__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        /* EXPLANATORY CAPTION — what the figures are and the fund's cadence. */
        .pay__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
        }

        .pay__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr) 260px;
          gap: 28px;
          margin-top: 16px;
          border-top: 1px solid var(--ins-ink);
        }

        .pay__cell {
          padding-top: 14px;
          min-width: 0;
        }
        .pay__cell + .pay__cell {
          border-left: 1px solid var(--ins-hair-soft);
          padding-left: 22px;
        }
        /* TRUE LABEL — the sleeve and its region tag. */
        .pay__cell-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .pay__cell-label span {
          font-weight: 600;
          color: var(--ins-gray-600);
        }
        .pay__cell-value {
          margin-top: 6px;
          font-size: 28px;
          font-weight: 600;
        }
        .pay__cell-track {
          height: 6px;
          background: var(--ins-track-soft);
          margin-top: 8px;
        }
        .pay__cell-fill {
          display: block;
          height: 100%;
          background: var(--ins-ink);
          transform-origin: left center;
        }
        .pay[data-armed="true"] .pay__cell-fill {
          animation: ins-payTapeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ins-payTapeIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        /* ── The countdown card — an ink cell, not an edition. ─── */
        .pay__card {
          background: #111111;
          color: #ffffff;
          padding: 16px 20px;
          margin-top: 14px;
        }
        /* TRUE LABEL — the card's one red word. */
        .pay__card-kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .pay__card-value {
          margin-top: 6px;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        /* TRUE LABEL — cadence + last print. Inverse muted tone stays the
           literal 55% white step (paper-side grays are unreadable on ink). */
        .pay__card-sub {
          margin-top: 5px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.55);
        }

        @media (max-width: 1100px) {
          .pay__grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .pay__card {
            grid-column: 1 / -1;
            justify-self: start;
            margin-top: 0;
          }
        }

        @media (max-width: 640px) {
          .pay {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .pay__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .pay__caption {
            display: none;
          }
          .pay__grid {
            grid-template-columns: 1fr 1fr;
            gap: 0 20px;
            margin-top: 12px;
            border-top: none;
          }
          .pay__cell {
            padding: 10px 0;
            border-top: 1px solid var(--ins-ink);
          }
          .pay__cell:nth-child(-n + 2) {
            border-top-width: 2px;
          }
          .pay__cell + .pay__cell {
            border-left: none;
            padding-left: 0;
          }
          .pay__cell-value {
            font-size: 22px;
          }
          .pay__card {
            grid-column: 1 / -1;
            margin-top: 12px;
            justify-self: stretch;
          }
        }
      `}</style>
    </section>
  );
}
