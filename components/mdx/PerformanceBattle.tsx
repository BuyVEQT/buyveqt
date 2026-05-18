"use client";

import { useEffect, useMemo, useState } from "react";

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

const STAMP = "var(--stamp)";
const INK = "var(--ink)";
const INK_MUTE = "var(--ink-mute)";
const RULE_SOFT = "var(--rule-soft)";
const PAPER_LIGHT = "var(--paper-light)";

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

export function PerformanceBattle({ compact }: PerformanceBattleProps = {}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const mobile = compact ?? isMobile;

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

  const chartH = mobile ? 200 : 280;
  const chartW = mobile ? 320 : 720;
  const padL = 60;
  const padR = 80;
  const padT = 20;
  const padB = 32;
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
      .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.t).toFixed(1)},${yScale(p.v).toFixed(1)}`)
      .join(" ");
  };

  const grids = [1.0, 1.25, 1.5, 1.75];
  const xTicks = mobile
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

  return (
    <div className="my-10" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          Five-year battle · $10,000 invested
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: mobile ? 24 : 32,
            lineHeight: 1.05,
            letterSpacing: "-0.018em",
            margin: "8px 0 0",
            color: "var(--ink)",
          }}
        >
          The argument that quietly wins itself.
        </h3>
      </div>

      <div
        style={{
          background: PAPER_LIGHT,
          border: "1px solid var(--ink)",
          padding: mobile ? "22px 16px" : "28px 32px",
        }}
      >
        {loading ? (
          <div
            className="skeleton"
            aria-busy="true"
            style={{
              width: "100%",
              height: chartH + 40,
              borderRadius: 8,
            }}
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
                  stroke={RULE_SOFT}
                  strokeDasharray="2 4"
                />
                <text
                  x={padL - 10}
                  y={yScale(v) + 4}
                  textAnchor="end"
                  fontFamily="var(--font-sans)"
                  fontSize="10"
                  fontWeight={600}
                  letterSpacing="0.06em"
                  fill={INK_MUTE}
                >
                  {fmtUSD(v)}
                </text>
              </g>
            ))}

            {xTicks.map(([t, label]) => (
              <text
                key={String(label)}
                x={xScale(t as number)}
                y={chartH + padT + 20}
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontSize="10"
                fontWeight={600}
                letterSpacing="0.06em"
                fill={INK_MUTE}
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
              stroke={STAMP}
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
                  fill={STAMP}
                  stroke={PAPER_LIGHT}
                  strokeWidth="2.5"
                />
                <g transform={`translate(${xScale(1) + 10}, ${yScale(veqt.final) - 4})`}>
                  <text fontFamily="var(--font-sans)" fontSize="11" fontWeight={700} letterSpacing="0.04em" fill={STAMP}>
                    VEQT
                  </text>
                  <text x="0" y="14" fontFamily="var(--font-display)" fontSize="14" fontWeight={500} fill={STAMP}>
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
                  stroke={PAPER_LIGHT}
                  strokeWidth="2.5"
                />
                <g transform={`translate(${xScale(1) + 10}, ${yScale(xeqt.final) + 16})`}>
                  <text fontFamily="var(--font-sans)" fontSize="11" fontWeight={700} letterSpacing="0.04em" fill={INK}>
                    XEQT
                  </text>
                  <text x="0" y="14" fontFamily="var(--font-display)" fontSize="14" fontWeight={500} fill={INK}>
                    {fmtUSD(xeqt.final)}
                  </text>
                </g>
              </>
            )}
          </svg>
        )}

        <div
          style={{
            marginTop: 6,
            paddingTop: 18,
            borderTop: `1px solid ${RULE_SOFT}`,
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {[
            { l: "VEQT, 5y annualised", v: "+12.69%", tone: STAMP },
            { l: "XEQT, 5y annualised", v: "+12.45%", tone: INK },
            { l: "The gap", v: "+0.24%/yr", tone: STAMP, sub: "in VEQT’s favour" },
            { l: "Correlation", v: "0.99", tone: INK, sub: "they’re twins" },
          ].map((s) => (
            <div key={s.l}>
              <div className="ed-label" style={{ fontSize: 9.5, margin: 0 }}>
                {s.l}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: mobile ? 20 : 24,
                  marginTop: 4,
                  color: s.tone,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.012em",
                }}
              >
                {s.v}
              </div>
              {s.sub && (
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 11.5,
                    color: INK_MUTE,
                    marginTop: 2,
                  }}
                >
                  {s.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13.5,
          lineHeight: 1.55,
          color: INK_MUTE,
          marginTop: 14,
          marginBottom: 0,
          maxWidth: "64ch",
        }}
      >
        The conventional wisdom is that XEQT&rsquo;s heavier US tilt should
        have pulled it ahead. It hasn&rsquo;t. VEQT has quietly outpaced
        XEQT every rolling year since inception — by an amount that
        compounds.
        {usingFallback && (
          <span style={{ opacity: 0.5 }}> Chart shown with cached shape; live data unavailable.</span>
        )}
      </p>
    </div>
  );
}
