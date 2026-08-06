"use client";

import { useCallback, useRef, useState } from "react";
import { useSleeves } from "@/lib/useSleeves";
import { useRegions } from "@/lib/useRegions";
import { SLEEVES } from "@/data/sleeves";
import { UP, DOWN, fmtSignedPct, fmtInt } from "@/lib/instrument-format";
import SleevePanel from "./SleevePanel";

/**
 * THE FLOOR PLAN — "The world, to scale." (artboard 10b).
 *
 * A proportional treemap: one room per sleeve, column width = live weight,
 * so the page's biggest claim is drawn rather than stated. VUN is the ink
 * room, VCN the 12% wash, VIU sits on warm paper with a hairline, and VEE
 * is the page's one solid-red surface. Every room is a button that opens
 * the sleeve panel below (the Turn 9 module, kept per Turn 10).
 *
 * Owns the `#sleeves` anchor — the home page's sleeve rows deep-link here.
 *
 * Weights prefer the live Yahoo mix (via /api/sleeves) and fall back to the
 * factsheet ticks so the rooms never render empty; today's moves ride the
 * same /api/regions payload the home page uses. Company counts are curated
 * approximations (see data/sleeves.ts) and print with a ≈.
 */
export default function FloorPlan() {
  const { data: sleevesData } = useSleeves();
  const { payload: regions } = useRegions();

  const [active, setActive] = useState<string>(SLEEVES[0].ticker);
  const panelRef = useRef<HTMLDivElement>(null);

  const weightOf = useCallback(
    (ticker: string): number => {
      const live = sleevesData?.sleeves.find(
        (s) => s.ticker === ticker
      )?.liveWeight;
      return (
        live ?? SLEEVES.find((s) => s.ticker === ticker)!.targetWeight
      );
    },
    [sleevesData]
  );

  const moveOf = useCallback(
    (ticker: string): number | null => {
      const region = regions?.regions.find((r) => r.ticker === ticker);
      return region?.changePercent ?? null;
    },
    [regions]
  );

  const openSleeve = useCallback((ticker: string) => {
    setActive(ticker);
    const el = panelRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, []);

  const weights = SLEEVES.map((s) => weightOf(s.ticker));
  const gridVars = {
    "--fp-c1": `${weights[0]}fr`,
    "--fp-c2": `${weights[1]}fr`,
    "--fp-c3": `${weights[2]}fr`,
    "--fp-c4": `${weights[3]}fr`,
  } as React.CSSProperties;

  return (
    <section className="fp" aria-label="The floor plan">
      <div id="sleeves" className="fp__anchor" />

      <div className="fp__head">
        <div>
          <div className="fp__kicker">
            The floor plan
            <span className="fp-mob"> · area = weight</span>
          </div>
          <h2 className="fp__display">The world, to scale.</h2>
        </div>
        <span className="fp__caption fp-desk">
          Area = weight · click a room to open the sleeve
        </span>
      </div>

      <div className="fp__grid" style={gridVars}>
        {SLEEVES.map((meta, i) => {
          const weight = weights[i];
          const move = moveOf(meta.ticker);
          const negative = move != null && move < 0;
          const moveStr =
            move == null
              ? null
              : `${negative ? DOWN : UP} ${fmtSignedPct(move)}`;

          return (
            <button
              key={meta.ticker}
              className={`fp__room fp__room--${i + 1}`}
              onClick={() => openSleeve(meta.ticker)}
              aria-label={`Open the ${meta.ticker} sleeve — ${weight.toFixed(1)} percent, ${meta.roomLabel.toLowerCase()}`}
            >
              <span className="fp__room-label">
                <span className="fp-desk">
                  {meta.ticker} · {meta.roomLabel}
                </span>
                <span className="fp-mob">
                  {meta.ticker} · {meta.shortLabel}
                </span>
              </span>
              <span className="fp__room-pct">
                {weight.toFixed(1)}
                <span className="fp__room-unit">%</span>
              </span>
              <span className="fp__room-sub fp-desk">
                {meta.ticker === "VUN" &&
                  `≈${fmtInt(meta.approxCompanies)} COMPANIES${moveStr ? ` · ${moveStr} TODAY` : ""}`}
                {meta.ticker === "VCN" &&
                  `PINNED AT 30${moveStr ? ` · ${moveStr}` : ""}`}
                {(meta.ticker === "VIU" || meta.ticker === "VEE") &&
                  (moveStr ?? "—")}
              </span>
            </button>
          );
        })}
      </div>

      <p className="fp__tapnote fp-mob">Tap a room to open the sleeve.</p>

      <div ref={panelRef} className="fp__panel-slot">
        <SleevePanel active={active} onSelect={setActive} />
      </div>

      <style jsx>{`
        .fp {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .fp__anchor {
          scroll-margin-top: 110px;
        }
        .fp-mob {
          display: none;
        }

        .fp__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .fp__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .fp__display {
          margin: 8px 0 0;
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--ins-ink);
        }
        /* EXPLANATORY CAPTION — how to read and use the diagram. */
        .fp__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
          white-space: nowrap;
        }

        /* ── Rooms ─────────────────────────────────────────────── */
        .fp__grid {
          display: grid;
          grid-template-columns: var(--fp-c1) var(--fp-c2) var(--fp-c3) var(
              --fp-c4
            );
          gap: 3px;
          margin-top: 20px;
          height: 300px;
        }
        .fp__room {
          appearance: none;
          border: none;
          font-family: var(--ins-font);
          text-align: left;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          cursor: pointer;
          min-width: 0;
          font-variant-numeric: tabular-nums;
          transition: background 0.15s ease;
        }
        .fp__room:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 2px;
        }

        .fp__room--1 {
          background: var(--ins-ink);
          color: #ffffff;
        }
        .fp__room--1:hover {
          background: #2a2a2a;
        }
        .fp__room--1 .fp__room-sub {
          color: var(--ins-inv-mute);
        }
        .fp__room--2 {
          background: rgba(17, 17, 17, 0.12);
          color: var(--ins-ink);
        }
        .fp__room--2:hover {
          background: rgba(17, 17, 17, 0.18);
        }
        .fp__room--3 {
          background: var(--ins-paper-warm);
          border: 1px solid var(--ins-hair);
          color: var(--ins-ink);
        }
        .fp__room--3:hover {
          background: #f2ede3;
        }
        .fp__room--4 {
          background: var(--ins-signal);
          color: #ffffff;
          padding: 18px 14px;
        }
        .fp__room--4:hover {
          background: #f25a45;
        }

        /* TRUE LABEL — the room's nameplate. */
        .fp__room-label {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fp__room--3 .fp__room-label {
          font-size: 11px;
        }
        .fp__room--4 .fp__room-label {
          font-size: 10px;
          letter-spacing: 0.08em;
        }

        .fp__room-pct {
          margin-top: auto;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .fp__room--1 .fp__room-pct {
          font-size: 64px;
        }
        .fp__room--2 .fp__room-pct {
          font-size: 52px;
        }
        .fp__room--3 .fp__room-pct {
          font-size: 40px;
          letter-spacing: -0.035em;
        }
        .fp__room--4 .fp__room-pct {
          font-size: 30px;
          letter-spacing: -0.03em;
        }
        .fp__room-unit {
          font-weight: 700;
        }
        .fp__room--1 .fp__room-unit {
          font-size: 24px;
        }
        .fp__room--2 .fp__room-unit {
          font-size: 20px;
        }
        .fp__room--3 .fp__room-unit {
          font-size: 17px;
        }
        .fp__room--4 .fp__room-unit {
          font-size: 14px;
        }

        /* TRUE LABEL — count + signed move; direction always ▲/▼. */
        .fp__room-sub {
          margin-top: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fp__room--4 .fp__room-sub {
          color: rgba(255, 255, 255, 0.85);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .fp__panel-slot {
          scroll-margin-top: 90px;
        }

        @media (max-width: 1100px) {
          .fp__display {
            font-size: 32px;
          }
          .fp__caption {
            white-space: normal;
            max-width: 200px;
          }
          .fp__room--1 .fp__room-pct {
            font-size: 48px;
          }
          .fp__room--2 .fp__room-pct {
            font-size: 40px;
          }
          .fp__room--3 .fp__room-pct {
            font-size: 30px;
          }
          .fp__room--4 .fp__room-pct {
            font-size: 24px;
          }
        }

        /* ── Mobile 390 — 2×2 rooms ────────────────────────────── */
        @media (max-width: 640px) {
          .fp {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .fp-desk {
            display: none;
          }
          .fp-mob {
            display: inline;
          }
          .fp__kicker {
            letter-spacing: 0.18em;
          }
          .fp__display {
            margin-top: 6px;
            font-size: 24px;
            letter-spacing: -0.02em;
          }
          .fp__grid {
            grid-template-columns: var(--fp-c1) var(--fp-c2);
            grid-template-rows: 120px 92px;
            height: auto;
            margin-top: 12px;
          }
          .fp__room,
          .fp__room--4 {
            padding: 12px 14px;
          }
          .fp__room-label,
          .fp__room--3 .fp__room-label,
          .fp__room--4 .fp__room-label {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
          .fp__room--1 .fp__room-pct {
            font-size: 36px;
            letter-spacing: -0.03em;
          }
          .fp__room--2 .fp__room-pct {
            font-size: 28px;
            letter-spacing: -0.025em;
          }
          .fp__room--3 .fp__room-pct,
          .fp__room--4 .fp__room-pct {
            font-size: 24px;
            letter-spacing: -0.02em;
          }
          .fp__room--1 .fp__room-unit {
            font-size: 15px;
          }
          .fp__room--2 .fp__room-unit {
            font-size: 13px;
          }
          .fp__room--3 .fp__room-unit,
          .fp__room--4 .fp__room-unit {
            font-size: 12px;
          }
          .fp__tapnote {
            display: block;
            margin: 8px 0 0;
            font-size: 12px;
            font-weight: 500;
            color: var(--ins-gray-600);
          }
        }
      `}</style>
    </section>
  );
}
