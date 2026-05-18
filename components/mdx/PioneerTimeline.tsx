"use client";

import { useEffect, useState } from "react";

interface PioneerTimelineProps {
  compact?: boolean;
}

type Milestone = {
  year: number;
  who: string;
  text: string;
  stamp?: boolean;
};

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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const mobile = compact ?? isMobile;

  return (
    <div className="my-10" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          Pioneer vs Fast-Follower · fifty years of index investing
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
          One company invented this. The other showed up.
        </h3>
      </div>

      <div
        style={{
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
          padding: mobile ? "24px 22px" : "32px 36px",
        }}
      >
        {/* Stacked band timeline */}
        <div style={{ position: "relative", paddingTop: 50, paddingBottom: 50, marginBottom: 22 }}>
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
              paddingLeft: 12,
              color: "#f6efdc",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Vanguard
          </div>

          <div
            style={{
              height: 40,
              display: "grid",
              gridTemplateColumns: `repeat(${YEAR_TICKS.length}, 1fr)`,
              borderTop: "1px solid var(--ink)",
              borderBottom: "1px solid var(--ink)",
              background: "var(--paper)",
              alignItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 14,
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
              background: "#0f0d0a",
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              color: "#f6efdc",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
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
            gap: mobile ? 14 : 18,
            marginTop: 4,
          }}
        >
          {MILESTONES.map((m) => (
            <div
              key={`${m.year}-${m.text.slice(0, 24)}`}
              style={{
                padding: "12px 14px",
                borderLeft: `3px solid ${m.stamp ? "var(--stamp)" : "var(--ink)"}`,
                background: m.stamp
                  ? "color-mix(in oklab, var(--stamp) 6%, transparent)"
                  : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 18,
                    fontVariantNumeric: "tabular-nums",
                    color: m.stamp ? "var(--stamp)" : "var(--ink)",
                  }}
                >
                  {m.year}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 9.5,
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
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                  marginTop: 6,
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
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--ink-mute)",
            marginTop: 22,
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
