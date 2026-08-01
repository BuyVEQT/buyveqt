import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "The Colophon — Sources, Methods, Fine Print",
  description:
    "How BuyVEQT sources its data, what's manual versus live, what we cache, and where the limits are. The fine print, plain.",
  alternates: { canonical: canonicalUrl("/methodology") },
  openGraph: {
    title: "The Colophon — Sources, Methods, Fine Print",
    description:
      "Where the data comes from, how often it refreshes, and what to trust.",
    url: canonicalUrl("/methodology"),
  },
};

interface Note {
  /** Anchor id so other pages can deep-link, e.g. `/methodology#sources`. */
  id: string;
  /** Red section kicker — ordinal + category, pre-uppercased. */
  kicker: string;
  title: string;
  body: React.ReactNode;
}

interface Source {
  name: string;
  /** What-it-feeds micro-label. Pre-uppercased (no σ in this page's copy). */
  feeds: string;
  /** Update cadence micro-label. Pre-uppercased. */
  cadence: string;
}

/**
 * The four upstream sources plus the local cache, as facts rows — the
 * Instrument's ruled-table grammar (handoff recipe: "facts rows for data
 * sources; keep the Vanguard/Yahoo attribution verbatim").
 *
 * Every claim here is stated at length in the notes below; the rows are
 * the index, the notes are the record.
 */
const SOURCES: Source[] = [
  {
    name: "Alpha Vantage",
    feeds: "VEQT quotes · full daily history",
    cadence: "~15 min · history ~24 h",
  },
  {
    name: "Yahoo Finance",
    feeds: "Comparison funds · VEQT fallback",
    cadence: "~15 min · history ~24 h",
  },
  {
    name: "Vanguard Canada",
    feeds: "Distribution announcements",
    cadence: "Transcribed as published",
  },
  {
    name: "Fund documents & filings",
    feeds: "MER · AUM · holdings · geography · sectors",
    cadence: "By hand · periodic",
  },
  {
    name: "Local cache",
    feeds: "Last known good data",
    cadence: "Every successful fetch",
  },
];

/**
 * The Colophon — methodology page in the Instrument grammar.
 *
 * A printer's colophon traditionally went at the back of a book to
 * declare its sources and craft. Here it does the same job for the
 * data on the rest of the site: where each number comes from, how
 * stale it can be, and what's manual.
 *
 * Composition (handoff recipe + the constants that hold across routes):
 *   hero            — kicker · display · dek
 *   data sources    — ruled facts rows, one per source
 *   notes 01–08     — article grammar: 3px rule, red kicker, 21px/1.6
 *                     body at 68ch, permalink anchors preserved
 *   disclaimer      — ink panel (red kicker, paper body)
 *   verdict rail    — one per page, square dot + honest right note
 *   closer          — display + dek + the single red CTA
 *
 * Server component: styles ship as a plain <style> tag (the
 * ArticleStrip/Closer pattern) rather than styled-jsx, which would
 * force "use client" and drop its scope class off <Link> anyway.
 */
export default function MethodologyPage() {
  const notes: Note[] = [
    {
      id: "about",
      kicker: "Note 01 · The publisher",
      title: "About this site",
      body: (
        <>
          <p>
            BuyVEQT is an unofficial, community-built information hub for the
            Vanguard All-Equity ETF Portfolio (VEQT). It is not affiliated
            with, endorsed by, or connected to Vanguard Investments Canada
            Inc. or any other financial institution.
          </p>
        </>
      ),
    },
    {
      // Linked from inside-veqt's methodology card as "Sources →".
      id: "sources",
      kicker: "Note 02 · The feeds",
      title: "Where the prices come from",
      body: (
        <>
          <p>
            Live market data flows through a two-source fallback chain so a
            single outage doesn&apos;t blank the page:
          </p>
          <ul>
            <li>
              <strong>Alpha Vantage</strong> — primary source for VEQT.
              Real-time quotes and full daily history via their financial
              data API.
            </li>
            <li>
              <strong>Yahoo Finance</strong> — primary for comparison funds,
              fallback for VEQT. Quotes and history via the{" "}
              <code>yahoo-finance2</code> library.
            </li>
          </ul>
          <p>
            Every successful fetch is cached locally so the site can serve
            the last known good data when both providers are unreachable.
            The &ldquo;Updated&rdquo; timestamp and source label on each
            page tell you when and from where.
          </p>
        </>
      ),
    },
    {
      id: "refresh-cadence",
      kicker: "Note 03 · The cadence",
      title: "How often it refreshes",
      body: (
        <>
          <p>Different data, different cadences:</p>
          <ul>
            <li>
              <strong>Price quotes</strong> — every ~15 minutes via ISR
              caching. Often fresher inside market hours.
            </li>
            <li>
              <strong>Daily history</strong> — every ~24 hours.
              Yesterday&apos;s close doesn&apos;t change.
            </li>
            <li>
              <strong>Monthly history</strong> — every ~7 days.
            </li>
          </ul>
          <p>
            Market data may be delayed and is not suitable for trading
            decisions. Always confirm prices with your brokerage before
            placing an order.
          </p>
        </>
      ),
    },
    {
      id: "charts",
      kicker: "Note 04 · The charts",
      title: "How the charts read",
      body: (
        <>
          <p>
            Charts use adjusted close prices, which back out distributions
            and splits so dividends don&apos;t manufacture phantom drops.
            Comparison charts normalize each fund to the start of the
            window, so two funds with different unit prices can be read on
            the same y-axis.
          </p>
          <p>
            <strong>Past performance does not guarantee future results.</strong>
          </p>
        </>
      ),
    },
    {
      id: "manual-data",
      kicker: "Note 05 · By hand",
      title: "What's manual",
      body: (
        <>
          <p>
            Fund metadata — MER, AUM, holding count, geographic and sector
            breakdowns, underlying ETFs — is compiled by hand from official
            fund documents, provider websites, and regulatory filings (Fund
            Facts).
          </p>
          <p>
            We update these periodically, but they are not live. Expect a
            short lag between when a provider publishes a change and when
            this site reflects it.
          </p>
          <p>
            <strong>MER note.</strong> Vanguard cut VEQT&apos;s management
            fee from 0.22% to 0.17% in November 2025. The official MER (which
            adds operating expenses and taxes) was last reported as 0.24%
            against an earlier fiscal year. The effective MER should land
            around 0.19%–0.20% once recalculated. We display
            &ldquo;~0.20%*&rdquo; with a footnote until the official number
            updates.
          </p>
        </>
      ),
    },
    {
      id: "distributions",
      kicker: "Note 06 · Distributions",
      title: "Distributions",
      body: (
        <>
          <p>
            Distribution history is transcribed from Vanguard&apos;s
            published distribution announcements — amounts, ex-dates, and
            payment dates as printed.
          </p>
          <p>
            Trailing 12-month yield is the sum of the last twelve months of
            distributions divided by the current unit price. A standard
            trailing yield. It does not predict future distributions.
          </p>
        </>
      ),
    },
    {
      id: "editorial",
      kicker: "Note 07 · Editorial",
      title: "Editorial content",
      body: (
        <>
          <p>
            Everything in the <Link href="/learn">Learn</Link> archive is
            educational. The dispatches help Canadians understand how VEQT,
            all-in-one ETFs, and tax-advantaged accounts work. They do not
            constitute financial, investment, tax, or legal advice.
          </p>
          <p>
            Tax information is general. Tax law changes. Always consult a
            qualified professional for advice specific to your situation.
          </p>
        </>
      ),
    },
    {
      id: "corrections",
      kicker: "Note 08 · Corrections",
      title: "Corrections & contributions",
      body: (
        <>
          <p>
            See an error, a stale figure, or a number that smells wrong?
            Reach the editors at{" "}
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
            >
              r/JustBuyVEQT
            </a>
            . This is a community project — corrections are welcomed, not
            tolerated.
          </p>
        </>
      ),
    },
  ];

  return (
    <main className="ins-root ismeth">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ])}
      />

      <div className="ismeth__page">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <header className="ismeth__hero">
          <div className="ismeth__heroTop">
            <span className="ismeth__kicker">
              How we know · Sources &amp; methods · Updated with the data
            </span>
            <span className="ismeth__heroMeta">
              {notes.length} notes on record
            </span>
          </div>
          <h1 className="ismeth__display">Where every number comes from.</h1>
          <p className="ismeth__dek">
            Every page on this site exists to make publicly available
            information about VEQT easier for Canadian investors to read,
            compare, and trust.
          </p>
        </header>

        {/* ── Data sources — facts rows ──────────────────────────── */}
        <section className="ismeth__sec" aria-labelledby="ismeth-sources">
          <div className="ismeth__secHead">
            <span className="ismeth__eyebrow">Data sources</span>
            <span className="ismeth__secMeta">
              Live where possible · By hand where not
            </span>
          </div>
          <h2 id="ismeth-sources" className="ismeth__secDisplay">
            Four sources, one cache.
          </h2>
          <p className="ismeth__standfirst">
            Where each number comes from, what we cache, what&apos;s typed by
            hand, and what to trust. The same notes a printer would set at the
            back of the book.
          </p>

          <ul className="ismeth__srcList">
            {SOURCES.map((s) => (
              <li key={s.name} className="ismeth__src">
                <span className="ismeth__srcName">{s.name}</span>
                <span className="ismeth__srcFeeds">{s.feeds}</span>
                <span className="ismeth__srcCadence">{s.cadence}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The notes — article grammar ────────────────────────── */}
        {notes.map((note) => (
          <section key={note.id} id={note.id} className="ismeth__note">
            <div className="ismeth__secHead">
              <span className="ismeth__eyebrow">{note.kicker}</span>
              <a href={`#${note.id}`} className="ismeth__permalink">
                #{note.id}
              </a>
            </div>
            <h2 className="ismeth__noteTitle">{note.title}</h2>
            <div className="ismeth__body">{note.body}</div>
          </section>
        ))}

        {/* ── Disclaimer — ink panel ─────────────────────────────── */}
        <section className="ismeth__panel" aria-label="Disclaimer">
          <div className="ismeth__panelTop">
            <span className="ismeth__panelKicker">Disclaimer</span>
            <span className="ismeth__panelNote">Read the whole thing</span>
          </div>
          <div className="ismeth__panelRule" />
          <p className="ismeth__panelBody">
            BuyVEQT is a community-built informational resource. It is not
            affiliated with, endorsed by, or sponsored by Vanguard
            Investments Canada Inc. or any other financial institution.
            Nothing on this site constitutes financial, investment, tax, or
            legal advice. All data is provided for informational purposes
            only and may be delayed or inaccurate. Always consult a
            qualified financial advisor before making investment decisions.
          </p>
        </section>

        {/* ── Verdict rail — one per page ────────────────────────── */}
        <div className="ismeth__rail">
          <span className="ismeth__railSq" aria-hidden="true" />
          {/* Rail copy is written pre-uppercased (no text-transform), the
              codebase convention — a transform would print a σ as Σ. */}
          <span className="ismeth__railCopy">
            NOTHING PROPRIETARY — CHECK OUR MATH ANYTIME
          </span>
          {/* Sentence, so sentence case — the subreddit keeps its own
              casing. */}
          <span className="ismeth__railNote">
            Corrections go to r/JustBuyVEQT — welcomed, not tolerated
          </span>
        </div>

        {/* ── Closer ─────────────────────────────────────────────── */}
        <section className="ismeth__closer" aria-label="Closing note">
          <div>
            <p className="ismeth__closerDisplay">
              That&apos;s every source, on the record.
            </p>
            <p className="ismeth__closerSub">
              Two live providers, one local cache, and the rest typed by hand
              from the filings.
            </p>
          </div>
          <Link href="/inside-veqt" className="ismeth__closerLink">
            See it in action <span aria-hidden>→</span>
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
 * carries the unique `ismeth` prefix. ── */

const css = `
.ismeth {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.ismeth__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.ismeth__hero {
  padding-top: 34px;
}
.ismeth__heroTop {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
}
.ismeth__kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ismeth__heroMeta {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ismeth__display {
  margin: 18px 0 0;
  max-width: 18ch;
  font-size: clamp(38px, 6vw, 72px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
  animation: ins-fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) 0.05s both;
}
.ismeth__dek {
  margin: 20px 0 0;
  max-width: 62ch;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
}

/* ── Section headers — 3px ink rule opens every section ───────── */
.ismeth__sec,
.ismeth__note {
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 12px;
}
/* Clears the sticky mobile TopBar (~56px) plus a small buffer so a
   deep-linked note doesn't sit flush against the chrome. */
.ismeth__note {
  scroll-margin-top: 80px;
}
.ismeth__secHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
/* Section kickers ("DATA SOURCES", "NOTE 04 · THE CHARTS") — labels. */
.ismeth__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
  font-variant-numeric: tabular-nums;
}
/* "LIVE WHERE POSSIBLE · BY HAND WHERE NOT" — a two-clause label phrase
   with no verb naming the sourcing policy, so it stays a label rather
   than going to caption grammar with the notes below it. */
.ismeth__secMeta {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
}
/* "#SOURCES" — a link-button, so it keeps caps at the floor. It is also
   the only interactive control inside a baseline-aligned flex head:
   padding or min-height here would drop the head's baseline and shove
   every section heading down, so the 44px tap area is an ::after
   overlay instead. The overlay grows vertically only, over the section
   rule above and the display heading below — neither is clickable, and
   the 34px page gap keeps it clear of the previous note's body links. */
.ismeth__permalink {
  position: relative;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-decoration: none;
  white-space: nowrap;
}
.ismeth__permalink::after {
  content: "";
  position: absolute;
  inset: -16px 0; /* ~12px line box + 32px = 44px tap height */
}
.ismeth__permalink:hover {
  color: var(--ins-ink);
}
.ismeth__secDisplay {
  margin: 6px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.ismeth__standfirst {
  margin: 12px 0 0;
  max-width: 68ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
}

/* ── Data sources — facts rows ────────────────────────────────── */
.ismeth__srcList {
  list-style: none;
  margin: 22px 0 0;
  padding: 0;
}
.ismeth__src {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  grid-template-areas: "name feeds cadence";
  gap: 24px;
  align-items: baseline;
  padding: 14px 0 16px;
  border-top: 1px solid var(--ins-ink);
}
.ismeth__src:last-child {
  border-bottom: 1px solid var(--ins-ink);
}
.ismeth__srcName {
  grid-area: name;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.1;
}
/* "MER · AUM · HOLDINGS · GEOGRAPHY · SECTORS" — an inventory of things,
   not a sentence: label. Tracking back a notch pays for the bump inside
   the row's 1fr track. */
.ismeth__srcFeeds {
  grid-area: feeds;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ismeth__srcCadence {
  grid-area: cadence;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ── The notes — article body ─────────────────────────────────── */
.ismeth__noteTitle {
  margin: 6px 0 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.12;
}
.ismeth__body {
  margin-top: 20px;
  max-width: 68ch;
  font-size: 21px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-ink);
}
.ismeth__body p {
  margin: 0 0 20px;
}
.ismeth__body > :last-child {
  margin-bottom: 0;
}
.ismeth__body strong {
  font-weight: 700;
}
.ismeth__body ul {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
}
.ismeth__body li {
  padding: 13px 0;
  border-top: 1px solid var(--ins-hair);
}
.ismeth__body li:last-child {
  border-bottom: 1px solid var(--ins-hair);
}
.ismeth__body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78em;
  padding: 2px 6px;
  border: 1px solid var(--ins-hair);
}
.ismeth__body a {
  color: var(--ins-ink);
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.ismeth__body a:hover {
  color: var(--ins-signal);
}

/* ── Disclaimer — ink panel. Muted tones mix off --ins-paper (not
   literal white) so the panel inverts under the Ink Edition. ────── */
.ismeth__panel {
  background: var(--ins-ink);
  color: var(--ins-paper);
  padding: 26px 30px 28px;
}
.ismeth__panelTop {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}
.ismeth__panelKicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
/* "READ THE WHOLE THING" — a four-word stamp paired with the DISCLAIMER
   kicker in a two-item top bar (the NewsletterCard .anews__top shape),
   so it stays a label. The muted tone is the inverse-panel 55% white and
   is left exactly as-is. */
.ismeth__panelNote {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ins-paper) 55%, transparent);
}
.ismeth__panelRule {
  height: 1px;
  background: color-mix(in srgb, var(--ins-paper) 22%, transparent);
  margin: 14px 0 18px;
}
.ismeth__panelBody {
  margin: 0;
  max-width: 72ch;
  padding-left: 16px;
  border-left: 3px solid color-mix(in srgb, var(--ins-paper) 35%, transparent);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.7;
  color: color-mix(in srgb, var(--ins-paper) 82%, transparent);
}

/* ── Verdict rail ─────────────────────────────────────────────── */
.ismeth__rail {
  border: 1px solid var(--ins-ink);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 11px 22px;
}
.ismeth__railSq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink);
  flex: none;
}
.ismeth__railCopy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}
/* The rail's right-hand note is a sentence — "Corrections go to
   r/JustBuyVEQT — welcomed, not tolerated". Caption grammar, and the
   string itself came out of caps (it was pre-uppercased in the JSX,
   which is why there is no text-transform to remove here). The rail
   copy above it stays a shouted verdict, per ConditionsBand. */
.ismeth__railNote {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--ins-gray-600);
  text-align: right;
}

/* ── Closer ───────────────────────────────────────────────────── */
.ismeth__closer {
  border-top: 1px solid var(--ins-ink);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.ismeth__closerDisplay {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.ismeth__closerSub {
  margin: 12px 0 0;
  max-width: 56ch;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
}
.ismeth__closerLink {
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

/* ── Mid breakpoint — the cadence column rides beside the name and
   the feeds label drops to its own line. ─────────────────────── */
@media (max-width: 860px) {
  .ismeth__src {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "name cadence"
      "feeds feeds";
    gap: 6px 20px;
    align-items: baseline;
  }
}

/* ── Mobile · 390 ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .ismeth__page {
    padding: 0 20px 28px;
    gap: 26px;
  }
  .ismeth__hero {
    padding-top: 24px;
  }
  /* Three clauses on a 350px measure — a notch of tracking back pays
     for the floor bump. */
  .ismeth__kicker {
    font-size: 10px;
    letter-spacing: 0.2em;
  }
  .ismeth__heroMeta {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .ismeth__display {
    margin-top: 14px;
    max-width: none;
    letter-spacing: -0.03em;
  }
  .ismeth__dek {
    margin-top: 14px;
    font-size: 15px;
  }
  .ismeth__eyebrow {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  /* Eyebrow + permalink share one 350px row, so both come down a notch:
     "NOTE 03 · THE CADENCE" beside "#REFRESH-CADENCE" still clears the
     measure at the floor. */
  .ismeth__secMeta,
  .ismeth__permalink {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .ismeth__secDisplay {
    font-size: 20px;
  }
  .ismeth__standfirst {
    margin-top: 10px;
    font-size: 14px;
  }
  /* Facts rows stack 2×1 — name over feeds over cadence. */
  .ismeth__srcList {
    margin-top: 16px;
  }
  .ismeth__src {
    grid-template-columns: 1fr;
    grid-template-areas:
      "name"
      "feeds"
      "cadence";
    gap: 5px;
    padding: 12px 0 14px;
  }
  .ismeth__srcName {
    font-size: 22px;
  }
  /* Full-width row here, but "MER · AUM · HOLDINGS · GEOGRAPHY ·
     SECTORS" is 42 characters — 0.14em keeps it to one line at 390. */
  .ismeth__srcFeeds {
    font-size: 10px;
    letter-spacing: 0.14em;
  }
  .ismeth__srcCadence {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-align: left;
    white-space: normal;
    color: var(--ins-gray-600);
  }
  .ismeth__noteTitle {
    font-size: 22px;
    letter-spacing: -0.02em;
  }
  .ismeth__body {
    margin-top: 14px;
    font-size: 17px;
    line-height: 1.62;
  }
  .ismeth__body p,
  .ismeth__body ul {
    margin-bottom: 16px;
  }
  .ismeth__body li {
    padding: 11px 0;
  }
  .ismeth__panel {
    padding: 20px 18px 22px;
  }
  .ismeth__panelBody {
    padding-left: 12px;
    font-size: 13.5px;
    line-height: 1.65;
  }
  .ismeth__rail {
    gap: 10px;
    padding: 10px 16px;
  }
  .ismeth__railSq {
    width: 7px;
    height: 7px;
  }
  .ismeth__railCopy {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  /* Caption size carries over from desktop; mobile only unpins it from
     the right edge. */
  .ismeth__railNote {
    margin-left: 0;
    width: 100%;
    text-align: left;
  }
  .ismeth__closer {
    display: block;
    padding-top: 18px;
  }
  .ismeth__closerDisplay {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .ismeth__closerSub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .ismeth__closerLink {
    display: inline-block;
    margin-top: 14px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
}
`;
