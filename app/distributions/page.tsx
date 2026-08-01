import type { Metadata } from "next";
import Link from "next/link";
import {
  VEQT_DISTRIBUTIONS,
  getCumulativeSinceInception,
  getDistributionCAGR,
  getTotalDistributionGrowthPct,
  getInceptionDistributionYear,
} from "@/data/distributions";
import { FUNDS, FUND_DATA_LAST_UPDATED } from "@/data/funds";
import { getNextDistributionEstimate } from "@/lib/distributions-calendar";
import { getQuote, getDailyHistory } from "@/lib/data";
import {
  fmtChipDate,
  fmtPrice,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "The Annual — VEQT Distribution History & Income",
  description:
    "VEQT pays one distribution a year, every late December, and it's grown every year since 2019 — the full ledger, the next payout, and what your stake pays.",
  alternates: { canonical: canonicalUrl("/distributions") },
  openGraph: {
    title: "The Annual — VEQT Distribution History & Income",
    description:
      "Every VEQT distribution since 2019 — what it paid, how it's grown, and what your stake earns.",
    url: canonicalUrl("/distributions"),
  },
};

/**
 * /distributions — "The Instrument" payout ledger.
 *
 * Per the handoff's per-route recipe: *facts-column grammar as a ruled
 * table — one row per distribution (ex-date ordinal, amount 22px w700,
 * yield micro-label), next-distribution row highlighted with the
 * today-chip treatment.* Module order:
 *
 *   hero          kicker · "Paid, on file." · dek · 4-up facts strip
 *   THE NEXT ONE  red chip row (est. month) + supporting facts + caption
 *   THE LEDGER    ruled table, one row per confirmed payment
 *   THE MECHANICS article grammar (21px/1.6, 68ch)
 *   verdict rail  ink square + statement + right gray note
 *   closer        44px display + dek + one red CTA
 *
 * Server component: no client state anywhere on the page, so the styles
 * ship as a plain <style> tag (the components/home/Closer.tsx pattern)
 * rather than styled-jsx, which is client-only in the App Router. Class
 * names carry a unique `dist-` prefix since the block is global — which
 * is also why the closer's <Link> styles without any :global() dance.
 *
 * Every number on this page is derived from data/distributions.ts,
 * lib/distributions-calendar.ts, data/funds.ts, or the live quote/history
 * fetches below. Nothing is hardcoded.
 */

const css = `
.dist-root {
  background: var(--ins-paper);
  min-height: 100dvh;
  color: var(--ins-ink);
  font-family: var(--ins-font);
  font-variant-numeric: tabular-nums;
}
.dist-page {
  display: flex;
  flex-direction: column;
  gap: 34px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
}

/* ── Shared micro-typography ───────────────────────────────────── */
.dist-kicker {
  margin: 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.dist-kicker--red {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--ins-signal);
}
/* Section notes are SENTENCES and source lines ("Vanguard declares the
   date and amount in November", "Source: Vanguard Canada · Confirmed
   payments only") — caption grammar, not label grammar. The JSX copy was
   already authored in sentence case; only the text-transform was
   shouting it. */
.dist-note {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  text-align: right;
}
/* The projection disclaimer — three full sentences. Caption. */
.dist-caption {
  margin: 14px 0 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  max-width: 90ch;
  line-height: 1.6;
}

/* ── Hero ──────────────────────────────────────────────────────── */
.dist-hero {
  padding-top: 34px;
}
.dist-display {
  margin: 16px 0 0;
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.98;
  color: var(--ins-ink);
}
.dist-dek {
  margin: 18px 0 0;
  max-width: 60ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-600);
}
.dist-facts {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--ins-ink);
  border-bottom: 1px solid var(--ins-ink);
}
.dist-fact {
  padding: 14px 24px 16px;
  border-left: 1px solid var(--ins-hair);
  min-width: 0;
}
.dist-fact:first-child {
  border-left: 0;
  padding-left: 0;
}
/* Stat labels — TRUE LABELS, caps at the floor. Tracking comes back one
   notch (0.22em → 0.2em) to pay for the size bump: these sit in a 4-up
   grid track and "PAID SINCE 2019 · PER UNIT" is the longest string on
   the strip. */
.dist-fact-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.dist-fact-value {
  margin-top: 6px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ins-ink);
}
/* Sub-labels under each figure name the basis of the number ("Per unit
   vs. 2019", "Compound, 2019 to 2025") — they name a thing rather than
   say one, so they stay labels. */
.dist-fact-sub {
  margin-top: 7px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}

/* ── Section openers — 3px ink rule, never double-thin ─────────── */
.dist-sec {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 16px;
}
.dist-sec__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}
.dist-h2 {
  margin: 10px 0 0;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--ins-ink);
}

/* ── The next one — today-chip treatment ───────────────────────── */
.dist-next {
  margin-top: 20px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 28px;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid var(--ins-ink);
  border-bottom: 1px solid var(--ins-ink);
}
.dist-chip {
  background: var(--ins-signal);
  color: #ffffff;
  padding: 7px 14px;
  border-radius: 3px;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.dist-next__when {
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ins-ink);
}
.dist-next__sub,
.dist-next__amtsub {
  margin-top: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.dist-next__amtwrap {
  text-align: right;
}
.dist-next__amt {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ins-ink);
}
.dist-next-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-bottom: 1px solid var(--ins-hair);
}
.dist-nf {
  padding: 12px 24px 14px;
  border-left: 1px solid var(--ins-hair);
  min-width: 0;
}
.dist-nf:first-child {
  border-left: 0;
  padding-left: 0;
}
/* 3-up grid track — tracking down a notch (0.2em → 0.18em) so
   "AVERAGE OF LAST THREE" still clears its cell at the 900px breakpoint. */
.dist-nf-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.dist-nf-value {
  margin-top: 5px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: var(--ins-ink);
}
.dist-nf-sub {
  margin-top: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}

/* ── The ledger — ruled table ──────────────────────────────────── */
.dist-thead,
.dist-row {
  display: grid;
  grid-template-columns: 74px 1fr 1fr auto;
  gap: 24px;
}
.dist-thead {
  margin-top: 22px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ins-ink);
}
/* Column heads — labels. Tracking down a notch because "YEAR" has to
   live inside the ledger's fixed 74px first track. */
.dist-th {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.dist-th--right {
  text-align: right;
}
.dist-tbody {
  border-bottom: 1px solid var(--ins-ink);
}
.dist-row {
  align-items: end;
  padding: 14px 0;
  border-bottom: 1px solid var(--ins-hair);
}
.dist-tbody .dist-row:last-child {
  border-bottom: 0;
}
.dist-year {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 0.82;
  color: var(--ins-ordinal);
}
.dist-cell {
  min-width: 0;
}
.dist-cell-value {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ins-ink);
}
/* Column labels vanish on mobile, so the pay date relabels itself. */
.dist-paid-prefix {
  display: none;
}
.dist-amtwrap {
  text-align: right;
}
.dist-amt {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: var(--ins-ink);
}
/* "2.31% YIELD · +5.2% YOY" — a data annotation, not a sentence. Label.
   It sits in the ledger's right-hand 'auto' track, so tracking comes down
   a notch to keep that track from widening into the date columns. */
.dist-amtsub {
  margin-top: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
/* Footnotes are running prose — the yield definition and the source /
   as-of line. Caption grammar; the copy was already sentence case. */
.dist-footnote {
  margin: 12px 0 0;
  padding-top: 10px;
  border-top: 1px solid var(--ins-hair-soft);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  line-height: 1.6;
}

/* ── The mechanics — article grammar ───────────────────────────── */
.dist-article {
  margin-top: 22px;
  max-width: 68ch;
}
.dist-article p {
  margin: 0 0 22px;
  font-size: 21px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-ink);
}
.dist-article p:last-child {
  margin-bottom: 0;
}
.dist-article b {
  font-weight: 700;
}

/* ── Verdict rail ──────────────────────────────────────────────── */
.dist-rail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 13px 22px;
  border: 1px solid var(--ins-ink);
}
.dist-rail__sq {
  width: 9px;
  height: 9px;
  flex: none;
  background: var(--ins-ink);
}
.dist-rail__copy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-ink);
}
/* The rail's right-hand note is a sentence ("Estimates firm up when
   Vanguard declares") — caption, same split ConditionsBand's rail makes
   between its shouted verdict and its spoken note. */
.dist-rail__note {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  text-align: right;
}

/* ── Closer ────────────────────────────────────────────────────── */
.dist-closer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  padding-top: 40px;
  border-top: 1px solid var(--ins-ink);
}
.dist-closer__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--ins-ink);
}
.dist-closer__sub {
  margin: 12px 0 0;
  max-width: 62ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--ins-gray-600);
}
.dist-closer__link {
  justify-self: end;
  padding-bottom: 5px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  white-space: nowrap;
}

/* ── Mid breakpoint ────────────────────────────────────────────── */
@media (max-width: 900px) {
  .dist-display {
    font-size: 48px;
  }
  .dist-h2 {
    font-size: 28px;
  }
  .dist-facts {
    grid-template-columns: 1fr 1fr;
  }
  .dist-fact {
    padding: 13px 0 15px;
    border-left: 0;
  }
  .dist-fact:nth-child(2n) {
    padding-left: 20px;
    border-left: 1px solid var(--ins-hair);
  }
  .dist-fact:nth-child(n + 3) {
    border-top: 1px solid var(--ins-hair);
  }
  .dist-fact-value {
    font-size: 27px;
  }
  /* Keeps the closer's display + CTA on one line before the mobile
     stack takes over at 640px. */
  .dist-closer__display {
    font-size: 32px;
  }
}

/* ── Mobile 390 ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .dist-page {
    gap: 26px;
    padding: 0 20px 28px;
  }
  .dist-hero {
    padding-top: 22px;
  }
  /* Three clauses on a 350px measure — tracking back a notch pays for
     the floor bump so the kicker still breaks in two lines, not three. */
  .dist-kicker {
    font-size: 10px;
    letter-spacing: 0.2em;
  }
  .dist-display {
    margin-top: 14px;
    font-size: 38px;
    letter-spacing: -0.03em;
    line-height: 1.02;
  }
  .dist-dek {
    margin-top: 14px;
    font-size: 14px;
  }
  .dist-facts {
    margin-top: 22px;
  }
  .dist-note {
    text-align: left;
  }
  .dist-h2 {
    font-size: 24px;
  }

  /* Next-one stacks: chip + window, then the amount on its own line. */
  .dist-next {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 16px 0;
  }
  .dist-chip {
    justify-self: start;
    padding: 6px 12px;
    font-size: 11.5px;
  }
  .dist-next__when {
    font-size: 19px;
  }
  .dist-next__amtwrap {
    text-align: left;
  }
  .dist-next__amt {
    font-size: 30px;
  }
  .dist-next-facts {
    grid-template-columns: 1fr;
  }
  .dist-nf {
    padding: 11px 0 12px;
    border-left: 0;
    border-top: 1px solid var(--ins-hair);
  }
  .dist-nf:first-child {
    border-top: 0;
    padding-top: 0;
  }
  .dist-nf-value {
    font-size: 19px;
  }

  /* Ledger rows stack: ex-date + amount on one line, sub-labels below.
     The pale year ordinal drops — the ex-date already carries the year. */
  .dist-thead {
    display: none;
  }
  .dist-row {
    grid-template-columns: 1fr auto;
    gap: 6px 16px;
    align-items: baseline;
    padding: 12px 0;
    min-height: 56px;
  }
  .dist-year {
    display: none;
  }
  .dist-cell--ex {
    grid-column: 1;
    grid-row: 1;
  }
  .dist-cell--paid {
    grid-column: 1;
    grid-row: 2;
  }
  /* "PAID JAN 5, 2026" — still a value with a relabel prefix, so it
     keeps caps; tracking down a notch to hold the stacked row's width. */
  .dist-cell--paid .dist-cell-value {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--ins-gray-600);
  }
  .dist-paid-prefix {
    display: inline;
  }
  .dist-amtwrap {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
  .dist-amt {
    font-size: 20px;
  }

  .dist-article {
    margin-top: 18px;
  }
  .dist-article p {
    margin-bottom: 18px;
    font-size: 17px;
    line-height: 1.55;
  }

  .dist-rail {
    gap: 10px;
    padding: 11px 16px;
  }
  .dist-rail__sq {
    width: 7px;
    height: 7px;
  }
  .dist-rail__copy {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  /* Caption size carries over from desktop; only the alignment and the
     full-width wrap are mobile business. */
  .dist-rail__note {
    margin-left: 0;
    width: 100%;
    text-align: left;
  }

  .dist-closer {
    display: block;
    padding-top: 18px;
  }
  .dist-closer__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .dist-closer__sub {
    margin-top: 8px;
    font-size: 12.5px;
  }
  /* Top padding does the work of the margin so the tap target clears
     44px without floating the 2px underline away from the words. */
  .dist-closer__link {
    display: inline-block;
    margin-top: 0;
    padding: 24px 0 8px;
    font-size: 10px;
    letter-spacing: 0.14em;
  }
}
`;

export default async function DistributionsPage() {
  /* ── The ledger, newest first. Sorting explicitly rather than trusting
     the source order keeps the year-over-year pairing below sound. ── */
  const confirmed = VEQT_DISTRIBUTIONS.distributions
    .filter((d) => !d.estimated)
    .sort((a, b) => b.exDate.localeCompare(a.exDate));

  const cumulativePaid = getCumulativeSinceInception();
  const cagr = getDistributionCAGR();
  const totalGrowthPct = getTotalDistributionGrowthPct();
  const inceptionYear = getInceptionDistributionYear();
  const yearsPaid = confirmed.length;
  const latestYear = parseSessionDate(confirmed[0].exDate).getUTCFullYear();
  /* Provable, not asserted: every year between the first and the last is
     accounted for, so "no missed years" is safe to print. */
  const noGaps = yearsPaid === latestYear - inceptionYear + 1;

  /* Live price — the trailing-yield fact. Renders "—" when unavailable.
     Daily closes — the only honest source for yield-at-the-time. When the
     history is unavailable the per-row yield micro-label omits itself
     rather than being estimated from anything else.

     The two reads are independent, so they run concurrently rather than
     serially; `allSettled` keeps each one's failure isolated exactly as the
     two separate try/catch blocks did. */
  const [quoteResult, historyResult] = await Promise.allSettled([
    getQuote("VEQT"),
    getDailyHistory("VEQT", "full"),
  ]);

  /* Trailing-yield fact degrades to "—"; nothing else depends on it. */
  const currentPrice =
    quoteResult.status === "fulfilled" ? quoteResult.value?.price ?? 0 : 0;

  /* Yield micro-labels omit themselves — see above. */
  const closeByDate = new Map<string, number>();
  if (historyResult.status === "fulfilled") {
    for (const bar of historyResult.value.data) {
      if (bar.close > 0) closeByDate.set(bar.date, bar.close);
    }
  }

  /** Close on the ex-date, or the last session in the week before it. */
  function closeOnOrBefore(iso: string): number | null {
    const d = parseSessionDate(iso);
    for (let i = 0; i < 8; i += 1) {
      const close = closeByDate.get(d.toISOString().slice(0, 10));
      if (close) return close;
      d.setUTCDate(d.getUTCDate() - 1);
    }
    return null;
  }

  const rows = confirmed.map((d, i) => {
    const prior = confirmed[i + 1];
    const close = closeOnOrBefore(d.exDate);
    return {
      exDate: d.exDate,
      payDate: d.payDate,
      amount: d.amount,
      year: parseSessionDate(d.exDate).getUTCFullYear(),
      yieldPct: close ? (d.amount / close) * 100 : null,
      yoyPct:
        prior && prior.amount > 0
          ? ((d.amount - prior.amount) / prior.amount) * 100
          : null,
    };
  });
  const anyYield = rows.some((r) => r.yieldPct !== null);

  const estimate = getNextDistributionEstimate(
    currentPrice > 0 ? currentPrice : undefined
  );

  /* "December 2026" → chip "DEC 2026", matching the home hero's NEXT
     DISTRIBUTION micro-fact that links here. */
  const [estMonthWord, estYearRaw] = estimate.estimatedMonth.split(" ");
  const estChip =
    estMonthWord && estYearRaw
      ? `${estMonthWord.slice(0, 3).toUpperCase()} ${estYearRaw}`
      : estimate.estimatedMonth.toUpperCase();
  /* The forward amount is only ever the estimated row Vanguard hasn't
     declared yet — never an average dressed up as a forecast. */
  const estYear = Number(estYearRaw);
  const estRow =
    VEQT_DISTRIBUTIONS.distributions.find(
      (d) =>
        d.estimated && parseSessionDate(d.exDate).getUTCFullYear() === estYear
    ) ?? null;

  const priorYear = confirmed[1]
    ? parseSessionDate(confirmed[1].exDate).getUTCFullYear()
    : null;

  const veqt = FUNDS["VEQT.TO"];
  const holdingsLabel = veqt.numberOfHoldings.toLocaleString("en-CA");
  const sleeveCount = veqt.underlyingETFs.length;

  return (
    <main className="ins-root dist-root">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Distributions", path: "/distributions" },
        ])}
      />

      <div className="dist-page">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <header className="dist-hero">
          <p className="dist-kicker">
            The payout ledger · Annual distributions · Since {inceptionYear}
          </p>
          <h1 className="dist-display">Paid, on file.</h1>
          <p className="dist-dek">
            VEQT pays once a year, in late December, and the money lands in
            early January. Every payment on record, the one that&rsquo;s
            still coming, and what each one worked out to per unit.
          </p>

          <div className="dist-facts">
            <div className="dist-fact">
              <div className="dist-fact-label">
                Paid since {inceptionYear} · per unit
              </div>
              <div className="dist-fact-value">
                ${cumulativePaid.toFixed(2)}
              </div>
              <div className="dist-fact-sub">
                {yearsPaid} payments{noGaps ? " · no missed years" : ""}
              </div>
            </div>

            <div className="dist-fact">
              <div className="dist-fact-label">Growth per year</div>
              <div className="dist-fact-value">
                {cagr !== null ? `${(cagr * 100).toFixed(1)}%` : "—"}
              </div>
              <div className="dist-fact-sub">
                Compound, {inceptionYear} to {latestYear}
              </div>
            </div>

            <div className="dist-fact">
              <div className="dist-fact-label">Total growth</div>
              <div className="dist-fact-value">
                {totalGrowthPct !== null
                  ? fmtSignedPct(totalGrowthPct, 0)
                  : "—"}
              </div>
              <div className="dist-fact-sub">
                Per unit vs. {inceptionYear}
              </div>
            </div>

            <div className="dist-fact">
              <div className="dist-fact-label">Trailing yield</div>
              <div className="dist-fact-value">
                {estimate.trailingAnnualYield !== null
                  ? `${estimate.trailingAnnualYield.toFixed(2)}%`
                  : "—"}
              </div>
              <div className="dist-fact-sub">
                {estimate.trailingAnnualYield !== null
                  ? `Last payment on today's $${fmtPrice(currentPrice)}`
                  : "Price unavailable"}
              </div>
            </div>
          </div>
        </header>

        {/* ── The next one ──────────────────────────────────────── */}
        <section className="dist-sec" aria-labelledby="dist-next-heading">
          <div className="dist-sec__head">
            <p className="dist-kicker dist-kicker--red">The next one</p>
            <p className="dist-note">
              Vanguard declares the date and amount in November
            </p>
          </div>
          <h2 className="dist-h2" id="dist-next-heading">
            The one still coming.
          </h2>

          <div className="dist-next">
            <span className="dist-chip">&#9656; EST. {estChip}</span>
            <div>
              <div className="dist-next__when">{estimate.estimatedWindow}</div>
              <div className="dist-next__sub">
                Ex-dividend window · {estimate.confidence} confidence
              </div>
            </div>
            <div className="dist-next__amtwrap">
              <div className="dist-next__amt">
                {estRow ? `$${estRow.amount.toFixed(4)}` : "—"}
              </div>
              <div className="dist-next__amtsub">
                {estRow ? "Per unit · estimated" : "Not yet estimated"}
              </div>
            </div>
          </div>

          <div className="dist-next-facts">
            <div className="dist-nf">
              <div className="dist-nf-label">Last confirmed</div>
              <div className="dist-nf-value">
                ${estimate.lastConfirmed.amount.toFixed(4)}
              </div>
              <div className="dist-nf-sub">
                {fmtChipDate(parseSessionDate(estimate.lastConfirmed.date))}
              </div>
            </div>
            <div className="dist-nf">
              <div className="dist-nf-label">Average of last three</div>
              <div className="dist-nf-value">
                ${estimate.averageAmount.toFixed(4)}
              </div>
              <div className="dist-nf-sub">Per unit</div>
            </div>
            <div className="dist-nf">
              <div className="dist-nf-label">Year over year</div>
              <div className="dist-nf-value">
                {estimate.growthTrend !== null
                  ? fmtSignedPct(estimate.growthTrend, 1)
                  : "—"}
              </div>
              <div className="dist-nf-sub">
                {priorYear !== null ? `${priorYear} to ${latestYear}` : "—"}
              </div>
            </div>
          </div>

          <p className="dist-caption">
            Estimated from the annual pattern. Vanguard announces the actual
            date and amount in early November — until then this row is a
            projection, not a promise.
          </p>
        </section>

        {/* ── The ledger ────────────────────────────────────────── */}
        <section className="dist-sec" aria-labelledby="dist-ledger-heading">
          <div className="dist-sec__head">
            <p className="dist-kicker dist-kicker--red">The ledger</p>
            <p className="dist-note">
              Source: Vanguard Canada · Confirmed payments only
            </p>
          </div>
          <h2 className="dist-h2" id="dist-ledger-heading">
            Every payment on record.
          </h2>

          {/* Not a <table>: `display: grid` on <tr> strips the row/cell
              roles anyway, so the ledger is a plain ruled list. The header
              row stays in the accessibility tree — read once, it labels
              the four values that follow in every row. */}
          <div className="dist-thead">
            <div className="dist-th">Year</div>
            <div className="dist-th">Ex-dividend</div>
            <div className="dist-th">Paid</div>
            <div className="dist-th dist-th--right">Per unit</div>
          </div>

          <div className="dist-tbody">
            {rows.map((r) => {
              const micro = [
                r.yieldPct !== null ? `${r.yieldPct.toFixed(2)}% yield` : null,
                r.yoyPct !== null ? `${fmtSignedPct(r.yoyPct, 1)} YoY` : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div className="dist-row" key={r.exDate}>
                  <div className="dist-year">{r.year}</div>
                  <div className="dist-cell dist-cell--ex">
                    <div className="dist-cell-value">
                      {fmtChipDate(parseSessionDate(r.exDate))}
                    </div>
                  </div>
                  <div className="dist-cell dist-cell--paid">
                    <div className="dist-cell-value">
                      <span className="dist-paid-prefix">Paid </span>
                      {fmtChipDate(parseSessionDate(r.payDate))}
                    </div>
                  </div>
                  <div className="dist-amtwrap">
                    <div className="dist-amt">${r.amount.toFixed(4)}</div>
                    {micro && <div className="dist-amtsub">{micro}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {(anyYield || estRow) && (
            <p className="dist-footnote">
              {anyYield
                ? "Yield is the payment divided by that day's closing price — the fund's full-year yield at the moment it paid. "
                : ""}
              {estRow
                ? `The ${estYearRaw} row sits above, still an estimate.`
                : ""}
            </p>
          )}
        </section>

        {/* ── The mechanics ─────────────────────────────────────── */}
        <section className="dist-sec" aria-labelledby="dist-mechanics-heading">
          <div className="dist-sec__head">
            <p className="dist-kicker dist-kicker--red">The mechanics</p>
            <p className="dist-note">
              Frequency: {VEQT_DISTRIBUTIONS.frequency} · Ticker{" "}
              {VEQT_DISTRIBUTIONS.ticker}
            </p>
          </div>
          <h2 className="dist-h2" id="dist-mechanics-heading">
            What the payment actually is.
          </h2>

          <div className="dist-article">
            <p>
              A distribution is a payment from the fund to its holders.
              VEQT&rsquo;s is mostly dividends — earned by the {holdingsLabel}{" "}
              stocks the fund holds through its {sleeveCount} underlying ETFs.
              When Apple, Royal Bank, and Nestl&eacute; pay their
              shareholders, that income flows through to you.
            </p>
            <p>
              <b>Yield is not return.</b> A fund with a 2% distribution yield
              and 8% price appreciation beats a fund with a 4% yield and 4%
              appreciation. Distribution size, on its own, says nothing about
              whether the fund is winning.
            </p>
            <p>
              Most long-term holders DRIP — dividend reinvestment plan —
              through their brokerage. The December payment buys more units
              automatically. No fees, no decisions, and the compounding does
              its quiet work.
            </p>
          </div>

          <p className="dist-footnote">
            Source: Vanguard Canada · Holdings as of the{" "}
            {fmtChipDate(parseSessionDate(FUND_DATA_LAST_UPDATED))} factsheet ·
            Distribution data updated after each declaration
          </p>
        </section>

        {/* ── Verdict rail ──────────────────────────────────────── */}
        <div className="dist-rail">
          <span className="dist-rail__sq" aria-hidden="true" />
          <span className="dist-rail__copy">
            One payout a year — reinvest it and forget it
          </span>
          <span className="dist-rail__note">
            Estimates firm up when Vanguard declares
          </span>
        </div>

        {/* ── Closer ────────────────────────────────────────────── */}
        <section className="dist-closer" aria-label="Closing note">
          <div>
            <p className="dist-closer__display">
              You&rsquo;ve seen the ledger.
            </p>
            <p className="dist-closer__sub">
              {yearsPaid} payments{noGaps ? ", no missed years" : ""}, and the
              next one is a December away. The only decision left is whether
              it buys more units.
            </p>
          </div>
          <Link href="/calculators?tab=dca" className="dist-closer__link">
            Model the reinvestment <span aria-hidden>&rarr;</span>
          </Link>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  );
}
