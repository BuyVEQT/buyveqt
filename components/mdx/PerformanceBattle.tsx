"use client";

import { useEffect, useMemo, useState } from "react";
import { useContainerWidth } from "@/lib/useContainerWidth";

interface PerformanceBattleProps {
  compact?: boolean;
}

type Point = { date: string; close: number };

interface SeriesResponse {
  data: Point[];
  error?: boolean;
}

interface NormalizedSeries {
  pts: { t: number; v: number }[];
  final: number;
}

const COMPACT_THRESHOLD = 600;

/* Instrument palette. The chart draws VEQT in signal red and XEQT in ink —
   the same two-voice convention the rest of the article uses. */
const SIGNAL = "var(--ins-signal)";
const INK = "var(--ins-ink)";
const MUTE = "var(--ins-gray-600)";
const HAIR = "var(--ins-hair)";
const PAPER = "var(--ins-paper)";
const FONT = "var(--ins-font)";

const css = `
.mpb {
  margin: 34px 0 30px;
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 14px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.mpb__kicker {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.mpb__headline {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.mpb__box {
  margin-top: 16px;
  border: 1px solid var(--ins-ink);
  background: var(--ins-paper);
  padding: 24px 26px 22px;
}
.mpb__stats {
  margin-top: 14px;
  padding-top: 16px;
  border-top: 1px solid var(--ins-hair);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}
.mpb__statLabel {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.mpb__statValue {
  margin-top: 4px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
}
.mpb__statValue--lead {
  color: var(--ins-signal);
}
.mpb__statSub {
  margin-top: 3px;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.mpb__caption {
  margin: 10px 0 0;
  max-width: 68ch;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.7;
  color: var(--ins-gray-600);
}

@media (max-width: 640px) {
  .mpb {
    margin: 22px 0 20px;
    padding-top: 12px;
  }
  .mpb__kicker {
    font-size: 9px;
    letter-spacing: 0.18em;
  }
  .mpb__headline {
    font-size: 19px;
    letter-spacing: -0.015em;
  }
  .mpb__box {
    padding: 14px 12px 16px;
  }
  .mpb__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .mpb__statValue {
    font-size: 19px;
  }
  .mpb__caption {
    font-size: 8px;
    letter-spacing: 0.1em;
  }
}
`;

const FALLBACK_VEQT: number[] = [
  1.0, 1.08, 0.9, 1.05, 1.18, 1.32, 1.41, 1.5, 1.42, 1.36, 1.3, 1.45, 1.58,
  1.69, 1.78, 1.82,
];
const FALLBACK_XEQT: number[] = [
  1.0, 1.09, 0.91, 1.06, 1.2, 1.34, 1.42, 1.5, 1.4, 1.32, 1.27, 1.42, 1.55,
  1.66, 1.74, 1.78,
];

function normalize(data: Point[]): NormalizedSeries | null {
  if (!data || data.length === 0) return null;
  const start = new Date(data[0].date + "T00:00:00").getTime();
  const end = new Date(data[data.length - 1].date + "T00:00:00").getTime();
  const range = Math.max(1, end - start);
  const base = data[0].close;
  const pts = data.map((d) => {
    const t = (new Date(d.date + "T00:00:00").getTime() - start) / range;
    return { t, v: d.close / base };
  });
  return { pts, final: pts[pts.length - 1].v };
}

function buildFallback(arr: number[]): NormalizedSeries {
  const pts = arr.map((v, i) => ({ t: i / (arr.length - 1), v }));
  return { pts, final: arr[arr.length - 1] };
}

/**
 * Five-year battle — restyled into Instrument chrome for Turn 7. No Turn 7
 * exhibit was drawn for this one, so the reading is untouched: same live
 * 5Y series, same cached-shape fallback, same four summary stats. What
 * changed is the dress — ink rule and red kicker instead of the italic
 * display header, a square 1px ink box instead of the tinted card, Archivo
 * everywhere, and the chart drawn in signal red vs ink.
 */
export function PerformanceBattle({ compact }: PerformanceBattleProps = {}) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const auto = width > 0 && width < COMPACT_THRESHOLD;
  const mobile = compact ?? auto;

  const [veqt, setVeqt] = useState<NormalizedSeries | null>(null);
  const [xeqt, setXeqt] = useState<NormalizedSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [v, x] = await Promise.all([
          fetch("/api/funds/chart/VEQT?range=5Y").then((r) =>
            r.ok ? r.json() : Promise.reject(new Error("bad response"))
          ),
          fetch("/api/funds/chart/XEQT?range=5Y").then((r) =>
            r.ok ? r.json() : Promise.reject(new Error("bad response"))
          ),
        ]);
        if (cancelled) return;
        const vNorm = normalize((v as SeriesResponse).data);
        const xNorm = normalize((x as SeriesResponse).data);
        if (vNorm && xNorm) {
          setVeqt(vNorm);
          setXeqt(xNorm);
        } else {
          setVeqt(buildFallback(FALLBACK_VEQT));
          setXeqt(buildFallback(FALLBACK_XEQT));
          setUsingFallback(true);
        }
      } catch {
        if (cancelled) return;
        setVeqt(buildFallback(FALLBACK_VEQT));
        setXeqt(buildFallback(FALLBACK_XEQT));
        setUsingFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartH = mobile ? 180 : 320;
  const chartW = mobile ? 360 : 760;
  const padL = mobile ? 50 : 68;
  const padR = mobile ? 80 : 96;
  const padT = mobile ? 16 : 24;
  const padB = mobile ? 26 : 34;
  const innerW = chartW - padL - padR;
  const innerH = chartH;

  const { vMin, vMax } = useMemo(() => {
    if (!veqt || !xeqt) return { vMin: 1, vMax: 1.9 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of [...veqt.pts, ...xeqt.pts]) {
      if (p.v < lo) lo = p.v;
      if (p.v > hi) hi = p.v;
    }
    const span = Math.max(0.1, hi - lo);
    return { vMin: lo - span * 0.08, vMax: hi + span * 0.08 };
  }, [veqt, xeqt]);

  const xScale = (t: number) => padL + t * innerW;
  const yScale = (v: number) =>
    padT + ((vMax - v) / Math.max(0.001, vMax - vMin)) * innerH;

  const pathFor = (series: NormalizedSeries | null) => {
    if (!series) return "";
    return series.pts
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${xScale(p.t).toFixed(1)},${yScale(p.v).toFixed(1)}`
      )
      .join(" ");
  };

  const grids = [1.0, 1.25, 1.5, 1.75];
  const xTicks: [number, string][] = mobile
    ? [
        [0, "'21"],
        [0.5, "'23"],
        [1, "today"],
      ]
    : [
        [0, "'21"],
        [0.2, "'22"],
        [0.4, "'23"],
        [0.6, "'24"],
        [0.8, "'25"],
        [1, "today"],
      ];

  const fmtUSD = (v: number) =>
    `$${Math.round(10000 * v).toLocaleString("en-CA")}`;

  const stats = [
    { l: "2025, both funds", v: "≈20.45%", lead: true, sub: "A dead heat" },
    { l: "5-year leader", v: "VEQT", lead: false, sub: "By a sliver" },
    { l: "The gap", v: "<0.5%/yr", lead: true, sub: "Noise, not signal" },
    { l: "Correlation", v: "~0.97", lead: false, sub: "Near-twins" },
  ];

  return (
    <section className="mpb" ref={ref} aria-labelledby="mpb-headline">
      <div className="mpb__kicker">
        Five-year battle · $10,000 invested
      </div>
      <h3 className="mpb__headline" id="mpb-headline">
        The argument that quietly wins itself.
      </h3>

      <div className="mpb__box">
        {loading ? (
          <div
            className="skeleton"
            aria-busy="true"
            style={{ width: "100%", height: chartH + 40 }}
          />
        ) : (
          <svg
            width="100%"
            viewBox={`0 0 ${chartW} ${chartH + padB + padT}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Five-year cumulative return of $10,000 invested in VEQT and XEQT."
            style={{ display: "block" }}
          >
            {grids.map((v) => (
              <g key={v}>
                <line
                  x1={padL}
                  y1={yScale(v)}
                  x2={chartW - padR + 10}
                  y2={yScale(v)}
                  stroke={HAIR}
                  strokeDasharray="2 4"
                />
                <text
                  x={padL - 10}
                  y={yScale(v) + 4}
                  textAnchor="end"
                  fontFamily={FONT}
                  fontSize="10"
                  fontWeight={600}
                  letterSpacing="0.08em"
                  fill={MUTE}
                >
                  {fmtUSD(v)}
                </text>
              </g>
            ))}

            {xTicks.map(([t, label]) => (
              <text
                key={String(label)}
                x={xScale(t)}
                y={chartH + padT + 22}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize="10"
                fontWeight={600}
                letterSpacing="0.08em"
                fill={MUTE}
              >
                {label}
              </text>
            ))}

            <line
              x1={padL}
              y1={yScale(1)}
              x2={chartW - padR + 10}
              y2={yScale(1)}
              stroke={INK}
              strokeOpacity="0.5"
              strokeWidth="1"
            />

            <path
              d={pathFor(xeqt)}
              fill="none"
              stroke={INK}
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={pathFor(veqt)}
              fill="none"
              stroke={SIGNAL}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {veqt && (
              <>
                <circle
                  cx={xScale(1)}
                  cy={yScale(veqt.final)}
                  r="5"
                  fill={SIGNAL}
                  stroke={PAPER}
                  strokeWidth="2.5"
                />
                <g
                  transform={`translate(${xScale(1) + 10}, ${yScale(veqt.final) - 6})`}
                >
                  <text
                    fontFamily={FONT}
                    fontSize="9.5"
                    fontWeight={700}
                    letterSpacing="0.18em"
                    fill={SIGNAL}
                  >
                    VEQT
                  </text>
                  <text
                    x="0"
                    y="17"
                    fontFamily={FONT}
                    fontSize="16"
                    fontWeight={700}
                    letterSpacing="-0.02em"
                    fill={SIGNAL}
                  >
                    {fmtUSD(veqt.final)}
                  </text>
                </g>
              </>
            )}
            {xeqt && (
              <>
                <circle
                  cx={xScale(1)}
                  cy={yScale(xeqt.final)}
                  r="5"
                  fill={INK}
                  stroke={PAPER}
                  strokeWidth="2.5"
                />
                <g
                  transform={`translate(${xScale(1) + 10}, ${yScale(xeqt.final) + 18})`}
                >
                  <text
                    fontFamily={FONT}
                    fontSize="9.5"
                    fontWeight={700}
                    letterSpacing="0.18em"
                    fill={INK}
                  >
                    XEQT
                  </text>
                  <text
                    x="0"
                    y="17"
                    fontFamily={FONT}
                    fontSize="16"
                    fontWeight={700}
                    letterSpacing="-0.02em"
                    fill={INK}
                  >
                    {fmtUSD(xeqt.final)}
                  </text>
                </g>
              </>
            )}
          </svg>
        )}

        <div className="mpb__stats">
          {stats.map((s) => (
            <div key={s.l}>
              <div className="mpb__statLabel">{s.l}</div>
              <div
                className={`mpb__statValue${s.lead ? " mpb__statValue--lead" : ""}`}
              >
                {s.v}
              </div>
              <div className="mpb__statSub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="mpb__caption">
        The conventional wisdom said XEQT&rsquo;s heavier US tilt should have
        pulled it ahead — across recent windows the two are effectively tied,
        with VEQT a hair in front
        {usingFallback && " · Chart shown with cached shape; live data unavailable"}
      </p>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
