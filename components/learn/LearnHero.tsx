import { capitalize, numberWord } from "./learn-syllabus";

const css = `
.lrn-hero {
  padding-top: 34px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.lrn-hero__kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.lrn-hero__display {
  margin: 16px 0 0;
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}
.lrn-hero__dek {
  margin: 16px 0 0;
  max-width: 64ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}

@media (max-width: 960px) {
  .lrn-hero__display {
    font-size: 52px;
    letter-spacing: -0.035em;
  }
}
@media (max-width: 640px) {
  .lrn-hero {
    padding-top: 24px;
  }
  .lrn-hero__kicker {
    font-size: 9px;
    letter-spacing: 0.24em;
  }
  .lrn-hero__kicker-long {
    display: none;
  }
  .lrn-hero__display {
    margin-top: 12px;
    font-size: 40px;
    letter-spacing: -0.035em;
    line-height: 1.02;
  }
  .lrn-hero__dek {
    margin-top: 12px;
    font-size: 12.5px;
    line-height: 1.55;
  }
}
`;

/**
 * /learn masthead — artboard 6c.
 *
 * Kicker (dispatch count from the registry) · 64px display · one dek.
 * The dek's leading numeral is spelled out and derived, so adding an
 * article to content/learn updates the sentence.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function LearnHero({ count }: { count: number }) {
  return (
    <header className="lrn-hero">
      <div className="lrn-hero__kicker">
        Read up · {count} dispatches
        <span className="lrn-hero__kicker-long">
          {" "}
          · Plain English · New every Thursday
        </span>
      </div>
      <h1 className="lrn-hero__display">Learn the boring fund.</h1>
      <p className="lrn-hero__dek">
        {capitalize(numberWord(count))} dispatches on VEQT, the accounts that
        shelter it, and the behaviour that ruins it. Read in order, or raid the
        index.
      </p>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </header>
  );
}
