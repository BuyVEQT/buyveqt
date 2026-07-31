"use client";

import { Suspense } from "react";
import InsideHero from "./InsideHero";
import GeographyPanel from "./GeographyPanel";
import InsideHoldings from "./InsideHoldings";
import InsideHeatBoard from "./InsideHeatBoard";
import InsideMethodology from "./InsideMethodology";
import InsideCloser from "./InsideCloser";

/**
 * The Instrument — /inside-veqt composition (artboard 6a).
 *
 * Same grammar as the home page: white paper, Archivo, 3px ink section
 * rules, red spent only on signal. Module order:
 *
 *   InsideHero        — dateline · "What you own when you own VEQT." ·
 *                       spec strip (holdings / AUM / mgmt fee / on tape)
 *   GeographyPanel    — THE GEOGRAPHY · "Where the dollars sit." ·
 *                       four ruled sleeve rows  (owns #sleeves)
 *   InsideHoldings    — TOP OF THE BOOK · "The ten biggest bets."
 *   InsideHeatBoard   — SESSIONS ON FILE · "The year on tape."
 *                       (owns #heatmap and the ?date= deep link)
 *   InsideMethodology — HOW WE KNOW · the ink panel that names its sources
 *   InsideCloser      — verdict rail + "You've seen the machine."
 *
 * This page does not print editions — the red/ink edition attribute is the
 * home page's signal, and setting it here would make two pages shout.
 */
export default function InsideClient() {
  return (
    <main className="ins-root ins-inside">
      <div className="ins-page">
        <InsideHero />
        <GeographyPanel />
        <InsideHoldings />

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
