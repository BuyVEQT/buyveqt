"use client";

import ExhibitFrame from "./ExhibitFrame";
import { useExhibit } from "./useExhibit";

const css = `
.exa {
  border: 1px solid var(--ins-ink);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.exa__panel {
  padding: 22px 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.exa__panel + .exa__panel {
  border-left: 1px solid var(--ins-ink);
}
.exa__svg {
  display: block;
  width: 100%;
  max-width: 340px;
  height: auto;
  overflow: visible;
}

/* Diagram labels. Uppercase is written into the strings rather than set in
   CSS — SVG text ignores text-transform in some engines.

   TRUE LABELS: every one of these names a party ("YOU", "VANGUARD",
   "NYSE: BLK"), so they keep caps and take the 10px floor. Tracking comes
   back one notch (0.9px → 0.6px in user units) because they sit inside
   fixed-width chip rects — at 10px/0.9px "BLACKROCK" would have run past
   its 74-unit chip. At 0.6px the longest chip string, "BLACKROCK", measures
   ~61 units and the widest chip is 74.

   One knowing overrun: the unchipped "SHAREHOLDERS" annotation starts at
   x=222 and now reaches ~304 in a 300-unit viewBox. The svg is
   overflow: visible and centred inside a panel with ≥10px of padding, so
   it renders; it can't be pulled left without colliding with the escape
   arrowhead that lands at ~(214, 39). */
.exa__label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  fill: var(--ins-ink);
}
.exa__label--mute {
  fill: var(--ins-gray-600);
}
.exa__chip {
  fill: var(--ins-paper);
}
/* The annotation stacked inside each ring — a label phrase ("$200/YR
   ORBITS HOME"), not a sentence, so caps stay. At the 10px floor with
   tracking dialled 1.1px → 0.9px the longest line, "LEAKS OUT", measures
   ~64 units against the ring's 124-unit inner span, and the 13-unit
   baseline steps still clear each other. */
.exa__centre {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.9px;
  fill: var(--ins-signal);
}
.exa__centre--mute {
  fill: var(--ins-gray-600);
}

/* ── The one idea: VEQT's fee orbits home, XEQT's leaks out. Both
   animations are declared only under [data-live], so the frame before
   the exhibit scrolls into view — and the frame under
   prefers-reduced-motion — is the static end state. ─────────────── */
.exa__orbit {
  transform-box: view-box;
  transform-origin: 150px 88px;
}
.exa[data-live="true"] .exa__orbit {
  animation: ins-art-orbit 5s linear infinite;
}
.exa[data-live="true"] .exa__escape {
  animation: ins-art-exitFlow 3.2s ease-in infinite;
}
.exa[data-run="false"] .exa__orbit,
.exa[data-run="false"] .exa__escape {
  animation-play-state: paused;
}

@media (max-width: 640px) {
  .exa__panel {
    padding: 16px 10px 14px;
    gap: 8px;
  }
  .exa[data-live="true"] .exa__escape {
    animation-name: ins-art-exitFlowSm;
  }
}
`;

/** Ring geometry, shared by both panels so the pair reads as one figure. */
const R = 62;
const CY = 88;

/**
 * Exhibit A — the ownership loop.
 *
 * One idea, told twice: follow the $200 fee. On the VEQT side the ring is
 * closed and a red fee dot orbits back to where it started, because the
 * manager is owned by the funds and the funds are owned by their investors.
 * On the XEQT side the same ring is broken open at the upper right and the
 * fee escapes along an arrow to NYSE: BLK shareholders.
 *
 * Both panels sit on one shared viewBox so the rings stay the same size
 * beside each other at any width, and both animations are pure transform
 * (rotate, translateX) — no layout, no paint.
 */
export function OwnershipLoop() {
  const { ref, props } = useExhibit<HTMLDivElement>();

  return (
    <ExhibitFrame
      letter="A"
      name="The ownership loop"
      headline="Follow your $200 fee."
      caption="On a $100,000 position both funds take about $200 a year — only one of them has somewhere else for it to go"
    >
      <div className="exa" ref={ref} {...props}>
        {/* ── VEQT — the loop closes ─────────────────────────────── */}
        <div className="exa__panel">
          <svg
            className="exa__svg"
            viewBox="0 0 300 180"
            role="img"
            aria-label="VEQT's fee travels a closed loop — you, the fund, Vanguard — and returns to you, because Vanguard is owned by its own funds."
          >
            <circle
              cx={150}
              cy={CY}
              r={R}
              fill="none"
              stroke="var(--ins-ink)"
              strokeWidth="1.5"
            />
            <g className="exa__orbit">
              <circle cx={150} cy={CY - R} r="5" fill="var(--ins-signal)" />
            </g>

            <text className="exa__centre" x={150} y={80} textAnchor="middle">
              $200/YR
            </text>
            <text className="exa__centre" x={150} y={93} textAnchor="middle">
              ORBITS
            </text>
            <text className="exa__centre" x={150} y={106} textAnchor="middle">
              HOME
            </text>

            <rect className="exa__chip" x={132} y={19} width={36} height={14} />
            <text className="exa__label" x={150} y={29.5} textAnchor="middle">
              YOU
            </text>

            <rect className="exa__chip" x={72} y={128} width={40} height={14} />
            <text className="exa__label" x={92} y={138.5} textAnchor="middle">
              VEQT
            </text>

            <rect className="exa__chip" x={182} y={128} width={72} height={14} />
            <text className="exa__label" x={218} y={138.5} textAnchor="middle">
              VANGUARD
            </text>
          </svg>
          <p className="exh__panelCap">
            No ticker · No outside shareholders
            <br />
            The manager is, in effect, you
          </p>
        </div>

        {/* ── XEQT — the loop doesn't close ──────────────────────── */}
        <div className="exa__panel">
          <svg
            className="exa__svg"
            viewBox="0 0 300 180"
            role="img"
            aria-label="XEQT's ring is broken open at the upper right: the same fee exits through the gap toward NYSE-listed BlackRock shareholders."
          >
            {/* 324 on, 66 off — an SVG circle's dash pattern starts at three
                o'clock and runs clockwise, so the gap lands upper-right. */}
            <circle
              cx={100}
              cy={CY}
              r={R}
              fill="none"
              stroke="var(--ins-gray-600)"
              strokeWidth="1.5"
              strokeDasharray="324 66"
            />

            <text
              className="exa__centre exa__centre--mute"
              x={100}
              y={84}
              textAnchor="middle"
            >
              $200/YR
            </text>
            <text
              className="exa__centre exa__centre--mute"
              x={100}
              y={97}
              textAnchor="middle"
            >
              LEAKS OUT
            </text>

            {/* Escape route out of the gap. Rotating the group lets the dot
                translate along a plain X axis and still track the arrow. */}
            <g transform="rotate(-15 158 54)">
              <line
                x1={158}
                y1={54}
                x2={214}
                y2={54}
                stroke="var(--ins-gray-600)"
                strokeWidth="1.5"
              />
              <path d="M216 54 L208 50 L208 58 Z" fill="var(--ins-gray-600)" />
              <circle
                className="exa__escape"
                cx={158}
                cy={54}
                r="4.5"
                fill="var(--ins-gray-600)"
              />
            </g>

            <text className="exa__label exa__label--mute" x={222} y={36}>
              NYSE: BLK
            </text>
            <text className="exa__label exa__label--mute" x={222} y={47}>
              SHAREHOLDERS
            </text>

            <rect className="exa__chip" x={82} y={19} width={36} height={14} />
            <text className="exa__label" x={100} y={29.5} textAnchor="middle">
              YOU
            </text>

            <rect className="exa__chip" x={22} y={128} width={40} height={14} />
            <text className="exa__label" x={42} y={138.5} textAnchor="middle">
              XEQT
            </text>

            <rect className="exa__chip" x={132} y={128} width={74} height={14} />
            <text
              className="exa__label exa__label--mute"
              x={169}
              y={138.5}
              textAnchor="middle"
            >
              BLACKROCK
            </text>
          </svg>
          <p className="exh__panelCap">
            Publicly traded · Two masters
            <br />
            The loop doesn&rsquo;t close — the fee exits
          </p>
        </div>
      </div>

      <div className="exh__verdict">
        <span className="exh__verdictSq" aria-hidden />
        <span className="exh__verdictCopy">
          One company has one master — the architecture is what compounds
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </ExhibitFrame>
  );
}
