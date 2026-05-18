"use client";

import { useEffect, useState } from "react";

interface WeightingComparisonProps {
  compact?: boolean;
}

type Slice = { name: string; pct: number; color: string; sub: string };

const VEQT_SLICES: Slice[] = [
  { name: "US", pct: 43, color: "var(--stamp)", sub: "follows market" },
  { name: "Canada", pct: 30, color: "var(--ink)", sub: "30% target" },
  { name: "Dev", pct: 20, color: "var(--amber)", sub: "follows market" },
  { name: "EM", pct: 7, color: "var(--rule)", sub: "follows market" },
];

const XEQT_SLICES: Slice[] = [
  { name: "US", pct: 45, color: "var(--stamp)", sub: "fixed" },
  { name: "Canada", pct: 25, color: "var(--ink)", sub: "fixed" },
  { name: "Dev", pct: 25, color: "var(--amber)", sub: "fixed" },
  { name: "EM", pct: 5, color: "var(--rule)", sub: "fixed" },
];

function Donut({
  slices,
  label,
  sub,
  size,
}: {
  slices: Slice[];
  label: string;
  sub: string;
  size: number;
}) {
  const cx = size;
  const cy = size;
  const r = size * 0.71;
  let acc = -90;
  return (
    <svg width={size * 2} height={size * 2} viewBox={`0 0 ${size * 2} ${size * 2}`} aria-hidden>
      {slices.map((s) => {
        const start = acc;
        const end = acc + (s.pct / 100) * 360;
        acc = end;
        const sa = (start * Math.PI) / 180;
        const ea = (end * Math.PI) / 180;
        const x1 = cx + r * Math.cos(sa);
        const y1 = cy + r * Math.sin(sa);
        const x2 = cx + r * Math.cos(ea);
        const y2 = cy + r * Math.sin(ea);
        const large = end - start > 180 ? 1 : 0;
        return (
          <path
            key={s.name}
            d={`M ${cx},${cy} L ${x1.toFixed(1)},${y1.toFixed(1)} A ${r.toFixed(1)},${r.toFixed(1)} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`}
            fill={s.color}
            stroke="var(--paper-light)"
            strokeWidth="2"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--paper-light)" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="9.5"
        fontWeight={700}
        letterSpacing="0.22em"
        fill="var(--ink-mute)"
      >
        {label}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        fontSize="11"
        fill="var(--ink)"
      >
        {sub}
      </text>
    </svg>
  );
}

function Legend({ slices }: { slices: Slice[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {slices.map((s) => (
        <div
          key={s.name}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            padding: "3px 0",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: s.color,
              flexShrink: 0,
              alignSelf: "center",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              width: 50,
              color: "var(--ink)",
            }}
          >
            {s.name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 16,
              fontVariantNumeric: "tabular-nums",
              color: "var(--ink)",
            }}
          >
            {s.pct}%
          </span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: "var(--ink-mute)",
              marginLeft: 6,
            }}
          >
            {s.sub}
          </span>
        </div>
      ))}
    </div>
  );
}

export function WeightingComparison({ compact }: WeightingComparisonProps = {}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const mobile = compact ?? isMobile;
  const donutSize = mobile ? 60 : 78;

  return (
    <div className="my-10" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          Two ways to slice the world
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
          One breathes. One is frozen.
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
          gap: 0,
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
        }}
      >
        {/* VEQT */}
        <div
          style={{
            padding: mobile ? "28px 22px" : "32px 32px",
            borderRight: mobile ? "none" : "1px solid var(--ink)",
            borderBottom: mobile ? "1px solid var(--ink)" : "none",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "var(--stamp)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <Donut slices={VEQT_SLICES} label="VEQT" sub="alive" size={donutSize} />
            <Legend slices={VEQT_SLICES} />
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              marginTop: 18,
              marginBottom: 0,
            }}
          >
            VEQT pins Canada at 30%, then lets the non-Canadian 70% breathe
            with the global market. If the US shrinks, VEQT&rsquo;s US sleeve
            shrinks with it.{" "}
            <em
              style={{
                color: "var(--stamp)",
                fontStyle: "italic",
                fontWeight: 600,
              }}
            >
              It&rsquo;s the more passive of the two passive funds.
            </em>
          </p>
        </div>

        {/* XEQT */}
        <div
          style={{
            padding: mobile ? "28px 22px" : "32px 32px",
            background: "color-mix(in oklab, var(--ink) 3%, transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <Donut slices={XEQT_SLICES} label="XEQT" sub="frozen" size={donutSize} />
            <Legend slices={XEQT_SLICES} />
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              marginTop: 18,
              marginBottom: 0,
            }}
          >
            XEQT uses fixed targets — 45/25/25/5. They are an active
            allocation choice wearing passive clothing. If global market
            dynamics shift, the targets only move when BlackRock decides
            they should.
          </p>
        </div>
      </div>
    </div>
  );
}
