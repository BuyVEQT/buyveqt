"use client";

import { useEffect, useState } from "react";

/**
 * Compute the next Sunday 8:00pm America/Toronto as a UTC Date.
 * Handles DST via Intl.DateTimeFormat's timeZone-aware offset resolution.
 */
function nextSundayEightPmToronto(now: Date): Date {
  // Find the current time in Toronto to know what "today" is there.
  const tzFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(
    tzFmt.formatToParts(now).map((p) => [p.type, p.value])
  );
  const tzDay = parts.weekday;
  // en-CA weekday abbreviations: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dayIdx = dayMap[tzDay] ?? 0;
  const hourInToronto = Number(parts.hour);
  const minuteInToronto = Number(parts.minute);

  // Days until next Sunday 8pm Toronto. If it's Sunday and before 8pm, 0.
  let daysUntilSunday = (7 - dayIdx) % 7;
  if (daysUntilSunday === 0 && (hourInToronto < 20 || (hourInToronto === 20 && minuteInToronto === 0))) {
    // Sunday and not yet 8pm — target is today at 8pm.
    daysUntilSunday = 0;
  } else if (daysUntilSunday === 0) {
    // Sunday and past 8pm — target is next Sunday.
    daysUntilSunday = 7;
  }

  // Build ISO string for target date at 20:00 Toronto, then let the browser
  // reinterpret through the timeZone by reconstructing from parts.
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day) + daysUntilSunday;

  // Construct the target as a local time, then convert to ET offset by
  // using Intl to measure offset at that instant.
  const naiveLocal = new Date(Date.UTC(year, month - 1, day, 20, 0, 0));
  // Measure Toronto offset at that instant.
  const offsetMinutes = torontoOffsetMinutes(naiveLocal);
  // Adjust: we want the UTC instant such that the Toronto clock reads 20:00.
  return new Date(Date.UTC(year, month - 1, day, 20, 0, 0) - offsetMinutes * 60_000);
}

function torontoOffsetMinutes(d: Date): number {
  // Offset = Toronto wall time minus UTC wall time, in minutes.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const o = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const toronto = Date.UTC(
    Number(o.year),
    Number(o.month) - 1,
    Number(o.day),
    Number(o.hour) === 24 ? 0 : Number(o.hour),
    Number(o.minute),
    Number(o.second)
  );
  return (toronto - d.getTime()) / 60_000;
}

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffParts(targetMs: number, nowMs: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function formatCountdown({ days, hours, minutes, seconds }: CountdownParts): string {
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export default function CountdownToNextBrief() {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = nextSundayEightPmToronto(now);
      setParts(diffParts(target.getTime(), now.getTime()));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-editorial p-5 flex flex-col gap-1">
      <p className="section-label">Next Weekly Brief</p>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
        Sundays · 8:00pm ET
      </p>
      <p
        className="text-2xl font-serif font-normal tabular-nums text-[var(--color-text-primary)] mt-2"
        aria-live="polite"
      >
        {parts ? formatCountdown(parts) : "\u00A0"}
      </p>
    </div>
  );
}
