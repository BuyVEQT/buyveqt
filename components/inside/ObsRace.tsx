"use client";

import { useEffect, useMemo, useState } from "react";
import { SLEEVES } from "@/data/sleeves";
import { useArmOnView } from "./useArmOnView";

/** VEQT's first session — every sleeve's $100 is placed here. */
const RACE_START = "2019-01-29";

const VIEW_W = 900;
const VIEW_H = 260;
const WEEK_MS = 7 * 86_400_000;

/** Stroke + rail colour per lane, heaviest sleeve first (10b). */
const LANES: Record<string, { stroke: string; width: number; cls: string }> = {
  VUN: { stroke: "var(--ins-signal)", width: 3, cls: "is-vun" },
  VCN: { stroke: "var(--ins-ink)", width: 2, cls: "is-vcn" },
  VIU: { stroke: "rgba(17,17,17,0.55)", width: 2, cls: "is-viu" },
  VEE: { stroke: "rgba(17,17,17,0.3)", width: 2, cls: "is-vee" },
};

interface ChartPoint {
  date: string;
  close: number;
}

interface Lane {
  ticker: string;
  /** Weekly-downsampled indexed series (start = 100). */
  values: number[];
  /** $ value of $100 today, rounded. */
  endValue: number;
}

/** Last close of each calendar week — ~390 points instead of ~1,900. The
 *  plot is ~830px wide, so weekly resolution is visually identical and the
 *  four paths stay light. First and last sessions always survive. */
function weeklyDownsample(points: ChartPoint[]): ChartPoint[] {
  if (points.length <= 2) return points;
  const out: ChartPoint[] = [];
  let currentWeek = -1;
  for (const p of points) {
    const week = Math.floor(Date.parse(`${p.date}T12:00:00Z`) / WEEK_MS);
    if (week !== currentWeek) {
      out.push(p);
      currentWeek = week;
    } else {
      out[out.length - 1] = p;
    }
  }
  return out;
}

/**
 * THE RACE — "$100 in each sleeve, since launch." (artboard 10b).
 *
 * Four SVG lines, daily adjusted closes indexed to 100 at VEQT's first
 * session, drawing in staggered when the section first scrolls into view.
 * Hovering a line or its rail row isolates it — the other three dim.
 * Adjusted closes carry reinvested distributions, and the caption says so.
 *
 * Data rides the existing /api/funds/chart/{ticker}?range=ALL route (edge
 * cached for a day), one request per sleeve, all failures independent.
 */
export default function ObsRace() {
  const { ref, armed } = useArmOnView<HTMLElement>();
  const [series, setSeries] = useState<Map<string, ChartPoint[]> | null>(null);
  const [failed, setFailed] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(
        SLEEVES.map(async (s) => {
          const res = await fetch(`/api/funds/chart/${s.ticker}?range=ALL`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as {
            data: ChartPoint[];
            error: boolean;
          };
          if (json.error || !json.data?.length) throw new Error("empty");
          return [s.ticker, json.data] as const;
        })
      );
      if (cancelled) return;

      const map = new Map<string, ChartPoint[]>();
      for (const r of results) {
        if (r.status === "fulfilled") map.set(r.value[0], r.value[1]);
      }
      if (map.size === 0) {
        setFailed(true);
      } else {
        setSeries(map);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lanes = useMemo<Lane[]>(() => {
    if (!series) return [];
    return SLEEVES.flatMap((meta) => {
      const raw = series.get(meta.ticker);
      if (!raw) return [];
      const sliced = weeklyDownsample(
        raw.filter((p) => p.date >= RACE_START && p.close > 0)
      );
      if (sliced.length < 2) return [];
      const base = sliced[0].close;
      const values = sliced.map((p) => (p.close / base) * 100);
      return [
        {
          ticker: meta.ticker,
          values,
          endValue: Math.round(values[values.length - 1]),
        },
      ];
    });
  }, [series]);

  const { paths, yearLabels } = useMemo(() => {
    if (lanes.length === 0)
      return { paths: new Map<string, string>(), yearLabels: [] as string[] };

    let min = Infinity;
    let max = -Infinity;
    for (const lane of lanes) {
      for (const v of lane.values) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const pad = (max - min) * 0.04 || 1;
    min -= pad;
    max += pad;

    const p = new Map<string, string>();
    for (const lane of lanes) {
      const n = lane.values.length;
      const d = lane.values
        .map((v, i) => {
          const x = ((i / (n - 1)) * VIEW_W).toFixed(1);
          const y = (VIEW_H - ((v - min) / (max - min)) * VIEW_H).toFixed(1);
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
      p.set(lane.ticker, d);
    }

    const startYear = Number(RACE_START.slice(0, 4));
    const nowYear = new Date().getFullYear();
    const labels: string[] = [];
    for (let y = startYear; y < nowYear; y += 2) labels.push(String(y));
    labels.push("TODAY");

    return { paths: p, yearLabels: labels };
  }, [lanes]);

  const ready = lanes.length > 0;

  return (
    <section
      ref={ref}
      className="race"
      aria-label="One hundred dollars in each sleeve since launch"
      data-armed={armed && ready ? "true" : "false"}
    >
      <div className="race__head">
        <div>
          <div className="race__kicker">The race</div>
          <h2 className="race__display">$100 in each sleeve, since launch.</h2>
        </div>
        <span className="race__caption">
          Daily adjusted closes · Jan 2019 → today · distributions reinvested
        </span>
      </div>

      <div className="race__grid">
        <div className="race__plot" onPointerLeave={() => setFocus(null)}>
          {ready ? (
            <>
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="none"
                className="race__svg"
                role="img"
                aria-label={`Growth of $100 since January 2019: ${lanes
                  .map((l) => `${l.ticker} to $${l.endValue}`)
                  .join(", ")}`}
              >
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    y1={VIEW_H * f}
                    x2={VIEW_W}
                    y2={VIEW_H * f}
                    className="race__grid-line"
                  />
                ))}
                {lanes.map((lane) => {
                  const conf = LANES[lane.ticker];
                  const dimmed = focus !== null && focus !== lane.ticker;
                  return (
                    <g key={lane.ticker}>
                      <path
                        d={paths.get(lane.ticker)}
                        fill="none"
                        stroke={conf.stroke}
                        strokeWidth={conf.width}
                        pathLength={1}
                        vectorEffect="non-scaling-stroke"
                        className={`race__line ${conf.cls}${dimmed ? " is-dim" : ""}`}
                      />
                      <path
                        d={paths.get(lane.ticker)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={16}
                        vectorEffect="non-scaling-stroke"
                        className="race__hit"
                        onPointerEnter={() => setFocus(lane.ticker)}
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="race__years" aria-hidden="true">
                {yearLabels.map((y) => (
                  <span key={y}>{y}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="race__skeleton" aria-hidden="true">
              {failed ? "THE TAPE DIDN'T ANSWER — TRY A RELOAD" : ""}
            </div>
          )}
        </div>

        <div className="race__rail" onPointerLeave={() => setFocus(null)}>
          {SLEEVES.map((meta, i) => {
            const lane = lanes.find((l) => l.ticker === meta.ticker);
            const conf = LANES[meta.ticker];
            const dimmed = focus !== null && focus !== meta.ticker;
            return (
              <div
                key={meta.ticker}
                className={`race__row ${conf.cls}${dimmed ? " is-dim" : ""}`}
                style={{ animationDelay: `${2 + i * 0.2}s` }}
                onPointerEnter={() => setFocus(meta.ticker)}
              >
                <span className="race__row-label">
                  {meta.ticker} · {meta.railLabel}
                </span>
                <span className="race__row-value">
                  {lane ? `$${lane.endValue}` : "—"}
                </span>
              </div>
            );
          })}
          <div className="race__hint">
            Hover a line to isolate it — the other three dim.
          </div>
        </div>
      </div>

      <style jsx>{`
        .race {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }

        .race__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .race__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .race__display {
          margin: 8px 0 0;
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--ins-ink);
        }
        /* EXPLANATORY CAPTION — what the lines are made of. */
        .race__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
        }

        .race__grid {
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 40px;
          margin-top: 18px;
          align-items: stretch;
        }

        .race__plot {
          position: relative;
          border-bottom: 1px solid var(--ins-ink);
          border-left: 1px solid var(--ins-hair);
          padding-bottom: 0;
          margin-bottom: 22px;
        }
        .race__svg {
          display: block;
          width: 100%;
          height: 260px;
        }
        .race__svg :global(.race__grid-line) {
          stroke: var(--ins-track-soft);
          stroke-width: 1;
        }
        .race__svg :global(.race__line) {
          transition: opacity 0.2s ease;
        }
        .race__svg :global(.race__line.is-dim) {
          opacity: 0.15;
        }
        .race__svg :global(.race__hit) {
          cursor: crosshair;
        }

        /* Lines draw in once armed; the un-armed frame is the finished
           chart (dash properties exist only under [data-armed]). */
        .race[data-armed="true"] .race__svg :global(.race__line) {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: ins-raceDraw 2.2s ease-out both;
        }
        .race[data-armed="true"] .race__svg :global(.race__line.is-vcn) {
          animation-delay: 0.2s;
        }
        .race[data-armed="true"] .race__svg :global(.race__line.is-viu) {
          animation-delay: 0.4s;
        }
        .race[data-armed="true"] .race__svg :global(.race__line.is-vee) {
          animation-delay: 0.6s;
        }
        @keyframes ins-raceDraw {
          to {
            stroke-dashoffset: 0;
          }
        }

        /* TRUE LABEL — year ticks. */
        .race__years {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -22px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--ins-gray-600);
        }

        .race__skeleton {
          height: 260px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            var(--ins-track-soft) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
        }

        /* ── End-value rail ────────────────────────────────────── */
        .race__rail {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px 0 22px;
          min-width: 0;
        }
        .race__row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          border-bottom: 1px solid var(--ins-hair-soft);
          padding-bottom: 10px;
          transition: opacity 0.2s ease;
          cursor: default;
        }
        .race__row:nth-last-child(2) {
          border-bottom: none;
        }
        .race__row.is-dim {
          opacity: 0.25;
        }
        /* Rail values pop in after the lines land. */
        .race[data-armed="true"] .race__row {
          animation: ins-fadeUp 0.6s ease-out both;
        }
        /* TRUE LABEL — lane nameplates, toned like their lines. */
        .race__row-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }
        .race__row.is-vun .race__row-label {
          color: var(--ins-signal);
        }
        .race__row.is-viu .race__row-label {
          color: rgba(17, 17, 17, 0.55);
        }
        .race__row.is-vee .race__row-label {
          color: rgba(17, 17, 17, 0.35);
        }
        .race__row-value {
          font-size: 22px;
          font-weight: 700;
        }
        /* EXPLANATORY CAPTION — the interaction hint. */
        .race__hint {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 1100px) {
          .race__display {
            font-size: 32px;
          }
          .race__grid {
            grid-template-columns: 1fr 210px;
            gap: 28px;
          }
        }

        /* ── Mobile 390 — compact plot, values as a row ────────── */
        @media (max-width: 640px) {
          .race {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .race__display {
            margin-top: 6px;
            font-size: 24px;
            letter-spacing: -0.02em;
          }
          .race__caption {
            display: none;
          }
          .race__grid {
            grid-template-columns: 1fr;
            gap: 0;
            margin-top: 12px;
          }
          .race__svg,
          .race__skeleton {
            height: 120px;
          }
          .race__plot {
            margin-bottom: 0;
          }
          .race__years {
            display: none;
          }
          .race__rail {
            flex-direction: row;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 6px 14px;
            padding: 8px 0 0;
          }
          .race__row,
          .race[data-armed="true"] .race__row {
            border-bottom: none;
            padding-bottom: 0;
            gap: 6px;
            animation: none;
          }
          .race__row-label {
            font-size: 10px;
          }
          .race__row-value {
            font-size: 12px;
          }
          .race__hint {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
