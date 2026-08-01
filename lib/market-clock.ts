"use client";

import { useEffect, useState } from "react";

/**
 * TSX market clock — "is Toronto open right now, and when does it next
 * open?" — for the Instrument's closed-market rail and its close-only
 * edition gate.
 *
 * Deliberately small and honest:
 *   - Wall time comes from `Intl.DateTimeFormat` with
 *     `timeZone: "America/Toronto"`. No hand-rolled UTC offsets, so DST
 *     is the platform's problem, not ours. (Both DST switchovers land on
 *     a Sunday anyway, which is never a session.)
 *   - Regular session only: weekdays 09:30–16:00 ET.
 *   - Full-closure holidays come from the static list below.
 *
 * NOT modelled: early closes (the 13:00 ET half-days around Christmas Eve
 * and a few others) and unscheduled halts. On a half-day the rail keeps
 * saying nothing until 16:00 — a copy miss, never a data claim.
 */

export type MarketPhase = "open" | "closed";

export interface MarketClock {
  phase: MarketPhase;
  /** "9:30 ET" when the next bell is today, else "MONDAY 9:30 ET". */
  reopensLabel: string;
  /** Same, abbreviated for the mobile rail's tighter box: "MON 9:30 ET". */
  reopensLabelShort: string;
}

/** Regular session bounds in Toronto wall-clock minutes past midnight. */
const OPEN_MINUTES = 9 * 60 + 30; // 09:30
const CLOSE_MINUTES = 16 * 60; // 16:00

const BELL_LABEL = "9:30 ET";

/**
 * TSX full-closure days, 2026–2027, as Toronto civil dates.
 *
 * ⚠ NEEDS AN ANNUAL REFRESH from the TMX trading-calendar notice. The
 * failure mode is asymmetric, so know which way it breaks: a *missing*
 * holiday makes `getMarketPhase` claim the exchange is OPEN on a day it
 * is shut — the rail then prints nothing about the closure and the
 * edition gate stays open all day. (Wrong copy, never wrong data: the
 * quote itself is unaffected.) Once this list runs out at the end of
 * 2027 every statutory holiday reads as a normal session. An *extra*
 * date is the harmless direction — the rail simply says "closed" and
 * points at the next bell.
 *
 * Weekend-observance rule applied below (TMX): a holiday falling on a
 * Saturday or Sunday is observed the following Monday, and when both
 * Christmas and Boxing Day are pushed they take consecutive weekdays.
 */
const HOLIDAYS: ReadonlySet<string> = new Set([
  // ── 2026 ──
  "2026-01-01", // New Year's Day — Thursday
  "2026-02-16", // Family Day — 3rd Monday in February
  "2026-04-03", // Good Friday — Easter is April 5
  "2026-05-18", // Victoria Day — the Monday *preceding* May 25 (May 25 is itself a Monday)
  "2026-07-01", // Canada Day — Wednesday
  "2026-08-03", // Civic Holiday — 1st Monday in August
  "2026-09-07", // Labour Day — 1st Monday in September
  "2026-10-12", // Thanksgiving — 2nd Monday in October
  "2026-12-25", // Christmas Day — Friday
  "2026-12-28", // Boxing Day observed — Dec 26 is a Saturday
  // ── 2027 ──
  "2027-01-01", // New Year's Day — Friday
  "2027-02-15", // Family Day — 3rd Monday in February
  "2027-03-26", // Good Friday — Easter is March 28
  "2027-05-24", // Victoria Day — the Monday preceding May 25 (a Tuesday)
  "2027-07-01", // Canada Day — Thursday
  "2027-08-02", // Civic Holiday — 1st Monday in August
  "2027-09-06", // Labour Day — 1st Monday in September
  "2027-10-11", // Thanksgiving — 2nd Monday in October
  "2027-12-27", // Christmas observed — Dec 25 is a Saturday
  "2027-12-28", // Boxing Day observed — Dec 26 is a Sunday
]);

/** Toronto wall time, decomposed. `h23` so midnight reads 00, not 24. */
const TORONTO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/* Weekday names are read back off a noon-UTC anchor, so these must format
   in UTC or a viewer west of Toronto would see the previous day's name. */
const WEEKDAY_LONG = new Intl.DateTimeFormat("en-CA", {
  weekday: "long",
  timeZone: "UTC",
});
const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  timeZone: "UTC",
});

interface TorontoWallTime {
  year: number;
  month: number;
  day: number;
  /** Minutes past local midnight. */
  minutes: number;
}

function torontoWallTime(now: Date): TorontoWallTime {
  const parts = TORONTO.formatToParts(now);
  const num = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number(part.value) : 0;
  };
  return {
    year: num("year"),
    month: num("month"),
    day: num("day"),
    minutes: num("hour") * 60 + num("minute"),
  };
}

/**
 * Noon-UTC anchor for a Toronto civil date — same convention as
 * `parseSessionDate`. Toronto is UTC−4/−5, so noon UTC is always 07:00 or
 * 08:00 local: the civil date survives day-stepping and DST intact.
 */
function anchorFor(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function isoOf(anchor: Date): string {
  return anchor.toISOString().slice(0, 10);
}

function isSessionDay(anchor: Date): boolean {
  const dow = anchor.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  return !HOLIDAYS.has(isoOf(anchor));
}

/**
 * The current market phase plus the label for the next opening bell.
 *
 * Closed covers three shapes, all of which want the same rail sentence:
 * before the bell on a session day, after the bell, and non-session days
 * (weekends and the holidays above).
 */
export function getMarketPhase(now: Date = new Date()): MarketClock {
  const wall = torontoWallTime(now);
  const today = anchorFor(wall.year, wall.month, wall.day);
  const sessionToday = isSessionDay(today);

  if (
    sessionToday &&
    wall.minutes >= OPEN_MINUTES &&
    wall.minutes < CLOSE_MINUTES
  ) {
    return {
      phase: "open",
      reopensLabel: BELL_LABEL,
      reopensLabelShort: BELL_LABEL,
    };
  }

  // Pre-market on a session day: the next bell is today, so no weekday.
  if (sessionToday && wall.minutes < OPEN_MINUTES) {
    return {
      phase: "closed",
      reopensLabel: BELL_LABEL,
      reopensLabelShort: BELL_LABEL,
    };
  }

  // Past the close, or a non-session day — walk forward to the next
  // session. Bounded: a run of 10 shut days would mean the holiday list
  // is corrupt, and looping forever is a worse answer than a stale label.
  const next = new Date(today);
  for (let i = 0; i < 10; i += 1) {
    next.setUTCDate(next.getUTCDate() + 1);
    if (isSessionDay(next)) break;
  }

  return {
    phase: "closed",
    reopensLabel: `${WEEKDAY_LONG.format(next).toUpperCase()} ${BELL_LABEL}`,
    reopensLabelShort: `${WEEKDAY_SHORT.format(next).toUpperCase()} ${BELL_LABEL}`,
  };
}

/**
 * Client-side market phase, re-read every minute while mounted.
 *
 * Returns `null` until the first read lands in an effect — the phase is a
 * function of the *browser's* clock, so evaluating it during render would
 * risk a server/client hydration mismatch at a boundary minute. Consumers
 * treat null as "not yet known" and keep their open-market copy, which is
 * exactly the pre-existing behaviour.
 *
 * The 60s granularity means the closed state lands within a minute of the
 * 4pm bell. It cannot chatter: `getMarketPhase` is a pure function of a
 * monotonic clock with no hysteresis, so each boundary is crossed once.
 */
export function useMarketClock(pollMs = 60_000): MarketClock | null {
  const [clock, setClock] = useState<MarketClock | null>(null);

  useEffect(() => {
    const read = () => {
      const next = getMarketPhase();
      // Identity-stable while nothing changed, so the minute tick doesn't
      // re-render the whole band 1,440 times a day.
      setClock((prev) =>
        prev &&
        prev.phase === next.phase &&
        prev.reopensLabel === next.reopensLabel
          ? prev
          : next
      );
    };
    read();
    const id = window.setInterval(read, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs]);

  return clock;
}
