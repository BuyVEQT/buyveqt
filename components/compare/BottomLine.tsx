import { getVerdict } from "@/data/verdicts";
import { getVerdict as getPairVerdict } from "@/lib/compare-verdicts";

interface BottomLineProps {
  slug: string;
  fundA: string;
  fundB: string;
  className?: string;
}

/** The shape both verdict stores agree on — all this module reads. */
interface ScoredPoint {
  label: string;
  winner: string;
  explanation: string;
}

const css = `
.ins-cmp-bl {
  border-top: 3px solid var(--ins-rule-strong, #111111);
  padding-top: 16px;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-bl__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
.ins-cmp-bl__kicker {
  margin: 0;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.ins-cmp-bl__display {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.ins-cmp-bl__note {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ins-cmp-bl__lede {
  margin: 14px 0 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  max-width: 76ch;
  color: var(--ins-gray-700);
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}

/* ── The rounds — ruled rows, two columns on wide viewports ────── */
.ins-cmp-bl__grid {
  margin-top: 16px;
  border-top: 1px solid var(--ins-ink);
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 56px;
}
.ins-cmp-bl__col {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ins-cmp-bl__col > li:not(:last-child) {
  border-bottom: 1px solid var(--ins-hair);
}
.ins-cmp-bl__point {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 16px;
  align-items: start;
  padding: 14px 0;
}
.ins-cmp-bl__ordinal {
  font-size: 26px;
  font-weight: 700;
  line-height: 0.85;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.ins-cmp-bl__body {
  min-width: 0;
}
.ins-cmp-bl__label {
  display: block;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
.ins-cmp-bl__text {
  display: block;
  margin-top: 5px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--ins-gray-700);
  max-width: 48ch;
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}

/* Winner marks — ink, not red. Filled = the house side took the round,
   outlined = the contender did, hairline = a draw. */
.ins-cmp-bl__chip {
  margin-top: 2px;
  padding: 3px 8px 2px;
  border: 1px solid var(--ins-ink);
  border-radius: 0;
  background: var(--ins-ink);
  color: var(--ins-paper);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ins-cmp-bl__chip--other {
  background: transparent;
  color: var(--ins-ink);
}
.ins-cmp-bl__chip--tie {
  background: transparent;
  color: var(--ins-gray-600);
  border-color: var(--ins-hair);
}

/* ── The recommendation ────────────────────────────────────────── */
.ins-cmp-bl__rec {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--ins-ink);
}
.ins-cmp-bl__rec-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-bl__rec-text {
  margin: 8px 0 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.55;
  max-width: 72ch;
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}
.ins-cmp-bl__colophon {
  margin: 18px 0 0;
  padding-top: 10px;
  border-top: 1px solid var(--ins-hair-soft);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}

@media (max-width: 900px) {
  .ins-cmp-bl__grid {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
  .ins-cmp-bl__col:first-child > li:last-child {
    border-bottom: 1px solid var(--ins-hair);
  }
  .ins-cmp-bl__note { display: none; }
}

@media (max-width: 640px) {
  .ins-cmp-bl { padding-top: 12px; }
  .ins-cmp-bl__kicker { font-size: 9px; letter-spacing: 0.18em; }
  .ins-cmp-bl__display { margin-top: 6px; font-size: 20px; }
  .ins-cmp-bl__lede { margin-top: 10px; font-size: 13px; line-height: 1.5; }
  .ins-cmp-bl__grid { margin-top: 10px; }
  .ins-cmp-bl__point {
    grid-template-columns: 28px 1fr auto;
    gap: 10px;
    padding: 12px 0;
  }
  .ins-cmp-bl__ordinal { font-size: 19px; }
  .ins-cmp-bl__label { font-size: 13.5px; }
  .ins-cmp-bl__text { margin-top: 4px; font-size: 12.5px; line-height: 1.5; }
  .ins-cmp-bl__chip { font-size: 8px; letter-spacing: 0.08em; padding: 2px 6px 1px; }
  .ins-cmp-bl__rec { margin-top: 14px; padding-top: 12px; }
  .ins-cmp-bl__rec-text { font-size: 13px; }
  .ins-cmp-bl__colophon { margin-top: 14px; font-size: 8.5px; letter-spacing: 0.12em; }
}
`;

function WinnerChip({
  winner,
  fundA,
  fundB,
}: {
  winner: string;
  fundA: string;
  fundB: string;
}) {
  const strip = (t: string) => t.replace(/\.TO$/i, "").toUpperCase();
  const w = winner.trim().toUpperCase();

  let modifier = " ins-cmp-bl__chip--tie";
  if (w === strip(fundA)) modifier = "";
  else if (w === strip(fundB)) modifier = " ins-cmp-bl__chip--other";

  return <span className={`ins-cmp-bl__chip${modifier}`}>{winner}</span>;
}

/**
 * The scorecard — the lower half of `/compare/[slug]`, in the Instrument
 * grammar (3px ink rule, red kicker, ruled rows, Archivo throughout).
 *
 * Copy is curated, never generated: `data/verdicts.ts` first, then the
 * pair-keyed store in `lib/compare-verdicts.ts` (whose `points` field was
 * always documented as "rendered by the BottomLine component"). A pair
 * curated in neither store renders nothing rather than an opinion we
 * haven't earned.
 *
 * Red budget: one moment — the kicker. The winner marks are ink, so the
 * only vermilion on the page below the fold is the section's own label.
 */
export default function BottomLine({
  slug,
  fundA,
  fundB,
  className,
}: BottomLineProps) {
  const verdict = getVerdict(slug) ?? getPairVerdict(fundA, fundB);
  if (!verdict) return null;

  const points: ScoredPoint[] = verdict.points;
  const split = Math.ceil(points.length / 2);
  const columns = [points.slice(0, split), points.slice(split)];

  const renderPoint = (point: ScoredPoint, index: number) => (
    <li key={point.label}>
      <div className="ins-cmp-bl__point">
        <span className="ins-cmp-bl__ordinal" aria-hidden>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="ins-cmp-bl__body">
          <span className="ins-cmp-bl__label">{point.label}</span>
          <span className="ins-cmp-bl__text">{point.explanation}</span>
        </span>
        <WinnerChip winner={point.winner} fundA={fundA} fundB={fundB} />
      </div>
    </li>
  );

  return (
    <section
      className={`ins-cmp-bl${className ? ` ${className}` : ""}`}
      aria-labelledby="bottomline-heading"
    >
      <header className="ins-cmp-bl__head">
        <div>
          <p className="ins-cmp-bl__kicker">The scorecard</p>
          <h2 id="bottomline-heading" className="ins-cmp-bl__display">
            Round by round, who took it.
          </h2>
        </div>
        <span className="ins-cmp-bl__note">
          {points.length} rounds &middot; Reviewed quarterly
        </span>
      </header>

      <p className="ins-cmp-bl__lede">{verdict.summary}</p>

      <div className="ins-cmp-bl__grid">
        {columns.map((column, col) => (
          <ol
            key={col}
            className="ins-cmp-bl__col"
            start={col === 0 ? 1 : split + 1}
          >
            {column.map((point, i) =>
              renderPoint(point, col === 0 ? i : split + i)
            )}
          </ol>
        ))}
      </div>

      <div className="ins-cmp-bl__rec">
        <div className="ins-cmp-bl__rec-label">&mdash; The recommendation</div>
        <p className="ins-cmp-bl__rec-text">{verdict.recommendation}</p>
      </div>

      <p className="ins-cmp-bl__colophon">
        Editorial analysis &middot; Public fund data &middot; Not financial
        advice &middot; Your situation may differ
      </p>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
