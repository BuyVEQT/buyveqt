import type { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getAllWeeklyRecaps, type WeeklyRecap } from "@/lib/weekly";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import {
  fmtChipDate,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";

export const metadata: Metadata = {
  title: "The Wire — VEQT Week-by-Week Recaps",
  description:
    "Short, useful weekly recaps of VEQT performance, the macro that moved it, and what matters for Canadian passive investors. Filed every Sunday.",
  alternates: { canonical: canonicalUrl("/weekly") },
  openGraph: {
    title: "The Wire — VEQT Week-by-Week Recaps",
    description:
      "Sunday-night recaps for Canadian VEQT investors — what moved, what didn't, and what it meant.",
    url: canonicalUrl("/weekly"),
  },
};

/* ── Facts, derived from the real files ────────────────────────────────── */

/** Two-digit issue number — oldest issue is № 01 (matches getRecapOrdinal). */
function issueNo(total: number, indexNewestFirst: number): string {
  return String(total - indexNewestFirst).padStart(2, "0");
}

/** "JULY 26, 2026" — micro-label dateline. */
function kickerDate(iso: string): string {
  return fmtChipDate(parseSessionDate(iso));
}

/** "July 26, 2026" — sentence-case dateline for the closer. */
function sentenceDate(iso: string): string {
  return parseSessionDate(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "Jun 2026" — the month the archive starts. */
function monthYear(iso: string): string {
  return parseSessionDate(iso).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
  });
}

/**
 * The cadence weekday, taken from the files themselves — the modal filing
 * day across every issue on record. One stray Monday filing shouldn't
 * relabel the masthead, hence the mode rather than the latest issue.
 * With nothing on file we fall back to the stated cadence (Sunday), which
 * is what the page metadata and the signup copy both promise.
 */
function cadenceDay(recaps: WeeklyRecap[]): string {
  const counts = new Map<string, number>();
  for (const r of recaps) {
    const day = parseSessionDate(r.date).toLocaleDateString("en-CA", {
      weekday: "long",
    });
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [day, n] of counts) {
    if (n > bestCount) {
      bestCount = n;
      best = day;
    }
  }
  return best ?? "Sunday";
}

/**
 * The week's move, appended to a dateline — but only when the frontmatter
 * actually carried price data. `weeklyChangePercent` defaults to 0 in
 * lib/weekly, so a file missing the field would otherwise print a
 * fabricated "+0.00%".
 */
function moveSuffix(recap: WeeklyRecap): string {
  if (!(recap.veqtClose > 0)) return "";
  return ` · VEQT ${fmtSignedPct(recap.weeklyChangePercent)}`;
}

/* ── Styles ───────────────────────────────────────────────────────────────
 * Plain <style>, not styled-jsx: this is a Server Component (it exports
 * `metadata`), and styled-jsx is client-only in the App Router. Same
 * pattern as components/home/ArticleStrip.tsx and Closer.tsx.
 * ────────────────────────────────────────────────────────────────────── */

const css = `
.wk {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.wk__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

/* ── Hero ─────────────────────────────────────────────────────────── */
.wk-hero {
  padding-top: 30px;
}
.wk-hero__kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wk-hero__display {
  margin: 14px 0 0;
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.98;
}
.wk-hero__dek {
  margin: 18px 0 0;
  max-width: 56ch;
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
}

/* ── Section head (3px ink rule opens every section) ──────────────── */
.wk-sec {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 12px;
}
.wk-sec__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}
.wk-sec__eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.wk-sec__eyebrow--signal {
  color: var(--ins-signal);
  font-weight: 700;
}
.wk-sec__display {
  margin: 6px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
/* Datelines and counts — "FILED JUL 26, 2026", "3 EARLIER ISSUES". They
   name a thing rather than say one, so they stay labels (unlike the
   rail's note below, which is a sentence). nowrap in a space-between
   head, so tracking comes back a notch to pay for the bump. */
.wk-sec__meta {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ── Latest — the leader treatment ────────────────────────────────── */
.wk-lead {
  margin-top: 16px;
  border-top: 1px solid var(--ins-ink);
  border-bottom: 1px solid var(--ins-ink);
  padding: 22px 0 24px;
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 32px;
  align-items: start;
  color: inherit;
  text-decoration: none;
  transition: padding-left 0.18s ease;
}
a.wk-lead:hover {
  padding-left: 8px;
}
.wk-lead__ord {
  font-size: 92px;
  font-weight: 700;
  line-height: 0.82;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.wk-lead__body {
  min-width: 0;
}
/* Dateline — "JUL 26, 2026 · ISSUE № 12 · VEQT +1.24%". Label. */
.wk-lead__kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wk-lead__title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.14;
  max-width: 26ch;
}
.wk-lead__summary {
  margin: 14px 0 0;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.4;
  max-width: 48ch;
  color: var(--ins-ink);
}
.wk-lead__cta {
  align-self: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  border-bottom: 2px solid var(--ins-ink);
  padding-bottom: 5px;
  transition: color 0.18s ease, border-color 0.18s ease;
}
a.wk-lead:hover .wk-lead__cta {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}

/* ── Archive — one ruled row per issue ────────────────────────────── */
.wk-arch {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  border-top: 1px solid var(--ins-ink);
}
.wk-arch__item {
  border-bottom: 1px solid var(--ins-hair);
}
.wk-arch__item:last-child {
  border-bottom-color: var(--ins-ink);
}
.wk-arch__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
  min-height: 44px;
  padding: 15px 0;
  color: inherit;
  text-decoration: none;
  transition: padding-left 0.18s ease;
}
.wk-arch__row:hover {
  padding-left: 8px;
}
.wk-arch__body {
  min-width: 0;
  max-width: 62ch;
}
.wk-arch__kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wk-arch__title {
  margin: 4px 0 0;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.wk-arch__arrow {
  font-size: 18px;
  font-weight: 700;
  color: var(--ins-ink);
  transition: color 0.18s ease;
}
.wk-arch__row:hover .wk-arch__arrow {
  color: var(--ins-signal);
}

/* ── Signup — 1px ink box, uppercase micro-label, ink button ──────── */
.wk-signup {
  border: 1px solid var(--ins-ink);
  padding: 24px 26px 26px;
}
.wk-signup__label {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-ink);
}
.wk-signup__copy {
  margin: 12px 0 0;
  max-width: 54ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
}
.wk-signup__form {
  margin-top: 18px;
  max-width: 560px;
}
/* NewsletterSignup is shared with /weekly/[slug]; it is restyled from the
   outside rather than edited. Flatten its card, drop its own heading and
   pitch (this page supplies both), square off the controls. */
.wk-signup__form > div {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
}
.wk-signup__form h3,
.wk-signup__form h3 + p {
  display: none;
}
.wk-signup__form form {
  margin: 0;
}
.wk-signup__form input {
  border-radius: 0;
  border: 1px solid var(--ins-ink);
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  font-weight: 500;
  padding: 12px 14px;
  min-height: 46px;
}
.wk-signup__form input:focus {
  border-color: var(--ins-ink);
  outline: 2px solid var(--ins-ink);
  outline-offset: 1px;
  box-shadow: none;
}
.wk-signup__form button {
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
.wk-signup__form button:hover {
  background: var(--ins-signal);
}
.wk-signup__form p {
  font-family: var(--ins-font);
}
/* The component's three <p> roles, styled by position so each keeps a
   legible colour on Instrument paper (its Tailwind colours are theme
   tokens, and this surface is white in both themes).
   :last-child (0,2,2) outranks form + p (0,1,3), so the fine print stays
   grey whether or not an error is showing. */
.wk-signup__form > div > p:last-child {
  color: var(--ins-gray-600);
}
.wk-signup__form > div > form + p {
  color: var(--ins-signal);
  font-weight: 600;
}
.wk-signup__form > div > div {
  text-align: left;
  padding: 0;
}
.wk-signup__form > div > div > p {
  color: var(--ins-ink);
  font-size: 15px;
  font-weight: 600;
}

/* ── Verdict rail ─────────────────────────────────────────────────── */
.wk-rail {
  border: 1px solid var(--ins-ink);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 22px;
}
.wk-rail__sq {
  width: 8px;
  height: 8px;
  background: var(--ins-ink);
  flex: none;
}
.wk-rail__copy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
/* Two strings, two type roles — the ConditionsBand rail split. The
   desktop note is a sentence ("Published Sundays · 12 issues since Jun
   2026"), so it reads as a caption; the mobile note is a bare label
   phrase and goes back to caps in the mobile block below. */
.wk-rail__note {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.wk-rail__note--mobile {
  display: none;
}

/* ── Closer ───────────────────────────────────────────────────────── */
.wk-closer {
  border-top: 1px solid var(--ins-ink);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.wk-closer__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.wk-closer__sub {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wk-closer__link {
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

/* ── Mid ──────────────────────────────────────────────────────────── */
@media (max-width: 960px) {
  .wk-hero__display {
    font-size: 48px;
  }
  .wk-lead {
    grid-template-columns: 110px 1fr;
    gap: 24px;
  }
  .wk-lead__ord {
    font-size: 68px;
  }
  .wk-lead__cta {
    grid-column: 2;
    align-self: start;
    justify-self: start;
    margin-top: 16px;
  }
}

/* ── Mobile 390 ───────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .wk__page {
    padding: 0 20px 32px;
    gap: 26px;
  }
  .wk-hero {
    padding-top: 20px;
  }
  /* Three clauses on a 350px measure — one notch of tracking back keeps
     the kicker to two lines at the floor. */
  .wk-hero__kicker {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .wk-hero__display {
    margin-top: 10px;
    font-size: 34px;
    letter-spacing: -0.03em;
    line-height: 1.02;
  }
  .wk-hero__dek {
    margin-top: 14px;
    font-size: 14.5px;
  }
  .wk-sec__head {
    display: block;
  }
  .wk-sec__eyebrow {
    font-size: 10px;
    letter-spacing: 0.2em;
  }
  .wk-sec__display {
    margin-top: 4px;
    font-size: 20px;
  }
  .wk-sec__meta {
    display: none;
  }
  .wk-lead {
    display: block;
    padding: 16px 0 18px;
  }
  .wk-lead__ord {
    display: block;
    font-size: 46px;
    line-height: 1;
    margin-bottom: 10px;
  }
  /* Three-clause dateline with the move suffix — 0.12em holds it to one
     line on a 350px measure at the floor. */
  .wk-lead__kicker {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .wk-lead__title {
    margin-top: 6px;
    font-size: 22px;
    max-width: none;
  }
  .wk-lead__summary {
    margin-top: 10px;
    font-size: 16px;
    max-width: none;
  }
  .wk-lead__cta {
    display: inline-block;
    margin-top: 16px;
    min-height: 44px;
    line-height: 40px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 0;
  }
  .wk-arch__row {
    gap: 14px;
    padding: 12px 0;
  }
  /* Same dateline, and the archive row also gives up ~26px to the arrow
     column — same 0.12em. */
  .wk-arch__kicker {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .wk-arch__title {
    margin-top: 3px;
    font-size: 16px;
  }
  .wk-arch__arrow {
    font-size: 15px;
  }
  .wk-signup {
    padding: 18px 16px 20px;
  }
  .wk-signup__copy {
    font-size: 14px;
  }
  .wk-rail {
    gap: 10px;
    padding: 10px 14px;
  }
  .wk-rail__sq {
    width: 7px;
    height: 7px;
  }
  .wk-rail__copy {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .wk-rail__note--desktop {
    display: none;
  }
  /* "SUNDAYS · 12 ON FILE" — a label phrase, not a sentence, so the
     mobile note goes back to caps at the floor rather than inheriting
     the desktop caption. */
  .wk-rail__note--mobile {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .wk-closer {
    display: block;
    padding-top: 18px;
  }
  .wk-closer__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .wk-closer__sub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .wk-closer__link {
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
  .wk-lead,
  .wk-lead__cta,
  .wk-arch__row,
  .wk-arch__arrow,
  .wk-signup__form button {
    transition: none;
  }
}
`;

/**
 * /weekly index — the Instrument.
 *
 * Reading-order grammar, one ruled row per issue:
 *
 *   hero      kicker (real cadence + count) · display · dek
 *   LATEST    leader treatment — oversized ordinal, dateline, 28px
 *             headline, the issue's own summary sentence, arrow CTA
 *   ARCHIVE   one ruled row per remaining issue (dateline · issue №,
 *             21px headline, arrow; hover indents 8px, arrow goes red)
 *   SIGNUP    1px ink box wrapping the shared NewsletterSignup
 *   RAIL      one verdict line + the honest cadence on the right
 *   CLOSER    display · dek · the page's one red CTA
 *
 * With nothing on file (the state today — content/weekly holds only
 * _template.mdx) the leader block becomes the first-edition notice and
 * the closer points at the signup instead of an issue.
 *
 * Server Component: plain <style>, no styled-jsx. The Instrument tokens
 * are theme-invariant, so this reads white in both themes, like the home
 * page. The global shell supplies nav and footer.
 */
export default function WeeklyIndexPage() {
  const recaps = getAllWeeklyRecaps();
  const total = recaps.length;
  const day = cadenceDay(recaps);
  const latest = recaps[0] ?? null;
  const rest = recaps.slice(1);
  const oldest = total > 0 ? recaps[total - 1] : null;

  const heroKicker = latest
    ? `The Weekly Dispatch · Every ${day} · ${total} ${
        total === 1 ? "issue" : "issues"
      } on file`
    : `The Weekly Dispatch · Every ${day} · First issue pending`;

  const railNote =
    latest && oldest
      ? `Published ${day}s · ${total} ${
          total === 1 ? "issue" : "issues"
        } since ${monthYear(oldest.date)}`
      : `Published ${day}s · First issue pending`;

  return (
    <main className="ins-root wk">
      <div className="wk__page">
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Weekly", path: "/weekly" },
          ])}
        />

        {/* ── Hero ───────────────────────────────────────────────── */}
        <header className="wk-hero">
          <div className="wk-hero__kicker">{heroKicker}</div>
          <h1 className="wk-hero__display">The week, on one page.</h1>
          <p className="wk-hero__dek">
            What VEQT did, what drove it, and what &mdash; if anything &mdash;
            it changes for a thirty-year hold. One issue every {day}, then back
            to your life.
          </p>
        </header>

        {/* ── Latest — the leader ────────────────────────────────── */}
        <section className="wk-sec" aria-labelledby="wk-latest">
          <div className="wk-sec__head">
            <div className="wk-sec__eyebrow wk-sec__eyebrow--signal">
              {latest ? "The latest issue" : "The first issue"}
            </div>
            <div className="wk-sec__meta">
              {latest ? `Filed ${kickerDate(latest.date)}` : "Nothing on file yet"}
            </div>
          </div>

          {latest ? (
            <Link href={`/weekly/${latest.slug}`} className="wk-lead">
              <span className="wk-lead__ord" aria-hidden="true">
                {issueNo(total, 0)}
              </span>
              <div className="wk-lead__body">
                <div className="wk-lead__kicker">
                  {kickerDate(latest.date)} · Issue № {issueNo(total, 0)}
                  {moveSuffix(latest)}
                </div>
                <h2 id="wk-latest" className="wk-lead__title">
                  {latest.title}
                </h2>
                {latest.description && (
                  <p className="wk-lead__summary">{latest.description}</p>
                )}
              </div>
              <span className="wk-lead__cta">
                Read the issue <span aria-hidden="true">→</span>
              </span>
            </Link>
          ) : (
            <div className="wk-lead">
              <span className="wk-lead__ord" aria-hidden="true">
                01
              </span>
              <div className="wk-lead__body">
                <div className="wk-lead__kicker">
                  Issue № 01 · In preparation
                </div>
                <h2 id="wk-latest" className="wk-lead__title">
                  The press hasn&rsquo;t run yet.
                </h2>
                <p className="wk-lead__summary">
                  The first dispatch is being written. Leave an email below and
                  it lands the {day} it ships.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── The archive ────────────────────────────────────────── */}
        {rest.length > 0 && (
          <section className="wk-sec" aria-labelledby="wk-archive">
            <div className="wk-sec__head">
              <div>
                <div className="wk-sec__eyebrow">The archive</div>
                <h2 id="wk-archive" className="wk-sec__display">
                  Every issue on file.
                </h2>
              </div>
              <div className="wk-sec__meta">
                {rest.length} earlier {rest.length === 1 ? "issue" : "issues"}
              </div>
            </div>

            <ol className="wk-arch">
              {rest.map((recap, i) => {
                const no = issueNo(total, i + 1);
                return (
                  <li key={recap.slug} className="wk-arch__item">
                    <Link
                      href={`/weekly/${recap.slug}`}
                      className="wk-arch__row"
                    >
                      <div className="wk-arch__body">
                        <div className="wk-arch__kicker">
                          {kickerDate(recap.date)} · Issue № {no}
                          {moveSuffix(recap)}
                        </div>
                        <h3 className="wk-arch__title">{recap.title}</h3>
                      </div>
                      <span className="wk-arch__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* ── Signup ─────────────────────────────────────────────── */}
        <section
          id="dispatch-signup"
          className="wk-signup"
          aria-labelledby="wk-signup-label"
        >
          <h2 id="wk-signup-label" className="wk-signup__label">
            The dispatch, by email
          </h2>
          <p className="wk-signup__copy">
            One short email on {day} evenings &mdash; what VEQT did, what drove
            it, and what (if anything) it changes for a thirty-year hold.
            Nothing else.
          </p>
          <div className="wk-signup__form">
            <NewsletterSignup variant="section" />
          </div>
        </section>

        {/* ── Verdict rail ───────────────────────────────────────── */}
        <div className="wk-rail">
          <span className="wk-rail__sq" aria-hidden="true" />
          <span className="wk-rail__copy">
            One issue a week &mdash; the news cycle can wait
          </span>
          <span className="wk-rail__note wk-rail__note--desktop">
            {railNote}
          </span>
          <span className="wk-rail__note wk-rail__note--mobile">
            {day}s · {total > 0 ? `${total} on file` : "issue № 01 pending"}
          </span>
        </div>

        {/* ── Closer ─────────────────────────────────────────────── */}
        <section className="wk-closer" aria-label="Closing note">
          <div>
            <p className="wk-closer__display">
              {latest ? "That is the whole file." : "Be here for issue № 01."}
            </p>
            <p className="wk-closer__sub">
              {latest
                ? `Issue № ${issueNo(total, 0)} — filed ${sentenceDate(
                    latest.date
                  )}. ${
                    total === 1
                      ? "The only one on file."
                      : `The newest of ${total} on file.`
                  }`
                : `Nothing on file yet. The first dispatch goes out on a ${day} evening.`}
            </p>
          </div>
          {latest ? (
            <Link href={`/weekly/${latest.slug}`} className="wk-closer__link">
              Read the latest <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <a href="#dispatch-signup" className="wk-closer__link">
              Get the first issue <span aria-hidden="true">→</span>
            </a>
          )}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  );
}
