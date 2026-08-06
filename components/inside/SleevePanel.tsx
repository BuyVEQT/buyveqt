"use client";

import { useSleeves } from "@/lib/useSleeves";
import { SLEEVES } from "@/data/sleeves";
import { FUNDS } from "@/data/funds";
import { classifyDrift } from "./driftMath";

/** Full sleeve names, from the same factsheet snapshot the weights use. */
const SLEEVE_NAME: Record<string, string> = Object.fromEntries(
  (FUNDS["VEQT.TO"]?.underlyingETFs ?? []).map((e) => [e.ticker, e.name])
);

interface SleevePanelProps {
  active: string;
  onSelect: (ticker: string) => void;
}

/**
 * OPEN A SLEEVE — the Turn 9 module, kept below the floor plan (Turn 10).
 *
 * Segmented VUN/VCN/VIU/VEE tabs over a bordered panel that reprices on
 * click: weight vs its tick + the drift readout, the top of the sleeve's
 * own book, and the three biggest sector tilts. Holdings and sectors come
 * from /api/sleeves; VUN and VEE read through their US-listed engines and
 * say so. No layout shift on switch — every cell has a loading em-dash.
 */
export default function SleevePanel({ active, onSelect }: SleevePanelProps) {
  const { data } = useSleeves();

  const entry = data?.sleeves.find((s) => s.ticker === active) ?? null;
  const meta = SLEEVES.find((s) => s.ticker === active)!;

  const liveWeight = entry?.liveWeight ?? null;
  const weightShown = liveWeight ?? meta.targetWeight;
  const drift = classifyDrift(liveWeight, meta.targetWeight);

  const holdings = entry?.topHoldings ?? [];
  const sectors = entry?.sectors ?? [];
  const maxSector = sectors.reduce((m, s) => Math.max(m, s.weight), 0) || 100;

  return (
    <div className="panel">
      <div
        className="panel__tabs"
        role="tablist"
        aria-label="Open a sleeve"
      >
        {SLEEVES.map((s) => (
          <button
            key={s.ticker}
            role="tab"
            id={`sleeve-tab-${s.ticker}`}
            aria-selected={s.ticker === active}
            aria-controls="sleeve-panel"
            className={`panel__tab${s.ticker === active ? " is-active" : ""}`}
            onClick={() => onSelect(s.ticker)}
          >
            {s.ticker}
          </button>
        ))}
      </div>

      <div
        id="sleeve-panel"
        role="tabpanel"
        aria-labelledby={`sleeve-tab-${active}`}
        className="panel__body"
      >
        <div className="panel__col">
          <div className="panel__name">
            {SLEEVE_NAME[active] ?? active}
          </div>
          <div className="panel__weight">
            {weightShown.toFixed(1)}%
            <span className="panel__target">
              {" "}
              {meta.isPinned
                ? "· PINNED AT 30"
                : `· TICK ${meta.targetWeight.toFixed(1)}`}
            </span>
          </div>
          <div className={`panel__drift is-${drift.kind}`}>{drift.label}</div>
          <p className="panel__note">
            Vanguard snaps drift back to the tick each quarter.
          </p>
        </div>

        <div className="panel__col">
          <div className="panel__label">Top of this sleeve</div>
          <div className="panel__list">
            {(holdings.length > 0 ? holdings : [null, null, null]).map(
              (h, i) => (
                <div className="panel__row" key={h ? h.name : i}>
                  <span className="panel__row-name">{h ? h.name : "—"}</span>
                  <span className="panel__row-weight">
                    {h ? `${h.weight.toFixed(2)}%` : ""}
                  </span>
                </div>
              )
            )}
          </div>
          {meta.lookthrough.note && (
            <p className="panel__note">{meta.lookthrough.note}</p>
          )}
        </div>

        <div className="panel__col">
          <div className="panel__label">Sector tilt</div>
          <div className="panel__list">
            {(sectors.length > 0 ? sectors : [null, null, null]).map(
              (s, i) => (
                <div className="panel__sector" key={s ? s.name : i}>
                  <span className="panel__sector-name">
                    {s ? s.name : "—"}
                  </span>
                  <span className="panel__sector-track">
                    {s && (
                      <span
                        className="panel__sector-fill"
                        style={{
                          width: `${Math.min(100, (s.weight / maxSector) * 100)}%`,
                        }}
                      />
                    )}
                  </span>
                  <span className="panel__sector-weight">
                    {s ? `${s.weight.toFixed(1)}%` : ""}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .panel {
          margin-top: 14px;
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }

        /* ── Tabs ─────────────────────────────────────────────── */
        .panel__tabs {
          display: inline-flex;
          border: 1px solid var(--ins-ink);
        }
        /* TRUE LABEL — a tab names a sleeve. */
        .panel__tab {
          appearance: none;
          background: var(--ins-paper);
          border: none;
          border-right: 1px solid var(--ins-ink);
          padding: 8px 18px;
          font-family: var(--ins-font);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--ins-ink);
          cursor: pointer;
          min-height: 32px;
        }
        .panel__tab:last-child {
          border-right: none;
        }
        .panel__tab:hover {
          background: var(--ins-track-soft);
        }
        .panel__tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }
        .panel__tab:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: -2px;
        }

        /* ── Body ─────────────────────────────────────────────── */
        .panel__body {
          border: 1px solid var(--ins-ink);
          margin-top: -1px;
          padding: 20px 22px;
          display: grid;
          grid-template-columns: 1.1fr 1.2fr 1fr;
          gap: 36px;
        }
        .panel__col {
          min-width: 0;
        }

        .panel__name {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          text-wrap: balance;
        }
        .panel__weight {
          margin-top: 10px;
          font-size: 30px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        /* TRUE LABEL — the tick the weight is judged against. */
        .panel__target {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
        }
        /* The drift stamp — red spent on OVER only (see driftMath). */
        .panel__drift {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }
        .panel__drift.is-over {
          color: var(--ins-signal);
        }
        .panel__drift.is-under,
        .panel__drift.is-on {
          color: var(--ins-gray-600);
        }
        /* EXPLANATORY CAPTION — provenance and mechanics, sentence case. */
        .panel__note {
          margin: 10px 0 0;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        /* TRUE LABEL — column headers name their lists. */
        .panel__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .panel__list {
          margin-top: 8px;
          border-top: 1px solid var(--ins-ink);
        }
        .panel__row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: baseline;
          padding: 9px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
          font-size: 13px;
          font-weight: 600;
        }
        .panel__row:last-child {
          border-bottom: none;
        }
        .panel__row-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .panel__row-weight {
          font-weight: 700;
          flex-shrink: 0;
        }

        .panel__sector {
          display: grid;
          grid-template-columns: minmax(0, 120px) 1fr 48px;
          gap: 12px;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
          font-size: 12px;
          font-weight: 600;
        }
        .panel__sector:last-child {
          border-bottom: none;
        }
        .panel__sector-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .panel__sector-track {
          display: block;
          height: 6px;
          background: var(--ins-track-soft);
        }
        .panel__sector-fill {
          display: block;
          height: 100%;
          background: var(--ins-ink);
        }
        .panel__sector-weight {
          text-align: right;
          font-weight: 700;
        }

        @media (max-width: 960px) {
          .panel__body {
            grid-template-columns: 1fr;
            gap: 22px;
          }
        }

        @media (max-width: 640px) {
          .panel__tabs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            width: 100%;
          }
          .panel__tab {
            min-height: 44px;
            padding: 8px 0;
          }
          .panel__body {
            padding: 16px 14px;
          }
          .panel__weight {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
