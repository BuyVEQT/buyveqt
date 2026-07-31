"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVeqtData } from "@/lib/useVeqtData";
import { fmtInt } from "@/lib/instrument-format";
import { buildAlmanac, type NotableState } from "./almanac-derive";
import LedgerRow from "./LedgerRow";

/**
 * The Almanac (/almanac) — the archive the seven-state weather system
 * produces. Every session since launch that the engine classified above
 * the 90th percentile, newest first, one ruled row each.
 *
 * This is where the home page's rally rail lands ("ARCHIVED →").
 *
 * Data: the same ALL history the home page fetches (useVeqtData("ALL")),
 * re-run through lib/severity via components/almanac/almanac-derive. No
 * new endpoint, no second yardstick — see that file for why the archive
 * and the home gauge cannot disagree.
 *
 * styled-jsx: the whole page is one lexical return (no nested-closure JSX
 * — the scope class would not attach), <Link> is reached through :global
 * under a scoped parent, and LedgerRow styles its own row in its own scope.
 */

type FilterKey = "ALL" | NotableState;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "rally", label: "RALLIES" },
  { key: "gale", label: "GALES" },
  { key: "squall", label: "SQUALLS" },
  { key: "surge", label: "SURGES" },
];

const SKELETON_ROWS = 8;

export default function AlmanacClient() {
  const { data, loading } = useVeqtData("ALL");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const jumped = useRef(false);

  const almanac = useMemo(
    () => buildAlmanac(data?.historical ?? []),
    [data]
  );

  const rows = useMemo(() => {
    if (!almanac) return [];
    if (filter === "ALL") return almanac.entries;
    return almanac.entries.filter((e) => e.state === filter);
  }, [almanac, filter]);

  /* Deep links (/almanac#2025-10-08): the rows only exist once the ALL
     history lands, long after the browser gave up on the hash. Jump once,
     the first time there is something to jump to. */
  useEffect(() => {
    if (jumped.current || rows.length === 0) return;
    jumped.current = true;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash));
    if (el) el.scrollIntoView({ block: "start" });
  }, [rows.length]);

  const firstYear = almanac?.firstYear ?? 2019;
  const showSkeleton = loading && !almanac;
  const notableCount = almanac?.entries.length ?? 0;

  /* Quiet, rail-style note instead of the ledger when there is nothing to
     print — a dead fetch, a sample too thin to classify, a tape that has
     never crossed P90, or a filter with no days in it. */
  let note: string | null = null;
  if (!showSkeleton) {
    if (!almanac) {
      note = data
        ? "NOT ENOUGH SESSIONS ON FILE TO CLASSIFY YET"
        : "THE TAPE DIDN’T ANSWER — REFRESH IN A MOMENT";
    } else if (notableCount === 0) {
      note = "NO SESSION HAS CROSSED THE 90TH PERCENTILE YET";
    } else if (rows.length === 0) {
      note = "NO DAYS ON FILE IN THIS CLASS — TRY ALL";
    }
  }

  return (
    <main className="ins-root ins-almanac">
      <div className="ins-page">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <header className="hero">
          <div className="hero__kicker">
            The Almanac &middot; Every day the sky turned &middot; Since{" "}
            {firstYear}
          </div>
          <h1 className="hero__display">Days worth remembering.</h1>
          <p className="hero__dek">
            Most sessions are calm. These are the ones that weren&rsquo;t
            &mdash; every session since launch louder than the 90th percentile,
            classified by the weather system.
          </p>
        </header>

        {/* ── Stats strip ───────────────────────────────────────────── */}
        {showSkeleton ? (
          <div className="stats" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="stat">
                <span className="skl" style={{ width: "64%" }} />
                <span className="skl skl--value" />
                <span className="skl" style={{ width: "82%" }} />
              </div>
            ))}
          </div>
        ) : (
          almanac && (
            <section className="stats" aria-label="The archive at a glance">
              <div className="stat">
                <div className="statLabel">Notable days</div>
                <div className="statValue">{fmtInt(notableCount)}</div>
                <div className="statSub">Above the 90th pctl</div>
              </div>
              <div className="stat">
                <div className="statLabel">Rallies</div>
                <div className="statValue">{fmtInt(almanac.counts.rally)}</div>
                <div className="statSub">98th pctl &middot; up days</div>
              </div>
              <div className="stat">
                <div className="statLabel">Gales</div>
                <div className="statValue statValue--signal">
                  {fmtInt(almanac.counts.gale)}
                </div>
                <div className="statSub">98th pctl &middot; down days</div>
              </div>
              <div className="stat">
                <div className="statLabel">Share of all sessions</div>
                <div className="statValue">
                  {almanac.sharePercent.toFixed(1)}%
                </div>
                <div className="statSub">
                  Of {fmtInt(almanac.totalSessions)} sessions since {firstYear}
                </div>
              </div>
            </section>
          )
        )}

        {/* ── The ledger ────────────────────────────────────────────── */}
        <section className="ledgerSection" aria-labelledby="alm-ledger-label">
          <div className="ledgerHead">
            <div>
              <div className="eyebrow" id="alm-ledger-label">
                The ledger &middot; Newest first
              </div>
              <div className="showing" aria-live="polite">
                {almanac
                  ? `Showing ${fmtInt(rows.length)} of ${fmtInt(notableCount)}`
                  : "Reading the tape"}
              </div>
            </div>
            <div className="tabs" role="tablist" aria-label="Filter the ledger">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={f.key === filter}
                  aria-controls="alm-ledger"
                  className={`tab${f.key === filter ? " is-active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* The tabs' aria-controls target — always present, whatever is
              inside it, so the reference never dangles. */}
          <div id="alm-ledger">
            {showSkeleton ? (
              <div className="skelRows" aria-hidden="true">
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <div key={i} className="skelRow">
                    <span className="skl" style={{ width: "190px" }} />
                    <span className="skl skl--glyph" />
                    <span className="skl" style={{ width: "58%" }} />
                    <span className="skl skl--move" />
                  </div>
                ))}
              </div>
            ) : note ? (
              <div className="note">
                <span className="sq" aria-hidden="true" />
                <span className="noteCopy">{note}</span>
              </div>
            ) : (
              <ol className="ledger">
                {rows.map((entry) => (
                  <LedgerRow key={entry.date} entry={entry} />
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* ── Verdict rail — only once there is a record to stand on ── */}
        {almanac && notableCount > 0 && (
          <div className="rail">
            <span className="sq" aria-hidden="true" />
            <span className="railCopy">
              EVERY ONE OF THESE WAS SURVIVABLE &mdash; THAT&rsquo;S THE RECORD
            </span>
            <span className="railNote">
              {`${fmtInt(notableCount)} NOTABLE DAYS IN ${fmtInt(
                almanac.totalSessions
              )} SESSIONS · THE REST WERE CALM`}
            </span>
          </div>
        )}

        {/* ── Closer ────────────────────────────────────────────────── */}
        <section className="closer" aria-label="Closing note">
          <div>
            <p className="closerDisplay">
              The sky clears. It&rsquo;s on file.
            </p>
            <p className="closerSub">
              Every one of these sessions ended and the tape kept going.
              Today&rsquo;s reading is the only one that asks anything of you.
            </p>
          </div>
          <Link href="/" className="closerLink">
            Back to today&rsquo;s weather <span aria-hidden>&rarr;</span>
          </Link>
        </section>
      </div>

      <style jsx>{`
        .ins-almanac {
          background: var(--ins-paper);
          min-height: 100dvh;
          color: var(--ins-ink);
          font-family: var(--ins-font);
        }
        .ins-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 40px;
        }

        /* ── Hero ──────────────────────────────────────────────────── */
        .hero {
          padding-top: 34px;
        }
        .hero__kicker {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .hero__display {
          margin: 16px 0 0;
          font-size: 76px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 0.94;
          color: var(--ins-ink);
          animation: ins-fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) 0.1s both;
        }
        .hero__dek {
          margin: 18px 0 0;
          max-width: 640px;
          font-size: 15.5px;
          font-weight: 500;
          line-height: 1.55;
          color: var(--ins-gray-700);
        }

        /* ── Stats strip ───────────────────────────────────────────── */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 16px 0;
          border-top: 1px solid var(--ins-hair);
          border-bottom: 1px solid var(--ins-hair);
          font-variant-numeric: tabular-nums;
        }
        .stat {
          padding: 0 24px;
          border-left: 1px solid var(--ins-hair);
          min-width: 0;
        }
        .stat:first-child {
          padding-left: 0;
          border-left: 0;
        }
        .statLabel {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .statValue {
          margin-top: 4px;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.05;
          color: var(--ins-ink);
        }
        .statValue--signal {
          color: var(--ins-signal);
        }
        .statSub {
          margin-top: 3px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }

        /* ── Ledger head + tabs ────────────────────────────────────── */
        .ledgerSection {
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 12px;
        }
        .ledgerHead {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
        }
        .eyebrow {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .showing {
          margin-top: 6px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .tabs {
          display: flex;
          gap: 2px;
          flex-wrap: wrap;
        }
        .tab {
          appearance: none;
          background: none;
          border: 1px solid transparent;
          border-radius: 0;
          padding: 5px 11px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--ins-gray-600);
          cursor: pointer;
        }
        .tab:not(.is-active):hover {
          border-color: var(--ins-hair);
          color: var(--ins-ink);
        }
        .tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }

        /* ── Ledger list ───────────────────────────────────────────── */
        .ledger {
          list-style: none;
          margin: 14px 0 0;
          padding: 0;
          border-bottom: 1px solid var(--ins-hair);
        }

        /* ── Quiet notes (empty / error) ───────────────────────────── */
        .note {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          border-top: 1px solid var(--ins-hair);
          border-bottom: 1px solid var(--ins-hair);
          padding: 14px 0;
        }
        .noteCopy {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
        }

        /* ── Verdict rail ──────────────────────────────────────────── */
        .rail {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          border: 1px solid var(--ins-ink);
          padding: 12px 18px;
        }
        .sq {
          width: 9px;
          height: 9px;
          background: var(--ins-ink);
          flex: none;
        }
        .railCopy {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }
        .railNote {
          margin-left: auto;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        /* ── Closer ────────────────────────────────────────────────── */
        .closer {
          border-top: 1px solid var(--ins-ink);
          padding-top: 40px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: end;
        }
        .closerDisplay {
          margin: 0;
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .closerSub {
          margin: 12px 0 0;
          max-width: 560px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.5;
          color: var(--ins-gray-600);
        }
        /* <Link> is an imported component — styled-jsx will not attach the
           scope class to it, so reach it through :global under .closer. */
        .closer :global(.closerLink) {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-signal);
          text-decoration: none;
          border-bottom: 2px solid var(--ins-signal);
          padding-bottom: 5px;
          white-space: nowrap;
          justify-self: end;
        }

        /* ── Loading — ink-tint bars, no spinners ──────────────────── */
        .skl {
          display: block;
          height: 9px;
          background: var(--ins-track-soft);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }
        .stats .stat .skl + .skl {
          margin-top: 10px;
        }
        .skl--value {
          height: 30px;
          width: 46%;
        }
        .skelRows {
          margin-top: 14px;
          border-bottom: 1px solid var(--ins-hair);
        }
        .skelRow {
          display: grid;
          grid-template-columns: 236px 34px minmax(0, 1fr) auto;
          column-gap: 22px;
          align-items: center;
          padding: 22px 0;
          border-top: 1px solid var(--ins-hair);
        }
        .skl--glyph {
          height: 30px;
          width: 30px;
        }
        .skl--move {
          height: 18px;
          width: 96px;
        }

        /* ── Mid band ──────────────────────────────────────────────── */
        @media (max-width: 960px) {
          .hero__display {
            font-size: 56px;
          }
          .stats {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 18px;
          }
          .stat:nth-child(3) {
            padding-left: 0;
            border-left: 0;
          }
        }

        /* ── Mobile (390 artboard) ─────────────────────────────────── */
        @media (max-width: 640px) {
          .ins-page {
            gap: 24px;
            padding: 0 20px 28px;
          }
          .hero {
            padding-top: 24px;
          }
          .hero__kicker {
            font-size: 8.5px;
            letter-spacing: 0.2em;
          }
          .hero__display {
            margin-top: 10px;
            font-size: 34px;
            letter-spacing: -0.03em;
            line-height: 1.02;
          }
          .hero__dek {
            margin-top: 12px;
            font-size: 13px;
            line-height: 1.5;
          }
          .stats {
            padding: 14px 0;
            row-gap: 14px;
          }
          .stat {
            padding: 0 14px;
          }
          .statLabel {
            font-size: 8px;
            letter-spacing: 0.14em;
          }
          .statValue {
            font-size: 24px;
          }
          .statSub {
            font-size: 8px;
            letter-spacing: 0.1em;
          }
          .ledgerHead {
            align-items: flex-start;
            gap: 12px;
          }
          .eyebrow {
            font-size: 8.5px;
            letter-spacing: 0.2em;
          }
          .showing {
            margin-top: 4px;
            font-size: 11px;
          }
          .tabs {
            width: 100%;
          }
          .tab {
            flex: 1 1 auto;
            padding: 6px 6px;
            font-size: 9px;
            letter-spacing: 0.06em;
            text-align: center;
          }
          .skelRow {
            grid-template-columns: 26px minmax(0, 1fr) auto;
            column-gap: 10px;
            padding: 18px 0;
          }
          .skl--glyph {
            height: 24px;
            width: 24px;
          }
          .skl--move {
            width: 70px;
          }
          .rail {
            gap: 10px;
            padding: 10px 14px;
          }
          .sq {
            width: 7px;
            height: 7px;
          }
          .railCopy {
            font-size: 9px;
            letter-spacing: 0.13em;
          }
          .railNote {
            margin-left: 0;
            width: 100%;
            text-align: left;
            font-size: 8px;
            letter-spacing: 0.1em;
          }
          .noteCopy {
            font-size: 9px;
            letter-spacing: 0.12em;
          }
          .closer {
            display: block;
            padding-top: 20px;
          }
          .closerDisplay {
            font-size: 24px;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }
          .closerSub {
            margin-top: 8px;
            font-size: 12.5px;
          }
          .closer :global(.closerLink) {
            display: inline-block;
            margin-top: 14px;
            font-size: 10px;
            letter-spacing: 0.14em;
            padding-bottom: 4px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ins-almanac,
          .ins-almanac :global(*) {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
