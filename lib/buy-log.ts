/**
 * Buy log + buy settings — the Next Buy module's entire state layer.
 *
 * localStorage ONLY. There is no account, no server record and no sync:
 * a reader's buy day, cadence, typical amount, contribution room and the
 * buys they've logged live on the device that typed them. Every read is
 * guarded for SSR (`typeof window`) and for corrupt/foreign JSON, and
 * every write is wrapped — a full or blocked store degrades to "the
 * setting didn't stick", never to a thrown render.
 *
 * Two keys, both versioned so a future shape change can be introduced
 * without stepping on what's already stored:
 *
 *   buyveqt:buy-settings:v1  → BuySettings  (one object)
 *   buyveqt:buy-log:v1       → BuyEntry[]   (ascending by date)
 *
 * Consumers: components/home/NextBuy.tsx (read + write) and
 * components/calculators/Lookback.tsx (read only, via readBuyLogSummary).
 */

export type Cadence = "weekly" | "biweekly" | "monthly";

/** One logged purchase, priced at the tape the reader saw when logging. */
export interface BuyEntry {
  /** Local calendar day, "YYYY-MM-DD". One entry per day, by design. */
  date: string;
  /** Dollars contributed (CAD). */
  amount: number;
  /** Price per unit at log time. */
  price: number;
  /** amount / price, stored so a later price change can't rewrite history. */
  units: number;
}

export interface BuySettings {
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  cadence: Cadence;
  /** Typical buy in CAD. */
  amount: number;
  /** Annual contribution room. null until the reader sets one. */
  annualLimit: number | null;
}

const SETTINGS_KEY = "buyveqt:buy-settings:v1";
const LOG_KEY = "buyveqt:buy-log:v1";

/** Friday / every 2nd payday / $200 / room unset — the artboard's frame. */
export const DEFAULT_SETTINGS: BuySettings = {
  weekday: 5,
  cadence: "biweekly",
  amount: 200,
  annualLimit: null,
};

/** Index-addressed so the label never depends on a locale or a clock. */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const CADENCE_LABELS: Record<Cadence, string> = {
  weekly: "EVERY WEEK",
  biweekly: "EVERY 2ND PAYDAY",
  monthly: "EVERY MONTH",
};

const CADENCES: readonly Cadence[] = ["weekly", "biweekly", "monthly"];

/* ── Storage ─────────────────────────────────────────────────────────── */

function readRaw<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota full, private mode, or storage disabled — the setting simply
    // doesn't persist. Never surfaced as an error; nothing here is data
    // the reader can't retype.
  }
}

/** Settings with every field validated back onto the defaults. */
export function readSettings(): BuySettings {
  const raw = readRaw<Partial<BuySettings>>(SETTINGS_KEY);
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;

  const weekday =
    typeof raw.weekday === "number" &&
    Number.isInteger(raw.weekday) &&
    raw.weekday >= 0 &&
    raw.weekday <= 6
      ? raw.weekday
      : DEFAULT_SETTINGS.weekday;

  const cadence =
    typeof raw.cadence === "string" && CADENCES.includes(raw.cadence as Cadence)
      ? (raw.cadence as Cadence)
      : DEFAULT_SETTINGS.cadence;

  const amount =
    typeof raw.amount === "number" && Number.isFinite(raw.amount) && raw.amount > 0
      ? Math.min(raw.amount, 1_000_000)
      : DEFAULT_SETTINGS.amount;

  const annualLimit =
    typeof raw.annualLimit === "number" &&
    Number.isFinite(raw.annualLimit) &&
    raw.annualLimit > 0
      ? Math.min(raw.annualLimit, 10_000_000)
      : null;

  return { weekday, cadence, amount, annualLimit };
}

export function writeSettings(settings: BuySettings): void {
  writeRaw(SETTINGS_KEY, settings);
}

function isEntry(v: unknown): v is BuyEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Partial<BuyEntry>;
  return (
    typeof e.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    typeof e.amount === "number" &&
    Number.isFinite(e.amount) &&
    e.amount > 0 &&
    typeof e.price === "number" &&
    Number.isFinite(e.price) &&
    e.price > 0 &&
    typeof e.units === "number" &&
    Number.isFinite(e.units) &&
    e.units > 0
  );
}

/** Logged buys, oldest first. Anything malformed is dropped, not thrown. */
export function readBuys(): BuyEntry[] {
  const raw = readRaw<unknown>(LOG_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isEntry).sort((a, b) => a.date.localeCompare(b.date));
}

export function writeBuys(buys: BuyEntry[]): void {
  writeRaw(LOG_KEY, buys);
}

/**
 * Append a buy and return the new list.
 *
 * Same-day logs REPLACE rather than accumulate. The button is a
 * one-tap confirmation of "I bought today", not a ledger line-item —
 * a double tap (or a revisit later the same afternoon at a different
 * price) is far more likely to be the same purchase logged twice than
 * two genuine purchases on one day. Double-counting would quietly
 * overstate contributions and eat TFSA room the reader still has;
 * replacing at worst re-prices a single day. The cheaper error wins.
 */
export function logBuy(entry: BuyEntry): BuyEntry[] {
  const next = readBuys().filter((b) => b.date !== entry.date);
  next.push(entry);
  next.sort((a, b) => a.date.localeCompare(b.date));
  writeBuys(next);
  return next;
}

/* ── Derived ─────────────────────────────────────────────────────────── */

/** Dollars contributed in a calendar year — drives the room figure. */
export function contributedInYear(buys: BuyEntry[], year: number): number {
  const prefix = `${year}-`;
  let total = 0;
  for (const b of buys) {
    if (b.date.startsWith(prefix)) total += b.amount;
  }
  return total;
}

export interface BuyLogSummary {
  count: number;
  /** Total units held across every logged buy. */
  units: number;
  /** Total dollars contributed across every logged buy. */
  contributed: number;
}

export function summarizeBuys(buys: BuyEntry[]): BuyLogSummary {
  let units = 0;
  let contributed = 0;
  for (const b of buys) {
    units += b.units;
    contributed += b.amount;
  }
  return { count: buys.length, units, contributed };
}

/**
 * The one-line reader for consumers outside the home page (Lookback's
 * "YOUR COHORT" rail entry). Null when nothing has been logged — callers
 * render the entry only when there's a real cohort to show.
 */
export function readBuyLogSummary(): BuyLogSummary | null {
  const buys = readBuys();
  if (buys.length === 0) return null;
  return summarizeBuys(buys);
}

/* ── Schedule ────────────────────────────────────────────────────────── */

/** Local calendar day as "YYYY-MM-DD" — never a UTC slice of an ISO string. */
export function todayIso(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface NextBuyReading {
  /** The resolved buy date, local midnight. */
  date: Date;
  /** "Friday" — index-addressed, locale-independent. */
  weekdayName: string;
  /** Whole calendar days from today. 0 = today. */
  daysOut: number;
  /** "TODAY" / "TOMORROW" / "12 DAYS OUT". */
  daysOutLabel: string;
  /** "EVERY 2ND PAYDAY". */
  cadenceLabel: string;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole days since the Unix epoch, in local calendar terms. */
function epochDays(d: Date): number {
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000
  );
}

/**
 * The next buy date for a cadence, relative to `from` (default: now).
 *
 * weekly    the next occurrence of `weekday`, today included.
 * biweekly  the same, snapped to an even fortnight measured from the
 *           epoch. There is no per-reader anchor to configure and no
 *           payroll calendar to guess at — parity off a fixed origin
 *           gives a stable every-other-week rhythm that survives a
 *           reload and reads the same on every device.
 * monthly   the first `weekday` of the month; next month once it's past.
 */
export function nextBuy(
  settings: BuySettings,
  from: Date = new Date()
): NextBuyReading {
  const today = startOfDay(from);
  let target: Date;

  if (settings.cadence === "monthly") {
    const firstOf = (y: number, m: number): Date => {
      const first = new Date(y, m, 1);
      first.setDate(1 + ((settings.weekday - first.getDay() + 7) % 7));
      return first;
    };
    target = firstOf(today.getFullYear(), today.getMonth());
    if (target.getTime() < today.getTime()) {
      target = firstOf(today.getFullYear(), today.getMonth() + 1);
    }
  } else {
    target = new Date(today);
    target.setDate(target.getDate() + ((settings.weekday - today.getDay() + 7) % 7));
    if (settings.cadence === "biweekly" && Math.floor(epochDays(target) / 7) % 2 !== 0) {
      target.setDate(target.getDate() + 7);
    }
  }

  const daysOut = Math.max(0, epochDays(target) - epochDays(today));
  const daysOutLabel =
    daysOut === 0 ? "TODAY" : daysOut === 1 ? "TOMORROW" : `${daysOut} DAYS OUT`;

  return {
    date: target,
    weekdayName: WEEKDAY_NAMES[settings.weekday],
    daysOut,
    daysOutLabel,
    cadenceLabel: CADENCE_LABELS[settings.cadence],
  };
}
