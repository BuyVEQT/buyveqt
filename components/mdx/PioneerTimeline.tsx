"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

interface PioneerTimelineProps {
  compact?: boolean;
}

type Milestone = {
  year: number;
  who: string;
  text: string;
  stamp?: boolean;
};

const COMPACT_THRESHOLD = 600;

const MILESTONES: Milestone[] = [
  {
    year: 1975,
    who: "Vanguard",
    text: "Bogle founds Vanguard with the radical idea that an asset manager could be owned by its own investors.",
    stamp: true,
  },
  {
    year: 1976,
    who: "Vanguard",
    text: "First retail index mutual fund launched. Wall Street calls it “Bogle’s Folly.”",
    stamp: true,
  },
  {
    year: 1988,
    who: "BlackRock",
    text: "BlackRock founded — as a bond risk-management shop. Not yet an asset manager.",
  },
  {
    year: 1993,
    who: "iShares",
    text: "iShares launched (by Barclays, later sold to BlackRock in 2009).",
  },
  {
    year: 2018,
    who: "Vanguard",
    text: "Vanguard launches the asset-allocation suite in Canada: VCNS, VBAL, VGRO.",
    stamp: true,
  },
  {
    year: 2019,
    who: "BlackRock",
    text: "BlackRock launches XEQT — seven months after VEQT.",
  },
];

const YEAR_TICKS = ["1975", "1985", "1995", "2009", "2018", "today"];

export function PioneerTimeline({ compact }: PioneerTimelineProps = {}) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const auto = width > 0 && width < COMPACT_THRESHOLD;
  const mobile = compact ?? auto;

  return (
    <div ref={ref} className="flagship-bleed my-10" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: 24 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          Pioneer vs Fast-Follower · fifty years of index investing
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: mobile ? "clamp(22px, 6vw, 26px)" : "clamp(28px, 3.4vw, 34px)",
            lineHeight: 1.05,
            letterSpacing: "-0.018em",
            margin: "10px 0 0",
            color: "var(--ink)",
          }}
        >
          One company invented this. The other showed up.
        </h3>
      </div>

      <div
        style={{
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
          padding: mobile ? "26px 22px" : "34px 36px",
        }}
      >
        <div style={{ position: "relative", paddingTop: 44, paddingBottom: 44, marginBottom: 26 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 38,
              background: "var(--stamp)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
              color: "var(--band-paper)",
              fontFamily: "var(--font-sans)",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Vanguard
          </div>

          <div
            style={{
              height: 42,
              display: "grid",
              gridTemplateColumns: `repeat(${YEAR_TICKS.length}, 1fr)`,
              borderTop: "1px solid var(--ink)",
              borderBottom: "1px solid var(--ink)",
              background: "var(--paper)",
              alignItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: mobile ? 13 : 15,
              fontVariantNumeric: "tabular-nums",
              color: "var(--ink)",
              textAlign: "center",
            }}
          >
            {YEAR_TICKS.map((y, i) => (
              <div
                key={y}
                style={{
                  borderRight:
                    i === YEAR_TICKS.length - 1
                      ? undefined
                      : "1px solid var(--rule-soft)",
                }}
              >
                {mobile && y === "today" ? "’25" : y}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 38,
              background: "var(--band-ink)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
              color: "var(--band-paper)",
              fontFamily: "var(--font-sans)",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            BlackRock
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)",
            gap: mobile ? 14 : 20,
            marginTop: 4,
          }}
        >
          {MILESTONES.map((m) => (
            <div
              key={`${m.year}-${m.text.slice(0, 24)}`}
              style={{
                padding: "14px 16px",
                borderLeft: `3px solid ${m.stamp ? "var(--stamp)" : "var(--ink)"}`,
                background: m.stamp
                  ? "color-mix(in oklab, var(--stamp) 7%, transparent)"
                  : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 20,
                    fontVariantNumeric: "tabular-nums",
                    color: m.stamp ? "var(--stamp)" : "var(--ink)",
                  }}
                >
                  {m.year}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: m.stamp ? "var(--stamp)" : "var(--ink-mute)",
                  }}
                >
                  {m.who}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "var(--ink-mute)",
            marginTop: 24,
            marginBottom: 0,
            maxWidth: "64ch",
          }}
        >
          Nobel laureate Paul Samuelson once ranked Bogle&rsquo;s index fund
          alongside the wheel, the alphabet, and the printing press. Warren
          Buffett has called Vanguard funds the best option for most
          investors.{" "}
          <span
            style={{
              color: "var(--stamp)",
              fontStyle: "normal",
              fontWeight: 600,
            }}
          >
            When you buy VEQT, you are buying the original.
          </span>
        </p>
      </div>
    </div>
  );
}
