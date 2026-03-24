/**
 * TSX market hours utility.
 * TSX trades 9:30 AM – 4:00 PM Eastern Time, Monday–Friday.
 * We add a 15-minute buffer on each side for pre/post data updates.
 */

const TSX_OPEN_HOUR = 9;
const TSX_OPEN_MINUTE = 15; // 9:15 AM (15 min buffer before 9:30)
const TSX_CLOSE_HOUR = 16;
const TSX_CLOSE_MINUTE = 15; // 4:15 PM (15 min buffer after 4:00)

/**
 * Check if the TSX market is currently open (or within the buffer window).
 * Returns true during weekday market hours in Eastern Time.
 */
export function isMarketOpen(): boolean {
  const now = new Date();

  // Convert to Eastern Time
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = et.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;

  const hours = et.getHours();
  const minutes = et.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const openTime = TSX_OPEN_HOUR * 60 + TSX_OPEN_MINUTE;
  const closeTime = TSX_CLOSE_HOUR * 60 + TSX_CLOSE_MINUTE;

  return timeInMinutes >= openTime && timeInMinutes <= closeTime;
}

/**
 * Check if we're within extended hours — market day but outside trading hours.
 * Data providers sometimes update shortly after close.
 * Returns true on weekdays from 4:15 PM to 6:00 PM ET.
 */
export function isExtendedHours(): boolean {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = et.getDay();
  if (day === 0 || day === 6) return false;

  const hours = et.getHours();
  const minutes = et.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const closeTime = TSX_CLOSE_HOUR * 60 + TSX_CLOSE_MINUTE;
  const extendedEnd = 18 * 60; // 6:00 PM

  return timeInMinutes > closeTime && timeInMinutes <= extendedEnd;
}

/**
 * Should we attempt Alpha Vantage calls right now?
 * Only during market hours + extended hours on weekdays.
 * This preserves the 25/day AV budget by not wasting calls
 * at 2 AM or on weekends when data hasn't changed.
 */
export function shouldUseAlphaVantage(): boolean {
  return isMarketOpen() || isExtendedHours();
}
