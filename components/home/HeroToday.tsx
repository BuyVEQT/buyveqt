"use client";

import Link from "next/link";
import { useMemo } from "react";
import type {
  VeqtApiResponse,
  VeqtQuote,
  HistoricalDataPoint,
} from "@/lib/types";
import type { SeverityReading } from "@/lib/severity";
import { FUNDS } from "@/data/funds";
import { getNextDistributionEstimate } from "@/lib/distributions-calendar";
import {
  MINUS,
  UP,
  DOWN,
  fmtSignedPct,
  fmtPlusMinusPct,
  fmtPrice,
  fmtInt,
  fmtDateline,
  parseSessionDate,
} from "@/lib/instrument-format";
import FiftyTwoTrack from "./hero/FiftyTwoTrack";

/**
 * HeroToday — The Instrument hero (artboard 3a).
 *
 * Desktop (≥960px): grid `1fr 300px`, gap 48px, padding-top 34px — the
 * page container owns horizontal margins, so this module carries none.
 *
 *   LEFT                                          RIGHT (300px)
 *   eyebrow                                       ONE YEAR        +13.13%
 *   51.87 $CAD  (196px, fadeUp)                   SINCE LAUNCH    ×2.27
 *   [▲ +0.43% TODAY] +$0.22 VS. 51.65 · …         TYPICAL DAY     ±0.39%
 *   ── MER · NEXT DISTRIBUTION · STREAK · SLEEVES 52-WEEK RANGE + track
 *
 * <960px the facts drop below the price as a 2×2 grid (handoff pre-flight
 * #2); <640px the mobile deltas apply (96px price, short eyebrow, chip
 * stacked over the dateline, mobile fact labels, no track / micro-facts —
 * per the 3a mobile artboard).
 *
 * The chart, conditions band, etc. are sibling modules — nothing else is
 * rendered here.
 */
export default function HeroToday({
  data,
  loading,
  severity,
}: {
  data: VeqtApiResponse | null;
  loading: boolean;
  severity: SeverityReading | null;
}) {
  const historical = data?.historical ?? EMPTY_HISTORY;
  const quote = data?.quote ?? null;

  /* ── Derivations (all from the single ALL fetch) ── */

  const dateline = useMemo(() => {
    // Session date, not the fetch clock: between midnight and the next
    // open the quote still belongs to the prior session and must be
    // datelined as such (lastUpdated is the fetch timestamp).
    const raw = quote?.latestTradingDay ?? quote?.lastUpdated;
    if (!raw) return null;
    const d = raw.length <= 10 ? parseSessionDate(raw) : new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    // fmtDateline shouts its weekday ("FRIDAY 31.07.2026") because every
    // other caller prints it inside a caps micro-label. The hero meta line
    // is a sentence-case caption since Turn 8, so it de-shouts locally
    // rather than changing a formatter five other modules depend on.
    const line = fmtDateline(d);
    return line.charAt(0) + line.slice(1).toLowerCase();
  }, [quote?.latestTradingDay, quote?.lastUpdated]);

  /** Consecutive most-recent green (or red) sessions, from closes. */
  const streak = useMemo(() => computeStreak(historical), [historical]);

  /** "DEC 2026" from the estimator's "December 2026". */
  const distLabel = useMemo(() => {
    const est = getNextDistributionEstimate(quote?.price);
    const [month, year] = est.estimatedMonth.split(" ");
    return month && year
      ? `${month.slice(0, 3).toUpperCase()} ${year}`
      : est.estimatedMonth.toUpperCase();
  }, [quote?.price]);

  if (!quote || !data) {
    if (loading) return <HeroSkeleton />;
    return null;
  }

  const up = quote.changePercent >= 0;
  const changeMoney = `${quote.change < 0 ? MINUS : "+"}$${Math.abs(
    quote.change
  ).toFixed(2)}`;

  const streakLabel = streak
    ? `${streak.count} ${streak.dir} SESSION${streak.count === 1 ? "" : "S"}`
    : "—";

  return (
    <section className="ihero">
      {/* ── LEFT — the poster price ── */}
      <div className="ihero__main">
        <div className="ihero__eyebrow">
          <span className="ihero-desk">
            VANGUARD ALL-EQUITY ETF · VEQT.TO · TORONTO
          </span>
          <span className="ihero-mob">VEQT.TO · ALL-EQUITY · CAD</span>
        </div>

        <div className="ihero__pricerow">
          <span className="ihero__price">{fmtPrice(quote.price)}</span>
          <span className="ihero__cur" aria-label="Canadian dollars">
            $CAD
          </span>
        </div>

        <div className="ihero__chiprow">
          <span className="ihero__chip">
            {up ? UP : DOWN} {fmtSignedPct(quote.changePercent)} TODAY
          </span>
          {/* Sentence case since Turn 8: this is an explanatory fragment
              about the chip beside it, not a label. */}
          <span className="ihero__meta">
            <span className="ihero__meta-change">
              {changeMoney} vs. {fmtPrice(quote.previousClose)} ·{" "}
            </span>
            {dateline ? `${dateline} · ` : ""}Day №{" "}
            {historical.length ? fmtInt(historical.length) : "—"}
          </span>
        </div>

        <div className="ihero__micro">
          <span>
            MER <b>{MER_LABEL}</b>
          </span>
          <Link href="/distributions" className="ihero__micro-link">
            NEXT DISTRIBUTION <b>{distLabel}</b>
          </Link>
          <span>
            STREAK <b>{streakLabel}</b>
          </span>
          <span>
            SLEEVES <b>4</b>
          </span>
        </div>
      </div>

      {/* ── RIGHT — facts column (2×2 grid below 960px). Hidden on
          phones, where the artboard orders the facts AFTER the
          conditions band — HomeClient renders HeroFactsMobile there. ── */}
      <div className="ihero__facts ihero__facts--desk">
        <FactsRows historical={historical} quote={quote} severity={severity} />
      </div>

      <HeroStyles />
    </section>
  );
}

/* ── Facts rows — shared by the in-hero column and the phone-only
 * instance below the conditions band (3a mobile order: price →
 * conditions → facts → chart). ── */

function FactsRows({
  historical,
  quote,
  severity,
}: {
  historical: readonly HistoricalDataPoint[];
  quote: VeqtQuote;
  severity: SeverityReading | null;
}) {
  /** Trailing-year return: last close vs. close ~252 sessions back. */
  const oneYear = useMemo(() => {
    const n = historical.length;
    if (n < 240) return null;
    const last = historical[n - 1].close;
    const base = historical[Math.max(0, n - 1 - 252)].close;
    if (!(base > 0) || !Number.isFinite(last)) return null;
    return (last / base - 1) * 100;
  }, [historical]);

  /** Since launch: last close / first close — "×2.27". */
  const sinceLaunch = useMemo(() => {
    const n = historical.length;
    if (n < 2) return null;
    const first = historical[0].close;
    const last = historical[n - 1].close;
    if (!(first > 0) || !Number.isFinite(last)) return null;
    return last / first;
  }, [historical]);

  const launchYear = useMemo(
    () =>
      historical.length
        ? parseSessionDate(historical[0].date).getUTCFullYear()
        : 2019,
    [historical]
  );

  /** Month of the minimum close in the trailing 365 days — "OCT". */
  const lowMonth = useMemo(() => {
    const n = historical.length;
    if (n < 2) return null;
    const lastTime = parseSessionDate(historical[n - 1].date).getTime();
    const cutoff = lastTime - 365 * 24 * 60 * 60 * 1000;
    let min: HistoricalDataPoint | null = null;
    for (let i = n - 1; i >= 0; i -= 1) {
      const p = historical[i];
      if (parseSessionDate(p.date).getTime() < cutoff) break;
      if (!min || p.close < min.close) min = p;
    }
    return min ? MONTHS[parseSessionDate(min.date).getUTCMonth()] : null;
  }, [historical]);

  const low = quote.fiftyTwoWeekLow;
  const high = quote.fiftyTwoWeekHigh;
  const hasRange = high > low && low > 0;
  const rangeLabel = hasRange ? `${fmtPrice(low)}–${fmtPrice(high)}` : "—";

  return (
    <>
      <div className="ihero__fact ihero__fact--f1">
        <div className="ihero__fact-label">ONE YEAR</div>
        <div
          className={`ihero__fact-value${
            oneYear !== null && oneYear < 0 ? " is-neg" : ""
          }`}
        >
          {oneYear !== null ? fmtSignedPct(oneYear) : "—"}
        </div>
      </div>

      <div className="ihero__fact ihero__fact--f2">
        <div className="ihero__fact-label">
          <span className="ihero-desk">SINCE LAUNCH · {launchYear}</span>
          <span className="ihero-mob">SINCE {launchYear}</span>
        </div>
        <div className="ihero__fact-value">
          {sinceLaunch !== null ? `×${sinceLaunch.toFixed(2)}` : "—"}
        </div>
      </div>

      <div className="ihero__fact ihero__fact--f3">
        <div className="ihero__fact-label">TYPICAL DAY</div>
        <div className="ihero__fact-value">
          {severity ? fmtPlusMinusPct(severity.typicalMovePercent) : "—"}
        </div>
      </div>

      <div className="ihero__fact ihero__fact--f4">
        <div className="ihero__fact-label">
          <span className="ihero-desk">52-WEEK RANGE</span>
          <span className="ihero-mob">52-WK RANGE</span>
        </div>
        <div className="ihero__fact-value ihero__fact-value--range">
          {rangeLabel}
        </div>
        {hasRange && (
          <div className="ihero__trackwrap">
            <FiftyTwoTrack
              price={quote.price}
              low={low}
              high={high}
              lowMonth={lowMonth}
            />
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Phone-only facts grid, rendered by HomeClient between the conditions
 * band and the chart — the 3a mobile artboard's module order. Hidden at
 * ≥640px, where the facts live in the hero column above.
 */
export function HeroFactsMobile({
  data,
  severity,
}: {
  data: VeqtApiResponse | null;
  severity: SeverityReading | null;
}) {
  const historical = data?.historical ?? EMPTY_HISTORY;
  const quote = data?.quote ?? null;
  if (!quote) return null;
  return (
    <div className="ihero__facts ihero__facts--mobile">
      <FactsRows historical={historical} quote={quote} severity={severity} />
      <HeroStyles />
    </div>
  );
}

/* ── Loading state — ink-tint bars matching the layout, no spinners ── */

function HeroSkeleton() {
  return (
    <section className="ihero" aria-busy="true" aria-label="Loading price">
      <div className="ihero__main">
        <div className="ihero-skel" style={{ height: 10, width: 280, maxWidth: "80%" }} />
        <div className="ihero-skel ihero-skel--price" />
        <div className="ihero-skel" style={{ height: 31, width: 340, maxWidth: "90%", marginTop: 28 }} />
        <div className="ihero-skel" style={{ height: 41, marginTop: 26 }} />
      </div>
      <div className="ihero__facts ihero__facts--desk">
        {(["f1", "f2", "f3", "f4"] as const).map((f) => (
          <div key={f} className={`ihero__fact ihero__fact--${f}`}>
            <div className="ihero-skel" style={{ height: 9, width: 90 }} />
            <div className="ihero-skel" style={{ height: 28, width: 130, maxWidth: "100%", marginTop: 8 }} />
          </div>
        ))}
      </div>
      <HeroStyles />
    </section>
  );
}

/* ── Helpers ── */

const EMPTY_HISTORY: HistoricalDataPoint[] = [];

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

/** "0.20%" — effective MER from the fund registry. */
const MER_LABEL = `${FUNDS["VEQT.TO"].mer.toFixed(2)}%`;

/**
 * Count consecutive most-recent daily gains (or, honestly, losses when the
 * latest sessions are red) from successive closes. Flat closes ride with
 * the green side, matching the severity module's "flat counts as up".
 */
function computeStreak(
  historical: readonly HistoricalDataPoint[]
): { count: number; dir: "GREEN" | "RED" } | null {
  if (historical.length < 2) return null;
  const lastDiff =
    historical[historical.length - 1].close -
    historical[historical.length - 2].close;
  const dir = lastDiff < 0 ? "RED" : "GREEN";
  let count = 0;
  for (let i = historical.length - 1; i >= 1; i -= 1) {
    const diff = historical[i].close - historical[i - 1].close;
    if (dir === "GREEN" ? diff >= 0 : diff < 0) count += 1;
    else break;
  }
  return { count, dir };
}

/* ── Styles — values from the 3a artboards (see handoff README §1.2/§2) ──
 * Shared by the live hero and its skeleton via `style jsx global` with a
 * unique `.ihero*` prefix — the codebase pattern for multi-return modules
 * (mirrors the old `.heroC*` / RegionGrid's `.ledger*`). */

function HeroStyles() {
  return (
    <style jsx global>{`
  .ihero {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 48px;
    align-items: start;
    padding-top: 34px;
    font-family: var(--ins-font);
    color: var(--ins-ink);
  }
  .ihero-mob {
    display: none;
  }
  .ihero__main {
    min-width: 0;
  }
  .ihero__eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ins-gray-600);
  }
  .ihero__pricerow {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    margin-top: 16px;
  }
  .ihero__price {
    font-size: 196px;
    font-weight: 700;
    letter-spacing: -0.05em;
    line-height: 0.78;
    color: var(--ins-ink);
    font-variant-numeric: tabular-nums;
    animation: ins-fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) 0.1s both;
  }
  .ihero__cur {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-top: 10px;
  }
  .ihero__chiprow {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 28px;
  }
  .ihero__chip {
    background: var(--ins-signal);
    color: #ffffff;
    padding: 7px 14px;
    border-radius: 3px;
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
    animation: ins-tickPop 0.5s ease 0.5s both;
    white-space: nowrap;
  }
  /* CAPTION, not a label — a sentence fragment explaining the chip. Turn 8
     took it out of caps (was 10.5px / 0.18em uppercase) and into sentence
     case at the caption size; the chip beside it keeps the shouting. */
  .ihero__meta {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--ins-gray-600);
    font-variant-numeric: tabular-nums;
  }
  .ihero__micro {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 28px;
    margin-top: 26px;
    padding-top: 14px;
    border-top: 1px solid var(--ins-ink);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ins-gray-600);
    font-variant-numeric: tabular-nums;
  }
  .ihero__micro b {
    color: var(--ins-ink);
    font-weight: 700;
  }
  /* The distribution fact is a link into /distributions — same typography as
     its sibling spans; on hover the value takes a 2px ink underline. */
  .ihero__micro-link {
    color: inherit;
    text-decoration: none;
  }
  .ihero__micro-link:hover b {
    border-bottom: 2px solid var(--ins-ink);
    padding-bottom: 1px;
  }
  .ihero__facts {
    display: flex;
    flex-direction: column;
  }
  .ihero__fact {
    padding: 12px 0 16px;
  }
  .ihero__fact--f1 {
    border-top: 3px solid var(--ins-rule-strong);
  }
  .ihero__fact--f2,
  .ihero__fact--f3,
  .ihero__fact--f4 {
    border-top: 1px solid var(--ins-ink);
  }
  .ihero__fact--f4 {
    border-bottom: 1px solid var(--ins-ink);
  }
  .ihero__fact-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ins-gray-600);
  }
  .ihero__fact-value {
    font-size: 30px;
    font-weight: 600;
    margin-top: 4px;
    color: var(--ins-ink);
    font-variant-numeric: tabular-nums;
  }
  .ihero__fact-value--range {
    font-size: 24px;
  }
  .ihero__fact-value.is-neg {
    color: var(--ins-signal);
  }
  .ihero-skel {
    background: rgba(17, 17, 17, 0.06);
  }
  .ihero-skel--price {
    height: 154px;
    width: 72%;
    margin-top: 16px;
  }

  /* Mid breakpoint — facts drop below the price as a 2×2 grid. */
  @media (max-width: 959px) {
    .ihero {
      grid-template-columns: 1fr;
      gap: 26px;
    }
    .ihero__facts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 20px;
    }
    .ihero__fact {
      padding: 10px 0 14px;
    }
    .ihero__fact--f1,
    .ihero__fact--f2 {
      border-top: 2px solid var(--ins-ink);
    }
    .ihero__fact--f3,
    .ihero__fact--f4 {
      border-top: 1px solid var(--ins-ink);
    }
    .ihero__fact--f4 {
      border-bottom: none;
    }
  }

  /* The phone-only facts instance (after the conditions band) stays
     out of the document until the mobile deltas kick in. */
  .ihero__facts.ihero__facts--mobile {
    display: none;
  }

  /* Mobile deltas — 3a mobile artboard. */
  @media (max-width: 639px) {
    .ihero-desk {
      display: none;
    }
    .ihero-mob {
      display: inline;
    }
    /* Artboard order on phones: price → conditions → facts → chart.
       The in-hero column bows out; HomeClient's instance takes over. */
    .ihero__facts.ihero__facts--desk {
      display: none;
    }
    .ihero__facts.ihero__facts--mobile {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 20px;
    }
    .ihero {
      padding-top: 24px;
    }
    .ihero__eyebrow {
      font-size: 10px;
      letter-spacing: 0.2em;
    }
    .ihero__pricerow {
      margin-top: 14px;
    }
    .ihero__price {
      font-size: 96px;
      line-height: 0.8;
    }
    .ihero__cur {
      display: none;
    }
    .ihero__chiprow {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      margin-top: 18px;
    }
    .ihero__chip {
      padding: 6px 12px;
      font-size: 11.5px;
    }
    .ihero__meta {
      font-size: 12px;
    }
    .ihero__meta-change {
      display: none;
    }
    .ihero__micro {
      display: none;
    }
    .ihero__fact-label {
      font-size: 10px;
      letter-spacing: 0.14em;
    }
    .ihero__fact-value,
    .ihero__fact-value--range {
      font-size: 22px;
      margin-top: 3px;
    }
    .ihero__trackwrap {
      display: none;
    }
    .ihero-skel--price {
      height: 77px;
      width: 90%;
      margin-top: 14px;
    }
  }
    `}</style>
  );
}
