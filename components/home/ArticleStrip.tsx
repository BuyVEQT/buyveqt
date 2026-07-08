import Link from "next/link";

interface CourseEntry {
  step: number;
  slug: string;
  title: string;
  kicker: string;
  readingTime: string;
}

/**
 * Course 1 — the home page's primary reading order.
 * Hardcoded so it stays independent of /learn syllabus changes.
 */
const COURSE_1: CourseEntry[] = [
  {
    step: 1,
    slug: "what-is-veqt",
    title: "What VEQT actually is",
    kicker: "Foundation",
    readingTime: "8 min",
  },
  {
    step: 2,
    slug: "veqt-vs-diy-portfolio",
    title: "Why one fund and hold forever",
    kicker: "Strategy",
    readingTime: "9 min",
  },
  {
    step: 3,
    slug: "veqt-is-down",
    title: "What to do when it's down",
    kicker: "Behaviour",
    readingTime: "6 min",
  },
];

const css = `
.ins-read {
  border-top: 3px solid var(--ins-rule-strong, #111111);
  padding-top: 12px;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-read__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}
.ins-read__eyebrow {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-read__display {
  margin: 6px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.ins-read__all {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-ink);
  padding-bottom: 4px;
  white-space: nowrap;
}
.ins-read__grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  margin-top: 16px;
}
.ins-read__editor {
  border-right: 1px solid var(--ins-hair);
  padding-right: 28px;
}
.ins-read__editor-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.ins-read__editor-body {
  margin: 10px 0 0;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.55;
  color: #333333;
}
.ins-read__editor-meta {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--ins-hair);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-read__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ins-read__row {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 20px;
  align-items: end;
  padding: 14px 0;
  text-decoration: none;
  color: var(--ins-ink);
  transition: padding-left 0.18s ease;
}
.ins-read__item:not(:last-child) .ins-read__row {
  border-bottom: 1px solid var(--ins-hair);
}
.ins-read__row:hover {
  padding-left: 8px;
}
.ins-read__ordinal {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.ins-read__body {
  display: block;
  min-width: 0;
}
.ins-read__kicker {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.ins-read__title {
  display: block;
  margin-top: 4px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.ins-read__arrow {
  font-size: 18px;
  font-weight: 700;
  color: var(--ins-ink);
  align-self: center;
  transition: color 0.18s ease;
}
.ins-read__row:hover .ins-read__arrow {
  color: var(--ins-signal);
}

@media (prefers-reduced-motion: reduce) {
  .ins-read__row,
  .ins-read__arrow {
    transition: none;
  }
}

@media (max-width: 640px) {
  .ins-read__editor {
    display: none;
  }
  .ins-read__all {
    display: none;
  }
  .ins-read__grid {
    grid-template-columns: 1fr;
    gap: 0;
    margin-top: 0;
  }
  .ins-read__eyebrow {
    font-size: 8.5px;
    letter-spacing: 0.2em;
  }
  .ins-read__display {
    margin-top: 4px;
    font-size: 20px;
  }
  .ins-read__row {
    grid-template-columns: 40px 1fr auto;
    gap: 14px;
    padding: 12px 0;
  }
  .ins-read__ordinal {
    font-size: 30px;
  }
  .ins-read__kicker {
    font-size: 8px;
    letter-spacing: 0.16em;
  }
  .ins-read__title {
    margin-top: 3px;
    font-size: 15px;
  }
  .ins-read__arrow {
    font-size: 15px;
  }
}
`;

/**
 * ArticleStrip — "Reading order" module of the Instrument (handoff §1.7).
 *
 * 3px rule · eyebrow + display · syllabus link, then a `300px 1fr` grid:
 * editor's note (the module's single red label) beside three ordinal rows.
 * Row hover: 8px indent + the arrow turns signal red.
 *
 * Server component — zero props, no client state; plain <style> (not
 * styled-jsx) keeps it server-safe.
 */
export default function ArticleStrip() {
  return (
    <section className="ins-read" aria-labelledby="ins-read-display">
      <header className="ins-read__head">
        <div>
          <div className="ins-read__eyebrow">Read up · Course one</div>
          <h2 id="ins-read-display" className="ins-read__display">
            A reading order, in three parts.
          </h2>
        </div>
        <Link href="/learn" className="ins-read__all">
          The full syllabus <span aria-hidden>→</span>
        </Link>
      </header>

      <div className="ins-read__grid">
        {/* Editor column — hidden on mobile (rows only, per 13-ref) */}
        <aside className="ins-read__editor">
          <div className="ins-read__editor-label">From the editor</div>
          <p className="ins-read__editor-body">
            The shortest path from &ldquo;I keep hearing about VEQT&rdquo; to
            &ldquo;I understand what I&rsquo;d be holding.&rdquo; Three reads,
            twenty-three minutes. In order.
          </p>
          <div className="ins-read__editor-meta">
            &mdash; Syllabus updated weekly
          </div>
        </aside>

        <ol className="ins-read__list">
          {COURSE_1.map((a) => (
            <li key={a.slug} className="ins-read__item">
              <Link href={`/learn/${a.slug}`} className="ins-read__row">
                <span className="ins-read__ordinal" aria-hidden>
                  {String(a.step).padStart(2, "0")}
                </span>
                <span className="ins-read__body">
                  <span className="ins-read__kicker">
                    {a.kicker} · {a.readingTime}
                  </span>
                  <span className="ins-read__title">{a.title}</span>
                </span>
                <span className="ins-read__arrow" aria-hidden>
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
