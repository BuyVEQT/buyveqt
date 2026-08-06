"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSleeves } from "@/lib/useSleeves";
import { getSleeveMeta, SLEEVES, type SleeveMeta } from "@/data/sleeves";
import { FUNDS } from "@/data/funds";
import { fmtInt } from "@/lib/instrument-format";
import SleeveYearStrip from "./SleeveYearStrip";
import SleeveBook from "./SleeveBook";
import SleeveHeatBoard from "./SleeveHeatBoard";

/** Full sleeve names, from the factsheet snapshot. */
const SLEEVE_NAME: Record<string, string> = Object.fromEntries(
  (FUNDS["VEQT.TO"]?.underlyingETFs ?? []).map((e) => [e.ticker, e.name])
);

interface ChartPoint {
  date: string;
  close: number;
}

function fmtAum(raw: number | null): string {
  if (raw === null || !Number.isFinite(raw) || raw <= 0) return "—";
  if (raw >= 1e9) return `$${(raw / 1e9).toFixed(1)}B`;
  if (raw >= 1e6) return `$${(raw / 1e6).toFixed(0)}M`;
  return `$${raw.toFixed(0)}`;
}

/* One component per styled-jsx block — the Turbopack transform rejects a
   second <style jsx> inside the same component function (the same
   constraint that shaped InsideCloser). */

function DossierHero({
  ticker,
  meta,
  weight,
  netAssets,
  ordinal,
}: {
  ticker: string;
  meta: SleeveMeta;
  weight: number;
  netAssets: number | null;
  ordinal: number;
}) {
  return (
    <section className="dhero" aria-label={`The ${ticker} sleeve`}>
      <div className="dhero__kicker">
        <Link href="/inside-veqt#sleeves" className="dhero__back">
          ← The floor plan
        </Link>
        <span className="dhero__crumb">
          Inside VEQT · Sleeve {ordinal} of {SLEEVES.length}
        </span>
      </div>

      <h1 className="dhero__display">
        {ticker}
        <span className="dhero__signal">.</span>
      </h1>
      <div className="dhero__role">{SLEEVE_NAME[ticker] ?? meta.roomLabel}</div>
      <p className="dhero__dek">{meta.roleDek}</p>

      <div className="dhero__spec">
        <div className="dhero__cell">
          <div className="dhero__label">Weight in VEQT</div>
          <div className="dhero__value">{weight.toFixed(1)}%</div>
          <div className="dhero__sub">
            {meta.isPinned ? "Pinned at 30 by design" : "Floats at market cap"}
          </div>
        </div>
        <div className="dhero__cell">
          <div className="dhero__label">Sleeve AUM</div>
          <div className="dhero__value">{fmtAum(netAssets)}</div>
          <div className="dhero__sub">The ETF in its own right</div>
        </div>
        <div className="dhero__cell">
          <div className="dhero__label">Holdings</div>
          <div className="dhero__value">≈{fmtInt(meta.approxCompanies)}</div>
          <div className="dhero__sub">Companies in this sleeve</div>
        </div>
        <div className="dhero__cell">
          <div className="dhero__label">On tape</div>
          <div className="dhero__value">Since {meta.inceptionYear}</div>
          <div className="dhero__sub">Judged here from Jan 2019</div>
        </div>
      </div>

      <style jsx>{`
        .dhero {
          padding-top: 30px;
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .dhero__kicker {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 20px;
        }
        /* TRUE LABEL — button text back to the hub. styled-jsx does not
           tag <Link>; scoped via :global. */
        .dhero :global(.dhero__back) {
          position: relative;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-ink);
          text-decoration: none;
          border-bottom: 2px solid var(--ins-ink);
          padding-bottom: 3px;
          white-space: nowrap;
        }
        /* ≥44px tap height via transparent overlay — the 2px rule stays the
           affordance (same construction as the methodology CTA). */
        .dhero :global(.dhero__back::after) {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 44px;
          transform: translateY(-50%);
        }
        .dhero :global(.dhero__back:hover) {
          color: var(--ins-signal);
          border-bottom-color: var(--ins-signal);
        }
        /* TRUE LABEL — the dateline crumb. */
        .dhero__crumb {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }

        .dhero__display {
          margin: 22px 0 0;
          font-size: 110px;
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 0.85;
        }
        .dhero__signal {
          color: var(--ins-signal);
        }
        /* TRUE LABEL — the sleeve's full name. */
        .dhero__role {
          margin-top: 12px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .dhero__dek {
          margin: 12px 0 0;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.6;
          max-width: 62ch;
          color: var(--ins-gray-700);
          text-wrap: pretty;
        }

        .dhero__spec {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
          margin-top: 24px;
          border-top: 3px solid var(--ins-rule-strong);
        }
        .dhero__cell {
          padding-top: 14px;
          min-width: 0;
        }
        .dhero__cell + .dhero__cell {
          border-left: 1px solid var(--ins-hair);
          padding-left: 24px;
        }
        /* TRUE LABEL — names its cell. */
        .dhero__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .dhero__value {
          margin-top: 6px;
          font-size: 30px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          white-space: nowrap;
        }
        /* EXPLANATORY CAPTION — sentence case. */
        .dhero__sub {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 1100px) {
          .dhero__display {
            font-size: 84px;
          }
          .dhero__value {
            font-size: 24px;
          }
        }

        @media (max-width: 640px) {
          .dhero {
            padding-top: 20px;
          }
          .dhero__crumb {
            display: none;
          }
          .dhero__display {
            margin-top: 16px;
            font-size: 64px;
            letter-spacing: -0.04em;
            line-height: 0.9;
          }
          .dhero__role {
            margin-top: 10px;
            font-size: 10px;
            letter-spacing: 0.12em;
          }
          .dhero__dek {
            font-size: 12.5px;
            line-height: 1.55;
          }
          .dhero__spec {
            grid-template-columns: 1fr 1fr;
            gap: 0 20px;
            margin-top: 16px;
            border-top: none;
          }
          .dhero__cell {
            padding: 10px 0;
            border-top: 1px solid var(--ins-ink);
          }
          .dhero__cell:nth-child(-n + 2) {
            border-top-width: 2px;
          }
          .dhero__cell + .dhero__cell {
            border-left: none;
            padding-left: 0;
          }
          .dhero__value {
            font-size: 20px;
          }
          .dhero__sub {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

function DossierClose({ ticker, weight }: { ticker: string; weight: number }) {
  return (
    <section className="dclose" aria-label="Closing note">
      <div className="dclose__rail" role="note">
        <span className="dclose__mark" aria-hidden />
        <span className="dclose__claim">
          <span className="dclose-desk">
            {ticker} is {weight.toFixed(1)}% of every VEQT dollar — Vanguard
            does the weighing
          </span>
          <span className="dclose-mob">
            {weight.toFixed(1)}% of every VEQT dollar
          </span>
        </span>
        <span className="dclose__note">Re-weighed quarterly</span>
      </div>

      <div className="dclose__closer">
        <div>
          <p className="dclose__display">
            You&rsquo;ve read the {ticker} file.
          </p>
          <p className="dclose__sub">
            One of four sleeves. You never have to trade it yourself.
          </p>
        </div>
        <Link href="/inside-veqt#sleeves" className="dclose__cta">
          Back to the floor plan <span aria-hidden>→</span>
        </Link>
      </div>

      <style jsx>{`
        .dclose {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .dclose-mob {
          display: none;
        }
        .dclose__rail {
          border: 1px solid var(--ins-ink);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          padding: 11px 22px;
        }
        .dclose__mark {
          width: 9px;
          height: 9px;
          background: var(--ins-ink);
          flex-shrink: 0;
        }
        /* The rail is a STAMP — caps kept (home-band grammar). */
        .dclose__claim {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        /* TRUE LABEL. */
        .dclose__note {
          margin-left: auto;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }

        .dclose__closer {
          border-top: 1px solid var(--ins-ink);
          margin-top: 30px;
          padding-top: 36px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px;
          align-items: end;
        }
        .dclose__display {
          margin: 0;
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .dclose__sub {
          margin: 12px 0 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--ins-gray-600);
        }
        /* styled-jsx does not tag <Link>; scope via :global. */
        .dclose :global(.dclose__cta) {
          justify-self: end;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-signal);
          text-decoration: none;
          border-bottom: 2px solid var(--ins-signal);
          padding-bottom: 5px;
          white-space: nowrap;
        }
        .dclose :global(.dclose__cta:hover) {
          color: var(--ins-ink);
          border-bottom-color: var(--ins-ink);
        }

        @media (max-width: 900px) {
          .dclose__claim {
            font-size: 10px;
            letter-spacing: 0.14em;
          }
        }
        @media (max-width: 640px) {
          .dclose-desk {
            display: none;
          }
          .dclose-mob {
            display: inline;
          }
          .dclose__rail {
            gap: 8px;
            padding: 11px 14px;
          }
          .dclose__claim {
            letter-spacing: 0.1em;
          }
          .dclose__note {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
          .dclose__closer {
            display: block;
            margin-top: 20px;
            padding-top: 18px;
          }
          .dclose__display {
            font-size: 24px;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }
          .dclose__sub {
            margin-top: 8px;
            font-size: 12.5px;
          }
          .dclose :global(.dclose__cta) {
            display: inline-block;
            margin-top: 12px;
            font-size: 10px;
            letter-spacing: 0.14em;
            padding-bottom: 4px;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * The sleeve dossier — /inside-veqt/[sleeve] (the Observatory's depth pass).
 *
 * One page per sleeve in the Instrument grammar: hero with the sleeve's
 * role and its own vitals (live weight in VEQT, the sleeve ETF's own AUM,
 * ≈company count, launch year), then the chosen instruments — the
 * year-by-year returns strip, the full book (top ten + every sector), and
 * the sleeve's own session board — closed by a verdict rail and a closer
 * back to the floor plan.
 *
 * Data: /api/sleeves (shared store with the Observatory) + one chart fetch
 * (daily closes since Jan 2019, the same route the race reads).
 */
export default function SleeveDossierClient({ ticker }: { ticker: string }) {
  const meta = getSleeveMeta(ticker)!;
  const { data: sleevesData } = useSleeves();

  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/funds/chart/${ticker}?range=ALL`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          data: ChartPoint[];
          error: boolean;
        };
        if (!cancelled && !json.error && json.data?.length) {
          setPoints(json.data.filter((p) => p.close > 0));
        }
      } catch {
        /* board + YTD render their skeleton/absent states */
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const entry = sleevesData?.sleeves.find((s) => s.ticker === ticker) ?? null;
  const weight = entry?.liveWeight ?? meta.targetWeight;
  const ordinal = SLEEVES.findIndex((s) => s.ticker === ticker) + 1;

  return (
    <main className="ins-root ins-inside">
      <div className="ins-page">
        <DossierHero
          ticker={ticker}
          meta={meta}
          weight={weight}
          netAssets={entry?.netAssets ?? null}
          ordinal={ordinal}
        />

        <SleeveYearStrip
          ticker={ticker}
          annualReturns={entry?.annualReturns ?? []}
          points={points}
        />

        <SleeveBook
          ticker={ticker}
          topHoldings={entry?.topHoldings ?? []}
          sectors={entry?.sectors ?? []}
          lookthroughNote={meta.lookthrough.note}
        />

        <SleeveHeatBoard
          ticker={ticker}
          points={points}
          loading={chartLoading}
        />

        <DossierClose ticker={ticker} weight={weight} />
      </div>

      <style jsx>{`
        .ins-inside {
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
        @media (max-width: 640px) {
          .ins-page {
            gap: 20px;
            padding: 0 20px 28px;
          }
        }
      `}</style>
    </main>
  );
}
