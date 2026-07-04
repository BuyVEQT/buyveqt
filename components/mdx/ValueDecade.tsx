"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

/**
 * The cautionary exhibit for every factor investor: the 2010–2020 US decade
 * where growth nearly tripled and value limped. Two scaled bars (Russell 1000
 * Growth vs Value, cumulative return early 2010 → March 2020) plus the
 * per-year gaps and Asness's four-sigma value spread. Static, sourced numbers
 * — this is a historical exhibit, not a live chart.
 */

const COMPACT_THRESHOLD = 600;
const MAX_SCALE = 290; // % axis headroom above growth's +264%

type Row = {
  label: string;
  sub: string;
  pct: number;
  color: string;
  highlight?: boolean;
};

const ROWS: Row[] = [
  {
    label: "Russell 1000 Growth",
    sub: "the decade's winner",
    pct: 264,
    color: "var(--ink)",
  },
  {
    label: "Russell 1000 Value",
    sub: "the side CAGE tilts toward",
    pct: 91,
    color: "var(--stamp)",
    highlight: true,
  },
];

const STATS = [
  { l: "Large value vs growth", v: "−5.3pp", sub: "per year, for a decade" },
  { l: "Small value vs growth", v: "−4.1pp", sub: "per year, for a decade" },
  { l: "Value spread by 2020", v: "≈4σ", sub: "past the dot-com extreme" },
];

export function ValueDecade() {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const mobile = width > 0 && width < COMPACT_THRESHOLD;

  return (
    <div ref={ref} className="flagship-bleed" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          US equities &middot; early 2010 &ndash; March 2020
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
          Ten years of being right eventually.
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
                  +{r.pct}%
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
                  aria-label={`${r.label}: cumulative return of +${r.pct}% from early 2010 to March 2020`}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: mobile ? 18 : 22,
            paddingTop: mobile ? 16 : 18,
            borderTop: "1px solid var(--rule-soft)",
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
            gap: mobile ? 14 : 18,
          }}
        >
          {STATS.map((s) => (
            <div key={s.l}>
              <div className="ed-label" style={{ fontSize: 9.5, margin: 0 }}>
                {s.l}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: mobile ? 20 : 26,
                  marginTop: 4,
                  color: "var(--ink)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.012em",
                  lineHeight: 1.05,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: mobile ? 14 : 15,
          lineHeight: 1.55,
          color: "var(--ink-mute)",
          marginTop: mobile ? 10 : 16,
          marginBottom: 0,
          maxWidth: "64ch",
        }}
      >
        This is the chart to war-game before buying CAGE. Anyone holding the
        value side lived through ten consecutive years of the tilt losing
        &mdash; and the academic case never stopped being &ldquo;right.&rdquo;
      </p>
    </div>
  );
}
