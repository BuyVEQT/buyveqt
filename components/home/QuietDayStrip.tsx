"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { HistoricalDataPoint, VeqtQuote } from "@/lib/types";
import type { SeverityReading, WeatherState } from "@/lib/severity";
import { fmtInt, fmtMoney, fmtPlusMinusPct, fmtPrice } from "@/lib/instrument-format";

/**
 * The Quiet Day strip — artboard 8a, the calm-day retention module.
 *
 * A quiet session is the product working, and the page used to say
 * nothing about it. This strip fills that silence with the only two
 * things a calm tape actually earns: a line in the house voice, and the
 * almanac — what this same calendar date did in a past year, and how
 * often VEQT closes up at all.
 *
 * RENDER GATE: calm / bright / breezy only. From surge upward the
 * ConditionsBand's weather presence is the story and this strip stands
 * down — the page never runs two "here's what today means" modules at
 * once. Editions (rally / gale) are P98 states, so the strip is never on
 * screen while the page is inverted; the warm paper below can be literal.
 *
 * Every figure is derived from the ALL series HomeClient already holds.
 * No fetch, no clock: "today" is the last completed session on the tape,
 * which makes the daily rotation and the almanac math identical on the
 * server and the client.
 */

interface QuietDayStripProps {
  severity: SeverityReading | null;
  history: HistoricalDataPoint[];
  quote: VeqtQuote | null;
}

/** The states that earn the strip. Anything louder belongs to the band. */
const QUIET_STATES: readonly WeatherState[] = ["calm", "bright", "breezy"];

/**
 * The rotation pool. House register: flat, declarative, no exclamation,
 * no advice. Each line has to be true on any quiet day — none of them
 * claims a direction, a number, or a reason.
 */
const LINES = [
  "Nothing happened today. That's the product working.",
  "A quiet tape is what compounding sounds like.",
  "No news is the base case, not the exception.",
  "The market opened, did its job, and closed.",
  "Most sessions look like this one. That's the thesis.",
  "Boring is the feature. You are already holding it.",
  "Another day on the record. Nothing was required of you.",
] as const;

/** Day-of-year from a "YYYY-MM-DD" session date — UTC math, no clock. */
function dayOfYear(iso: string): number {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return 0;
  return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86_400_000);
}

const WHAT_IF = 10_000;

export default function QuietDayStrip({
  severity,
  history,
  quote,
}: QuietDayStripProps) {
  /** The session the strip speaks for — the tape's own last date. */
  const sessionIso = useMemo(() => {
    const fromQuote = quote?.latestTradingDay;
    if (fromQuote && /^\d{4}-\d{2}-\d{2}/.test(fromQuote)) return fromQuote.slice(0, 10);
    if (history.length > 0) return history[history.length - 1].date.slice(0, 10);
    return null;
  }, [quote, history]);

  /**
   * The same calendar date in the OLDEST past year that actually traded.
   * Exact month-day only: "on this day" has to mean this day, so a date
   * that fell on a weekend or a holiday in every prior year suppresses
   * the line rather than drifting to a neighbouring session.
   */
  const onThisDay = useMemo(() => {
    if (!sessionIso || history.length < 2) return null;
    const lastClose = history[history.length - 1].close;
    if (!Number.isFinite(lastClose) || lastClose <= 0) return null;
    const monthDay = sessionIso.slice(5, 10);
    const thisYear = Number(sessionIso.slice(0, 4));

    // Ascending series, so `find` returns the OLDEST year that traded on
    // this calendar date.
    const match = history.find(
      (p) =>
        Number(p.date.slice(0, 4)) < thisYear &&
        p.date.slice(5, 10) === monthDay &&
        Number.isFinite(p.close) &&
        p.close > 0
    );
    if (!match) return null;
    return {
      year: Number(match.date.slice(0, 4)),
      close: match.close,
      value: (WHAT_IF * lastClose) / match.close,
    };
  }, [history, sessionIso]);

  /** Share of every session since inception that closed up. */
  const almanac = useMemo(() => {
    let up = 0;
    let n = 0;
    for (let i = 1; i < history.length; i += 1) {
      const prev = history[i - 1].close;
      const curr = history[i].close;
      if (prev > 0 && Number.isFinite(prev) && Number.isFinite(curr)) {
        n += 1;
        if (curr >= prev) up += 1;
      }
    }
    if (n === 0) return null;
    return { pct: Math.round((up / n) * 100), sessions: n };
  }, [history]);

  const line = LINES[sessionIso ? dayOfYear(sessionIso) % LINES.length : 0];

  // Gate last so the hooks above always run in the same order.
  if (!severity || !QUIET_STATES.includes(severity.state)) return null;

  return (
    <section className="quiet" aria-label="The quiet day">
      <div className="cell cell--state">
        <div className="microlabel">THE QUIET DAY</div>
        <div className="state">
          {severity.state.toUpperCase()} · {fmtPlusMinusPct(severity.typicalMovePercent)}
        </div>
      </div>

      <div className="cell cell--copy">
        <p className="line">{line}</p>
        <div className="caps">
          {onThisDay && (
            <span className="cap">
              On this day · {onThisDay.year} — closed ${fmtPrice(onThisDay.close)} · that
              $10K is {fmtMoney(onThisDay.value)} now
            </span>
          )}
          {almanac && (
            <span className="cap">
              Almanac — {almanac.pct}% of all {fmtInt(almanac.sessions)} sessions closed up
            </span>
          )}
        </div>
      </div>

      <div className="cell cell--cta">
        <Link href="/weekly" className="dispatch">
          TODAY&rsquo;S DISPATCH →
        </Link>
      </div>

      <style jsx>{`
        .quiet {
          display: grid;
          grid-template-columns: 220px 1fr auto;
          align-items: center;
          border: 1px solid var(--ins-ink);
          /* The home page's single warm band (Turn 8 allows one per page,
             and nothing else on Home claims it). The token has no ink-
             edition override, which is harmless here: this strip only
             prints on calm/bright/breezy days and editions are P98 states,
             so the two are never on screen together. */
          background: var(--ins-paper-warm);
          color: var(--ins-ink);
          font-family: var(--ins-font);
          font-variant-numeric: tabular-nums;
        }
        .cell {
          padding: 18px 22px;
          min-width: 0;
        }
        .cell--copy {
          padding: 18px 24px;
          border-left: 1px solid var(--ins-hair);
        }
        .cell--cta {
          align-self: stretch;
          display: flex;
          align-items: center;
          border-left: 1px solid var(--ins-hair);
          padding: 0;
        }

        .microlabel {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-gray-600);
        }
        .state {
          margin-top: 5px;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -0.015em;
        }

        .line {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        .caps {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 26px;
          margin-top: 8px;
        }
        /* Explanatory caption — sentence case, 12px, utility gray. */
        .cap {
          font-size: 12px;
          font-weight: 500;
          line-height: 1.45;
          color: var(--ins-gray-600);
        }

        .quiet :global(.dispatch) {
          display: flex;
          align-items: center;
          min-height: 44px;
          height: 100%;
          padding: 0 22px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: var(--ins-ink);
          text-decoration: none;
          white-space: nowrap;
        }
        .quiet :global(.dispatch:hover) {
          background: var(--ins-ink);
          color: var(--ins-paper-warm);
        }

        /* ── Mobile (26-ref): one column, the state reading pinned right
              of the label, the dispatch as a ruled 44px row. ── */
        @media (max-width: 640px) {
          .quiet {
            grid-template-columns: 1fr;
            align-items: stretch;
          }
          .cell {
            padding: 14px 16px;
          }
          .cell--state {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            padding-bottom: 0;
          }
          .microlabel {
            font-size: 10px;
            letter-spacing: 0.16em;
          }
          .state {
            margin-top: 0;
            font-size: 12px;
          }
          .cell--copy {
            border-left: none;
            padding: 8px 16px 14px;
          }
          .line {
            font-size: 14px;
            line-height: 1.4;
          }
          .caps {
            gap: 4px;
            flex-direction: column;
          }
          .cell--cta {
            border-left: none;
            border-top: 1px solid var(--ins-hair);
            margin: 0 16px;
            padding: 0;
          }
          .quiet :global(.dispatch) {
            padding: 0;
            font-size: 10px;
            letter-spacing: 0.12em;
          }
        }
      `}</style>
    </section>
  );
}
