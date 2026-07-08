/**
 * Shared formatting for the Instrument (home redesign) — sign conventions,
 * tabular dates, and en-CA money are part of the design, so every module
 * pulls from here instead of hand-rolling.
 *
 * Conventions (from the handoff):
 *   - Real minus sign (U+2212), never a hyphen: "−0.48%"
 *   - Explicit plus on positives: "+0.43%"
 *   - Direction is never color-only — pair red with ▲/▼ or a label
 *   - Dates as "TUESDAY 30.06.2026" / chips as "JUN 30, 2025"
 *   - Money en-CA, no decimals at poster scale: "$22,690"
 */

export const MINUS = "−";
export const UP = "▲"; // ▲
export const DOWN = "▼"; // ▼

/** "+0.43%" / "−0.48%" — signed percent with a true minus. */
export function fmtSignedPct(value: number, decimals = 2): string {
  const sign = value < 0 ? MINUS : "+";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

/** "+0.30 PP" / "−0.03 PP" — contribution in percentage points. */
export function fmtSignedPp(value: number, decimals = 2): string {
  const sign = value < 0 ? MINUS : "+";
  return `${sign}${Math.abs(value).toFixed(decimals)} PP`;
}

/** "±0.39%" — symmetric typical-day move. */
export function fmtPlusMinusPct(value: number, decimals = 2): string {
  return `±${Math.abs(value).toFixed(decimals)}%`;
}

/** "51.87" — price tape, always two decimals, no currency symbol. */
export function fmtPrice(value: number): string {
  return value.toFixed(2);
}

/** "$22,690" — en-CA money, rounded to whole dollars. */
export function fmtMoney(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/** "1,868" — grouped integer (day №, session counts). */
export function fmtInt(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 0,
  }).format(value);
}

/** "TUESDAY 30.06.2026" — the dateline stamp. */
export function fmtDateline(date: Date): string {
  const weekday = date
    .toLocaleDateString("en-CA", { weekday: "long" })
    .toUpperCase();
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${weekday} ${dd}.${mm}.${date.getFullYear()}`;
}

/** "JUN 30, 2025" — what-if date chips. */
export function fmtChipDate(date: Date): string {
  return date
    .toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

/** "JUN 30" — short readout dates (session board). */
export function fmtShortDate(date: Date): string {
  return date
    .toLocaleDateString("en-CA", { month: "short", day: "numeric" })
    .toUpperCase();
}

/** "MON" — week-strip day letters. */
export function fmtWeekday(date: Date): string {
  return date
    .toLocaleDateString("en-CA", { weekday: "short" })
    .toUpperCase();
}

/**
 * Parse an API "YYYY-MM-DD" date at noon UTC so the local calendar day
 * never slips a day in western time zones.
 */
export function parseSessionDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}
