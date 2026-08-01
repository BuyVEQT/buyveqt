"use client";

import { FUNDS } from "@/data/funds";
import ExhibitFrame from "./ExhibitFrame";
import { useExhibit } from "./useExhibit";

const css = `
.exd__plot {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: end;
  gap: 6px;
  height: 120px;
  border-bottom: 1px solid var(--ins-ink);
}
.exd__col {
  display: flex;
  align-items: flex-end;
  height: 100%;
}
.exd__bar {
  width: 100%;
  transform-origin: bottom center;
  background: color-mix(in srgb, var(--ins-ink) 35%, transparent);
}
.exd__bar--lead {
  background: var(--ins-signal);
}
/* X-AXIS LABELS — "2019 · VEQT", "+30 days · BLK matches". They name the
   bar, so they are chrome and take the 10px floor. Tracking 0.08em →
   0.06em because these are fixed 1fr grid tracks; the longest string still
   wraps to two lines in a narrow column, which it already did at 8px. */
.exd__labels {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.5;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.exd__fee {
  /* COMPUTED FIGURE — the management fee printed under its own bar, live
     from data/funds.ts. The label above it moved to the floor; this did
     not, because the floor governs chrome and a data label on a bar is not
     chrome. Split out of .exd__labels for exactly that reason. */
  display: block;
  font-size: 8px;
  color: var(--ins-ink);
}
.exd__fee--lead {
  color: var(--ins-signal);
}

/* ── The one idea: the red bars move first, the grey ones follow. ──
   A one-shot entrance, armed by the observer; before it fires (and
   under prefers-reduced-motion) the bars are already at full height. */
.exd[data-live="true"] .exd__bar {
  animation: ins-art-riseIn 0.62s cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

@media (max-width: 640px) {
  .exd__plot {
    height: 96px;
    gap: 4px;
  }
  .exd__labels {
    gap: 4px;
    font-size: 10px;
    letter-spacing: 0.02em;
  }
  .exd__fee {
    /* Figure holds its old mobile size. */
    font-size: 7px;
  }
}
`;

/**
 * The exhibit's y-axis top. Fees are read against a fixed 0.25% ceiling
 * rather than the series max so the four bars keep their true proportions.
 */
const CEILING = 0.25;

/**
 * Exhibit D — the Vanguard effect.
 *
 * One idea: who moves first. Vanguard's two bars are red and animate in
 * ahead of BlackRock's grey ones, which is the whole pattern — Vanguard
 * cuts, the field matches. The 2025 figures come from data/funds.ts, so
 * the next cut moves the chart; the 2019 launch fees are historical and
 * stay literal.
 */
export function VanguardEffectV2() {
  const { ref, props } = useExhibit<HTMLDivElement>();

  const bars = [
    { when: "2019 · VEQT", fee: 0.22, lead: true, delay: "0s" },
    { when: "2019 · XEQT", fee: 0.18, lead: false, delay: "0.34s" },
    {
      when: "2025 · Vanguard cuts",
      fee: FUNDS["VEQT.TO"].managementFee,
      lead: true,
      delay: "0.12s",
    },
    {
      when: "+30 days · BLK matches",
      fee: FUNDS["XEQT.TO"].managementFee,
      lead: false,
      delay: "0.46s",
    },
  ];

  return (
    <ExhibitFrame
      letter="D"
      name="The Vanguard effect"
      headline="Vanguard leads. The field follows."
      caption="Red bars move first — 2,100+ fee cuts since 1975, and about thirty days between Vanguard's November 2025 cut and BlackRock's match"
      tight
    >
      <div className="exd" ref={ref} {...props}>
        <div
          className="exd__plot"
          role="img"
          aria-label="Management fees: VEQT 0.22% and XEQT 0.18% at launch in 2019; Vanguard cuts VEQT to 0.17% in 2025 and BlackRock matches on XEQT about thirty days later."
        >
          {bars.map((b) => (
            <div className="exd__col" key={b.when}>
              <div
                className={`exd__bar${b.lead ? " exd__bar--lead" : ""}`}
                style={{
                  height: `${((b.fee / CEILING) * 100).toFixed(1)}%`,
                  animationDelay: b.delay,
                }}
              />
            </div>
          ))}
        </div>
        <div className="exd__labels">
          {bars.map((b) => (
            <span key={b.when}>
              {b.when}
              <b className={`exd__fee${b.lead ? " exd__fee--lead" : ""}`}>
                {b.fee.toFixed(2)}
              </b>
            </span>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </ExhibitFrame>
  );
}
