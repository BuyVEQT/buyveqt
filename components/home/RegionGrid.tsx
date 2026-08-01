"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Region } from "@/lib/useRegions";
import { fmtSignedPct, fmtSignedPp } from "@/lib/instrument-format";

/**
 * RegionGrid — the Instrument's sleeves ledger.
 *
 * "Four sleeves, one fund." — 3px rule, eyebrow + display + right caption,
 * attribution sentence, then a `1.5fr 1fr` grid: oversized leader block
 * (rank ordinal, micro-label, 52px move, weight bar, contribution,
 * 30-day sparkline) beside three ruled follower rows ranked by
 * |contribution|.
 *
 * Mobile (<640px): leader collapses into a 1px-ink box (label + move,
 * weight bar + combined meta) above three compact follower rows, per the
 * mobile artboard. Mid (<960px): the two grid columns stack.
 */

/** Sleeve names that read naturally after "The … carried today". */
const SENTENCE_NAME: Record<string, string> = {
  VUN: "United States",
  VCN: "Canadian market",
  VIU: "developed-markets sleeve",
  VEE: "emerging-markets sleeve",
};

const SPARK_W = 200;
const SPARK_H = 48;
const SPARK_PAD = 3;

/** Build the 30-day sparkline path (viewBox 200×48, rendered 150×48). */
function sparkPath(history: Region["history"]): string | null {
  if (history.length < 2) return null;
  const closes = history.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min;
  return closes
    .map((close, i) => {
      const x = (i / (closes.length - 1)) * SPARK_W;
      const y =
        span === 0
          ? SPARK_H / 2
          : SPARK_PAD + (1 - (close - min) / span) * (SPARK_H - SPARK_PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

interface RegionGridProps {
  regions: Region[];
  leaderIndex: number;
  fundChangePercent: number | null;
}

export default function RegionGrid({
  regions,
  leaderIndex,
  fundChangePercent,
}: RegionGridProps) {
  // Leader first (from leaderIndex), then the rest by |contribution| desc.
  // When leaderIndex is -1 (attribution missing) fall back to sorting the
  // whole set — stable sort keeps the VUN/VCN/VIU/VEE order for null data.
  const ordered = useMemo(() => {
    if (regions.length === 0) return [];
    const leader =
      leaderIndex >= 0 && leaderIndex < regions.length
        ? regions[leaderIndex]
        : null;
    const byContribution = (a: Region, b: Region) =>
      Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0);
    if (!leader) return [...regions].sort(byContribution);
    return [leader, ...regions.filter((r) => r !== leader).sort(byContribution)];
  }, [regions, leaderIndex]);

  const leader = ordered[0] ?? null;
  const followers = ordered.slice(1);

  const leaderNegative = (leader?.changePercent ?? 0) < 0;
  const leaderSpark = leader ? sparkPath(leader.history) : null;

  // "The United States carried today — +0.30 pp of the fund's +0.43% move."
  const sentence = useMemo(() => {
    if (!leader || leader.contribution == null) {
      return (
        <>Four regional sleeves, one fund — today&rsquo;s attribution is unavailable.</>
      );
    }
    const name = SENTENCE_NAME[leader.ticker] ?? leader.label;
    const verb = leader.contribution < 0 ? "dragged" : "carried";
    const pp = fmtSignedPp(leader.contribution).toLowerCase();
    if (fundChangePercent == null) {
      return (
        <>
          The {name} {verb} today — {pp} of the fund&rsquo;s move.
        </>
      );
    }
    return (
      <>
        The {name} {verb} today — {pp} of the fund&rsquo;s{" "}
        {fmtSignedPct(fundChangePercent)} move.
      </>
    );
  }, [leader, fundChangePercent]);

  const head = (
    <header className="sleeves__head">
      <div>
        <div className="sleeves__eyebrow">Today&apos;s move came from</div>
        <h2 className="sleeves__display">Four sleeves, one fund.</h2>
      </div>
      <div className="sleeves__caption">
        A weighted average of four
        <br />
        regional Vanguard ETFs
      </div>
    </header>
  );

  // Loading / empty — keep the section header, show ink-tint skeleton bars.
  if (regions.length === 0) {
    return (
      <section className="sleeves" aria-label="Today's move by sleeve" aria-busy="true">
        {head}
        <div className="sleeves__grid" aria-hidden="true">
          <div className="sleeves__skel-leader">
            <span className="sleeves__skel-bar" style={{ width: "38%", height: 8 }} />
            <span className="sleeves__skel-bar" style={{ width: "52%", height: 40 }} />
            <span className="sleeves__skel-bar" style={{ width: "100%", height: 5 }} />
            <span className="sleeves__skel-bar" style={{ width: "30%", height: 8 }} />
          </div>
          <div className="sleeves__skel-rows">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sleeves__skel-row">
                <span
                  className="sleeves__skel-bar"
                  style={{ height: 12, width: i === 1 ? "72%" : "84%" }}
                />
              </div>
            ))}
          </div>
        </div>
        <SleevesStyles />
      </section>
    );
  }

  return (
    <section className="sleeves" aria-label="Today's move by sleeve">
      {head}

      <p className="sleeves__sentence">{sentence}</p>

      <div className="sleeves__grid">
        {leader && (
          <div>
            {/* Desktop / tablet leader block */}
            <Link href="/inside-veqt#sleeves" className="sleeves__leader-desk">
              <span className="sleeves__ord" aria-hidden="true">
                01
              </span>
              <div>
                <div className="sleeves__microlabel">
                  Leader · {leader.ticker} · {leader.fullName}
                </div>
                <div
                  className={`sleeves__value${leaderNegative ? " is-neg" : ""}`}
                >
                  {leader.changePercent != null
                    ? fmtSignedPct(leader.changePercent)
                    : "—"}
                </div>
                <div className="sleeves__bar-row">
                  <div className="sleeves__track">
                    <div
                      className="sleeves__fill"
                      style={{ width: `${leader.weight}%` }}
                    />
                  </div>
                  <span className="sleeves__weight">
                    Weight {leader.weight.toFixed(1)}%
                  </span>
                </div>
                <div className="sleeves__contrib">
                  Contribution{" "}
                  {leader.contribution != null
                    ? fmtSignedPp(leader.contribution)
                    : "—"}
                </div>
              </div>
              {leaderSpark ? (
                <svg
                  className="sleeves__spark"
                  width="150"
                  height="48"
                  viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                  aria-label={`${leader.label} 30-day trend`}
                  role="img"
                >
                  <path
                    d={leaderSpark}
                    fill="none"
                    stroke="var(--ins-ink)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <span aria-hidden="true" />
              )}
            </Link>

            {/* Mobile boxed leader */}
            <Link href="/inside-veqt#sleeves" className="sleeves__leader-mob">
              <div className="sleeves__mob-top">
                <span className="sleeves__mob-label">
                  Leader · {leader.ticker} · {leader.fullName}
                </span>
                <span
                  className={`sleeves__mob-value${leaderNegative ? " is-neg" : ""}`}
                >
                  {leader.changePercent != null
                    ? fmtSignedPct(leader.changePercent)
                    : "—"}
                </span>
              </div>
              <div className="sleeves__mob-bar">
                <div className="sleeves__track sleeves__track--mob">
                  <div
                    className="sleeves__fill"
                    style={{ width: `${leader.weight}%` }}
                  />
                </div>
                <span className="sleeves__mob-meta">
                  {leader.weight.toFixed(1)}%
                  {leader.contribution != null
                    ? ` · ${fmtSignedPp(leader.contribution)}`
                    : ""}
                </span>
              </div>
            </Link>
          </div>
        )}

        <div className="sleeves__followers">
          {followers.map((r, i) => {
            const negative = (r.changePercent ?? 0) < 0;
            const isFirst = i === 0;
            const isLast = i === followers.length - 1;
            return (
              <Link
                key={r.ticker}
                href="/inside-veqt#sleeves"
                className={`sleeves__row${isFirst ? " is-first" : ""}${
                  isLast ? " is-last" : ""
                }`}
              >
                <span className="sleeves__rank" aria-hidden="true">
                  {`0${i + 2}`}
                </span>
                <span className="sleeves__name">
                  {r.label}{" "}
                  <span className="sleeves__name-sub">
                    {r.ticker} · {r.weight.toFixed(1)}%
                  </span>
                </span>
                <span className="sleeves__pp">
                  {r.contribution != null ? fmtSignedPp(r.contribution) : "—"}
                </span>
                <span className={`sleeves__pct${negative ? " is-neg" : ""}`}>
                  {r.changePercent != null ? fmtSignedPct(r.changePercent) : "—"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <SleevesStyles />
    </section>
  );
}

function SleevesStyles() {
  return (
    <style jsx global>{`
      .sleeves {
        font-family: var(--ins-font);
        color: var(--ins-ink);
        font-variant-numeric: tabular-nums;
      }

      /* ── Header ─────────────────────────────────────────────── */
      .sleeves__head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-top: 3px solid var(--ins-rule-strong);
        padding-top: 12px;
      }
      .sleeves__eyebrow {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.2em;
        color: var(--ins-gray-600);
        text-transform: uppercase;
      }
      .sleeves__display {
        font-size: 40px;
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.05;
        color: var(--ins-ink);
        margin: 6px 0 0;
      }
      /* Explanatory caption (a sentence fragment describing how the
         number is built), not a label — sentence case at 12px since
         Turn 8. Was 9.5px caps at 0.2em. */
      .sleeves__caption {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.01em;
        color: var(--ins-gray-600);
        text-align: right;
        line-height: 1.5;
      }

      /* ── Sentence ───────────────────────────────────────────── */
      .sleeves__sentence {
        margin: 14px 0 0;
        font-size: 19px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--ins-ink);
      }

      /* ── Grid ───────────────────────────────────────────────── */
      .sleeves__grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 40px;
        margin-top: 18px;
      }

      /* ── Leader (desktop) ───────────────────────────────────── */
      .sleeves__leader-desk {
        border-top: 1px solid var(--ins-ink);
        padding-top: 16px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 24px;
        align-items: start;
        color: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      /* Desktop leader is an open ledger row (top rule only) — hover
         doubles that rule via an inset shadow, zero layout shift. The
         mobile leader is a boxed card, so its whole ring doubles. */
      .sleeves__leader-desk:hover {
        box-shadow: inset 0 1px 0 var(--ins-ink);
      }
      .sleeves__leader-mob:hover {
        box-shadow: 0 0 0 1px var(--ins-ink);
      }
      .sleeves__ord {
        font-size: 64px;
        font-weight: 700;
        line-height: 0.8;
        color: var(--ins-ordinal);
      }
      .sleeves__microlabel {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.16em;
        color: var(--ins-gray-600);
        text-transform: uppercase;
      }
      .sleeves__value {
        font-size: 52px;
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.05;
        margin-top: 8px;
        color: var(--ins-ink);
      }
      .sleeves__value.is-neg {
        color: var(--ins-signal);
      }
      .sleeves__bar-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 14px;
      }
      .sleeves__track {
        flex: 1;
        height: 5px;
        background: var(--ins-track-soft);
      }
      .sleeves__fill {
        height: 100%;
        background: var(--ins-ink);
      }
      .sleeves__weight {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--ins-gray-600);
        text-transform: uppercase;
        white-space: nowrap;
      }
      .sleeves__contrib {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: var(--ins-ink);
        text-transform: uppercase;
        margin-top: 10px;
      }
      .sleeves__spark {
        margin-top: 26px;
        display: block;
      }

      /* ── Leader (mobile box) ────────────────────────────────── */
      .sleeves__leader-mob {
        display: none;
        border: 1px solid var(--ins-ink);
        padding: 14px 16px;
        color: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      .sleeves__mob-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
      }
      .sleeves__mob-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--ins-gray-600);
        text-transform: uppercase;
      }
      .sleeves__mob-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--ins-ink);
      }
      .sleeves__mob-value.is-neg {
        color: var(--ins-signal);
      }
      .sleeves__mob-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
      }
      .sleeves__track--mob {
        height: 4px;
      }
      .sleeves__mob-meta {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--ins-gray-600);
        text-transform: uppercase;
        white-space: nowrap;
      }

      /* ── Followers ──────────────────────────────────────────── */
      .sleeves__followers {
        display: flex;
        flex-direction: column;
      }
      .sleeves__row {
        display: grid;
        grid-template-columns: 30px 1fr auto auto;
        gap: 14px;
        align-items: baseline;
        padding: 13px 0;
        border-top: 1px solid var(--ins-hair);
        color: inherit;
        text-decoration: none;
        cursor: pointer;
        transition: padding-left 0.15s;
      }
      /* Reading-row grammar: the row indents into the click. */
      .sleeves__row:hover {
        padding-left: 8px;
      }
      .sleeves__row.is-first {
        border-top-color: var(--ins-ink);
      }
      .sleeves__row.is-last {
        border-bottom: 1px solid var(--ins-ink);
      }
      /* Ghost rank numeral. 0.3 is already an ink-scale step and stays
         there: --ins-ordinal's 12% is tuned for the 44–64px oversized
         numerals, and at 15px it would be invisible. */
      .sleeves__rank {
        font-size: 15px;
        font-weight: 700;
        color: rgba(17, 17, 17, 0.3);
      }
      .sleeves__name {
        font-size: 13px;
        font-weight: 700;
        color: var(--ins-ink);
        text-transform: uppercase;
        min-width: 0;
      }
      .sleeves__name-sub {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--ins-gray-600);
      }
      .sleeves__pp {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--ins-gray-600);
        white-space: nowrap;
      }
      .sleeves__pct {
        font-size: 16px;
        font-weight: 700;
        color: var(--ins-ink);
        white-space: nowrap;
      }
      .sleeves__pct.is-neg {
        color: var(--ins-signal);
      }

      /* ── Skeleton (loading) ─────────────────────────────────── */
      .sleeves__skel-leader {
        border-top: 1px solid var(--ins-ink);
        padding-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .sleeves__skel-rows {
        display: flex;
        flex-direction: column;
      }
      .sleeves__skel-row {
        padding: 13px 0;
        border-top: 1px solid var(--ins-hair);
      }
      .sleeves__skel-row:first-child {
        border-top-color: var(--ins-ink);
      }
      .sleeves__skel-row:last-child {
        border-bottom: 1px solid var(--ins-ink);
      }
      .sleeves__skel-bar {
        display: block;
        background: rgba(17, 17, 17, 0.08);
      }

      /* ── Mid: stack the two grid columns ────────────────────── */
      @media (max-width: 960px) {
        .sleeves__grid {
          grid-template-columns: 1fr;
          gap: 28px;
        }
      }

      /* ── Mobile ─────────────────────────────────────────────── */
      @media (max-width: 640px) {
        .sleeves__head {
          display: block;
          border-top-width: 2px;
          padding-top: 10px;
        }
        .sleeves__caption {
          display: none;
        }
        .sleeves__eyebrow {
          font-size: 10px;
          letter-spacing: 0.16em;
        }
        .sleeves__display {
          font-size: 28px;
          letter-spacing: -0.02em;
          margin-top: 4px;
        }
        .sleeves__sentence {
          display: none;
        }
        .sleeves__grid {
          margin-top: 12px;
          gap: 0;
        }
        .sleeves__leader-desk {
          display: none;
        }
        .sleeves__leader-mob {
          display: block;
        }
        .sleeves__row {
          grid-template-columns: 1fr auto auto;
          gap: 12px;
          padding: 11px 2px;
          border-top: none;
          border-bottom: 1px solid var(--ins-hair);
        }
        .sleeves__row.is-first {
          border-top: none;
        }
        .sleeves__row.is-last {
          border-bottom: 1px solid var(--ins-ink);
        }
        .sleeves__rank {
          display: none;
        }
        .sleeves__name {
          font-size: 12px;
        }
        .sleeves__name-sub {
          font-size: 10px;
          letter-spacing: 0;
        }
        .sleeves__pp {
          font-size: 10px;
          letter-spacing: 0;
        }
        .sleeves__pct {
          font-size: 14px;
        }
        .sleeves__skel-leader {
          border-top: none;
          border: 1px solid var(--ins-ink);
          padding: 14px 16px;
          margin-bottom: 0;
        }
      }
    `}</style>
  );
}
