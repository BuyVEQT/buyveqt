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
import WeatherGlyph from "./hero/WeatherGlyph";

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

/** Per-state caption under the verdict word — verbatim from the 5a cards. */
const CAPTIONS: Record<WeatherState, string> = {
  calm: "FAIR WEATHER OVER THE MARKETS.",
  bright: "A GOOD DAY'S WORK.",
  breezy: "A LOUD DAY. NOT A STORY.",
  surge: "THE MARKET SPRINTED. YOU WERE ABOARD.",
  squall: "TAKE THE UMBRELLA. SKIP THE NEWS.",
  rally: "A DAY FOR THE ALMANAC — THE GOOD KIND.",
  gale: "THE PLAN WAS BUILT FOR THIS.",
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

/** Honest severity phrase per percentile band (gauge caption). */
function severityPhrase(pct: number): string {
  if (pct < 50) return "QUIETER THAN MOST SESSIONS";
  if (pct <= 80) return "LOUDER THAN TYPICAL, A LONG WAY FROM RARE";
  if (pct <= 90) return "LOUDER THAN MOST — STILL SHORT OF RARE";
  if (pct < 98) return "APPROACHING RARE — A HANDFUL A YEAR";
  return "RARE — A FEW DAYS PER DECADE";
}

/** Full weekday name for week-caption copy — "FRIDAY". */
function weekdayLong(iso: string): string {
  return parseSessionDate(iso)
    .toLocaleDateString("en-CA", { weekday: "long" })
    .toUpperCase();
}

/**
 * One honest line under the week strip, derived from the classified
 * sessions. ≤60 chars, uppercase. "Recovered" is only claimed when the
 * next session actually regained the drop.
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
    const word = day.state.toUpperCase();
    if (loudDownIdx === sessions.length - 1) {
      return `A ${word} TO CLOSE THE WEEK.`;
    }
    const next = sessions[loudDownIdx + 1];
    if (next.changePercent >= Math.abs(day.changePercent)) {
      return `${weekdayLong(day.date)}'S ${word} RECOVERED IN ONE SESSION.`;
    }
    if (next.changePercent > 0) {
      return `${weekdayLong(day.date)}'S ${word} BOUNCED THE NEXT SESSION.`;
    }
    return `${weekdayLong(day.date)}'S ${word} IS STILL ON THE TAPE.`;
  }

  const lastOf = (state: WeatherState): SessionWeather | undefined => {
    for (let i = sessions.length - 1; i >= 0; i -= 1) {
      if (sessions[i].state === state) return sessions[i];
    }
    return undefined;
  };

  const rally = lastOf("rally");
  if (rally) return `${weekdayLong(rally.date)}'S RALLY — ONE FOR THE ALMANAC.`;
  const surge = lastOf("surge");
  if (surge) return `${weekdayLong(surge.date)}'S SURGE LED THE WEEK.`;
  const brightCount = sessions.filter((s) => s.state === "bright").length;
  if (brightCount >= 2) return `${brightCount} BRIGHT SESSIONS THIS WEEK.`;
  if (brightCount === 1) return "ONE BRIGHT SESSION IN A FAIR WEEK.";
  if (sessions.some((s) => s.state === "breezy")) {
    return "A BREEZE OR TWO, NOTHING MORE.";
  }
  return "A QUIET WEEK ON THE TAPE.";
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
        extra: { text: "ARCHIVED →", red: true },
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
      className={`band${severity ? "" : " band--loading"}`}
      aria-busy={severity ? undefined : true}
      aria-label="Conditions — today's weather"
    >
      {severity ? (
        <>
          <div className="cols">
            {/* ── Col 1 · desktop — CONDITIONS ── */}
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
                  {/* text-transform: none — uppercase turns σ into Σ */}
                  <span style={{ textTransform: "none" }}>σ</span> {sigma} ·{" "}
                  {CAPTIONS[state]}
                </div>
              </div>
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
                {/* text-transform: none — uppercase turns σ into Σ */}
                <span style={{ textTransform: "none" }}>σ</span> {sigma} ·{" "}
                {severityPhrase(pct)} · OF {fmtInt(severity.sampleSize)}{" "}
                SESSIONS
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
            <span className="railNote railNote--desktop">
              TOMORROW&rsquo;S OUTLOOK: {typical} — A TYPICAL DAY. NEXT READING
              AT THE 4 PM BELL.
            </span>
            <span className="railNote railNote--mobile">
              NEXT READING · 4 PM BELL
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

        .microlabel {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .caption {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
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
          letter-spacing: 0.18em;
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
          font-size: 7.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
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
          font-size: 8px;
          font-weight: 600;
          color: var(--ins-gray-600);
        }
        .num--start {
          transform: none;
        }
        .num--end {
          transform: translateX(-100%);
        }
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
        .week {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
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
          border: 1px dashed rgba(17, 17, 17, 0.4);
          gap: 4px;
        }
        .dayName {
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--ins-gray-600);
        }
        .dayVal {
          font-size: 9.5px;
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
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.1em;
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
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
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
        .railNote {
          margin-left: auto;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
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
            font-size: 8px;
            letter-spacing: 0.2em;
          }
          .word--m {
            font-size: 31px;
            letter-spacing: -0.02em;
            line-height: 1;
            margin-top: 3px;
          }
          .caption--m {
            font-size: 9px;
            letter-spacing: 0.14em;
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
            font-size: 7px;
            letter-spacing: 0.12em;
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
            font-size: 7.5px;
          }
          .num--hideM {
            display: none;
          }
          .marker {
            bottom: 7px;
            gap: 2px;
          }
          .markerLabel {
            font-size: 9px;
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
            font-size: 7px;
          }
          .dayVal {
            font-size: 8.5px;
          }
          .outVal {
            font-size: 9.5px;
            margin-top: 2px;
          }
          .outTag {
            font-size: 6.5px;
            letter-spacing: 0.08em;
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
            font-size: 9px;
            letter-spacing: 0.14em;
          }
          /* Informational extras drop on mobile; the rally/gale red
             extras (ARCHIVED / READ links) stay — they're the action. */
          .railSep,
          .rail :global(.railExtra) {
            display: none;
          }
          .rail :global(.railExtra--red) {
            display: inline;
            font-size: 8.5px;
          }
          .railNote--desktop {
            display: none;
          }
          .railNote--mobile {
            display: block;
            font-size: 7.5px;
            letter-spacing: 0.08em;
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
