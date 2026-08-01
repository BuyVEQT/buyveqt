import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { WeeklyRecap } from "@/lib/weekly";
import NewsletterSignup from "@/components/NewsletterSignup";
import { ArticleProvider } from "@/components/learn/ArticleContext";
import ReadingProgress from "@/components/learn/ReadingProgress";
import WeeklyMeta from "@/components/weekly/WeeklyMeta";
import { Pullquote } from "@/components/mdx/Pullquote";
import { Callout } from "@/components/mdx/Callout";
import { Summary } from "@/components/mdx/Summary";
import { MdxLink } from "@/components/mdx/MdxLink";
import {
  DOWN,
  MINUS,
  UP,
  fmtChipDate,
  fmtPrice,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";

const mdxComponents = {
  Pullquote,
  Callout,
  Summary,
  a: MdxLink,
};

/** Words per minute for the minutes-left readout. Weekly issues have no
 *  `readingTime` in frontmatter (see lib/weekly.ts), so it is measured
 *  from the issue's own body rather than typed by hand. */
const WPM = 220;

function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / WPM));
}

function isValidIso(iso: string | undefined): iso is string {
  if (!iso) return false;
  return !Number.isNaN(parseSessionDate(iso).getTime());
}

/** "JUL 26, 2026" — micro-label dateline, matching the /weekly index. */
function kickerDate(iso: string): string {
  return fmtChipDate(parseSessionDate(iso));
}

/**
 * "July 20 – 26, 2026" — the issue's week, collapsed where the two ends
 * share a month or a year. Returns null when the frontmatter didn't carry
 * a usable range, so a half-filled file prints nothing rather than
 * "Invalid Date – Invalid Date".
 */
function weekRange(weekStart: string, weekEnd: string): string | null {
  if (!isValidIso(weekStart) || !isValidIso(weekEnd)) return null;
  const a = parseSessionDate(weekStart);
  const b = parseSessionDate(weekEnd);
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();

  const end = b.toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (sameMonth) {
    const month = a.toLocaleDateString("en-CA", { month: "long" });
    return `${month} ${a.getDate()} – ${b.getDate()}, ${b.getFullYear()}`;
  }
  const start = a.toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `${start} – ${end}`;
}

/**
 * The week's move as a micro-fact, or null when the file carried no price
 * data. `veqtClose` defaults to 0 in lib/weekly, so an unguarded read would
 * print a fabricated "+0.00%" — the same guard the index uses.
 */
function moveFact(recap: WeeklyRecap): string | null {
  if (!(recap.veqtClose > 0)) return null;
  const glyph = recap.weeklyChange >= 0 ? UP : DOWN;
  const dollars = `${recap.weeklyChange < 0 ? MINUS : "+"}$${Math.abs(
    recap.weeklyChange
  ).toFixed(2)}`;
  return `${glyph} ${fmtSignedPct(recap.weeklyChangePercent)} · ${dollars}`;
}

interface WeeklyDispatchLayoutProps {
  recap: WeeklyRecap;
  /** 1-based issue number — oldest issue is № 01. Null when unknown. */
  ordinal: number | null;
  /** Count of every issue on file, for the "of NN" in the dateline. */
  total: number;
  previous: WeeklyRecap | null;
  next: WeeklyRecap | null;
}

/**
 * The issue reader — /weekly/[slug] in the Instrument grammar.
 *
 *   tape     — <ReadingProgress>, the shared 3px signal bar under the masthead
 *   dateline — <WeeklyMeta>, breadcrumb + live percent / minutes left
 *   hero     — 3px ink rule, issue kicker, title, standfirst, facts row
 *   body     — MDX at 18.5px/1.65 Newsreader on a 68ch measure
 *   closer   — prev/next issue rows, the signup box, one red CTA back
 *
 * Server component: the CSS ships as a plain <style> rather than styled-jsx,
 * which would force "use client" and drop its scope class off <Link> and
 * everything MDX renders. Only the tape and the dateline are client
 * components, and they share one scroll listener through <ArticleProvider>.
 *
 * The page owns <main className="ins-root wkd"> so its JSON-LD sits inside
 * the same landmark; every rule below is defined here, next to the markup
 * it styles.
 */
export default function WeeklyDispatchLayout({
  recap,
  ordinal,
  total,
  previous,
  next,
}: WeeklyDispatchLayoutProps) {
  const range = weekRange(recap.weekStart, recap.weekEnd);
  const move = moveFact(recap);
  const prices =
    recap.veqtClose > 0 && recap.veqtOpen > 0
      ? `${fmtPrice(recap.veqtOpen)} → ${fmtPrice(recap.veqtClose)}`
      : null;

  const issueNo = ordinal ? String(ordinal).padStart(2, "0") : null;
  const kicker = [
    "The Weekly Dispatch",
    issueNo ? `Issue № ${issueNo}` : null,
    isValidIso(recap.date) ? `Filed ${kickerDate(recap.date)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const meta = {
    slug: recap.slug,
    category: "The Weekly Dispatch",
    ordinal,
    total,
    minutes: readingMinutes(recap.content),
  };

  return (
    <ArticleProvider meta={meta}>
      <ReadingProgress />

      <div className="wkd__page">
        <WeeklyMeta />

        {/* ── Issue hero ─────────────────────────────────────────── */}
        <header className="wkd-hero">
          <div className="wkd-hero__kicker">{kicker}</div>
          <h1 className="wkd-hero__title">{recap.title}</h1>
          {recap.description && (
            <p className="wkd-hero__standfirst">{recap.description}</p>
          )}

          {(range || prices || move) && (
            <dl className="wkd-facts">
              {range && (
                <div className="wkd-facts__cell">
                  <dt className="wkd-facts__label">The week</dt>
                  <dd className="wkd-facts__value">{range}</dd>
                </div>
              )}
              {prices && (
                <div className="wkd-facts__cell">
                  <dt className="wkd-facts__label">VEQT open → close</dt>
                  <dd className="wkd-facts__value">{prices}</dd>
                </div>
              )}
              {move && (
                <div className="wkd-facts__cell">
                  <dt className="wkd-facts__label">The move</dt>
                  <dd className="wkd-facts__value">{move}</dd>
                </div>
              )}
            </dl>
          )}
        </header>

        {/* ── Body ───────────────────────────────────────────────── */}
        <article data-article-body className="wkd__prose">
          <MDXRemote
            source={recap.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>

        {/* ── Adjacent issues ────────────────────────────────────── */}
        {(next || previous) && (
          <nav className="wkd-adj" aria-label="Other issues">
            {next && (
              <Link href={`/weekly/${next.slug}`} className="wkd-adj__row">
                <span className="wkd-adj__body">
                  <span className="wkd-adj__kicker">
                    The next issue
                    {isValidIso(next.date) ? ` · ${kickerDate(next.date)}` : ""}
                  </span>
                  <span className="wkd-adj__title">{next.title}</span>
                </span>
                <span className="wkd-adj__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
            {previous && (
              <Link href={`/weekly/${previous.slug}`} className="wkd-adj__row">
                <span className="wkd-adj__body">
                  <span className="wkd-adj__kicker">
                    The previous issue
                    {isValidIso(previous.date)
                      ? ` · ${kickerDate(previous.date)}`
                      : ""}
                  </span>
                  <span className="wkd-adj__title">{previous.title}</span>
                </span>
                <span className="wkd-adj__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </nav>
        )}

        {/* ── Signup ─────────────────────────────────────────────── */}
        <section
          id="dispatch-signup"
          className="wkd-signup"
          aria-labelledby="wkd-signup-label"
        >
          <h2 id="wkd-signup-label" className="wkd-signup__label">
            The dispatch, by email
          </h2>
          <p className="wkd-signup__copy">
            One short email a week — what VEQT did, what drove it, and what (if
            anything) it changes for a thirty-year hold. Nothing else.
          </p>
          <div className="wkd-signup__form">
            <NewsletterSignup variant="section" />
          </div>
        </section>

        {/* ── Closer ─────────────────────────────────────────────── */}
        <section className="wkd-closer" aria-label="Closing note">
          <div>
            <p className="wkd-closer__display">That&rsquo;s the week.</p>
            <p className="wkd-closer__sub">
              {issueNo && total
                ? `Issue № ${issueNo} of ${String(total).padStart(
                    2,
                    "0"
                  )} on file. The rest of the archive is one click away.`
                : "The rest of the archive is one click away."}
            </p>
          </div>
          <Link href="/weekly" className="wkd-closer__link">
            Back to the Wire <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </ArticleProvider>
  );
}

/* ── Styles — Instrument tokens, radius 0, no shadows, tabular numerals.
 * Every selector carries the unique `wkd` prefix. ── */

const css = `
.wkd {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.wkd__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 48px;
}

/* ── Issue hero ───────────────────────────────────────────────── */
.wkd-hero {
  margin-top: 22px;
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 14px;
}
.wkd-hero__kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wkd-hero__title {
  margin: 14px 0 0;
  max-width: 22ch;
  font-size: clamp(30px, 5.4vw, 56px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.02;
  text-wrap: pretty;
}
.wkd-hero__standfirst {
  margin: 18px 0 0;
  max-width: 62ch;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}

/* ── Facts row — the issue's own numbers, ruled top and bottom ── */
.wkd-facts {
  margin: 24px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  border-top: 1px solid var(--ins-ink);
  border-bottom: 1px solid var(--ins-ink);
  padding: 14px 0 16px;
}
.wkd-facts__cell {
  min-width: 0;
}
.wkd-facts__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.wkd-facts__value {
  margin: 6px 0 0;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: var(--ins-ink);
  font-variant-numeric: tabular-nums;
}

/* ══ Article grammar ════════════════════════════════════════════════
 * The same column the /learn reader sets, so the two halves of the paper
 * read as one publication: Newsreader (--ins-serif) at 18.5px/1.65 for the
 * running prose, Archivo for everything else in the column — headings,
 * section kickers, tables, code. Turn 8's serif is prose-only; see the
 * note in app/layout.tsx before widening it.
 *
 * Block selectors are direct-child only: MDX components (pull-quotes,
 * callouts, summaries) carry their own type and must not inherit the
 * prose measure or family.
 * ═════════════════════════════════════════════════════════════════ */
.wkd__prose {
  counter-reset: wkd-sec;
  margin-top: 30px;
  font-family: var(--ins-font);
  font-size: 21px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-ink);
}
.wkd__prose > p,
.wkd__prose > ul,
.wkd__prose > ol,
.wkd__prose > blockquote {
  max-width: 68ch;
}
/* The serif column. 400 is Newsreader's text weight — the 500 the
   container carries is an Archivo weight and would synthesise here. */
.wkd__prose > p,
.wkd__prose > ul > li,
.wkd__prose > ol > li,
.wkd__prose > blockquote {
  font-family: var(--ins-serif);
  font-size: 18.5px;
  font-weight: 400;
  line-height: 1.65;
}
.wkd__prose > p {
  margin: 0 0 20px;
  text-wrap: pretty;
}
.wkd__prose > *:first-child {
  margin-top: 0;
}
.wkd__prose > h2 {
  margin: 46px 0 16px;
  padding-top: 14px;
  border-top: 3px solid var(--ins-rule-strong);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.12;
  color: var(--ins-ink);
  scroll-margin-top: 96px;
}
.wkd__prose > h2::before {
  counter-increment: wkd-sec;
  content: "Section " counter(wkd-sec, decimal-leading-zero);
  display: block;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
  font-variant-numeric: tabular-nums;
}
.wkd__prose > h3 {
  margin: 30px 0 10px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--ins-ink);
}
.wkd__prose > p strong,
.wkd__prose > ul strong,
.wkd__prose > ol strong {
  /* 600 = the real Newsreader cut we load (see app/layout.tsx). */
  font-weight: 600;
  color: var(--ins-ink);
}
.wkd__prose > p a,
.wkd__prose > ul a,
.wkd__prose > ol a,
.wkd__prose > blockquote a {
  color: var(--ins-ink);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.wkd__prose > p a:hover,
.wkd__prose > ul a:hover,
.wkd__prose > ol a:hover,
.wkd__prose > blockquote a:hover {
  color: var(--ins-signal);
}
/* Top-level bullets become ruled rows; nested lists keep their markers. */
.wkd__prose > ul {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
}
.wkd__prose > ul > li {
  padding: 13px 0;
  border-top: 1px solid var(--ins-hair);
}
.wkd__prose > ul > li:last-child {
  border-bottom: 1px solid var(--ins-hair);
}
.wkd__prose > ol {
  margin: 0 0 22px 1.3em;
  padding: 0;
}
.wkd__prose > ol > li {
  padding: 6px 0;
}
.wkd__prose > blockquote {
  margin: 24px 0;
  padding: 2px 0 2px 18px;
  border-left: 3px solid var(--ins-ink);
  color: var(--ins-gray-700);
}
.wkd__prose > blockquote p:last-child {
  margin-bottom: 0;
}
.wkd__prose > hr {
  margin: 34px 0;
  border: 0;
  border-top: 1px solid var(--ins-ink);
}
.wkd__prose code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78em;
  padding: 2px 6px;
  border: 1px solid var(--ins-hair);
}
.wkd__prose > pre {
  margin: 24px 0;
  padding: 16px 18px;
  border: 1px solid var(--ins-ink);
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.55;
}
.wkd__prose > pre code {
  border: 0;
  padding: 0;
}
.wkd__prose > table {
  width: 100%;
  margin: 26px 0;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  font-variant-numeric: tabular-nums;
}
.wkd__prose > table th {
  padding: 10px 14px 9px;
  text-align: left;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  border-bottom: 1px solid var(--ins-ink);
}
.wkd__prose > table td {
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--ins-gray-700);
  border-bottom: 1px solid var(--ins-hair);
}
.wkd__prose > table td strong {
  color: var(--ins-ink);
  font-weight: 700;
}

/* ── Adjacent issues — one ruled row each ─────────────────────── */
.wkd-adj {
  margin-top: 44px;
  border-top: 1px solid var(--ins-ink);
}
.wkd-adj__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  min-height: 44px;
  padding: 15px 0;
  border-bottom: 1px solid var(--ins-hair);
  color: var(--ins-ink);
  text-decoration: none;
  transition: padding-left 0.18s ease;
}
.wkd-adj__row:last-child {
  border-bottom-color: var(--ins-ink);
}
.wkd-adj__row:hover {
  padding-left: 8px;
}
.wkd-adj__body {
  min-width: 0;
  max-width: 62ch;
}
.wkd-adj__kicker {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wkd-adj__title {
  display: block;
  margin-top: 4px;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
  text-wrap: pretty;
}
.wkd-adj__arrow {
  font-size: 18px;
  font-weight: 700;
  color: var(--ins-ink);
  transition: color 0.18s ease;
}
.wkd-adj__row:hover .wkd-adj__arrow {
  color: var(--ins-signal);
}

/* ── Signup — 1px ink box, uppercase micro-label, ink button ──── */
.wkd-signup {
  margin-top: 34px;
  border: 1px solid var(--ins-ink);
  padding: 24px 26px 26px;
}
.wkd-signup__label {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-ink);
}
.wkd-signup__copy {
  margin: 12px 0 0;
  max-width: 54ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
}
.wkd-signup__form {
  margin-top: 18px;
  max-width: 560px;
}
/* NewsletterSignup is shared with the /weekly index; it is restyled from
   the outside rather than edited. Flatten its card, drop its own heading
   and pitch (this section supplies both), square off the controls. */
.wkd-signup__form > div {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
}
.wkd-signup__form h3,
.wkd-signup__form h3 + p {
  display: none;
}
.wkd-signup__form form {
  margin: 0;
}
.wkd-signup__form input {
  border-radius: 0;
  border: 1px solid var(--ins-ink);
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  font-weight: 500;
  padding: 12px 14px;
  min-height: 46px;
}
.wkd-signup__form input:focus {
  border-color: var(--ins-ink);
  outline: 2px solid var(--ins-ink);
  outline-offset: 1px;
  box-shadow: none;
}
.wkd-signup__form button {
  border-radius: 0;
  background: var(--ins-ink);
  color: var(--ins-paper);
  font-family: var(--ins-font);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 12px 24px;
  min-height: 46px;
  transition: background-color 0.18s ease;
}
.wkd-signup__form button:hover {
  background: var(--ins-signal);
}
.wkd-signup__form p {
  font-family: var(--ins-font);
}
/* The component's three <p> roles, styled by position so each keeps a
   legible colour on Instrument paper. :last-child (0,2,2) outranks
   form + p (0,1,3), so the fine print stays grey whether or not an
   error is showing. */
.wkd-signup__form > div > p:last-child {
  color: var(--ins-gray-600);
}
.wkd-signup__form > div > form + p {
  color: var(--ins-signal);
  font-weight: 600;
}
.wkd-signup__form > div > div {
  text-align: left;
  padding: 0;
}
.wkd-signup__form > div > div > p {
  color: var(--ins-ink);
  font-size: 15px;
  font-weight: 600;
}

/* ── Closer — the page's one red moment ──────────────────────── */
.wkd-closer {
  margin-top: 34px;
  border-top: 1px solid var(--ins-ink);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.wkd-closer__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.wkd-closer__sub {
  margin: 12px 0 0;
  max-width: 56ch;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wkd-closer__link {
  justify-self: end;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  padding-bottom: 5px;
}

/* ── Mid ─────────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .wkd-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 24px;
  }
}

/* ── Mobile · 390 ────────────────────────────────────────────── */
@media (max-width: 640px) {
  .wkd__page {
    padding: 0 20px 32px;
  }
  .wkd-hero {
    margin-top: 16px;
    padding-top: 12px;
  }
  .wkd-hero__kicker {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .wkd-hero__title {
    margin-top: 10px;
    max-width: none;
    letter-spacing: -0.03em;
  }
  .wkd-hero__standfirst {
    margin-top: 14px;
    font-size: 15px;
  }
  .wkd-facts {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 12px 0 14px;
  }
  .wkd-facts__label {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .wkd-facts__value {
    font-size: 18px;
  }
  .wkd__prose {
    margin-top: 24px;
    font-size: 17px;
    line-height: 1.62;
  }
  /* Phone prose holds the 18–19px band's lower end — see the /learn
     reader for the reasoning. */
  .wkd__prose > p,
  .wkd__prose > ul > li,
  .wkd__prose > ol > li,
  .wkd__prose > blockquote {
    font-size: 18px;
    line-height: 1.65;
  }
  .wkd__prose > p {
    margin-bottom: 16px;
  }
  .wkd__prose > h2 {
    margin: 32px 0 12px;
    padding-top: 12px;
    font-size: 22px;
    letter-spacing: -0.02em;
  }
  .wkd__prose > h2::before {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .wkd__prose > h3 {
    font-size: 17px;
  }
  .wkd__prose > ul > li {
    padding: 11px 0;
  }
  .wkd__prose > table td {
    padding: 9px 11px;
    font-size: 13px;
  }
  .wkd-adj {
    margin-top: 32px;
  }
  .wkd-adj__row {
    gap: 14px;
    padding: 12px 0;
  }
  .wkd-adj__kicker {
    font-size: 10px;
    letter-spacing: 0.14em;
  }
  .wkd-adj__title {
    margin-top: 3px;
    font-size: 16px;
  }
  .wkd-adj__arrow {
    font-size: 15px;
  }
  .wkd-signup {
    margin-top: 26px;
    padding: 18px 16px 20px;
  }
  .wkd-signup__copy {
    font-size: 14px;
  }
  .wkd-closer {
    display: block;
    margin-top: 26px;
    padding-top: 18px;
  }
  .wkd-closer__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .wkd-closer__sub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .wkd-closer__link {
    display: inline-block;
    margin-top: 14px;
    min-height: 44px;
    line-height: 40px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wkd-adj__row,
  .wkd-adj__arrow,
  .wkd-signup__form button {
    transition: none;
  }
}
`;
