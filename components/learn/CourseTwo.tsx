import Link from "next/link";
import type { SyllabusEntry } from "./learn-syllabus";

const css = `
.lrn-c2 {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 16px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.lrn-c2__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
.lrn-c2__eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrn-c2__display {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.lrn-c2__total {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.lrn-c2__total-short {
  display: none;
}
.lrn-c2__list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  border-top: 1px solid var(--ins-ink);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 40px;
}
.lrn-c2__item + .lrn-c2__item {
  border-left: 1px solid var(--ins-hair);
}
.lrn-c2__row {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 16px;
  align-items: end;
  padding: 14px 0;
  text-decoration: none;
  color: var(--ins-ink);
  transition: padding-left 0.18s ease;
}
.lrn-c2__item + .lrn-c2__item .lrn-c2__row {
  padding-left: 24px;
}
.lrn-c2__row:hover {
  padding-left: 8px;
}
.lrn-c2__item + .lrn-c2__item .lrn-c2__row:hover {
  padding-left: 32px;
}
.lrn-c2__ordinal {
  font-size: 36px;
  font-weight: 700;
  line-height: 0.85;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.lrn-c2__body {
  display: block;
  min-width: 0;
}
.lrn-c2__kicker {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.lrn-c2__title {
  display: block;
  margin-top: 4px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: pretty;
}
.lrn-c2__arrow {
  font-size: 18px;
  font-weight: 700;
  align-self: center;
  transition: color 0.18s ease;
}
.lrn-c2__row:hover .lrn-c2__arrow,
.lrn-c2__row:focus-visible .lrn-c2__arrow {
  color: var(--ins-signal);
}

@media (prefers-reduced-motion: reduce) {
  .lrn-c2__row,
  .lrn-c2__arrow {
    transition: none;
  }
}

@media (max-width: 900px) {
  .lrn-c2__list {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
  .lrn-c2__item + .lrn-c2__item {
    border-left: 0;
  }
  .lrn-c2__item:not(:last-child) {
    border-bottom: 1px solid var(--ins-hair);
  }
  .lrn-c2__item + .lrn-c2__item .lrn-c2__row {
    padding-left: 0;
  }
  .lrn-c2__item + .lrn-c2__item .lrn-c2__row:hover {
    padding-left: 8px;
  }
}
@media (max-width: 640px) {
  .lrn-c2 {
    padding-top: 12px;
  }
  .lrn-c2__display {
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
  .lrn-c2__eyebrow {
    font-size: 9px;
    letter-spacing: 0.18em;
  }
  .lrn-c2__total {
    font-size: 8.5px;
    letter-spacing: 0.12em;
  }
  .lrn-c2__total-long {
    display: none;
  }
  .lrn-c2__total-short {
    display: inline;
  }
  .lrn-c2__list {
    margin-top: 8px;
    border-top: 0;
  }
  .lrn-c2__row {
    grid-template-columns: 40px 1fr auto;
    gap: 12px;
    padding: 13px 0;
  }
  .lrn-c2__ordinal {
    font-size: 30px;
  }
  .lrn-c2__kicker {
    font-size: 8.5px;
    letter-spacing: 0.14em;
  }
  .lrn-c2__title {
    margin-top: 3px;
    font-size: 15px;
  }
  .lrn-c2__arrow {
    font-size: 15px;
  }
}
`;

/**
 * Course Two — the accounts (artboard 6c). Three ruled columns on desktop,
 * one stacked list on mobile, ordinals continuing from Course One.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function CourseTwo({
  entries,
  minutes,
  startOrdinal,
}: {
  entries: SyllabusEntry[];
  minutes: number;
  startOrdinal: number;
}) {
  return (
    <section className="lrn-c2" aria-labelledby="lrn-c2-display">
      <header className="lrn-c2__head">
        <div>
          <div className="lrn-c2__eyebrow">Course two — the accounts</div>
          <h2 id="lrn-c2-display" className="lrn-c2__display">
            Where to put it.
          </h2>
        </div>
        <span className="lrn-c2__total">
          {minutes}{" "}
          <span className="lrn-c2__total-long">
            minutes total · after course one
          </span>
          <span className="lrn-c2__total-short">min</span>
        </span>
      </header>

      <ol className="lrn-c2__list">
        {entries.map((e, i) => (
          <li key={e.slug} className="lrn-c2__item">
            <Link href={`/learn/${e.slug}`} className="lrn-c2__row">
              <span className="lrn-c2__ordinal" aria-hidden>
                {String(startOrdinal + i).padStart(2, "0")}
              </span>
              <span className="lrn-c2__body">
                <span className="lrn-c2__kicker">
                  {e.category} · {e.minutes} min
                </span>
                <span className="lrn-c2__title">{e.title}</span>
              </span>
              <span className="lrn-c2__arrow" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
