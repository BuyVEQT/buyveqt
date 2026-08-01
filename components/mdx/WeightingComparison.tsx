"use client";

import { FUNDS } from "@/data/funds";
import ExhibitFrame from "./ExhibitFrame";
import { useExhibit } from "./useExhibit";

const css = `
.exb {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
  font-variant-numeric: tabular-nums;
}
/* Column head — TRUE LABEL on both sides. "VEQT · Alive" names the fund;
   "Follows the market" / "Fixed targets · 45/25/25/5" name the method.
   Neither is a sentence (no subject), so they keep caps at the floor.
   Tracking 0.16em → 0.12em: the two halves share one non-wrapping flex
   row, and the XEQT side's method string is the longest chrome in the
   exhibit. The weights inside it are interpolated but they are part of a
   method label, not a readout on a bar — the exhibit's actual figures are
   .exb__pct, which is held at its old size below. */
.exb__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.exb__state {
  color: var(--ins-signal);
}
.exb__head--frozen .exb__who {
  color: color-mix(in srgb, var(--ins-ink) 45%, transparent);
}
.exb__method {
  color: var(--ins-gray-600);
  text-align: right;
}
.exb__rows {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
/* The row carries the REGION label, so it takes the floor: "Canada" is the
   longest at ~41 units against a 52px track. The row's own size is
   inherited by the sleeve name only — .exb__pct overrides it back down,
   because the percentage is a printed figure and figures do not move. */
.exb__row {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) 46px;
  gap: 10px;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.exb__region {
  color: var(--ins-gray-600);
}
.exb__pct {
  /* COMPUTED FIGURE — the sleeve weight straight off the factsheet. Held
     at the pre-Turn-8 size on purpose; the floor governs chrome, not the
     numbers an exhibit prints. */
  font-size: 8.5px;
  text-align: right;
  color: var(--ins-ink);
}
.exb__track {
  display: block;
  height: 10px;
  background: var(--ins-track);
}
.exb__fill {
  display: block;
  height: 10px;
  background: var(--ins-ink);
  transform-origin: left center;
}
.exb__fill--pinned {
  background: var(--ins-signal);
}
/* CAPTION — both per-side notes are explaining sentences ("Dashed = set by
   committee — moves only when BlackRock decides"), so they take the house
   caption grammar and lose the transform. The strings were already written
   in sentence case; only the CSS was shouting them. */
.exb__cap {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.45;
  color: var(--ins-gray-600);
}

/* ── Frozen side — dashed track, committee-set fill, never moves. ── */
.exb__row--frozen,
.exb__row--frozen .exb__pct {
  color: color-mix(in srgb, var(--ins-ink) 45%, transparent);
}
.exb__track--frozen {
  display: block;
  height: 10px;
  background: color-mix(in srgb, var(--ins-ink) 8%, transparent);
  border: 1px dashed color-mix(in srgb, var(--ins-ink) 30%, transparent);
}
.exb__fill--frozen {
  display: block;
  height: 100%;
  background: color-mix(in srgb, var(--ins-ink) 35%, transparent);
}

/* ── The one idea: VEQT's sleeves breathe, XEQT's don't. Canada is
   pinned at its 30% target, so it holds still in red while the other
   70% flexes with the market. ────────────────────────────────────── */
.exb[data-live="true"] .exb__fill--alive {
  animation: ins-art-breathe 4s ease-in-out infinite;
}
.exb[data-run="false"] .exb__fill--alive {
  animation-play-state: paused;
}

@media (max-width: 760px) {
  .exb {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }
}
@media (max-width: 640px) {
  /* One more notch off the tracking so "XEQT · FROZEN" and "FIXED TARGETS ·
     45/25/25/5" still share one line inside the 350px mobile measure. */
  .exb__head {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .exb__row {
    grid-template-columns: 50px minmax(0, 1fr) 42px;
    gap: 8px;
    font-size: 10px;
  }
  .exb__pct {
    /* Figure holds its old mobile size for the same reason as above. */
    font-size: 8px;
  }
  .exb__track,
  .exb__fill {
    height: 8px;
  }
  /* .exb__cap needs no override now that it is 12px sentence copy. */
}
`;

/** Factsheet region names → the exhibit's four-across shorthand. */
const SHORT: Record<string, string> = {
  "United States": "US",
  Canada: "Canada",
  "International Developed": "Dev",
  "Emerging Markets": "EM",
};

/** 30.6 → "30.6", 25 → "25". Keeps the factsheet's precision without noise. */
function fmtPct(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

function sleeves(ticker: string) {
  return FUNDS[ticker].geographyAllocation.map((g) => ({
    label: SHORT[g.region] ?? g.region,
    pct: g.weight,
  }));
}

/** Canada is VEQT's pinned 30% target — the only sleeve that doesn't move. */
const PINNED = "Canada";

/**
 * Pre-compute the stagger outside the render map: the delay counter only
 * advances on breathing sleeves, and reassigning a closure-captured
 * accumulator inside .map() trips `react-hooks/immutability`.
 */
function withStagger(rows: { label: string; pct: number }[]) {
  const delays = ["0s", "-1.3s", "-2.6s"];
  const out: { label: string; pct: number; pinned: boolean; delay: string | null }[] = [];
  let breathing = 0;
  for (const row of rows) {
    const pinned = row.label === PINNED;
    out.push({
      ...row,
      pinned,
      delay: pinned ? null : delays[breathing % delays.length],
    });
    if (!pinned) breathing += 1;
  }
  return out;
}

/**
 * Exhibit B — two ways to slice the world.
 *
 * One idea: VEQT's sleeves move and XEQT's don't. VEQT pins Canada at its
 * 30% target (the red bar, held still) and lets the other 70% track global
 * market cap, so those three bars breathe on a staggered loop. XEQT's four
 * bars sit inside dashed tracks at fixed 45/25/25/5 targets and never move —
 * the dash is the point.
 *
 * Weights come from data/funds.ts (Vanguard's and BlackRock's own
 * factsheets), so a quarterly update moves the bars. Only scaleX is
 * animated; the bars' widths are set in percent and never re-laid out.
 */
export function WeightingComparison() {
  const { ref, props } = useExhibit<HTMLDivElement>();
  const veqt = withStagger(sleeves("VEQT.TO"));
  const xeqt = sleeves("XEQT.TO");

  return (
    <ExhibitFrame
      letter="B"
      name="Two ways to slice the world"
      headline="One breathes. One is frozen."
      caption="Solid bars follow global market cap · Dashed bars are targets — they move only when a committee says so"
    >
      <div className="exb" ref={ref} {...props}>
        {/* ── VEQT — alive ───────────────────────────────────────── */}
        <div>
          <div className="exb__head">
            <span className="exb__who">
              VEQT <span className="exb__state">· Alive</span>
            </span>
            <span className="exb__method">Follows the market</span>
          </div>
          <ul className="exb__rows">
            {veqt.map((s) => (
              <li className="exb__row" key={s.label}>
                <span className="exb__region">{s.label}</span>
                <span className="exb__track">
                  <span
                    className={`exb__fill${s.pinned ? " exb__fill--pinned" : " exb__fill--alive"}`}
                    style={{
                      width: `${s.pct}%`,
                      ...(s.delay ? { animationDelay: s.delay } : null),
                    }}
                  />
                </span>
                <span className="exb__pct">{fmtPct(s.pct)}</span>
              </li>
            ))}
          </ul>
          <p className="exb__cap">
            Canada pinned at its 30% target (red) — the other 70% breathes with
            the market
          </p>
        </div>

        {/* ── XEQT — frozen ──────────────────────────────────────── */}
        <div>
          <div className="exb__head exb__head--frozen">
            <span className="exb__who">XEQT · Frozen</span>
            <span className="exb__method">
              Fixed targets · {xeqt.map((s) => s.pct).join("/")}
            </span>
          </div>
          <ul className="exb__rows">
            {xeqt.map((s) => (
              <li className="exb__row exb__row--frozen" key={s.label}>
                <span>{s.label}</span>
                <span className="exb__track--frozen">
                  <span
                    className="exb__fill--frozen"
                    style={{ width: `${s.pct}%` }}
                  />
                </span>
                <span className="exb__pct">{fmtPct(s.pct)}</span>
              </li>
            ))}
          </ul>
          <p className="exb__cap">
            Dashed = set by committee — moves only when BlackRock decides
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </ExhibitFrame>
  );
}
