"use client";

import { useContainerWidth } from "@/lib/useContainerWidth";

interface VanguardEffectV2Props {
  compact?: boolean;
}

type EffectEvent = {
  year: number;
  label: string;
  actor: "Vanguard" | "BlackRock" | "BMO";
  mer: number;
  marquee?: boolean;
  follow?: boolean;
};

const COMPACT_THRESHOLD = 600;

const EVENTS: EffectEvent[] = [
  { year: 2018, label: "VEQT, VGRO, VBAL, VCNS launched", actor: "Vanguard", mer: 0.25, marquee: true },
  { year: 2019, label: "XEQT launches at 0.20%", actor: "BlackRock", mer: 0.20 },
  { year: 2022, label: "ZEQT launches at 0.20%", actor: "BMO", mer: 0.20 },
  { year: 2024, label: "Vanguard cuts VEQT to 0.24%", actor: "Vanguard", mer: 0.24 },
  { year: 2025, label: "Vanguard cuts VEQT to 0.20%", actor: "Vanguard", mer: 0.20, marquee: true },
  { year: 2025, label: "BlackRock matches at 0.20%", actor: "BlackRock", mer: 0.20, follow: true },
];

export function VanguardEffectV2({ compact }: VanguardEffectV2Props = {}) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const auto = width > 0 && width < COMPACT_THRESHOLD;
  const mobile = compact ?? auto;

  const gridCols = mobile ? "52px 1fr 64px" : "78px 1fr 100px";

  return (
    <div ref={ref} className="flagship-bleed" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          The Vanguard Effect · who moves first
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
          Vanguard leads. The industry follows.
        </h3>
      </div>

      <div
        style={{
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
          padding: mobile ? "16px 0" : "28px 0",
        }}
      >
        <div
          style={{
            padding: mobile ? "0 16px" : "0 32px",
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: 12,
            marginBottom: 8,
          }}
        >
          <span className="ed-label" style={{ margin: 0, fontSize: 9.5 }}>Year</span>
          <span className="ed-label" style={{ margin: 0, fontSize: 9.5 }}>What happened</span>
          <span className="ed-label" style={{ margin: 0, fontSize: 9.5, textAlign: "right" }}>MER</span>
        </div>

        {EVENTS.map((e, i) => {
          const isVanguard = e.actor === "Vanguard";
          return (
            <div
              key={`${e.year}-${i}`}
              style={{
                padding: mobile ? "12px 16px" : "20px 32px",
                borderTop: "1px solid var(--rule-soft)",
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: 12,
                alignItems: "center",
                background: e.marquee
                  ? "color-mix(in oklab, var(--stamp) 6%, transparent)"
                  : "transparent",
                position: "relative",
              }}
            >
              {e.marquee && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: "var(--stamp)",
                  }}
                />
              )}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: mobile ? 17 : 24,
                  fontVariantNumeric: "tabular-nums",
                  color: isVanguard ? "var(--stamp)" : "var(--ink)",
                  letterSpacing: "-0.012em",
                  lineHeight: 1,
                }}
              >
                {e.year}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: mobile ? 14.5 : 17,
                    lineHeight: 1.25,
                    color: "var(--ink)",
                  }}
                >
                  {e.label}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: "var(--font-sans)",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: isVanguard ? "var(--stamp)" : "var(--ink-mute)",
                  }}
                >
                  {e.follow && <span aria-hidden>↳</span>}
                  <span>
                    {e.actor}
                    {isVanguard && " · leads"}
                    {e.follow && " · follows"}
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: mobile ? 15 : 20,
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                  color: "var(--ink)",
                }}
              >
                {e.mer.toFixed(2)}%
              </div>
            </div>
          );
        })}

        <div
          style={{
            padding: mobile ? "16px 16px 6px" : "26px 32px 10px",
            borderTop: "2px solid var(--ink)",
            marginTop: 0,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: mobile ? 14.5 : 15.5,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              margin: 0,
            }}
          >
            Across{" "}
            <span style={{ color: "var(--stamp)", fontWeight: 600, fontStyle: "italic" }}>
              2,100+ fee cuts
            </span>{" "}
            since 1975, the pattern is identical: Vanguard moves, then the
            industry reluctantly matches. If you bank XEQT&rsquo;s
            competitive fee today, you have Vanguard to thank for it.
          </p>
        </div>
      </div>
    </div>
  );
}
