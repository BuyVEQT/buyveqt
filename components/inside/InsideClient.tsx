"use client";

import { Suspense } from "react";
import HoldingsTicker from "./HoldingsTicker";
import ObservatoryHero from "./ObservatoryHero";
import FloorPlan from "./FloorPlan";
import ObsLedger from "./ObsLedger";
import ObsRace from "./ObsRace";
import ObsEngine from "./ObsEngine";
import ObsPayout from "./ObsPayout";
import DriftBlock from "./DriftBlock";
import InsideHeatBoard from "./InsideHeatBoard";
import InsideMethodology from "./InsideMethodology";
import InsideCloser from "./InsideCloser";

/**
 * The Observatory — /inside-veqt composition (artboard 10b, supersedes 6a's
 * top half).
 *
 * Site colourway: ink on paper, red as signal. Module order:
 *
 *   HoldingsTicker    — endless top-of-the-book marquee under the masthead
 *   ObservatoryHero   — dot field · "13,726" counts up · "companies. One
 *                       ticker." · AUM / fee / years meta
 *   FloorPlan         — THE FLOOR PLAN · treemap to scale · click a room →
 *                       the sleeve panel (Turn 9 module, kept)  (owns #sleeves)
 *   ObsLedger         — THE LEDGER, ALIVE · top five sweeping in + drift
 *                       lines (desktop; drift detaches on phones)
 *   ObsRace           — THE RACE · $100 in each sleeve since launch
 *   ObsEngine         — TODAY'S ENGINE · weight × move = contribution
 *   DriftBlock mobile — the 390 artboard slots drift after the engine
 *   ObsPayout         — THE PAYOUT · TTM yield by sleeve + next distribution
 *   InsideHeatBoard   — SESSIONS ON FILE · the year on tape
 *                       (owns #heatmap and the ?date= deep link)
 *   InsideMethodology — HOW WE KNOW · the ink panel that names its sources
 *   InsideCloser      — verdict rail + "You've seen the machine."
 *
 * Not built, deliberately: the Turn 9 "Is it in VEQT?" lookup — it needs
 * the full Vanguard holdings file (13,726 rows) and no connected API serves
 * it; indexing the 15 names we hold would make every miss a lie.
 *
 * This page does not print editions — the red/ink edition attribute is the
 * home page's signal, and setting it here would make two pages shout.
 */
export default function InsideClient() {
  return (
    <main className="ins-root ins-inside">
      <div className="ins-page">
        <HoldingsTicker />
        <ObservatoryHero />
        <FloorPlan />
        <ObsLedger />
        <ObsRace />
        <ObsEngine />
        <DriftBlock variant="mobile" />
        <ObsPayout />

        {/* useSearchParams (the ?date= deep link) bails static prerendering
            without a Suspense boundary; the rest of the page paints first. */}
        <Suspense fallback={null}>
          <InsideHeatBoard />
        </Suspense>

        <InsideMethodology />
        <InsideCloser />
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
