"use client";

import { useSleeves } from "@/lib/useSleeves";
import { SLEEVES } from "@/data/sleeves";
import { FUND_DATA_LAST_UPDATED } from "@/data/funds";
import { parseSessionDate } from "@/lib/instrument-format";
import { classifyDrift, driftDotLeft, type DriftReading } from "./driftMath";

interface DriftRow {
  label: string;
  reading: DriftReading;
}

/**
 * DRIFT FROM TARGET — one line per sleeve, no dials (artboard 10b).
 *
 * A soft track, a centre tick, and one dot per sleeve offset by its drift
 * from the tick (±1 pp = ±40% of the half-track). Red is spent on OVER
 * only. Desktop shows four lines inside the ledger's right column; the
 * mobile variant stands alone after the engine and folds VIU + VEE into
 * one line when both sit on target — the 390 artboard's move.
 *
 * VCN's tick is Vanguard's real 30% Canada pin; the other three are
 * measured against their last factsheet weights (no fixed targets exist),
 * and the caption says so.
 */
export default function DriftBlock({
  variant,
}: {
  variant: "desktop" | "mobile";
}) {
  const { data } = useSleeves();

  const readings = SLEEVES.map((meta) => ({
    meta,
    reading: classifyDrift(
      data?.sleeves.find((s) => s.ticker === meta.ticker)?.liveWeight ?? null,
      meta.targetWeight
    ),
  }));

  let rows: DriftRow[] = readings.map((r) => ({
    label: r.meta.ticker,
    reading: r.reading,
  }));

  // Mobile folds VIU + VEE into one line when both sit on the tick.
  if (variant === "mobile") {
    const viu = readings.find((r) => r.meta.ticker === "VIU")!;
    const vee = readings.find((r) => r.meta.ticker === "VEE")!;
    if (viu.reading.kind === "on" && vee.reading.kind === "on") {
      rows = [
        ...rows.filter((r) => r.label !== "VIU" && r.label !== "VEE"),
        { label: "VIU + VEE", reading: { kind: "on", label: "ON TARGET", pp: 0 } },
      ];
    }
  }

  const factsheet = parseSessionDate(FUND_DATA_LAST_UPDATED).toLocaleDateString(
    "en-CA",
    { month: "short", year: "numeric", timeZone: "UTC" }
  );

  return (
    <div className={`drift drift--${variant}`}>
      <div className="drift__label">
        {variant === "desktop"
          ? "Drift from target — one line, no dials"
          : "Drift — one line per sleeve, no dials"}
      </div>

      <div className="drift__rows">
        {rows.map((row) => {
          const mobileLabel = row.reading.label.replace(" PP ", " ");
          return (
            <div className="drift__row" key={row.label}>
              <span className="drift__ticker">{row.label}</span>
              <span className="drift__track">
                <span className="drift__tick" />
                <span
                  className={`drift__dot${row.reading.kind === "over" ? " is-over" : ""}`}
                  style={{ left: `${driftDotLeft(row.reading.pp)}%` }}
                />
              </span>
              <span
                className={`drift__reading${row.reading.kind === "over" ? " is-over" : ""}`}
              >
                {variant === "mobile" ? mobileLabel : row.reading.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="drift__note">
        Vanguard snaps the dot back to the tick each quarter — it rarely
        strays. Ticks: the 30% Canada pin; others, the {factsheet} factsheet.
      </p>

      <style jsx>{`
        .drift {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          min-width: 0;
        }
        .drift--desk {
        }
        /* Each variant renders only on its side of 640px. */
        .drift--mobile {
          display: none;
        }

        /* TRUE LABEL — names the instrument. */
        .drift__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .drift__rows {
          margin-top: 10px;
          border-top: 1px solid var(--ins-ink);
        }
        .drift__row {
          display: grid;
          grid-template-columns: 44px 1fr 104px;
          gap: 16px;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
        }
        .drift__row:last-child {
          border-bottom-color: var(--ins-ink);
        }
        /* TRUE LABEL — the sleeve's ticker. */
        .drift__ticker {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .drift__track {
          position: relative;
          display: block;
          height: 8px;
          background: var(--ins-track-soft);
        }
        .drift__tick {
          position: absolute;
          left: 50%;
          top: -4px;
          width: 1px;
          height: 16px;
          background: var(--ins-ink);
        }
        .drift__dot {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--ins-ink);
        }
        .drift__dot.is-over {
          background: var(--ins-signal);
        }
        /* The drift stamp — same grammar as the sleeve panel. */
        .drift__reading {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--ins-gray-600);
          text-align: right;
          white-space: nowrap;
        }
        .drift__reading.is-over {
          color: var(--ins-signal);
        }
        /* EXPLANATORY CAPTION — mechanics + which tick is which. */
        .drift__note {
          margin: 8px 0 0;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 640px) {
          .drift--desktop {
            display: none;
          }
          .drift--mobile {
            display: block;
          }
          .drift__row {
            grid-template-columns: 64px 1fr 80px;
            gap: 10px;
            padding: 11px 0;
          }
          .drift__ticker {
            font-size: 10px;
          }
          .drift__track {
            height: 6px;
          }
          .drift__tick {
            top: -3px;
            height: 12px;
          }
          .drift__dot {
            width: 9px;
            height: 9px;
          }
          .drift__reading {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
