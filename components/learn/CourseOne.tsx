import Link from "next/link";
import { numberWord, type SyllabusEntry } from "./learn-syllabus";

const css = `
.lrn-c1 {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 16px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.lrn-c1__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
.lrn-c1__eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrn-c1__display {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.lrn-c1__total {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.lrn-c1__total-short {
  display: none;
}
.lrn-c1__grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  margin-top: 18px;
}
.lrn-c1__editor {
  border-right: 1px solid var(--ins-hair);
  padding-right: 28px;
}
.lrn-c1__editor-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.lrn-c1__editor-body {
  margin: 10px 0 0;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.6;
  color: #333333;
  text-wrap: pretty;
}
.lrn-c1__editor-meta {
  margin-top: 14px;
  padding-top: 8px;
  border-top: 1px solid var(--ins-hair);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrn-c1__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.lrn-c1__row {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 20px;
  align-items: end;
  padding: 14px 0;
  text-decoration: none;
  color: var(--ins-ink);
  transition: padding-left 0.18s ease;
}
.lrn-c1__item:not(:last-child) .lrn-c1__row {
  border-bottom: 1px solid var(--ins-hair);
}
.lrn-c1__row:hover {
  padding-left: 8px;
}
.lrn-c1__ordinal {
  font-size: 44px;
  font-weight: 700;
  line-height: 0.85;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.lrn-c1__body {
  display: block;
  min-width: 0;
}
.lrn-c1__kicker {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.lrn-c1__title {
  display: block;
  margin-top: 4px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.lrn-c1__arrow {
  font-size: 18px;
  font-weight: 700;
  align-self: center;
  transition: color 0.18s ease;
}
.lrn-c1__row:hover .lrn-c1__arrow,
.lrn-c1__row:focus-visible .lrn-c1__arrow {
  color: var(--ins-signal);
}

@media (prefers-reduced-motion: reduce) {
  .lrn-c1__row,
  .lrn-c1__arrow {
    transition: none;
  }
}

@media (max-width: 900px) {
  .lrn-c1__grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .lrn-c1__editor {
    border-right: 0;
    padding-right: 0;
  }
}
@media (max-width: 640px) {
  .lrn-c1 {
    padding-top: 12px;
  }
  .lrn-c1__display {
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
  .lrn-c1__eyebrow {
    font-size: 9px;
    letter-spacing: 0.18em;
  }
  .lrn-c1__total {
    font-size: 8.5px;
    letter-spacing: 0.12em;
  }
  .lrn-c1__total-long {
    display: none;
  }
  .lrn-c1__total-short {
    display: inline;
  }
  .lrn-c1__grid {
    margin-top: 10px;
    gap: 8px;
  }
  .lrn-c1__editor-label {
    display: inline;
    font-size: 8.5px;
    letter-spacing: 0.16em;
  }
  .lrn-c1__editor-label::after {
    content: " — ";
  }
  .lrn-c1__editor-body {
    display: inline;
    margin: 0;
    font-size: 12.5px;
    line-height: 1.55;
  }
  .lrn-c1__editor-lede,
  .lrn-c1__editor-meta {
    display: none;
  }
  .lrn-c1__row {
    grid-template-columns: 40px 1fr auto;
    gap: 12px;
    padding: 13px 0;
  }
  .lrn-c1__ordinal {
    font-size: 30px;
  }
  .lrn-c1__kicker {
    font-size: 8.5px;
    letter-spacing: 0.14em;
  }
  .lrn-c1__title {
    margin-top: 3px;
    font-size: 15px;
  }
  .lrn-c1__arrow {
    font-size: 15px;
  }
}
`;

/**
 * Course One — artboard 6c. The home page's reading order at full length:
 * editor column (the module's single red label) beside three ordinal rows.
 * Row hover indents 8px and turns the arrow signal red.
 *
 * Minutes are summed from the articles' own frontmatter, so the editor's
 * note and the "N minutes total" stamp can't drift from the content.
 *
 * Mobile drops the editor's lede and reflows the label inline, per the
 * 390 artboard; the display heading stays in the DOM, visually hidden.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function CourseOne({
  entries,
  minutes,
}: {
  entries: SyllabusEntry[];
  minutes: number;
}) {
  return (
    <section className="lrn-c1" aria-labelledby="lrn-c1-display">
      <header className="lrn-c1__head">
        <div>
          <div className="lrn-c1__eyebrow">Course one — start here</div>
          <h2 id="lrn-c1-display" className="lrn-c1__display">
            Three reads, in order.
          </h2>
        </div>
        <span className="lrn-c1__total">
          {minutes} <span className="lrn-c1__total-long">minutes total</span>
          <span className="lrn-c1__total-short">min</span>
        </span>
      </header>

      <div className="lrn-c1__grid">
        <aside className="lrn-c1__editor">
          <div className="lrn-c1__editor-label">From the editor</div>
          <p className="lrn-c1__editor-body">
            <span className="lrn-c1__editor-lede">
              The shortest path from &ldquo;I keep hearing about VEQT&rdquo; to
              &ldquo;I understand what I&rsquo;d be holding.&rdquo;{" "}
            </span>
            Three reads, {numberWord(minutes)} minutes. In order.
          </p>
          <div className="lrn-c1__editor-meta">
            &mdash; Round 4 syllabus, updated weekly
          </div>
        </aside>

        <ol className="lrn-c1__list">
          {entries.map((e, i) => (
            <li key={e.slug} className="lrn-c1__item">
              <Link href={`/learn/${e.slug}`} className="lrn-c1__row">
                <span className="lrn-c1__ordinal" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="lrn-c1__body">
                  <span className="lrn-c1__kicker">
                    {e.category} · {e.minutes} min
                  </span>
                  <span className="lrn-c1__title">{e.title}</span>
                </span>
                <span className="lrn-c1__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
