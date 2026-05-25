import Link from "next/link";

interface CourseEntry {
  step: number | string;
  slug: string;
  title: string;
  kicker: string;
  readingTime: string;
}

/**
 * Course 1 — the home page's primary reading order.
 * V2: editor's-note column on left + three article rows with Fraunces ordinals.
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

/**
 * CourseStrip V2 — editor's note on the left (drop-cap T, stamp header,
 * hairline divider, byline footer) + three article rows with Fraunces ordinals.
 * Server component — no client state.
 */
export default function ArticleStrip() {
  return (
    <section className="course">
      <div className="course__head">
        <div>
          <div className="ed-stamp">Read up · Course one</div>
          <div className="ed-display course__h">
            A reading order,{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>
              in three parts.
            </em>
          </div>
        </div>
        <Link href="/learn" className="course__all">
          The full syllabus{" "}
          <span style={{ color: "var(--stamp)" }}>→</span>
        </Link>
      </div>

      <div className="course__layout">
        {/* Editor column */}
        <aside className="course__editor">
          <div
            className="ed-stamp"
            style={{ color: "var(--stamp)", marginBottom: 8 }}
          >
            From the editor
          </div>
          <p className="ed-body course__editor-body">
            The shortest path from &ldquo;I keep hearing about VEQT&rdquo; to
            &ldquo;I understand what I&apos;d be holding.&rdquo; Three reads,
            twenty-three minutes. In order.
          </p>
          <div className="course__editor-meta">
            <span className="ed-caption">
              — Round 4 syllabus, updated weekly
            </span>
          </div>
        </aside>

        {/* Article rows */}
        <ol className="course__list">
          {COURSE_1.map((a) => (
            <li key={a.slug}>
              <Link href={`/learn/${a.slug}`} className="course__row">
                <span className="course__num ed-display">{a.step}</span>
                <div className="course__row-body">
                  <div className="course__kicker">
                    <span className="ed-label">{a.kicker}</span>
                    <span className="ed-caption" style={{ fontSize: 12 }}>
                      {" "}
                      · {a.readingTime}
                    </span>
                  </div>
                  <div className="ed-display course__title">{a.title}</div>
                </div>
                <span className="course__chev" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <style jsx global>{`
        .course {
          padding: 28px 0 12px;
        }
        .course__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .course__h {
          font-size: clamp(2rem, 3.6vw, 2.6rem);
          line-height: 1;
          letter-spacing: -0.02em;
          margin-top: 6px;
        }
        .course__all {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-soft);
          text-decoration: none;
        }

        .course__layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--gap, 22px);
          border-top: 2px solid var(--ink);
          padding-top: 6px;
        }
        @media (min-width: 880px) {
          .course__layout {
            grid-template-columns: 0.7fr 2fr;
            gap: 32px;
          }
        }

        /* Editor column */
        .course__editor {
          padding: 18px 18px 0 4px;
          border-right: none;
        }
        @media (min-width: 880px) {
          .course__editor {
            border-right: 1px solid var(--rule-soft);
            padding-right: 24px;
          }
        }
        .course__editor-body {
          font-family: var(--font-serif);
          font-size: 16px;
          line-height: 1.55;
          color: var(--ink-soft);
          margin-bottom: 14px;
          max-width: 30ch;
        }
        /* Drop-cap T */
        .course__editor-body::first-letter {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 2.6em;
          line-height: 0.88;
          float: left;
          padding: 0.06em 0.12em 0 0;
          color: var(--ink);
        }
        .course__editor-meta {
          padding-top: 12px;
          border-top: 1px solid var(--rule-soft);
        }

        /* Article list */
        .course__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .course__row {
          display: grid;
          grid-template-columns: 56px 1fr 24px;
          /* Bottom-align so the big Fraunces ordinal's baseline sits on
             the same line as the article title; the small kicker label
             just rides above it. align-items center left the digits
             floating against the kicker instead of the title. */
          align-items: end;
          gap: 18px;
          padding: 18px 4px;
          border-bottom: 1px solid var(--rule-soft);
          text-decoration: none;
          color: var(--ink);
          transition: padding 0.18s;
        }
        .course__row:hover {
          padding-left: 12px;
        }
        .course__row:hover .course__chev {
          transform: translateX(4px);
          color: var(--stamp);
        }
        .course__list li:last-child .course__row {
          border-bottom: none;
        }

        .course__num {
          font-size: 48px;
          /* line-height: 1 so the digit's bottom edge sits on the row's
             bottom edge; combined with align-items end this lines the
             numeral up with the article title's baseline. */
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--stamp);
          font-feature-settings: "ss01", "lnum";
          /* Visual baseline trim: Fraunces lining figures sit a few px
             above the descender line, so nudge down so the bottom of the
             digit reads as flush with the title text below it. */
          position: relative;
          top: 4px;
        }
        .course__row-body {
          min-width: 0;
        }
        .course__kicker {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }
        .course__title {
          font-size: clamp(1.1rem, 1.8vw, 1.4rem);
          line-height: 1.1;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .course__chev {
          color: var(--ink-mute);
          font-size: 24px;
          font-family: var(--font-display);
          transition: transform 0.18s, color 0.18s;
          align-self: center;
        }
      `}</style>
    </section>
  );
}
