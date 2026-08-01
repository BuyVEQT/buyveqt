"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

/**
 * The article's hero claim, made visual: Canada is ~3% of global stock-market
 * cap, yet VEQT holds ~30% — a 10x deliberate overweight. Three scaled bars
 * (global cap weight / XEQT / VEQT) share one axis so the 10x gap between the
 * market and VEQT is read at a glance; responsive via useContainerWidth.
 *
 * Chrome is the Instrument: Archivo throughout, ink/gray/red tokens, square
 * corners, no shadows, emphasis by weight (Archivo ships no italic).
 */

const COMPACT_THRESHOLD = 600;
const MAX_SCALE = 33; // % axis headroom so the 30% bar isn't pinned to the edge

/** Kicker above the headline. */
const KICKER = {
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--ins-gray-600)",
  margin: 0,
} as const;

type Row = {
  label: string;
  sub: string;
  pct: number;
  color: string;
  highlight?: boolean;
};

const ROWS: Row[] = [
  { label: "Global market cap", sub: "what pure indexing implies", pct: 3, color: "var(--ins-gray-400)" },
  { label: "XEQT", sub: "fixed 25% target", pct: 25, color: "var(--ins-gray-600)" },
  { label: "VEQT", sub: "deliberate 30% tilt", pct: 30, color: "var(--ins-signal)", highlight: true },
];

export function HomeBiasOverweight() {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const mobile = width > 0 && width < COMPACT_THRESHOLD;

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "var(--ins-font)",
        color: "var(--ins-ink)",
        margin: mobile ? "22px 0 20px" : "34px 0 30px",
      }}
    >
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p style={KICKER}>The Canadian overweight</p>
        <h3
          style={{
            fontFamily: "var(--ins-font)",
            fontWeight: 700,
            fontSize: mobile ? "clamp(20px, 5vw, 22px)" : "clamp(28px, 3.4vw, 34px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "8px 0 0",
            color: "var(--ins-ink)",
          }}
        >
          3% of the world. 30% of the fund.
        </h3>
      </div>

      <div
        style={{
          background: "var(--ins-paper)",
          border: "1px solid var(--ins-ink)",
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
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: r.highlight ? "var(--ins-signal)" : "var(--ins-ink)",
                  }}
                >
                  {r.label}
                  <span
                    style={{
                      fontWeight: 500,
                      letterSpacing: 0,
                      fontSize: 12.5,
                      color: "var(--ins-gray-600)",
                      marginLeft: 8,
                    }}
                  >
                    {r.sub}
                  </span>
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: r.highlight ? 22 : 18,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    color: r.highlight ? "var(--ins-signal)" : "var(--ins-ink)",
                    flexShrink: 0,
                  }}
                >
                  {r.pct}%
                </span>
              </div>
              <div
                style={{
                  height: r.highlight ? 18 : 12,
                  background: "var(--ins-track)",
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
            borderTop: "1px solid var(--ins-hair)",
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: mobile ? 34 : 44,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: "var(--ins-signal)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            10&times;
          </span>
          <p
            style={{
              fontSize: mobile ? 14.5 : 15.5,
              fontWeight: 500,
              lineHeight: 1.5,
              color: "var(--ins-gray-700)",
              margin: 0,
            }}
          >
            VEQT holds roughly{" "}
            <strong style={{ fontWeight: 700, color: "var(--ins-ink)" }}>
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
