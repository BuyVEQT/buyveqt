"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

/**
 * CAGE's core mechanic, made visual: versus a geography-matched cap-weighted
 * benchmark, the fund is ~15% underweight the most expensive, least-profitable
 * names and ~15% overweight the cheaper, more-profitable ones (Repetto's own
 * framing, Rational Reminder Ep. 401). Diverging bars around a "market weight"
 * axis, the three academic pillars, and the two numbers that define the bet:
 * the target premium and the tracking error that comes with it.
 */

const COMPACT_THRESHOLD = 600;

const PILLARS = [
  { name: "Size", source: "Fama–French, 1992" },
  { name: "Value", source: "Fama–French, 1992" },
  { name: "Profitability", source: "Novy-Marx, 2013" },
];

export function FactorTilt() {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const mobile = width > 0 && width < COMPACT_THRESHOLD;

  const barH = mobile ? 22 : 26;

  return (
    <div ref={ref} className="flagship-bleed" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          How CAGE re-weights the world
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
          The market&rsquo;s weights, argued with.
        </h3>
      </div>

      <div
        style={{
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
          padding: mobile ? "20px 16px" : "30px 32px 26px",
        }}
      >
        {/* Diverging tilt bars around the cap-weight axis */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
              marginBottom: 10,
            }}
          >
            Cap-weighted benchmark
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: mobile ? 18 : 20,
              position: "relative",
            }}
          >
            {/* center axis */}
            <div
              style={{
                position: "absolute",
                top: -6,
                bottom: -6,
                left: "50%",
                width: 1,
                background: "var(--ink)",
                opacity: 0.55,
              }}
              aria-hidden
            />

            {/* underweight row: bar grows leftward from the axis */}
            <div style={{ gridColumn: "1", paddingRight: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "78%",
                    height: barH,
                    background: "color-mix(in oklab, var(--ink) 8%, transparent)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: "100%",
                      background: "var(--ink-mute)",
                    }}
                    role="img"
                    aria-label="About 15% underweight the most expensive, least-profitable companies"
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: mobile ? 14 : 16,
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--paper-light)",
                      zIndex: 1,
                    }}
                  >
                    &minus;15%
                  </span>
                </div>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: mobile ? 12.5 : 13.5,
                  color: "var(--ink-mute)",
                  textAlign: "right",
                  margin: "6px 0 0",
                  paddingRight: 2,
                }}
              >
                underweight the priciest,
                <br />
                least-profitable names
              </p>
            </div>
            <div style={{ gridColumn: "2" }} />

            {/* overweight row: bar grows rightward from the axis */}
            <div style={{ gridColumn: "1" }} />
            <div style={{ gridColumn: "2", paddingLeft: 1 }}>
              <div
                style={{
                  width: "78%",
                  height: barH,
                  background: "color-mix(in oklab, var(--ink) 8%, transparent)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "100%",
                    background: "var(--stamp)",
                  }}
                  role="img"
                  aria-label="About 15% overweight cheaper, more-profitable companies"
                />
                <span
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: mobile ? 14 : 16,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--paper-light)",
                    zIndex: 1,
                  }}
                >
                  +15%
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: mobile ? 12.5 : 13.5,
                  color: "var(--ink-mute)",
                  margin: "6px 0 0",
                  paddingLeft: 2,
                }}
              >
                overweight the cheaper,
                <br />
                more-profitable names
              </p>
            </div>
          </div>
        </div>

        {/* The three academic pillars */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
            gap: mobile ? 10 : 14,
            marginTop: mobile ? 20 : 26,
            paddingTop: mobile ? 16 : 18,
            borderTop: "1px solid var(--rule-soft)",
          }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.name}
              style={{
                display: mobile ? "flex" : "block",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12.5,
                  color: "var(--ink-mute)",
                  marginTop: mobile ? 0 : 2,
                }}
              >
                {p.source}
              </div>
            </div>
          ))}
        </div>

        {/* The two numbers that define the bet */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: mobile ? 12 : 18,
            marginTop: mobile ? 16 : 18,
            paddingTop: mobile ? 16 : 18,
            borderTop: "1px solid var(--rule-soft)",
          }}
        >
          <div>
            <div className="ed-label" style={{ fontSize: 9.5, margin: 0 }}>
              Target premium
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: mobile ? 22 : 28,
                marginTop: 4,
                color: "var(--stamp)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.012em",
                lineHeight: 1.05,
              }}
            >
              1.5&ndash;2%
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
              gross, annualized
            </div>
          </div>
          <div>
            <div className="ed-label" style={{ fontSize: 9.5, margin: 0 }}>
              Tracking error
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: mobile ? 22 : 28,
                marginTop: 4,
                color: "var(--ink)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.012em",
                lineHeight: 1.05,
              }}
            >
              3&ndash;4%
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
              the price of the target
            </div>
          </div>
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
        Read the tracking error carefully. At 3&ndash;4%, a one-year stretch
        where CAGE trails VEQT by 6% or more is a normal event, not a
        malfunction &mdash; and it will happen in both directions.
      </p>
    </div>
  );
}
