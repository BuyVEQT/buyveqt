"use client";

import { FUNDS } from "@/data/funds";
import {
  MINUS,
  fmtInt,
  fmtMoney,
  fmtPlusMinusPct,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";
import { HOUSE_TICKER, canadaWeight, houseLabel, houseLabelShort } from "./bouts";
import {
  FEE_GAP_PRINCIPAL,
  FEE_GAP_YEARS,
  feeGapDollars,
  spreadBarWidth,
  type PairMetrics,
} from "./compare-math";
import type { BoutQuote } from "./useBoutData";

const css = `
.ins-cmp-card {
  border: 1px solid var(--ins-ink, #111111);
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ── Mastheads ─────────────────────────────────────────────── */
.ins-cmp-card__mast {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--ins-ink);
}
.ins-cmp-mast {
  padding: 22px 28px;
  min-width: 0;
}
.ins-cmp-mast--a {
  border-right: 1px solid var(--ins-ink);
}
.ins-cmp-mast--b {
  text-align: right;
}
.ins-cmp-mast__ticker {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
}
.ins-cmp-mast__meta {
  margin-top: 10px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-mast__meta--short {
  display: none;
}

/* ── Fact rows ─────────────────────────────────────────────── */
.ins-cmp-row {
  display: grid;
  grid-template-columns: 1fr 190px 1fr;
  align-items: center;
  padding: 15px 28px;
  border-top: 1px solid var(--ins-hair);
}
.ins-cmp-row--first {
  border-top: none;
}
.ins-cmp-row__label {
  grid-column: 2;
  grid-row: 1;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  line-height: 1.35;
}
.ins-cmp-label--short {
  display: none;
}
.ins-cmp-row__a {
  grid-column: 1;
  grid-row: 1;
  text-align: right;
  min-width: 0;
}
.ins-cmp-row__b {
  grid-column: 3;
  grid-row: 1;
  min-width: 0;
}
.ins-cmp-val {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.ins-cmp-val--word {
  font-size: 22px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── MER row — the one place red is earned ─────────────────── */
.ins-cmp-row--fee {
  background: color-mix(in oklab, var(--ins-signal) 4%, transparent);
}
.ins-cmp-fee__a {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 14px;
}
.ins-cmp-fee__b {
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.ins-cmp-fee__labeltext {
  display: block;
}
.ins-cmp-fee__delta {
  font-size: 10px;
  font-weight: 700;
  color: var(--ins-signal);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ins-cmp-chip {
  display: inline-block;
  margin-top: 5px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--ins-signal);
  color: #ffffff;
}
.ins-cmp-chip--tie {
  background: var(--ins-ink);
  color: var(--ins-paper);
}
.ins-cmp-chip__mer {
  display: none;
}

/* ── Spread bar ────────────────────────────────────────────── */
.ins-cmp-spread {
  padding: 15px 28px;
  border-top: 1px solid var(--ins-hair);
}
.ins-cmp-spread__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-spread__lead {
  color: var(--ins-ink);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.ins-cmp-spread__lead--behind {
  color: var(--ins-signal);
}
.ins-cmp-spread__track {
  position: relative;
  height: 5px;
  background: var(--ins-track-soft);
  margin-top: 10px;
}
.ins-cmp-spread__mid {
  position: absolute;
  left: 50%;
  top: -3px;
  width: 1px;
  height: 11px;
  background: var(--ins-ink);
}
.ins-cmp-spread__fill {
  position: absolute;
  top: 0;
  height: 5px;
  background: var(--ins-ink);
}
.ins-cmp-spread__ends {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}

/* ── Verdict rail ──────────────────────────────────────────── */
.ins-cmp-rail {
  border-top: 1px solid var(--ins-ink);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 22px;
}
.ins-cmp-rail__sq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink);
  flex-shrink: 0;
}
.ins-cmp-rail__text {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1.4;
}
.ins-cmp-rail__noise {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .ins-cmp-mast { padding: 18px 20px; }
  .ins-cmp-mast__ticker { font-size: 44px; }
  .ins-cmp-row { grid-template-columns: 1fr 150px 1fr; padding: 14px 20px; }
  .ins-cmp-val { font-size: 24px; }
  .ins-cmp-val--word { font-size: 17px; }
  .ins-cmp-spread { padding: 14px 20px; }
  .ins-cmp-rail__noise { display: none; }
}

@media (max-width: 640px) {
  .ins-cmp-mast { padding: 14px 16px; }
  .ins-cmp-mast__ticker { font-size: 28px; letter-spacing: -0.03em; }
  .ins-cmp-mast__meta { display: none; }
  .ins-cmp-mast__meta--short {
    display: block;
    margin-top: 4px;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ins-gray-600);
  }

  .ins-cmp-row {
    grid-template-columns: 1fr auto 1fr;
    align-items: baseline;
    gap: 8px;
    padding: 12px 16px;
    min-height: 44px;
  }
  .ins-cmp-row__label { font-size: 8px; letter-spacing: 0.14em; }
  .ins-cmp-label--long { display: none; }
  .ins-cmp-label--short { display: inline; }
  .ins-cmp-row__b { text-align: right; }
  .ins-cmp-val { font-size: 17px; }
  .ins-cmp-val--word { font-size: 13px; }

  .ins-cmp-row--fee { grid-template-columns: 1fr 1fr; }
  .ins-cmp-row--fee .ins-cmp-row__label {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-bottom: 4px;
  }
  .ins-cmp-fee__labeltext { display: none; }
  .ins-cmp-chip__mer { display: inline; }
  .ins-cmp-chip { margin-top: 0; font-size: 8px; }
  .ins-cmp-fee__a { grid-column: 1; grid-row: 2; justify-content: flex-start; gap: 6px; }
  .ins-cmp-fee__b { grid-column: 2; grid-row: 2; justify-content: flex-end; gap: 6px; }
  .ins-cmp-fee__delta { font-size: 9px; }

  .ins-cmp-spread { padding: 12px 16px; }
  .ins-cmp-spread__head { font-size: 8px; letter-spacing: 0.12em; gap: 10px; }
  .ins-cmp-spread__track { height: 4px; margin-top: 8px; }
  .ins-cmp-spread__mid { top: -2px; height: 8px; }
  .ins-cmp-spread__fill { height: 4px; }
  .ins-cmp-spread__ends { display: none; }

  .ins-cmp-rail { padding: 11px 14px; gap: 8px; }
  .ins-cmp-rail__sq { width: 8px; height: 8px; }
  .ins-cmp-rail__text { font-size: 8.5px; letter-spacing: 0.1em; line-height: 1.5; }
}
`;

const DASH = "—";

function pctOrDash(v: number | null | undefined): string {
  return v == null || !Number.isFinite(v) ? DASH : fmtSignedPct(v);
}

function multipleOrDash(v: number | null): string {
  return v == null || !Number.isFinite(v) ? DASH : `×${v.toFixed(2)}`;
}

function typicalOrDash(v: number | null): string {
  return v == null || !Number.isFinite(v) ? DASH : fmtPlusMinusPct(v);
}

function weightLabel(w: number): string {
  return w % 1 === 0 ? `${w}%` : `${w.toFixed(1)}%`;
}

function commonTapeLabel(commonStart: string | null): string {
  if (!commonStart) return "The common tape";
  const since = parseSessionDate(commonStart).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
  });
  return `Since ${since} — the common tape`;
}

interface RowSpec {
  key: string;
  label: string;
  shortLabel?: string;
  a: string;
  b: string;
  word?: boolean;
}

/**
 * The scoreboard (artboard 6b) — two mastheads split by a 1px ink rule,
 * then baseline-aligned fact rows with the metric micro-label centred
 * between the two values.
 *
 * The MER row leads because it is the only row where the funds reliably
 * differ: red chip, a faint red band across the row, and the gap in
 * percentage points beside the cheaper side. When the fee is a dead heat
 * (VEQT/XEQT and VEQT/VGRO both sit at ~0.20% after the 2025 cuts) the
 * chip turns ink and the band drops — the page doesn't manufacture a
 * difference that isn't there.
 *
 * Everything below is derived from the same two fetches the old page
 * used: live quotes for the one-year row, the ALL-range daily tape for
 * the common-tape multiples, the spread and the typical day.
 */
export default function Scoreboard({
  contender,
  quotes,
  metrics,
}: {
  contender: string;
  quotes: Record<string, BoutQuote>;
  metrics: PairMetrics;
}) {
  const fundA = FUNDS[HOUSE_TICKER];
  const fundB = FUNDS[contender];
  if (!fundA || !fundB) return null;

  const shortA = fundA.shortName;
  const shortB = fundB.shortName;

  /* ── MER ─────────────────────────────────────────────────── */
  const merA = fundA.mer;
  const merB = fundB.mer;
  const merGap = merB - merA; // > 0 → VEQT is cheaper
  const hasGap = Math.abs(merGap) >= 0.005;
  const houseCheaper = merGap > 0;
  const deltaText = `${MINUS}${Math.abs(merGap).toFixed(2)} PP`;
  const gapDollars = Math.round(feeGapDollars(merA, merB) / 10) * 10;

  const railText = hasGap
    ? `The fee gap compounds to ≈ ${fmtMoney(gapDollars)} on ${fmtMoney(
        FEE_GAP_PRINCIPAL
      )} over ${FEE_GAP_YEARS} years`
    : `No fee gap to compound — ${FEE_GAP_YEARS} years, ${fmtMoney(
        FEE_GAP_PRINCIPAL
      )}, same result`;

  /* ── Spread ──────────────────────────────────────────────── */
  const spread = metrics.spreadPp;
  const houseAhead = (spread ?? 0) >= 0;
  const spreadCaption =
    spread == null
      ? `Spread ${DASH}`
      : `${houseAhead ? shortA : shortB} ahead by +${Math.abs(spread).toFixed(
          1
        )} PP`;
  const barWidth = spread == null ? 0 : spreadBarWidth(spread);

  /* ── Plain rows ──────────────────────────────────────────── */
  const rows: RowSpec[] = [
    {
      key: "one-year",
      label: "One year",
      a: pctOrDash(quotes[HOUSE_TICKER]?.oneYearReturn),
      b: pctOrDash(quotes[contender]?.oneYearReturn),
    },
    {
      key: "common-tape",
      label: commonTapeLabel(metrics.commonStart),
      shortLabel: "Common tape",
      a: multipleOrDash(metrics.multipleA),
      b: multipleOrDash(metrics.multipleB),
    },
  ];

  const tailRows: RowSpec[] = [
    {
      key: "typical-day",
      label: "Typical day",
      a: typicalOrDash(metrics.typicalDayA),
      b: typicalOrDash(metrics.typicalDayB),
    },
    {
      key: "holdings",
      label: "Holdings",
      a: fmtInt(fundA.numberOfHoldings),
      b: fmtInt(fundB.numberOfHoldings),
    },
    {
      key: "canada",
      label: "Canada weight",
      shortLabel: "Canada",
      a: weightLabel(canadaWeight(HOUSE_TICKER)),
      b: weightLabel(canadaWeight(contender)),
    },
    {
      key: "distributions",
      label: "Distributions",
      a: fundA.distributionFrequency,
      b: fundB.distributionFrequency,
      word: true,
    },
  ];

  const renderRow = (row: RowSpec) => (
    <div className="ins-cmp-row" key={row.key}>
      <div className="ins-cmp-row__label">
        {row.shortLabel ? (
          <>
            <span className="ins-cmp-label--long">{row.label}</span>
            <span className="ins-cmp-label--short">{row.shortLabel}</span>
          </>
        ) : (
          row.label
        )}
      </div>
      <div className="ins-cmp-row__a">
        <span className="ins-cmp-sr">{shortA}: </span>
        <span className={`ins-cmp-val${row.word ? " ins-cmp-val--word" : ""}`}>
          {row.a}
        </span>
      </div>
      <div className="ins-cmp-row__b">
        <span className="ins-cmp-sr">{shortB}: </span>
        <span className={`ins-cmp-val${row.word ? " ins-cmp-val--word" : ""}`}>
          {row.b}
        </span>
      </div>
    </div>
  );

  return (
    <section
      className="ins-cmp-card"
      aria-label={`${shortA} against ${shortB} — the scoreboard`}
    >
      <div className="ins-cmp-card__mast">
        <div className="ins-cmp-mast ins-cmp-mast--a">
          <div className="ins-cmp-mast__ticker">{shortA}</div>
          <div className="ins-cmp-mast__meta">{houseLabel(HOUSE_TICKER)}</div>
          <div className="ins-cmp-mast__meta--short">
            {houseLabelShort(HOUSE_TICKER)}
          </div>
        </div>
        <div className="ins-cmp-mast ins-cmp-mast--b">
          <div className="ins-cmp-mast__ticker">{shortB}</div>
          <div className="ins-cmp-mast__meta">{houseLabel(contender)}</div>
          <div className="ins-cmp-mast__meta--short">
            {houseLabelShort(contender)}
          </div>
        </div>
      </div>

      {/* MER — first, because it's the row that actually separates them. */}
      <div
        className={`ins-cmp-row ins-cmp-row--first${
          hasGap ? " ins-cmp-row--fee" : ""
        }`}
      >
        <div className="ins-cmp-row__label">
          <span className="ins-cmp-fee__labeltext">MER</span>
          <span className={`ins-cmp-chip${hasGap ? "" : " ins-cmp-chip--tie"}`}>
            <span className="ins-cmp-chip__mer">MER — </span>
            {hasGap ? "The real difference" : "The fee is a dead heat"}
          </span>
        </div>
        <div className="ins-cmp-row__a ins-cmp-fee__a">
          <span className="ins-cmp-sr">{shortA}: </span>
          {hasGap && houseCheaper && (
            <span className="ins-cmp-fee__delta">{deltaText}</span>
          )}
          <span className="ins-cmp-val">{merA.toFixed(2)}%</span>
        </div>
        <div className="ins-cmp-row__b ins-cmp-fee__b">
          <span className="ins-cmp-sr">{shortB}: </span>
          <span className="ins-cmp-val">{merB.toFixed(2)}%</span>
          {hasGap && !houseCheaper && (
            <span className="ins-cmp-fee__delta">{deltaText}</span>
          )}
        </div>
      </div>

      {rows.map(renderRow)}

      <div className="ins-cmp-spread">
        <div className="ins-cmp-spread__head">
          <span>The spread — cumulative, common tape</span>
          <span
            className={`ins-cmp-spread__lead${
              spread != null && !houseAhead ? " ins-cmp-spread__lead--behind" : ""
            }`}
          >
            {spreadCaption}
          </span>
        </div>
        <div className="ins-cmp-spread__track">
          <span className="ins-cmp-spread__mid" aria-hidden />
          {spread != null && (
            <span
              className="ins-cmp-spread__fill"
              aria-hidden
              style={
                houseAhead
                  ? { right: "50%", width: `${barWidth}%` }
                  : { left: "50%", width: `${barWidth}%` }
              }
            />
          )}
        </div>
        <div className="ins-cmp-spread__ends">
          <span>&#9666; {shortA} leads</span>
          <span>{shortB} leads &#9656;</span>
        </div>
      </div>

      {tailRows.map(renderRow)}

      <div className="ins-cmp-rail">
        <span className="ins-cmp-rail__sq" aria-hidden />
        <span className="ins-cmp-rail__text">{railText}</span>
        <span className="ins-cmp-rail__noise">
          Everything else above is noise
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
