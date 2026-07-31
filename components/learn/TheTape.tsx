import { FUNDS } from "@/data/funds";

const css = `
.tprail {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 12px;
  font-family: var(--ins-font);
}
.tprail__kicker {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.tprail__rows {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tprail__row {
  border-bottom: 1px solid var(--ins-hair);
  padding: 12px 0;
}
.tprail__row:last-child {
  border-bottom: 1px solid var(--ins-ink);
}
.tprail__label {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.tprail__values {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-top: 4px;
}
.tprail__lead {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  color: var(--ins-ink);
}
.tprail__foil {
  font-size: 14px;
  font-weight: 600;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.tprail__note {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ins-gray-600);
}
.tprail__caption {
  margin-top: 10px;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.7;
  color: var(--ins-gray-600);
}

/* ── Under lg the rail folds into a ruled strip beneath the hero:
   four cells across, values on one line, no sticky. ───────────── */
@media (max-width: 1023px) {
  .tprail__rows {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 18px;
  }
  .tprail__row {
    padding: 10px 0;
  }
  .tprail__row:nth-last-child(-n + 2) {
    border-bottom: 1px solid var(--ins-ink);
  }
  .tprail__lead {
    font-size: 17px;
  }
  .tprail__caption {
    letter-spacing: 0.1em;
  }
}
@media (max-width: 400px) {
  .tprail__values {
    flex-wrap: wrap;
    gap: 4px 8px;
  }
}
`;

/** 13,726 → "13,700". Matches the hero's rounding. */
function roundedHoldings(n: number): string {
  return (Math.round(n / 100) * 100).toLocaleString("en-CA");
}

/**
 * THE TAPE — the flagship's score rail. Pinned in the right column on
 * desktop so the four numbers that decide the argument stay on screen while
 * the article scrolls; folds into a ruled two-across strip under the hero on
 * narrow viewports.
 *
 * Holdings and the management fee are wired to data/funds.ts. The five-year
 * leader and the ~0.97 correlation are editorial readings of the tape rather
 * than fields we hold, so they stay literal — same figures the performance
 * exhibit quotes.
 *
 * Server component; sticky positioning is applied by the page's grid.
 */
export default function TheTape() {
  const veqt = FUNDS["VEQT.TO"];
  const xeqt = FUNDS["XEQT.TO"];
  const sameFee = veqt.managementFee === xeqt.managementFee;

  return (
    <aside className="tprail" aria-label="The tape — key numbers">
      <div className="tprail__kicker">The tape · Key numbers</div>
      <ul className="tprail__rows">
        <li className="tprail__row">
          <div className="tprail__label">Holdings</div>
          <div className="tprail__values">
            <span className="tprail__lead">
              {roundedHoldings(veqt.numberOfHoldings)}
            </span>
            <span className="tprail__foil">
              {roundedHoldings(xeqt.numberOfHoldings)}
            </span>
          </div>
        </li>

        <li className="tprail__row">
          <div className="tprail__label">
            Mgmt fee — {sameFee ? "both" : "VEQT vs XEQT"}
          </div>
          <div className="tprail__values">
            <span className="tprail__lead">
              {veqt.managementFee.toFixed(2)}%
            </span>
            {!sameFee && (
              <span className="tprail__foil">
                {xeqt.managementFee.toFixed(2)}%
              </span>
            )}
          </div>
        </li>

        <li className="tprail__row">
          <div className="tprail__label">5-year leader</div>
          <div className="tprail__values">
            <span className="tprail__lead">VEQT</span>
            <span className="tprail__note">By a sliver</span>
          </div>
        </li>

        <li className="tprail__row">
          <div className="tprail__label">Correlation</div>
          <div className="tprail__values">
            <span className="tprail__lead">~0.97</span>
            <span className="tprail__note">Near-twins</span>
          </div>
        </li>
      </ul>
      <p className="tprail__caption">
        Rail stays pinned while the article scrolls — the score is always on
        screen
      </p>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </aside>
  );
}
