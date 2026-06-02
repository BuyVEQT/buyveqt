"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

/**
 * The article's hero claim, made visual: Canada is ~3% of global stock-market
 * cap, yet VEQT holds ~30% — a 10x deliberate overweight. Three scaled bars
 * (global cap weight / XEQT / VEQT) share one axis so the 10x gap between the
 * market and VEQT is read at a glance. Broadsheet styling, token-driven so it
 * inherits dark mode; responsive via useContainerWidth.
 */

const COMPACT_THRESHOLD = 600;
const MAX_SCALE = 33; // % axis headroom so the 30% bar isn't pinned to the edge

type Row = {
  label: string;
  sub: string;
  pct: number;
  color: string;
  highlight?: boolean;
};

const ROWS: Row[] = [
  { label: "Global market cap", sub: "what pure indexing implies", pct: 3, color: "var(--ink-faint)" },
  { label: "XEQT", sub: "fixed 25% target", pct: 25, color: "var(--ink-mute)" },
  { label: "VEQT", sub: "deliberate 30% tilt", pct: 30, color: "var(--stamp)", highlight: true },
];

export function HomeBiasOverweight() {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const mobile = width > 0 && width < COMPACT_THRESHOLD;

  return (
    <div ref={ref} className="flagship-bleed" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          The Canadian overweight
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
          3% of the world. 30% of the fund.
        </h3>
      </div>

      <div
        style={{
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
          padding: mobile ? "20px 16px" : "30px 32px 26px",
        }}
      >
        <div style={{ display: "grid", gap: mobile ? 16 : 18 }}>
          {ROWS.map((r) => (
            <div key={r.label}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: r.highlight ? "var(--stamp)" : "var(--ink)",
                  }}
                >
                  {r.label}
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontWeight: 400,
                      letterSpacing: 0,
                      fontSize: 12.5,
                      color: "var(--ink-mute)",
                      marginLeft: 8,
                    }}
                  >
                    {r.sub}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: r.highlight ? 22 : 18,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    color: r.highlight ? "var(--stamp)" : "var(--ink)",
                    flexShrink: 0,
                  }}
                >
                  {r.pct}%
                </span>
              </div>
              <div
                style={{
                  height: r.highlight ? 18 : 12,
                  background: "color-mix(in oklab, var(--ink) 8%, transparent)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${(r.pct / MAX_SCALE) * 100}%`,
                    background: r.color,
                  }}
                  role="img"
                  aria-label={`${r.label}: ${r.pct}% Canada allocation`}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginTop: mobile ? 18 : 22,
            paddingTop: mobile ? 16 : 18,
            borderTop: "1px solid var(--rule-soft)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: mobile ? 34 : 44,
              lineHeight: 0.9,
              color: "var(--stamp)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            10&times;
          </span>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: mobile ? 14.5 : 15.5,
              lineHeight: 1.5,
              color: "var(--ink-soft)",
              margin: 0,
            }}
          >
            VEQT holds roughly{" "}
            <strong style={{ fontWeight: 600, fontStyle: "normal" }}>
              ten times
            </strong>{" "}
            Canada&rsquo;s weight in the global market. The rest of this article
            is the case for why that is deliberate, not a defect.
          </p>
        </div>
      </div>
    </div>
  );
}
