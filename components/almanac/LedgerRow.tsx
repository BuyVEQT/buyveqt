"use client";

import WeatherGlyph from "@/components/home/hero/WeatherGlyph";
import {
  UP,
  DOWN,
  fmtChipDate,
  fmtInt,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";
import { ordinal, type AlmanacEntry } from "./almanac-derive";

/**
 * LedgerRow — one notable session in the Almanac's ledger.
 *
 * Desktop reads across as a single ruled line:
 *   date ordinal · session № | glyph | STATE. | dispatch | move / pctl
 * Mobile (≤640) stacks: kicker + pctl, then glyph · word · move, then the
 * dispatch full width.
 *
 * The two P98+ tiers are *printed*, not just labelled:
 *   rally → red edition cell (1px signal border, red word/move on paper)
 *   gale  → ink cell (literal #111111, white text, red accents)
 * The gale cell re-declares the --ins-ink/--ins-paper pair locally, the
 * same mechanism globals.css uses for [data-ins-edition="ink"], so the
 * imported WeatherGlyph inverts to its white-stroked ink treatment on its
 * own — nothing here reaches inside the component to recolour it.
 *
 * Glyphs render with animated={false}: the archive can carry ~180 rows and
 * that many infinite SVG loops is a real cost for no editorial gain. The
 * printed cells carry the emphasis instead.
 *
 * `id` is the session date, so /almanac#2025-10-08 lands on the row.
 */

const GLYPH_SIZE = 30;

export default function LedgerRow({ entry }: { entry: AlmanacEntry }) {
  const down = entry.changePercent < 0;
  const tier =
    entry.state === "rally"
      ? " row--rally"
      : entry.state === "gale"
      ? " row--gale"
      : "";

  return (
    <li id={entry.date} className={`row${tier}`}>
      <span className="kicker">
        {fmtChipDate(parseSessionDate(entry.date))} &middot; SESSION №{" "}
        {fmtInt(entry.sessionNo)}
      </span>

      <span className="glyph">
        <WeatherGlyph state={entry.state} size={GLYPH_SIZE} animated={false} />
      </span>

      <span className="word">{entry.state.toUpperCase()}.</span>

      {/* Sentence case + text-transform: none — the surge line carries σ,
          and an uppercase transform would print it as Σ. */}
      <span className="dispatch">{entry.dispatch}</span>

      <span className={`move${down ? " move--down" : ""}`}>
        <span aria-hidden="true">{down ? DOWN : UP}</span>{" "}
        {fmtSignedPct(entry.changePercent)}
      </span>

      <span className="pctl">{ordinal(Math.floor(entry.percentile))} PCTL</span>

      <style jsx>{`
        .row {
          display: grid;
          grid-template-columns: 236px 34px 132px minmax(0, 1fr) auto;
          grid-template-areas:
            "kicker glyph word dispatch move"
            "kicker glyph word dispatch pctl";
          column-gap: 22px;
          row-gap: 3px;
          align-items: center;
          padding: 15px 0;
          border-top: 1px solid var(--ins-hair);
          scroll-margin-top: 80px;
          font-family: var(--ins-font);
          font-variant-numeric: tabular-nums;
          color: var(--ins-ink);
        }
        /* Deep-link landing mark — outline, so nothing shifts. */
        .row:target {
          outline: 2px solid var(--ins-signal);
          outline-offset: -2px;
        }

        .kicker {
          grid-area: kicker;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .glyph {
          grid-area: glyph;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .word {
          grid-area: word;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.01em;
          line-height: 1.05;
        }
        .dispatch {
          grid-area: dispatch;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.45;
          text-transform: none;
          color: var(--ins-gray-700);
        }
        .move {
          grid-area: move;
          justify-self: end;
          font-size: 19px;
          font-weight: 700;
          line-height: 1.05;
          white-space: nowrap;
        }
        .move--down {
          color: var(--ins-signal);
        }
        .pctl {
          grid-area: pctl;
          justify-self: end;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }

        /* ── Red edition cell — P98+ up ───────────────────────────────── */
        .row--rally {
          border: 1px solid var(--ins-signal);
          background: var(--ins-paper);
          padding: 16px 18px;
          margin: 9px 0;
        }
        .row--rally .word,
        .row--rally .move,
        .row--rally .pctl {
          color: var(--ins-signal);
        }

        /* ── Ink edition cell — P98+ down. Token re-declaration mirrors
             globals.css [data-ins-edition="ink"], so the glyph inverts. ── */
        .row--gale {
          --ins-ink: #ffffff;
          --ins-paper: #111111;
          --ins-gray-600: rgba(255, 255, 255, 0.55);
          --ins-gray-700: rgba(255, 255, 255, 0.72);
          --ins-hair: rgba(255, 255, 255, 0.28);
          border: 1px solid #111111;
          background: #111111; /* literal ink — stays ink under editions */
          color: #ffffff;
          padding: 16px 18px;
          margin: 9px 0;
        }
        .row--gale .word {
          color: #ffffff;
        }
        .row--gale .move,
        .row--gale .pctl {
          color: var(--ins-signal);
        }

        /* ── Mid band — the dispatch drops under the word so it never gets
             squeezed into a two-word column. ───────────────────────────── */
        @media (max-width: 900px) {
          .row {
            grid-template-columns: 200px 30px minmax(0, 1fr) auto;
            grid-template-areas:
              "kicker glyph word     move"
              "kicker glyph dispatch pctl";
            column-gap: 18px;
          }
          .glyph :global(svg) {
            width: 26px;
            height: 26px;
          }
        }

        /* ── Mobile (390 artboard) — three stacked bands ───────────────── */
        @media (max-width: 640px) {
          .row {
            grid-template-columns: 26px minmax(0, 1fr) auto;
            grid-template-areas:
              "kicker   kicker   pctl"
              "glyph    word     move"
              "dispatch dispatch dispatch";
            column-gap: 10px;
            row-gap: 6px;
            padding: 13px 0;
          }
          .glyph :global(svg) {
            width: 24px;
            height: 24px;
          }
          .kicker {
            font-size: 8px;
            letter-spacing: 0.13em;
          }
          .word {
            font-size: 16px;
          }
          .dispatch {
            font-size: 11.5px;
            line-height: 1.4;
          }
          .move {
            font-size: 15px;
          }
          .pctl {
            font-size: 8px;
            letter-spacing: 0.12em;
          }
          .row--rally,
          .row--gale {
            padding: 13px 14px;
            margin: 7px 0;
          }
        }
      `}</style>
    </li>
  );
}
