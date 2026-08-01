import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { getAllArticles } from "@/lib/articles";
import { LEARN_PATHS, assertPathSlugsResolve } from "@/lib/learn-paths-data";
import {
  capitalize,
  numberWord,
  pickBySlug,
  totalMinutes,
} from "@/components/learn/learn-syllabus";

export const metadata: Metadata = {
  title: "All Learn Paths — Six Ways In",
  description:
    "Six curated reading paths through the VEQT corpus — from \"I'm new to this\" to \"planning withdrawal.\" Each is 4–6 dispatches in a deliberate order.",
  alternates: { canonical: canonicalUrl("/learn/path") },
  openGraph: {
    title: "All Learn Paths — Six Ways In",
    description:
      "Six curated reading paths through the VEQT corpus. Each is 4–6 dispatches in the order we think they belong.",
    url: canonicalUrl("/learn/path"),
  },
};

/**
 * /learn/path — every guided route, in the Instrument grammar.
 *
 * The /learn index surfaces one ruled row pointing here; this page is the
 * whole shelf. Composition follows the constants that hold across migrated
 * routes:
 *   hero   — kicker · display · dek, with the derived count on the right
 *   routes — one ruled ordinal row per path (question, name, description,
 *            steps · minutes), hover indents and turns the arrow red
 *   rail   — the one verdict rail on the page
 *   closer — display + dek + the single red CTA, back to the index
 *
 * Every number is derived: step counts and running times are summed from
 * the article registry through `pickBySlug`, so a retitled or retimed
 * dispatch updates this page without anyone editing copy here.
 *
 * Server component. Styles ship as a plain <style> tag (the
 * CourseOne/methodology pattern) rather than styled-jsx, which would force
 * "use client" and drop its scope class off <Link>-rendered anchors.
 */
export default function AllPathsPage() {
  const articles = getAllArticles();
  assertPathSlugsResolve(articles.map((a) => a.slug));

  const routes = LEARN_PATHS.map((p) => {
    const steps = pickBySlug(articles, p.slugs);
    return {
      id: p.id,
      question: p.question ?? p.title,
      title: p.title,
      description: p.description,
      steps: steps.length,
      minutes: totalMinutes(steps),
    };
  });

  const totalSteps = routes.reduce((n, r) => n + r.steps, 0);
  const totalMins = routes.reduce((n, r) => n + r.minutes, 0);

  return (
    <main className="ins-root lrnp">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: "All paths", path: "/learn/path" },
        ])}
      />

      <div className="lrnp__page">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <header className="lrnp__hero">
          <div className="lrnp__heroTop">
            <span className="lrnp__kicker">
              Guided routes · {capitalize(numberWord(routes.length))} paths · By
              goal
            </span>
            <span className="lrnp__heroMeta">
              {totalSteps} steps · {totalMins} minutes
            </span>
          </div>
          <h1 className="lrnp__display">Pick a route. Follow it.</h1>
          <p className="lrnp__dek">
            {capitalize(numberWord(routes.length))} reading orders through the
            same archive, each built around a question you actually have. Every
            step is a dispatch you can also read alone — the path only decides
            what comes next.
          </p>
        </header>

        {/* ── The routes — ordinal rows ──────────────────────────── */}
        <section className="lrnp__sec" aria-labelledby="lrnp-routes">
          <div className="lrnp__secHead">
            <span className="lrnp__eyebrow" id="lrnp-routes">
              The routes · {numberWord(routes.length)} in all
            </span>
            <span className="lrnp__secMeta">Pick the question that fits</span>
          </div>

          <ol className="lrnp__list">
            {routes.map((r, i) => (
              <li key={r.id} className="lrnp__item">
                <Link href={`/learn/path/${r.id}`} className="lrnp__row">
                  <span className="lrnp__ordinal" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="lrnp__body">
                    <span className="lrnp__question">{r.question}</span>
                    <span className="lrnp__title">{r.title}</span>
                    <span className="lrnp__desc">{r.description}</span>
                  </span>
                  <span className="lrnp__meta">
                    {r.steps} steps · {r.minutes} min
                  </span>
                  <span className="lrnp__arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Verdict rail — one per page ────────────────────────── */}
        <div className="lrnp__rail">
          <span className="lrnp__railSq" aria-hidden="true" />
          {/* Rail copy is written pre-uppercased (no text-transform), the
              codebase convention — a transform would print a σ as Σ. */}
          <span className="lrnp__railCopy">
            NO PATH IS REQUIRED — THE ARCHIVE READS FINE UNSORTED
          </span>
          <span className="lrnp__railNote">
            PATHS OVERLAP ON PURPOSE — SOME DISPATCHES REPEAT
          </span>
        </div>

        {/* ── Closer ─────────────────────────────────────────────── */}
        <section className="lrnp__closer" aria-label="Where to start">
          <div>
            <p className="lrnp__closerDisplay">Rather browse than follow?</p>
            <p className="lrnp__closerSub">
              The index lists all {numberWord(articles.length)} dispatches,
              filterable, with the shortest course up top.
            </p>
          </div>
          <Link href="/learn" className="lrnp__closerLink">
            Back to the index <span aria-hidden>→</span>
          </Link>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  );
}

/* ── Styles — Instrument tokens, radius 0, no shadows, tabular numerals.
 * Plain <style> (not styled-jsx) keeps the page a server component and
 * lets descendant selectors reach <Link>-rendered anchors. Every selector
 * carries the unique `lrnp` prefix. ── */

const css = `
.lrnp {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.lrnp__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.lrnp__hero {
  padding-top: 34px;
}
.lrnp__heroTop {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
}
.lrnp__kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrnp__heroMeta {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.lrnp__display {
  margin: 16px 0 0;
  max-width: 18ch;
  font-size: clamp(38px, 6vw, 64px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  animation: ins-fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) 0.05s both;
}
.lrnp__dek {
  margin: 16px 0 0;
  max-width: 64ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}

/* ── Section head — 3px ink rule opens the section ────────────── */
.lrnp__sec {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 12px;
}
.lrnp__secHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
.lrnp__eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrnp__secMeta {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
}

/* ── Route rows ───────────────────────────────────────────────── */
.lrnp__list {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
}
.lrnp__row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto 20px;
  grid-template-areas: "ord body meta arrow";
  gap: 24px;
  align-items: start;
  min-height: 44px;
  padding: 18px 0;
  border-top: 1px solid var(--ins-ink);
  color: var(--ins-ink);
  text-decoration: none;
  transition: padding-left 0.18s ease;
}
.lrnp__item:last-child .lrnp__row {
  border-bottom: 1px solid var(--ins-ink);
}
.lrnp__row:hover {
  padding-left: 8px;
}
.lrnp__ordinal {
  grid-area: ord;
  font-size: 44px;
  font-weight: 700;
  line-height: 0.9;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.lrnp__body {
  grid-area: body;
  display: block;
  min-width: 0;
}
.lrnp__question {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrnp__title {
  display: block;
  margin-top: 5px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.lrnp__desc {
  display: block;
  margin-top: 6px;
  max-width: 54ch;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}
.lrnp__meta {
  grid-area: meta;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.lrnp__arrow {
  grid-area: arrow;
  align-self: center;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
  transition: color 0.18s ease;
}
.lrnp__row:hover .lrnp__arrow,
.lrnp__row:focus-visible .lrnp__arrow {
  color: var(--ins-signal);
}

/* ── Verdict rail ─────────────────────────────────────────────── */
.lrnp__rail {
  border: 1px solid var(--ins-ink);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 11px 22px;
}
.lrnp__railSq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink);
  flex: none;
}
.lrnp__railCopy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}
.lrnp__railNote {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--ins-gray-600);
  text-align: right;
}

/* ── Closer ───────────────────────────────────────────────────── */
.lrnp__closer {
  border-top: 1px solid var(--ins-ink);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.lrnp__closerDisplay {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.lrnp__closerSub {
  margin: 12px 0 0;
  max-width: 56ch;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
}
.lrnp__closerLink {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  padding-bottom: 5px;
  white-space: nowrap;
  justify-self: end;
}

@media (prefers-reduced-motion: reduce) {
  .lrnp__row,
  .lrnp__arrow,
  .lrnp__display {
    transition: none;
    animation: none;
  }
}

/* ── Mid breakpoint — the meta column drops under the body ────── */
@media (max-width: 900px) {
  .lrnp__row {
    grid-template-columns: 56px minmax(0, 1fr) 20px;
    grid-template-areas:
      "ord body arrow"
      "ord meta arrow";
    gap: 8px 20px;
  }
  .lrnp__meta {
    text-align: left;
  }
  .lrnp__closerDisplay {
    font-size: 34px;
  }
}

/* ── Mobile · 390 ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .lrnp__page {
    padding: 0 20px 28px;
    gap: 22px;
  }
  .lrnp__hero {
    padding-top: 24px;
  }
  .lrnp__kicker {
    font-size: 9px;
    letter-spacing: 0.24em;
  }
  .lrnp__heroMeta {
    font-size: 9px;
    letter-spacing: 0.16em;
  }
  .lrnp__display {
    margin-top: 12px;
    max-width: none;
    font-size: 40px;
    letter-spacing: -0.035em;
    line-height: 1.02;
  }
  .lrnp__dek {
    margin-top: 12px;
    font-size: 12.5px;
    line-height: 1.55;
  }
  .lrnp__eyebrow {
    font-size: 9px;
    letter-spacing: 0.18em;
  }
  .lrnp__secMeta {
    font-size: 8.5px;
    letter-spacing: 0.12em;
  }
  .lrnp__list {
    margin-top: 12px;
  }
  .lrnp__row {
    grid-template-columns: 40px minmax(0, 1fr) 18px;
    gap: 6px 12px;
    padding: 14px 0;
  }
  .lrnp__ordinal {
    font-size: 30px;
  }
  .lrnp__question {
    font-size: 8.5px;
    letter-spacing: 0.14em;
  }
  .lrnp__title {
    margin-top: 4px;
    font-size: 17px;
  }
  .lrnp__desc {
    margin-top: 5px;
    font-size: 13px;
  }
  .lrnp__meta {
    font-size: 9px;
    letter-spacing: 0.12em;
    color: var(--ins-gray-600);
  }
  .lrnp__arrow {
    font-size: 15px;
  }
  .lrnp__rail {
    gap: 10px;
    padding: 10px 16px;
  }
  .lrnp__railSq {
    width: 7px;
    height: 7px;
  }
  .lrnp__railCopy {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .lrnp__railNote {
    margin-left: 0;
    width: 100%;
    text-align: left;
    font-size: 8px;
    letter-spacing: 0.1em;
  }
  .lrnp__closer {
    display: block;
    padding-top: 18px;
  }
  .lrnp__closerDisplay {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .lrnp__closerSub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .lrnp__closerLink {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-top: 8px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
}
`;
