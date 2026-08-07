const css = `
.mpio {
  margin: 34px 0 30px;
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 14px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
/* TRUE LABEL — the section kicker, same object as ExhibitFrame's. Caps and
   tracking stay, size goes to the floor; it runs the full column and wraps. */
.mpio__kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.mpio__headline {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.mpio__band {
  margin-top: 18px;
  border: 1px solid var(--ins-ink);
}
.mpio__actor {
  padding: 8px 14px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ins-inv-text);
}
.mpio__actor--lead {
  background: var(--ins-signal);
}
.mpio__actor--follow {
  background: var(--ins-ink);
}
.mpio__ticks {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  border-top: 1px solid var(--ins-ink);
  border-bottom: 1px solid var(--ins-ink);
}
.mpio__tick {
  padding: 11px 0;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.mpio__tick + .mpio__tick {
  border-left: 1px solid var(--ins-hair);
}

.mpio__rows {
  list-style: none;
  margin: 22px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 32px;
}
.mpio__row {
  padding: 13px 0;
  border-top: 1px solid var(--ins-hair);
}
.mpio__rowTop {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.mpio__year {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.015em;
  font-variant-numeric: tabular-nums;
}
.mpio__row--lead .mpio__year,
.mpio__row--lead .mpio__who {
  color: var(--ins-signal);
}
/* TRUE LABEL — a proper noun ("Vanguard", "BlackRock", "iShares") beside
   the year. Names a thing, so caps stay; size goes to the floor. It sits in
   a baseline flex row with room to spare, not a fixed track. */
.mpio__who {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.mpio__text {
  margin: 6px 0 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
  max-width: 46ch;
}

.mpio__closer {
  margin: 22px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--ins-ink);
  max-width: 68ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.65;
  color: var(--ins-gray-700);
}
.mpio__stamp {
  color: var(--ins-signal);
  font-weight: 700;
}

@media (max-width: 760px) {
  .mpio__rows {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 640px) {
  .mpio {
    margin: 22px 0 20px;
    padding-top: 12px;
  }
  .mpio__kicker {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .mpio__headline {
    font-size: 19px;
    letter-spacing: -0.015em;
  }
  .mpio__actor {
    padding: 7px 12px;
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .mpio__tick {
    padding: 9px 0;
    font-size: 12px;
  }
  .mpio__year {
    font-size: 17px;
  }
  .mpio__text,
  .mpio__closer {
    font-size: 14px;
  }
}
`;

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
    year: 2000,
    who: "iShares",
    text: "Barclays launches the iShares ETF brand (sold to BlackRock in 2009).",
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
    text: "BlackRock launches XEQT — six months after VEQT.",
  },
];

const YEAR_TICKS = ["1975", "1985", "1995", "2009", "2018", "Today"];

/**
 * Pioneer vs fast-follower — restyled into Instrument chrome for Turn 7.
 * No Turn 7 exhibit was drawn for this one, so the content is untouched:
 * same six milestones, same tick scale, same closing line. What changed is
 * the dress — ink rules instead of cards, Archivo throughout, red spent
 * only on Vanguard's entries.
 *
 * Server component now that nothing measures its own width; the two-across
 * milestone grid collapses on a plain media query.
 */
export function PioneerTimeline() {
  return (
    <section className="mpio" aria-labelledby="mpio-headline">
      <div className="mpio__kicker">
        Pioneer vs fast-follower · Fifty years of index investing
      </div>
      <h3 className="mpio__headline" id="mpio-headline">
        One was born for this. One bought in.
      </h3>

      <div className="mpio__band">
        <div className="mpio__actor mpio__actor--lead">Vanguard</div>
        <div className="mpio__ticks">
          {YEAR_TICKS.map((y) => (
            <div className="mpio__tick" key={y}>
              {y}
            </div>
          ))}
        </div>
        <div className="mpio__actor mpio__actor--follow">BlackRock</div>
      </div>

      <ul className="mpio__rows">
        {MILESTONES.map((m) => (
          <li
            className={`mpio__row${m.stamp ? " mpio__row--lead" : ""}`}
            key={`${m.year}-${m.who}`}
          >
            <div className="mpio__rowTop">
              <span className="mpio__year">{m.year}</span>
              <span className="mpio__who">{m.who}</span>
            </div>
            <p className="mpio__text">{m.text}</p>
          </li>
        ))}
      </ul>

      <p className="mpio__closer">
        Nobel laureate Paul Samuelson once ranked Bogle&rsquo;s index fund
        alongside the wheel, the alphabet, and the printing press. Warren
        Buffett has called Vanguard funds the best option for most investors.{" "}
        <span className="mpio__stamp">
          When you buy VEQT, you are buying the original.
        </span>
      </p>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
