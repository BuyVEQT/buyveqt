"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VeqtQuote } from "@/lib/types";
import { fmtMoney, fmtPrice } from "@/lib/instrument-format";
import {
  CADENCE_LABELS,
  DEFAULT_SETTINGS,
  WEEKDAY_NAMES,
  contributedInYear,
  logBuy,
  nextBuy,
  readBuys,
  readSettings,
  todayIso,
  writeSettings,
  type BuyEntry,
  type BuySettings,
  type Cadence,
} from "@/lib/buy-log";

/**
 * Next Buy — artboard 8a, the thesis made actionable.
 *
 * Four cells across one ink-ruled box: the buy day, the contribution
 * room left this year, what today's tape buys for the reader's usual
 * amount, and the two CTAs. The CTA block is INK, not red — red on this
 * page means signal (a down day, a rare move), and a button the reader
 * is meant to press every second Friday is not a signal.
 *
 * STATE IS LOCAL. Buy day, cadence, amount, annual room and the log all
 * live in localStorage (lib/buy-log.ts). There is no account and nothing
 * leaves the device, which is also why the footnote says so out loud.
 *
 * SSR: localStorage and the calendar are both read in the mount effect,
 * never during render. The server and the first client render therefore
 * print the identical default frame — Friday, every 2nd payday, $200,
 * room unset — and the real values arrive as an ordinary state update.
 * No suppressHydrationWarning needed, and no layout shift: the swapped
 * strings are single-line, and the room cell carries a min-height so the
 * "set up" invite and the figure occupy the same box.
 */

interface NextBuyProps {
  quote: VeqtQuote | null;
}

const CADENCE_OPTIONS: readonly { value: Cadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2nd payday" },
  { value: "monthly", label: "Monthly" },
];

/** How long the CTA holds its confirmation before reverting. */
const FLASH_MS = 2600;

export default function NextBuy({ quote }: NextBuyProps) {
  /* null = not read yet (server + first client render). */
  const [settings, setSettings] = useState<BuySettings | null>(null);
  const [buys, setBuys] = useState<BuyEntry[] | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  const [open, setOpen] = useState(false);
  const [amountDraft, setAmountDraft] = useState(String(DEFAULT_SETTINGS.amount));
  const [limitDraft, setLimitDraft] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = readSettings();
    setSettings(stored);
    setBuys(readBuys());
    setNow(new Date());
    setAmountDraft(String(stored.amount));
    setLimitDraft(stored.annualLimit === null ? "" : String(stored.annualLimit));
  }, []);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  /* DEFAULT_SETTINGS is a module constant, so the fallback keeps a stable
     identity across the pre-mount renders that memos depend on. */
  const s = settings ?? DEFAULT_SETTINGS;

  const schedule = useMemo(() => (now ? nextBuy(s, now) : null), [s, now]);

  const rawPrice = quote?.price;
  const price =
    typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice > 0
      ? rawPrice
      : null;
  const units = price !== null ? s.amount / price : null;

  const year = now?.getFullYear() ?? null;
  const contributed =
    buys && year !== null ? contributedInYear(buys, year) : 0;
  const limit = s.annualLimit;
  const roomLeft = limit !== null ? Math.max(0, limit - contributed) : null;
  /* The bar tracks the headline figure — it fills with the room the
     reader still has, and drains as the year is used up (artboard: a
     $4,500-of-$7,000 reading shows a 64% bar). */
  const fillPct =
    limit !== null && limit > 0 && roomLeft !== null
      ? Math.max(0, Math.min(100, (roomLeft / limit) * 100))
      : 0;

  function update(patch: Partial<BuySettings>) {
    const next = { ...s, ...patch };
    setSettings(next);
    writeSettings(next);
  }

  function commitAmount(raw: string) {
    const n = Number(raw.replace(/[^0-9.]/g, ""));
    const next =
      Number.isFinite(n) && n > 0 ? Math.min(Math.round(n * 100) / 100, 1_000_000) : s.amount;
    update({ amount: next });
    setAmountDraft(String(next));
  }

  function commitLimit(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    if (cleaned === "") {
      update({ annualLimit: null });
      setLimitDraft("");
      return;
    }
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n <= 0) {
      setLimitDraft(s.annualLimit === null ? "" : String(s.annualLimit));
      return;
    }
    const next = Math.min(Math.round(n), 10_000_000);
    update({ annualLimit: next });
    setLimitDraft(String(next));
  }

  function handleLog() {
    if (price === null || units === null) return;
    const entry: BuyEntry = {
      date: todayIso(now ?? new Date()),
      amount: s.amount,
      price,
      units,
    };
    setBuys(logBuy(entry));
    setFlash(`LOGGED — ${units.toFixed(2)} UNITS`);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS);
  }

  return (
    <section className="nb" aria-label="Next buy">
      <div className="box">
        {/* ── The buy day ── */}
        <div className="cell cell--day">
          <div className="dayHead">
            <div className="kicker">NEXT BUY</div>
            <div className="day">{WEEKDAY_NAMES[s.weekday]}</div>
          </div>
          <div className="dayMeta">
            {schedule ? `${schedule.daysOutLabel} · ` : ""}
            {CADENCE_LABELS[s.cadence]}
          </div>
        </div>

        {/* ── Contribution room ──
             Unset room turns the whole cell into the invite rather than
             printing a $0 the reader never entered. Both states use the
             same label / figure / caption skeleton, so the row height is
             identical before and after the localStorage read — the module
             never jumps on mount. */}
        {roomLeft !== null && limit !== null ? (
          <div className="cell cell--room">
            <div className="label">
              TFSA ROOM LEFT{year !== null ? ` — ${year}` : ""}
            </div>
            <div className="fig">
              {fmtMoney(roomLeft)} <span className="figSub">OF {fmtMoney(limit)}</span>
            </div>
            <div
              className="track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={limit}
              aria-valuenow={Math.round(roomLeft)}
              aria-label={`${fmtMoney(roomLeft)} of ${fmtMoney(
                limit
              )} contribution room left`}
            >
              {/* Keyed on the fill so the tape re-runs when a logged buy
                  moves the number — the bar is the confirmation. */}
              <span key={fillPct} className="fill" style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="cell cell--room cell--invite"
            onClick={() => setOpen(true)}
          >
            <span className="label">
              TFSA ROOM LEFT{year !== null ? ` — ${year}` : ""}
            </span>
            <span className="fig">SET UP →</span>
            <span className="cap">Add your annual room to track what&rsquo;s left.</span>
          </button>
        )}

        {/* ── What today's tape buys ── */}
        <div className="cell cell--units">
          <div className="label">A {fmtMoney(s.amount)} BUY TODAY GETS YOU</div>
          <div className="fig">
            {units !== null ? units.toFixed(2) : "—"} UNITS{" "}
            <span className="figSub">@ {price !== null ? fmtPrice(price) : "—"}</span>
          </div>
          <div className="cap">Units recompute live off the tape.</div>
        </div>

        {/* ── CTAs — ink, never red ── */}
        <div className="cell cell--cta">
          <button
            type="button"
            className="log"
            onClick={handleLog}
            disabled={price === null}
            aria-live="polite"
          >
            {flash ?? "LOG THE BUY →"}
          </button>
          <button
            type="button"
            className="set"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nb-settings"
          >
            {open ? "CLOSE ✕" : "SET BUY DAY ✎"}
          </button>
        </div>

        {/* ── Inline settings ── */}
        {open && (
          <div className="settings" id="nb-settings">
            <label className="field">
              <span className="flab">BUY DAY</span>
              <select
                className="ctl"
                value={s.weekday}
                onChange={(e) => update({ weekday: Number(e.target.value) })}
              >
                {WEEKDAY_NAMES.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              {/* Drawn, not a background image: the glyph tracks --ins-ink
                  so it survives the gale edition's inversion. */}
              <span className="chev" aria-hidden="true">
                ▾
              </span>
            </label>
            <label className="field">
              <span className="flab">CADENCE</span>
              <select
                className="ctl"
                value={s.cadence}
                onChange={(e) => update({ cadence: e.target.value as Cadence })}
              >
                {CADENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="chev" aria-hidden="true">
                ▾
              </span>
            </label>
            <label className="field">
              <span className="flab">TYPICAL BUY</span>
              <input
                className="ctl"
                type="text"
                inputMode="decimal"
                value={amountDraft}
                onChange={(e) => setAmountDraft(e.target.value)}
                onBlur={(e) => commitAmount(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitAmount(e.currentTarget.value);
                  }
                }}
              />
            </label>
            <label className="field">
              <span className="flab">ANNUAL ROOM</span>
              <input
                className="ctl"
                type="text"
                inputMode="decimal"
                placeholder="7000"
                value={limitDraft}
                onChange={(e) => setLimitDraft(e.target.value)}
                onBlur={(e) => commitLimit(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitLimit(e.currentTarget.value);
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>

      <p className="foot">
        Buy day, cadence, amount and room are local to the device · no account
      </p>

      <style jsx>{`
        .nb {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .box {
          display: grid;
          grid-template-columns: 240px 1fr 1fr auto;
          border: 1px solid var(--ins-ink);
        }
        .cell {
          padding: 20px 24px;
          min-width: 0;
        }

        /* ── Buy day ── */
        .cell--day {
          background: var(--ins-ink);
          color: var(--ins-paper);
          padding: 20px 22px;
        }
        .kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-signal);
        }
        .day {
          margin-top: 8px;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .dayMeta {
          margin-top: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          /* Paper at 55% rather than a literal white — the token flips
             with the ink edition, an rgba(255,…) would not. */
          color: var(--ins-paper);
          opacity: 0.6;
        }

        /* ── Room + units ── */
        .cell--room {
          border-right: 1px solid var(--ins-hair);
        }
        /* The invite is the whole cell — a ~110px tap target, and the same
           label / figure / caption stack as the figure state. */
        .cell--invite {
          appearance: none;
          background: none;
          border: none;
          border-right: 1px solid var(--ins-hair);
          border-radius: 0;
          font-family: inherit;
          color: inherit;
          text-align: left;
          display: block;
          width: 100%;
          cursor: pointer;
        }
        .cell--invite .fig {
          display: block;
        }
        /* Underline, not red: red on this page is signal, and an invite
           to fill in a setting is not a signal. */
        .cell--invite:hover .fig {
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: var(--ins-gray-600);
        }
        .fig {
          margin-top: 6px;
          font-size: 26px;
          font-weight: 600;
          line-height: 1.1;
        }
        .figSub {
          font-size: 11px;
          font-weight: 600;
          color: var(--ins-gray-600);
        }
        .cap {
          display: block;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          color: var(--ins-gray-600);
        }
        .track {
          height: 7px;
          margin-top: 10px;
          background: var(--ins-track-soft);
        }
        .fill {
          display: block;
          height: 7px;
          background: var(--ins-ink);
          transform-origin: left;
          animation: ins-tapeIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) both 0.2s;
        }
        @keyframes ins-tapeIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        /* ── CTA column ── */
        .cell--cta {
          padding: 0;
          border-left: 1px solid var(--ins-ink);
          display: flex;
          flex-direction: column;
        }
        .log,
        .set {
          appearance: none;
          border: none;
          border-radius: 0;
          font-family: inherit;
          flex: 1;
          min-height: 44px;
          display: flex;
          align-items: center;
          padding: 0 26px;
          white-space: nowrap;
          cursor: pointer;
        }
        .log {
          background: var(--ins-ink);
          color: var(--ins-paper);
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }
        .log:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .set {
          background: none;
          color: var(--ins-gray-600);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          border-top: 1px solid var(--ins-hair);
        }
        .set:hover {
          color: var(--ins-ink);
        }

        /* ── Inline settings row ── */
        .settings {
          grid-column: 1 / -1;
          border-top: 1px solid var(--ins-ink);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 16px 24px;
        }
        .field {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .chev {
          position: absolute;
          right: 12px;
          bottom: 15px;
          font-size: 11px;
          line-height: 1;
          color: var(--ins-gray-600);
          pointer-events: none;
        }
        .flab {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: var(--ins-gray-600);
        }
        .ctl {
          appearance: none;
          -webkit-appearance: none;
          border: 1px solid var(--ins-hair);
          border-radius: 0;
          background: var(--ins-paper);
          color: var(--ins-ink);
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          min-height: 44px;
          width: 100%;
          padding: 0 12px;
        }
        select.ctl {
          padding-right: 30px;
        }
        .ctl:focus-visible {
          outline: 2px solid var(--ins-ink);
          outline-offset: -2px;
        }

        .foot {
          margin: 8px 0 0;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          color: var(--ins-gray-600);
        }

        /* ── Mid band: the CTA column drops under the three readings ── */
        @media (max-width: 1100px) {
          .box {
            grid-template-columns: 220px 1fr 1fr;
          }
          .cell--cta {
            grid-column: 1 / -1;
            flex-direction: row;
            border-left: none;
            border-top: 1px solid var(--ins-ink);
          }
          .set {
            border-top: none;
            border-left: 1px solid var(--ins-hair);
          }
          .settings {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ── Mobile (26-ref): stacked rows inside one box ── */
        @media (max-width: 640px) {
          .box {
            grid-template-columns: 1fr;
          }
          .cell--day {
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
          }
          .kicker {
            font-size: 10px;
            letter-spacing: 0.16em;
          }
          .day {
            margin-top: 4px;
            font-size: 24px;
            letter-spacing: -0.015em;
          }
          .dayMeta {
            margin-top: 0;
            font-size: 10px;
            letter-spacing: 0.1em;
            text-align: right;
          }
          /* Both readings collapse to "label left · figure right, detail
             on the line below" (26-ref). */
          .cell--room,
          .cell--units {
            padding: 12px 16px;
            border-right: none;
            border-bottom: 1px solid var(--ins-hair);
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
            width: 100%;
          }
          .label {
            letter-spacing: 0.12em;
          }
          .cap {
            flex-basis: 100%;
            margin-top: 6px;
          }
          .fig {
            margin-top: 0;
          }
          .cell--units .fig {
            font-size: 16px;
            font-weight: 700;
          }
          /* The tape price is already the page's hero figure — the phone
             doesn't need it a second time in this row. */
          .cell--units .figSub {
            display: none;
          }
          .cell--room .fig {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.06em;
          }
          .cell--room .figSub {
            font-size: 11px;
            font-weight: 700;
            color: inherit;
          }
          .cell--invite .fig {
            font-size: 14px;
            font-weight: 700;
          }
          .track {
            flex-basis: 100%;
            margin-top: 8px;
          }
          .track,
          .fill {
            height: 6px;
          }
          /* Stacked CTAs — LOG full-bleed ink, SET the ruled row under it.
             The 26-ref crop shows only the ink bar, but the settings have
             to stay reachable on a phone, so the secondary keeps its own
             44px row rather than hiding behind a desktop-only control. */
          .cell--cta {
            flex-direction: column;
            border-top: none;
          }
          .log {
            justify-content: center;
            min-height: 48px;
            font-size: 11px;
            letter-spacing: 0.12em;
          }
          .set {
            justify-content: center;
            border-left: none;
            border-top: 1px solid var(--ins-hair);
            min-height: 44px;
          }
          .settings {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 14px 16px;
          }
          .foot {
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}
