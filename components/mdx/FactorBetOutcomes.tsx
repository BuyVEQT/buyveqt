"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

/**
 * The math of the CAGE bet: $100,000 compounded 30 years at a 7% equity
 * baseline, under the four scenarios that matter. Scaled bars on one axis so
 * the asymmetry reads at a glance — the downside is a $26K fee-gap scrape,
 * the upside is a six-figure premium. A dashed marker pins the VEQT baseline
 * on every CAGE bar. Numbers match the article prose; keep them in sync.
 *
 * Chrome is the Instrument: Archivo throughout, ink/gray/red tokens, square
 * corners, no shadows, emphasis by weight (Archivo ships no italic).
 */

const COMPACT_THRESHOLD = 600;

const VEQT_OUTCOME = 761; // $K — 1.07^30 on $100K
const MAX_SCALE = 1240; // $K axis headroom above the best case

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
  outcome: number; // $K
  display: string;
  color: string;
  isBaseline?: boolean;
};

const ROWS: Row[] = [
  {
    label: "CAGE — zero net premium",
    sub: "a 2010s repeat: $26K behind on fees alone",
    outcome: 735,
    display: "$735K",
    color: "var(--ins-gray-400)",
  },
  {
    label: "VEQT — 7.0% baseline",
    sub: "the market return, nothing wagered",
    outcome: 761,
    display: "$761K",
    color: "var(--ins-signal)",
    isBaseline: true,
  },
  {
    label: "CAGE — +0.5% net premium",
    sub: "low end of target: $114K ahead",
    outcome: 875,
    display: "$875K",
    color: "var(--ins-gray-600)",
  },
  {
    label: "CAGE — +1.5% net premium",
    sub: "high end of target: $394K ahead",
    outcome: 1155,
    display: "$1.16M",
    color: "var(--ins-ink)",
  },
];

export function FactorBetOutcomes() {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const mobile = width > 0 && width < COMPACT_THRESHOLD;

  const baselinePct = (VEQT_OUTCOME / MAX_SCALE) * 100;

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
        <p style={KICKER}>
          $100,000 &middot; 30 years &middot; 7% equity baseline
        </p>
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
          Four endings, one holding period.
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
                    color: r.isBaseline ? "var(--ins-signal)" : "var(--ins-ink)",
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
                      display: mobile ? "block" : "inline",
                    }}
                  >
                    {r.sub}
                  </span>
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: r.isBaseline ? 22 : 18,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    color: r.isBaseline ? "var(--ins-signal)" : "var(--ins-ink)",
                    flexShrink: 0,
                  }}
                >
                  {r.display}
                </span>
              </div>
              <div
                style={{
                  height: r.isBaseline ? 18 : 12,
                  background: "var(--ins-track)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${(r.outcome / MAX_SCALE) * 100}%`,
                    background: r.color,
                  }}
                  role="img"
                  aria-label={`${r.label}: ${r.display} after 30 years`}
                />
                {!r.isBaseline && (
                  <div
                    style={{
                      position: "absolute",
                      top: -2,
                      bottom: -2,
                      left: `${baselinePct}%`,
                      width: 0,
                      borderLeft: "1.5px dashed var(--ins-signal)",
                    }}
                    aria-hidden
                  />
                )}
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
              fontSize: mobile ? 30 : 40,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              color: "var(--ins-signal)",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            10&ndash;15bp
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
            That&rsquo;s all the net factor premium CAGE needs to cover its fee
            gap. The target is ten times that. The catch is the{" "}
            <strong style={{ fontWeight: 700, color: "var(--ins-ink)" }}>
              sequence
            </strong>{" "}
            &mdash; the century-long average can take a very long decade to show
            up.
          </p>
        </div>
      </div>
    </div>
  );
}
