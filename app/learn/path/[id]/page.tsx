import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { getAllArticles } from "@/lib/articles";
import { LEARN_PATHS, assertPathSlugsResolve } from "@/lib/learn-paths-data";
import {
  numberWord,
  pickBySlug,
  totalMinutes,
} from "@/components/learn/learn-syllabus";

export function generateStaticParams() {
  return LEARN_PATHS.map((path) => ({ id: path.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = LEARN_PATHS.find((p) => p.id === id);
  if (!path) return { title: "Path Not Found" };

  const url = canonicalUrl(`/learn/path/${id}`);
  const description = `${path.description} A guided reading path for Canadian passive investors.`;

  return {
    title: `${path.title} — Learn Path`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${path.title} — Learn Path`,
      description,
      url,
    },
  };
}

/**
 * /learn/path/[id] — one guided route, in the Instrument grammar.
 *
 * Composition:
 *   hero   — path question as kicker, the path's own name as the display,
 *            its description as the dek, "Path 03 of 06" on the right
 *   steps  — ordinal rows in reading order (category · minutes kicker,
 *            article title from the registry), each linking the dispatch
 *   CTA    — the single red "Start at 01"
 *   rail   — the one verdict rail, honest about there being no progress
 *            state: this page tracks nothing, so it promises nothing
 *   closer — display + dek + the red CTA onward to the next route
 *
 * Titles, reading times and the running total come from the article
 * registry via `pickBySlug` — nothing here is transcribed.
 *
 * Server component; plain <style>, not styled-jsx (see the sibling index).
 */
export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const path = LEARN_PATHS.find((p) => p.id === id);

  if (!path) {
    notFound();
  }

  const articles = getAllArticles();
  assertPathSlugsResolve(articles.map((a) => a.slug));

  const steps = pickBySlug(articles, path.slugs);
  const minutes = totalMinutes(steps);
  const first = steps[0] ?? null;

  const position = LEARN_PATHS.findIndex((p) => p.id === path.id);
  const next =
    LEARN_PATHS.length > 1
      ? LEARN_PATHS[(position + 1) % LEARN_PATHS.length]
      : null;

  /* Path questions carry a terminal period ("I'm new to this."); the
     kicker chains on middots, so the period is dropped there only. */
  const question = (path.question ?? path.title).replace(/\.$/, "");

  return (
    <main className="ins-root lrnpd">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: "All paths", path: "/learn/path" },
          { name: path.title, path: `/learn/path/${id}` },
        ])}
      />

      <div className="lrnpd__page">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <header className="lrnpd__hero">
          <div className="lrnpd__heroTop">
            <span className="lrnpd__kicker">
              {question} · {steps.length} steps · {minutes} min
            </span>
            <span className="lrnpd__heroMeta">
              Path {String(position + 1).padStart(2, "0")} of{" "}
              {String(LEARN_PATHS.length).padStart(2, "0")}
            </span>
          </div>
          {/* Titles in learn-paths-data.ts carry their own terminal period. */}
          <h1 className="lrnpd__display">{path.title}</h1>
          <p className="lrnpd__dek">{path.description}</p>
        </header>

        {/* ── The steps — ordinal rows ───────────────────────────── */}
        <section className="lrnpd__sec" aria-labelledby="lrnpd-steps">
          <div className="lrnpd__secHead">
            <span className="lrnpd__eyebrow" id="lrnpd-steps">
              Reading order · {numberWord(steps.length)} steps
            </span>
            <Link href="/learn/path" className="lrnpd__secLink">
              All {numberWord(LEARN_PATHS.length)} paths
            </Link>
          </div>

          <ol className="lrnpd__list">
            {steps.map((step, i) => (
              <li key={step.slug} className="lrnpd__item">
                <Link href={`/learn/${step.slug}`} className="lrnpd__row">
                  <span className="lrnpd__ordinal" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="lrnpd__body">
                    <span className="lrnpd__kickerRow">
                      {step.category} · {step.minutes} min
                    </span>
                    <span className="lrnpd__title">{step.title}</span>
                  </span>
                  <span className="lrnpd__arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          {first && (
            <Link href={`/learn/${first.slug}`} className="lrnpd__start">
              Start at 01 <span aria-hidden>→</span>
            </Link>
          )}
        </section>

        {/* ── Verdict rail — one per page. No progress is stored for
             these routes, so the rail says so rather than implying a
             streak the page can't keep. ─────────────────────────── */}
        <div className="lrnpd__rail">
          <span className="lrnpd__railSq" aria-hidden="true" />
          {/* Rail copy is written pre-uppercased (no text-transform), the
              codebase convention — a transform would print a σ as Σ. */}
          <span className="lrnpd__railCopy">
            FINISH THE PATH OR LEAVE IT — NOTHING TRACKS YOU
          </span>
          {/* Sentence, so sentence case — see .lrnpd__railNote. */}
          <span className="lrnpd__railNote">
            {minutes} minutes end to end · skip what you already know
          </span>
        </div>

        {/* ── Closer ─────────────────────────────────────────────── */}
        <section className="lrnpd__closer" aria-label="What to read next">
          <div>
            <p className="lrnpd__closerDisplay">That&rsquo;s the route.</p>
            <p className="lrnpd__closerSub">
              {next
                ? `Next route — ${next.title} ${next.description}`
                : "Every route is listed on the paths index."}
            </p>
          </div>
          <Link
            href={next ? `/learn/path/${next.id}` : "/learn/path"}
            className="lrnpd__closerLink"
          >
            {next ? "Next path" : "All paths"} <span aria-hidden>→</span>
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
 * carries the unique `lrnpd` prefix. ── */

const css = `
.lrnpd {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.lrnpd__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.lrnpd__hero {
  padding-top: 34px;
}
.lrnpd__heroTop {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
}
.lrnpd__kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.lrnpd__heroMeta {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.lrnpd__display {
  margin: 16px 0 0;
  max-width: 16ch;
  font-size: clamp(38px, 6vw, 64px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  animation: ins-fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) 0.05s both;
}
.lrnpd__dek {
  margin: 16px 0 0;
  max-width: 60ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}

/* ── Section head — 3px ink rule opens the section ────────────── */
.lrnpd__sec {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 12px;
}
.lrnpd__secHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
.lrnpd__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
/* "ALL SIX PATHS" — a link-button, so it stays a label at the floor. It
   is interactive inside a baseline-aligned flex head, where padding or
   min-height would drop the head's baseline and shove the whole step
   list down; the 44px tap area is an ::after overlay instead. The
   overlay is deliberately asymmetric — 20px up into the section rule's
   padding and the 30px page gap (nothing clickable there), only 12px
   down, which keeps it clear of the first step row below. */
.lrnpd__secLink {
  position: relative;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-decoration: none;
  white-space: nowrap;
}
.lrnpd__secLink::after {
  content: "";
  position: absolute;
  inset: -20px 0 -12px; /* ~12px line box + 32px = 44px tap height */
}
.lrnpd__secLink:hover {
  color: var(--ins-ink);
}

/* ── Step rows ────────────────────────────────────────────────── */
.lrnpd__list {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
}
.lrnpd__row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 20px;
  gap: 20px;
  align-items: end;
  min-height: 44px;
  padding: 16px 0;
  border-top: 1px solid var(--ins-hair);
  color: var(--ins-ink);
  text-decoration: none;
  transition: padding-left 0.18s ease;
}
.lrnpd__item:last-child .lrnpd__row {
  border-bottom: 1px solid var(--ins-hair);
}
.lrnpd__row:hover {
  padding-left: 8px;
}
.lrnpd__ordinal {
  font-size: 44px;
  font-weight: 700;
  line-height: 0.85;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.lrnpd__body {
  display: block;
  min-width: 0;
}
/* "TAXES · 9 MIN" — category + reading time. Names things: label. */
.lrnpd__kickerRow {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.lrnpd__title {
  display: block;
  margin-top: 4px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.lrnpd__arrow {
  font-size: 18px;
  font-weight: 700;
  align-self: center;
  text-align: right;
  transition: color 0.18s ease;
}
.lrnpd__row:hover .lrnpd__arrow,
.lrnpd__row:focus-visible .lrnpd__arrow {
  color: var(--ins-signal);
}

/* ── The one red CTA ──────────────────────────────────────────── */
.lrnpd__start {
  display: inline-flex;
  align-items: center;
  margin-top: 24px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  padding-bottom: 5px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ── Verdict rail ─────────────────────────────────────────────── */
.lrnpd__rail {
  border: 1px solid var(--ins-ink);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 11px 22px;
}
.lrnpd__railSq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink);
  flex: none;
}
.lrnpd__railCopy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}
/* Sentence — "68 minutes end to end · skip what you already know". The
   string was pre-uppercased in the JSX (hence no text-transform here);
   it is re-cased there. The rail copy above stays a shouted verdict. */
.lrnpd__railNote {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── Closer ───────────────────────────────────────────────────── */
.lrnpd__closer {
  border-top: 1px solid var(--ins-ink);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.lrnpd__closerDisplay {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.lrnpd__closerSub {
  margin: 12px 0 0;
  max-width: 56ch;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
  text-wrap: pretty;
}
.lrnpd__closerLink {
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
  .lrnpd__row,
  .lrnpd__arrow,
  .lrnpd__display {
    transition: none;
    animation: none;
  }
}

@media (max-width: 900px) {
  .lrnpd__closerDisplay {
    font-size: 34px;
  }
}

/* ── Mobile · 390 ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .lrnpd__page {
    padding: 0 20px 28px;
    gap: 22px;
  }
  .lrnpd__hero {
    padding-top: 24px;
  }
  /* Question + two count clauses on a 350px measure — a notch of
     tracking back pays for the floor bump. */
  .lrnpd__kicker {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .lrnpd__heroMeta {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .lrnpd__display {
    margin-top: 12px;
    max-width: none;
    font-size: 40px;
    letter-spacing: -0.035em;
    line-height: 1.02;
  }
  .lrnpd__dek {
    margin-top: 12px;
    font-size: 12.5px;
    line-height: 1.55;
  }
  .lrnpd__eyebrow {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .lrnpd__secLink {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  /* 16px, not 12px: the secLink's 44px tap overlay reaches 12px below
     the head, so the list needs that much clearance plus a margin. */
  .lrnpd__list {
    margin-top: 16px;
  }
  .lrnpd__row {
    grid-template-columns: 40px minmax(0, 1fr) 18px;
    gap: 12px;
    padding: 13px 0;
  }
  .lrnpd__ordinal {
    font-size: 30px;
  }
  .lrnpd__kickerRow {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .lrnpd__title {
    margin-top: 3px;
    font-size: 16px;
  }
  .lrnpd__arrow {
    font-size: 15px;
  }
  .lrnpd__start {
    min-height: 44px;
    margin-top: 18px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
  .lrnpd__rail {
    gap: 10px;
    padding: 10px 16px;
  }
  .lrnpd__railSq {
    width: 7px;
    height: 7px;
  }
  .lrnpd__railCopy {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  /* Caption size carries over; mobile only unpins it from the right. */
  .lrnpd__railNote {
    margin-left: 0;
    width: 100%;
    text-align: left;
  }
  .lrnpd__closer {
    display: block;
    padding-top: 18px;
  }
  .lrnpd__closerDisplay {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .lrnpd__closerSub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .lrnpd__closerLink {
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
