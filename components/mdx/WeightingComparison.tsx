"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

interface WeightingComparisonProps {
  compact?: boolean;
}

type Slice = { name: string; pct: number; color: string; sub: string };

const COMPACT_THRESHOLD = 600;

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
  const r = size * 0.74;
  let acc = -90;
  return (
    <svg
      width={size * 2}
      height={size * 2}
      viewBox={`0 0 ${size * 2} ${size * 2}`}
      style={{ flexShrink: 0 }}
      aria-hidden
    >
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
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--paper-light)" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="10"
        fontWeight={700}
        letterSpacing="0.22em"
        fill="var(--ink-mute)"
      >
        {label}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        fontSize="13"
        fill="var(--ink)"
      >
        {sub}
      </text>
    </svg>
  );
}

function Legend({ slices }: { slices: Slice[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto 1fr",
        columnGap: 8,
        rowGap: 4,
        alignItems: "baseline",
      }}
    >
      {slices.map((s) => (
        <div key={s.name} style={{ display: "contents" }}>
          <span
            style={{
              width: 9,
              height: 9,
              background: s.color,
              alignSelf: "center",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--ink)",
            }}
          >
            {s.name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 17,
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
              fontSize: 12.5,
              color: "var(--ink-mute)",
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
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const auto = width > 0 && width < COMPACT_THRESHOLD;
  const mobile = compact ?? auto;
  const donutSize = mobile ? 56 : 82;
  const panelPad = mobile ? "18px 16px 20px" : "32px 32px";

  return (
    <div ref={ref} className="flagship-bleed" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          Two ways to slice the world
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: mobile ? "clamp(20px, 5vw, 22px)" : "clamp(28px, 3.4vw, 34px)",
            lineHeight: 1.1,
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
        <div
          style={{
            padding: panelPad,
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
              gap: mobile ? 14 : 22,
              flexWrap: "wrap",
            }}
          >
            <Donut slices={VEQT_SLICES} label="VEQT" sub="alive" size={donutSize} />
            <Legend slices={VEQT_SLICES} />
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: mobile ? 14.5 : 15.5,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              marginTop: mobile ? 14 : 20,
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

        <div
          style={{
            padding: panelPad,
            background: "color-mix(in oklab, var(--ink) 4%, transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: mobile ? 14 : 22,
              flexWrap: "wrap",
            }}
          >
            <Donut slices={XEQT_SLICES} label="XEQT" sub="frozen" size={donutSize} />
            <Legend slices={XEQT_SLICES} />
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: mobile ? 14.5 : 15.5,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              marginTop: mobile ? 14 : 20,
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
