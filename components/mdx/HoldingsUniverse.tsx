"use client";

import { FUNDS } from "@/data/funds";
import ExhibitFrame from "./ExhibitFrame";
import { useExhibit } from "./useExhibit";

const css = `
.exc__field {
  display: grid;
  border: 1px solid var(--ins-ink);
  height: 120px;
  overflow: hidden;
}
.exc__both,
.exc__only {
  /* One painted gradient per region instead of thousands of nodes — the
     dot matrix is a 9px tile, not 13,726 elements. */
  background-size: 9px 9px;
  background-position: 0 0;
}
.exc__both {
  background-image: radial-gradient(
    circle,
    color-mix(in srgb, var(--ins-ink) 75%, transparent) 1.3px,
    transparent 1.3px
  );
}
.exc__only {
  border-left: 1px solid var(--ins-ink);
  background-image: radial-gradient(
    circle,
    var(--ins-signal) 1.3px,
    transparent 1.3px
  );
}

/* ── The one idea: the slice XEQT doesn't hold, shimmering. ─────── */
.exc[data-live="true"] .exc__only {
  animation: ins-art-shimmer 2.4s ease-in-out infinite;
}
.exc[data-run="false"] .exc__only {
  animation-play-state: paused;
}

.exc__legend {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
  margin-top: 8px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
.exc__both-label {
  color: var(--ins-gray-600);
}
.exc__only-label {
  color: var(--ins-signal);
  text-align: right;
}

@media (max-width: 640px) {
  .exc__field {
    height: 84px;
  }
  .exc__both,
  .exc__only {
    background-size: 8px 8px;
  }
  .exc__both {
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--ins-ink) 75%, transparent) 1.2px,
      transparent 1.2px
    );
  }
  .exc__only {
    background-image: radial-gradient(
      circle,
      var(--ins-signal) 1.2px,
      transparent 1.2px
    );
  }
  .exc__legend {
    font-size: 7.5px;
    letter-spacing: 0.08em;
  }
}
`;

/**
 * Exhibit C — a wider net.
 *
 * One idea: the part of the world XEQT leaves out. The field is split by the
 * real ratio between the two books — the ink dots are the companies both
 * funds hold, the red dots are the ones only VEQT holds, and only the red
 * region shimmers.
 *
 * Both halves are a single painted radial-gradient tile rather than a node
 * per company: the previous build put ~13,800 <rect>s in the DOM to say the
 * same thing. Counts come from data/funds.ts, so a factsheet update moves
 * both the split and the labels.
 */
export function HoldingsUniverse() {
  const { ref, props } = useExhibit<HTMLDivElement>();

  const veqtCount = FUNDS["VEQT.TO"].numberOfHoldings;
  const xeqtCount = FUNDS["XEQT.TO"].numberOfHoldings;
  const shared = Math.min(veqtCount, xeqtCount);
  const only = Math.max(0, veqtCount - xeqtCount);
  const sharedPct = ((shared / veqtCount) * 100).toFixed(1);

  const fmt = (n: number) => n.toLocaleString("en-CA");

  return (
    <ExhibitFrame
      letter="C"
      name="A wider net"
      headline="What you don't own with XEQT."
      caption="One dot is one company — VEQT tracks broader FTSE and CRSP indices that reach further down the market than the S&P and MSCI books XEQT uses"
      tight
    >
      <div className="exc" ref={ref} {...props}>
        <div
          className="exc__field"
          style={{ gridTemplateColumns: `${sharedPct}% 1fr` }}
          role="img"
          aria-label={`${fmt(shared)} companies are held by both funds; ${fmt(only)} are held only by VEQT.`}
        >
          <div className="exc__both" />
          <div className="exc__only" />
        </div>
        <div className="exc__legend">
          <span className="exc__both-label">{fmt(shared)} companies in both</span>
          <span className="exc__only-label">
            {fmt(only)} only in VEQT — shimmering
          </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </ExhibitFrame>
  );
}
