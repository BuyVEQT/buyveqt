"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { HistoricalDataPoint, VeqtQuote } from "@/lib/types";
import {
  recentSessionWeather,
  type SessionWeather,
  type SeverityReading,
  type WeatherState,
} from "@/lib/severity";
import {
  fmtInt,
  fmtPlusMinusPct,
  fmtSignedPct,
  fmtWeekday,
  parseSessionDate,
} from "@/lib/instrument-format";
import { useMarketClock } from "@/lib/market-clock";
import WeatherGlyph from "./hero/WeatherGlyph";
import { useOnScreen } from "./useOnScreen";

/**
 * ConditionsBand — "The Instrument" weather module (README §1.3, §2, §3).
 *
 * 1px ink border box; inner grid `330px 1fr 330px` with ink dividers:
 *   Col 1  CONDITIONS — 84px state glyph + verdict word + state caption
 *   Col 2  SEVERITY   — ruler gauge, today's percentile against every
 *                       session since inception (role="meter")
 *   Col 3  THE WEEK   — five classified past sessions + dashed outlook
 * plus a full-width verdict rail stating what (not) to do.
 *
 * Breakpoints: ≤1100px the band wraps to two rows (cols 1+2 / col 3);
 * ≤640px it compacts per the mobile artboard (56px glyph beside the
 * word, 44px ruler with 0/50/100 ticks, full-width week grid, short
 * rail note). Loading (null severity) renders ink-tint skeleton bars.
 */

interface ConditionsBandProps {
  severity: SeverityReading | null;
  history: HistoricalDataPoint[];
  quote: VeqtQuote | null;
}

/**
 * Per-state caption under the verdict word — the 5a copy, set in sentence
 * case since Turn 8. These are full sentences, not labels: the band's
 * captions read, its micro-labels shout, and the two stopped sharing a
 * type treatment when the microtype floor came in.
 */
const CAPTIONS: Record<WeatherState, string> = {
  calm: "Fair weather over the markets.",
  bright: "A good day's work.",
  breezy: "A loud day. Not a story.",
  surge: "The market sprinted. You were aboard.",
  squall: "Take the umbrella. Skip the news.",
  rally: "A day for the almanac — the good kind.",
  gale: "The plan was built for this.",
};

/** "68" → "68TH", "71" → "71ST" — gauge marker label. */
function ordinalLabel(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}TH`;
  switch (n % 10) {
    case 1:
      return `${n}ST`;
    case 2:
      return `${n}ND`;
    case 3:
      return `${n}RD`;
    default:
      return `${n}TH`;
  }
}

/** Honest severity phrase per percentile band (gauge caption, sentence case). */
function severityPhrase(pct: number): string {
  if (pct < 50) return "Quieter than most sessions";
  if (pct <= 80) return "Louder than typical, a long way from rare";
  if (pct <= 90) return "Louder than most — still short of rare";
  if (pct < 98) return "Approaching rare — a handful a year";
  return "Rare — a few days per decade";
}

/** Full weekday name for week-caption copy — "Friday". */
function weekdayLong(iso: string): string {
  return parseSessionDate(iso).toLocaleDateString("en-CA", {
    weekday: "long",
  });
}

/**
 * One honest line under the week strip, derived from the classified
 * sessions. ≤60 chars, sentence case (it is a caption, not a label).
 * "Recovered" is only claimed when the next session actually regained
 * the drop.
 */
function weekCaption(sessions: SessionWeather[]): string {
  let loudDownIdx = -1;
  for (let i = sessions.length - 1; i >= 0; i -= 1) {
    const s = sessions[i].state;
    if (s === "squall" || s === "gale") {
      loudDownIdx = i;
      break;
    }
  }
  if (loudDownIdx >= 0) {
    const day = sessions[loudDownIdx];
    const word = day.state;
    if (loudDownIdx === sessions.length - 1) {
      return `A ${word} to close the week.`;
    }
    const next = sessions[loudDownIdx + 1];
    if (next.changePercent >= Math.abs(day.changePercent)) {
      return `${weekdayLong(day.date)}'s ${word} recovered in one session.`;
    }
    if (next.changePercent > 0) {
      return `${weekdayLong(day.date)}'s ${word} bounced the next session.`;
    }
    return `${weekdayLong(day.date)}'s ${word} is still on the tape.`;
  }

  const lastOf = (state: WeatherState): SessionWeather | undefined => {
    for (let i = sessions.length - 1; i >= 0; i -= 1) {
      if (sessions[i].state === state) return sessions[i];
    }
    return undefined;
  };

  const rally = lastOf("rally");
  if (rally) return `${weekdayLong(rally.date)}'s rally — one for the almanac.`;
  const surge = lastOf("surge");
  if (surge) return `${weekdayLong(surge.date)}'s surge led the week.`;
  const brightCount = sessions.filter((s) => s.state === "bright").length;
  if (brightCount >= 2) return `${brightCount} bright sessions this week.`;
  if (brightCount === 1) return "One bright session in a fair week.";
  if (sessions.some((s) => s.state === "breezy")) {
    return "A breeze or two, nothing more.";
  }
  return "A quiet week on the tape.";
}

/** Next trading weekday after the last session — the outlook cell. */
function nextTradingWeekday(lastIso: string): string {
  const d = parseSessionDate(lastIso);
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return fmtWeekday(d);
}

interface RailExtra {
  text: string;
  href?: string;
  red?: boolean;
}

/** State-driven verdict rail copy — verbatim per the README table. */
function railFor(
  state: WeatherState,
  pctFloor: number,
  upDownRatio: string
): { main: string; extra?: RailExtra; redSquare: boolean } {
  switch (state) {
    case "calm":
      return { main: "NOTHING REQUIRES ACTION", redSquare: false };
    case "bright":
      return {
        main: "NOTHING REQUIRES ACTION",
        extra: { text: `UP DAYS OUTNUMBER DOWN ${upDownRatio}` },
        redSquare: false,
      };
    case "breezy":
      return {
        main: "NOTHING REQUIRES ACTION",
        extra: { text: `${pctFloor}% OF SESSIONS SIT BELOW THIS` },
        redSquare: false,
      };
    case "surge":
      return {
        main: "NOTHING REQUIRES ACTION",
        extra: { text: "DON'T EXTRAPOLATE — σ CUTS BOTH WAYS" },
        redSquare: false,
      };
    case "squall":
      return {
        main: "STILL — NOTHING REQUIRES ACTION",
        extra: { text: "MEDIAN RECOVERY · 6 SESSIONS" },
        redSquare: true,
      };
    case "rally":
      return {
        main: "NOTHING TO DO — COMPOUNDING DID IT FOR YOU",
        extra: { text: "ARCHIVED →", href: "/almanac", red: true },
        redSquare: true,
      };
    case "gale":
      return {
        main: "DO NOTHING. ESPECIALLY TODAY.",
        extra: {
          text: "READ: WHAT TO DO WHEN IT'S DOWN →",
          href: "/learn/veqt-is-down",
          red: true,
        },
        redSquare: true,
      };
  }
}

/** Desktop ruler ticks — every 10%; majors at 0/50/100. */
const TICKS_DESKTOP = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
/** Mobile-only quarter ticks (majors 0/50/100 are shared). */
const TICKS_MOBILE_EXTRA = [25, 75];
const NUMERALS = [0, 25, 50, 75, 100];

export default function ConditionsBand({
  severity,
  history,
  quote,
}: ConditionsBandProps) {
  // Re-read every minute so the rail flips at the bell without a reload.
  // Null until the first client read — the band then keeps its open-market
  // copy, which is what it printed before this existed.
  const clock = useMarketClock();
  /** Non-null only while the exchange is shut — carries the next bell. */
  const closedClock = clock?.phase === "closed" ? clock : null;

  // Park the glyph's loops (raySpin / shimmer / halos / rain) and the red
  // marker pulse while the band is scrolled past.
  const { ref: bandRef, onScreen } = useOnScreen<HTMLElement>();

  const sessions = useMemo(
    () => recentSessionWeather(history ?? [], 5),
    [history]
  );

  /** "58:42" — real up:down session ratio, normalized to 100. */
  const upDownRatio = useMemo(() => {
    let up = 0;
    let total = 0;
    for (let i = 1; i < (history?.length ?? 0); i += 1) {
      const prev = history[i - 1].close;
      const curr = history[i].close;
      if (prev > 0 && Number.isFinite(prev) && Number.isFinite(curr)) {
        total += 1;
        if (curr >= prev) up += 1;
      }
    }
    if (total === 0) return "—";
    const upShare = Math.round((up / total) * 100);
    return `${upShare}:${100 - upShare}`;
  }, [history]);

  /* Let the live quote win in the TODAY cell when it's the same session
     as the last completed row, so the strip agrees with the hero chip. */
  const weekRows = useMemo(() => {
    if (sessions.length === 0) return sessions;
    const last = sessions[sessions.length - 1];
    const quoteDay = (quote?.latestTradingDay ?? quote?.lastUpdated)?.slice(
      0,
      10
    );
    if (severity && quoteDay && quoteDay === last.date.slice(0, 10)) {
      return [
        ...sessions.slice(0, -1),
        {
          ...last,
          changePercent: severity.todayChangePercent,
          state: severity.state,
        },
      ];
    }
    return sessions;
  }, [sessions, severity, quote]);

  // Derived display values, null-safe. NOTE: the band's JSX must stay
  // lexically inside this component's return — styled-jsx does not add
  // its scope class to JSX built in nested closures (an earlier IIFE
  // version rendered completely unstyled).
  const state: WeatherState = severity?.state ?? "calm";
  const word = `${state.toUpperCase()}.`;
  // §3: verdict words render at 46–54px — six-letter states take the
  // small end so they fit the 330px column beside the 84px glyph.
  const wordLong = state.length >= 6;
  const pct = (severity?.percentileRank ?? 0) * 100;
  const pctFloor = Math.floor(pct);
  const marker = ordinalLabel(pctFloor);
  const markerLeft = severity?.markerPosition ?? 0;
  const markerRed = state === "squall" || state === "gale";
  const sigma = (severity?.sigmaRatio ?? 0).toFixed(1);
  const typical = fmtPlusMinusPct(severity?.typicalMovePercent ?? 0);
  const rail = railFor(state, pctFloor, upDownRatio);
  const lastDate =
    weekRows.length > 0 ? weekRows[weekRows.length - 1].date : null;

  return (
    <section
      ref={bandRef}
      className={`band${severity ? "" : " band--loading"}`}
      data-run={onScreen ? "true" : "false"}
      aria-busy={severity ? undefined : true}
      aria-label="Conditions — today's weather"
    >
      {severity ? (
        <>
          <div className="cols">
            {/* ── Col 1 · desktop — CONDITIONS ──
                The weather cell click-throughs to the almanac via a
                stretched overlay link (a Link can't carry the styled-jsx
                scope class, so the cell stays a div). */}
            <div className="cell col1 col1--desktop">
              <div className="microlabel">CONDITIONS · TODAY&rsquo;S WEATHER</div>
              <div className="verdictRow">
                <WeatherGlyph state={state} size={84} />
                <span
                  className={`word${wordLong ? " word--long" : ""}${
                    state === "rally" ? " word--red" : ""
                  }`}
                >
                  {word}
                </span>
              </div>
              <div className="caption caption--c1">{CAPTIONS[state]}</div>
              <Link
                href="/almanac"
                className="colLink"
                aria-label="See the full almanac"
              />
            </div>

            {/* ── Col 1 · mobile compact ── */}
            <div className="cell col1 col1--mobile">
              <WeatherGlyph state={state} size={56} />
              <div>
                <div className="microlabel microlabel--m">CONDITIONS</div>
                <div
                  className={`word word--m${state === "rally" ? " word--red" : ""}`}
                >
                  {word}
                </div>
                <div className="caption caption--m">
                  σ {sigma} · {CAPTIONS[state]}
                </div>
              </div>
              <Link
                href="/almanac"
                className="colLink"
                aria-label="See the full almanac"
              />
            </div>

            {/* ── Col 2 — SEVERITY ruler gauge ── */}
            <div className="cell col2">
              <div className="microlabel microlabel--hideM">
                SEVERITY · TODAY AGAINST EVERY SESSION SINCE{" "}
                {severity.sampleFromYear}
              </div>
              <div
                className="gauge"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pctFloor}
                aria-label={`Today's ${fmtSignedPct(
                  severity.todayChangePercent
                )} move ranks at the ${pctFloor}th percentile of ${fmtInt(
                  severity.sampleSize
                )} sessions since ${severity.sampleFromYear}`}
              >
                <span className="baseline" aria-hidden="true" />
                <span className="rareZone" aria-hidden="true" />
                <span className="rareLabel" aria-hidden="true">
                  RARE
                </span>
                {TICKS_DESKTOP.map((p) => (
                  <span
                    key={p}
                    aria-hidden="true"
                    className={`tick ${
                      p === 0 || p === 50 || p === 100
                        ? "tick--major"
                        : "tick--minorD"
                    }${p === 100 ? " tick--end" : ""}`}
                    style={{ left: `${p}%` }}
                  />
                ))}
                {TICKS_MOBILE_EXTRA.map((p) => (
                  <span
                    key={p}
                    aria-hidden="true"
                    className="tick tick--minorM"
                    style={{ left: `${p}%` }}
                  />
                ))}
                {NUMERALS.map((p) => (
                  <span
                    key={p}
                    aria-hidden="true"
                    className={`num${p === 0 ? " num--start" : ""}${
                      p === 100 ? " num--end" : ""
                    }${p === 25 || p === 75 ? " num--hideM" : ""}`}
                    style={{ left: `${p}%` }}
                  >
                    {p}
                  </span>
                ))}
                <span
                  className={`marker${markerRed ? " marker--red" : ""}`}
                  style={{ left: `${markerLeft}%` }}
                  aria-hidden="true"
                >
                  <span className="markerLabel">{marker}</span>
                  <span className="markerBar" />
                </span>
              </div>
              <div className="caption caption--hideM">
                σ {sigma} · {severityPhrase(pct)} · of{" "}
                {fmtInt(severity.sampleSize)} sessions
              </div>
            </div>

            {/* ── Col 3 — THE WEEK + OUTLOOK ── */}
            <div className="cell col3">
              <div className="microlabel microlabel--hideM">
                THE WEEK + OUTLOOK
              </div>
              {weekRows.length > 0 && (
                <>
                  <div className="week">
                    {weekRows.map((s, i) => {
                      const isToday = i === weekRows.length - 1;
                      return (
                        <div
                          key={s.date}
                          className={`day${isToday ? " day--today" : ""}`}
                        >
                          <span className="dayName">
                            {fmtWeekday(parseSessionDate(s.date))}
                          </span>
                          <WeatherGlyph
                            state={s.state}
                            size={18}
                            animated={false}
                          />
                          <span
                            className={`dayVal${
                              s.changePercent < 0 ? " dayVal--neg" : ""
                            }`}
                          >
                            {fmtSignedPct(s.changePercent)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="day day--outlook">
                      <span className="dayName">
                        {lastDate ? nextTradingWeekday(lastDate) : "—"}
                      </span>
                      <span className="outVal">{typical}</span>
                      <span className="outTag">OUTLOOK</span>
                    </div>
                  </div>
                  <div className="caption caption--hideM">
                    {weekCaption(weekRows)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Verdict rail ── */}
          <div className="rail">
            <span
              className={`sq${rail.redSquare ? " sq--red" : ""}`}
              aria-hidden="true"
            />
            <span className="railCopy">{rail.main}</span>
            {rail.extra && (
              <>
                <span className="railSep" aria-hidden="true">
                  ·
                </span>
                {rail.extra.href ? (
                  <Link href={rail.extra.href} className="railExtra railExtra--red">
                    {rail.extra.text}
                  </Link>
                ) : (
                  <span
                    className={`railExtra${
                      rail.extra.red ? " railExtra--red" : ""
                    }`}
                  >
                    {rail.extra.text}
                  </span>
                )}
              </>
            )}
            {/* Right-hand note. Two strings, two type roles since Turn 8:
                the desktop copy is a SENTENCE, so it reads as a caption
                (sentence case, 12px); the mobile copy is a short LABEL
                PHRASE with no verb, so it keeps caps + tracking at the
                10px floor. The desktop copy keeps the outlook prefix (68
                chars vs. the open copy's 74, so the rail's visual width
                doesn't grow); mobile's box can't carry "reopens" on top of
                the weekday, so the time stands in for it. */}
            <span className="railNote railNote--desktop">
              {closedClock ? (
                <>
                  Tomorrow&rsquo;s outlook: {typical} · markets closed — reopens{" "}
                  {closedClock.reopensLabel}
                </>
              ) : (
                <>
                  Tomorrow&rsquo;s outlook: {typical} — a typical day. Next
                  reading at the 4 pm bell.
                </>
              )}
            </span>
            <span className="railNote railNote--mobile">
              {closedClock
                ? `MARKETS CLOSED · ${closedClock.reopensLabelShort}`
                : "NEXT READING · 4 PM BELL"}
            </span>
          </div>
        </>
      ) : (
        /* ── Loading skeleton — ink-tint bars, no spinners ── */
        <>
      <div className="cols" aria-hidden="true">
        <div className="cell col1 skCell">
          <span className="skl" style={{ width: "58%" }} />
          <span className="skl skl--glyph" />
          <span className="skl" style={{ width: "74%" }} />
        </div>
        <div className="cell col2 skCell">
          <span className="skl" style={{ width: "64%" }} />
          <span className="skl skl--gauge" />
          <span className="skl" style={{ width: "82%" }} />
        </div>
        <div className="cell col3 skCell">
          <span className="skl" style={{ width: "44%" }} />
          <span className="skl skl--week" />
          <span className="skl" style={{ width: "68%" }} />
        </div>
      </div>
      <div className="rail" aria-hidden="true">
        <span className="skl" style={{ width: "180px" }} />
        <span className="skl railSkl" style={{ width: "260px" }} />
      </div>
        </>
      )}

      <style jsx>{`
        .band {
          border: 1px solid var(--ins-ink);
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .cols {
          display: grid;
          grid-template-columns: 330px 1fr 330px;
        }
        .cell {
          padding: 18px 22px;
          min-width: 0;
        }
        .col1--desktop,
        .col2 {
          border-right: 1px solid var(--ins-ink);
        }
        .col2 {
          display: flex;
          flex-direction: column;
        }
        .col1--mobile {
          display: none;
        }
        .col1 {
          position: relative;
        }
        .band :global(.colLink) {
          position: absolute;
          inset: 0;
        }
        /* Hover affordance for the weather-cell-as-link. */
        .col1:hover .word {
          text-decoration: underline;
          text-decoration-thickness: 3px;
          text-underline-offset: 6px;
        }

        /* Micro-labels are TRUE LABELS — column heads. Caps + tracking,
           at the 10px floor. */
        .microlabel {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        /* Captions are SENTENCES — the state line, the gauge reading and
           the week summary. Turn 8 took all three out of 9.5px caps and
           into 12px sentence case; the strings themselves are authored in
           sentence case now, so there is no text-transform left to turn
           σ into Σ (which is why the two inline override spans are gone). */
        .caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          line-height: 1.45;
          color: var(--ins-gray-600);
        }

        /* ── Col 1 ── */
        .verdictRow {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 12px;
        }
        .word {
          font-size: 54px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 0.9;
          white-space: nowrap;
        }
        .word--long {
          font-size: 46px;
        }
        .word--red {
          color: var(--ins-signal);
        }
        .caption--c1 {
          margin-top: 14px;
        }

        /* ── Col 2 · ruler gauge ── */
        .gauge {
          position: relative;
          height: 58px;
          margin-top: auto;
        }
        .baseline {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 16px;
          height: 1px;
          background: var(--ins-ink);
        }
        .rareZone {
          position: absolute;
          left: 90%;
          right: 0;
          bottom: 15px;
          height: 3px;
          background: var(--ins-signal);
        }
        .rareLabel {
          position: absolute;
          left: 95%;
          bottom: 24px;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--ins-signal);
        }
        .tick {
          position: absolute;
          bottom: 16px;
          width: 1px;
          background: var(--ins-ink);
        }
        .tick--major {
          height: 11px;
          opacity: 0.6;
        }
        .tick--minorD {
          height: 7px;
          opacity: 0.45;
        }
        .tick--minorM {
          display: none;
          height: 6px;
          opacity: 0.45;
        }
        .tick--end {
          transform: translateX(-100%);
        }
        .num {
          position: absolute;
          bottom: 0;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 600;
          color: var(--ins-gray-600);
        }
        .num--start {
          transform: none;
        }
        .num--end {
          transform: translateX(-100%);
        }
        /* left POSITIONS the marker (set inline, as a percentage of the
           gauge); translateX(-50%) centres it on that point. The entrance
           is transform-only — ins-gaugeIn used to animate left, which
           relayouts the gauge every frame for 1.3s on first paint. The
           keyframe now composes both jobs into one transform:
             from translateX(calc(-50% - 40px)) to translateX(-50%)
           so if this centring value ever changes, the "to" frame in
           globals.css has to change with it. Mobile only overrides
           bottom/gap below, never the transform, so one keyframe covers
           both variants. */
        .marker {
          position: absolute;
          bottom: 10px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          animation: ins-gaugeIn 1.3s cubic-bezier(0.3, 0.8, 0.3, 1) 0.5s both;
        }
        .markerLabel {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .markerBar {
          width: 3px;
          height: 20px;
          background: var(--ins-ink);
        }
        .marker--red {
          animation: ins-gaugeIn 1.3s cubic-bezier(0.3, 0.8, 0.3, 1) 0.5s both,
            ins-pulse 2.2s ease-in-out 1.8s infinite;
        }
        /* ── Off-screen parking (see useOnScreen) ──
           The band's two infinite loops stop repainting once it scrolls
           away: the hero glyph's spin/shimmer/halo/rain and the red
           marker's pulse. WeatherGlyph sets its animations inline on its
           own elements, which carry *its* styled-jsx scope, so the col-1
           reach needs :global — the same shape the reduced-motion block
           at the bottom of this sheet uses. (animation-play-state does
           not inherit, hence the descendant selector rather than a rule
           on the wrapper.)

           The marker stacks two animations in one shorthand — entrance,
           then pulse — so its play-state list is positional: the one-shot
           ins-gaugeIn keeps running, only the infinite pulse parks. Plain
           .marker carries the entrance alone and is left with it. The
           week strip's minis render animated={false}, so nothing there
           needs parking. */
        .band[data-run="false"] .col1 :global(*) {
          animation-play-state: paused;
        }
        .band[data-run="false"] .marker--red {
          animation-play-state: running, paused;
        }
        .marker--red .markerLabel {
          color: var(--ins-signal);
        }
        .marker--red .markerBar {
          background: var(--ins-signal);
        }
        .col2 .caption {
          margin-top: 10px;
        }

        /* ── Col 3 · week strip ── */
        /* Five equal session cells plus a content-sized track for the
           outlook. Six equal columns used to be fine when the outlook tag
           was 7px; at the 10px floor "OUTLOOK" needs ~49px and a 43px cell
           would have overflowed into its neighbour. The five day cells
           give up ~1px each and nothing else moves. */
        .week {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
          gap: 5px;
          margin-top: 12px;
        }
        .day {
          border: 1px solid var(--ins-hair);
          padding: 8px 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          min-width: 0;
        }
        .day--today {
          border: 2px solid var(--ins-ink);
        }
        .day--today .dayName {
          font-weight: 800;
          color: var(--ins-ink);
        }
        .day--outlook {
          /* Pinned to the last track so a short history (fewer than five
             classified sessions) can't slide it into a 1fr cell. */
          grid-column: -2 / -1;
          border: 1px dashed var(--ins-hair);
          gap: 4px;
        }
        .dayName {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--ins-gray-600);
        }
        .dayVal {
          font-size: 10px;
          font-weight: 700;
        }
        .dayVal--neg {
          color: var(--ins-signal);
        }
        .outVal {
          font-size: 11px;
          font-weight: 700;
          margin-top: 3px;
        }
        .outTag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          white-space: nowrap;
          color: var(--ins-gray-600);
        }
        .col3 .caption {
          margin-top: 12px;
        }

        /* ── Verdict rail ── */
        .rail {
          border-top: 1px solid var(--ins-ink);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          padding: 11px 22px;
        }
        .sq {
          width: 9px;
          height: 9px;
          background: var(--ins-ink);
          flex: none;
        }
        .sq--red {
          background: var(--ins-signal);
        }
        .railCopy {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          /* No text-transform: rail copy is pre-uppercased in railFor()
             and a transform would print σ as Σ (surge copy). */
        }
        .railSep {
          font-size: 11px;
          font-weight: 800;
          color: var(--ins-gray-600);
        }
        .rail :global(.railExtra) {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          /* No text-transform — pre-uppercased copy; σ must stay σ. */
          color: var(--ins-gray-600);
        }
        .rail :global(.railExtra--red) {
          color: var(--ins-signal);
          font-weight: 800;
          text-decoration: none;
        }
        .rail :global(a.railExtra--red:hover) {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        /* Desktop note = caption (a sentence). The mobile override below
           puts the short label phrase back into caps. */
        .railNote {
          margin-left: auto;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
        }
        .railNote--mobile {
          display: none;
        }

        /* ── Loading skeleton ── */
        .skCell {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .skl {
          display: block;
          height: 9px;
          background: var(--ins-track-soft);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }
        .skl--glyph {
          height: 84px;
          width: 84px;
        }
        .skl--gauge {
          height: 58px;
          width: 100%;
          margin-top: auto;
        }
        .skl--week {
          height: 64px;
          width: 100%;
        }
        .railSkl {
          margin-left: auto;
        }

        /* ── Mid band (≤1100px): two rows — cols 1+2 / col 3 ── */
        @media (max-width: 1100px) {
          .cols {
            grid-template-columns: 330px 1fr;
          }
          .col2 {
            border-right: none;
          }
          .col3 {
            grid-column: 1 / -1;
            border-top: 1px solid var(--ins-ink);
          }
        }

        /* ── Mobile compact band (≤640px) ── */
        @media (max-width: 640px) {
          .cols {
            grid-template-columns: 1fr;
          }
          .col1--desktop {
            display: none;
          }
          .col1--mobile {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px 6px;
            border-right: none;
          }
          .microlabel--m {
            font-size: 10px;
            letter-spacing: 0.16em;
          }
          .word--m {
            font-size: 31px;
            letter-spacing: -0.02em;
            line-height: 1;
            margin-top: 3px;
          }
          .caption--m {
            font-size: 12px;
            margin-top: 5px;
          }
          .microlabel--hideM,
          .caption--hideM {
            display: none;
          }
          .col2 {
            padding: 4px 16px 12px;
          }
          .gauge {
            height: 44px;
            margin-top: 0;
          }
          .baseline {
            bottom: 12px;
          }
          .rareZone {
            bottom: 11px;
          }
          .rareLabel {
            bottom: 19px;
            font-size: 10px;
            letter-spacing: 0.06em;
          }
          .tick {
            bottom: 12px;
          }
          .tick--major {
            height: 9px;
          }
          .tick--minorD {
            display: none;
          }
          .tick--minorM {
            display: block;
          }
          .num {
            font-size: 10px;
          }
          .num--hideM {
            display: none;
          }
          .marker {
            bottom: 7px;
            gap: 2px;
          }
          .markerLabel {
            font-size: 10px;
            letter-spacing: 0.06em;
          }
          .markerBar {
            height: 15px;
          }
          .col3 {
            padding: 4px 16px 14px;
            border-top: none;
          }
          .week {
            gap: 4px;
            margin-top: 0;
          }
          .day {
            padding: 6px 2px;
            gap: 4px;
          }
          .day :global(svg) {
            width: 16px;
            height: 16px;
          }
          .dayName {
            font-size: 10px;
            letter-spacing: 0.02em;
          }
          .dayVal {
            font-size: 10px;
          }
          .outVal {
            font-size: 10px;
            margin-top: 2px;
          }
          .outTag {
            font-size: 10px;
            letter-spacing: 0.02em;
          }
          .rail {
            gap: 10px;
            padding: 9px 16px;
          }
          .sq {
            width: 7px;
            height: 7px;
          }
          .railCopy {
            font-size: 10px;
            letter-spacing: 0.1em;
          }
          /* Informational extras drop on mobile; the rally/gale red
             extras (ARCHIVED / READ links) stay — they're the action. */
          .railSep,
          .rail :global(.railExtra) {
            display: none;
          }
          .rail :global(.railExtra--red) {
            display: inline;
            font-size: 10px;
            letter-spacing: 0.08em;
          }
          .railNote--desktop {
            display: none;
          }
          /* Short label phrase, not a sentence — back to caps at the
             floor. 12px sentence case here would push the note onto its
             own line in a band that is already the page's densest. */
          .railNote--mobile {
            display: block;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .skl--glyph {
            height: 56px;
            width: 56px;
          }
          .skl--gauge {
            height: 44px;
          }
        }

        /* Reduced motion — kill loops and entrances, show end states.
           Belt-and-braces with the .ins-root/.ins-shell rule in globals. */
        @media (prefers-reduced-motion: reduce) {
          .band,
          .band :global(*) {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
