"use client";

import { Suspense } from "react";
import InsideHero from "./InsideHero";
import InsideStats from "./InsideStats";
import InsideRegionGrid from "./InsideRegionGrid";
import InsideHeatBoard from "./InsideHeatBoard";
import InsideHoldings from "./InsideHoldings";
import InsideMethodology from "./InsideMethodology";

/**
 * Round 4 M3 — /inside-veqt dashboard. No broadsheet wrapper, no per-page
 * nav (the global shell handles that). Composition mirrors the home page
 * cadence: hero, stats strip, region grid, holdings + methodology pair.
 *
 * The dark methodology card and the cream region cards are guaranteed at
 * least 28px of gap between them (via the .inside-stack gap on lg).
 */
export default function InsideClient() {
  return (
    <main
      style={{
        background: "var(--paper)",
        minHeight: "100dvh",
        color: "var(--ink)",
      }}
    >
      <div className="inside-stack">
        <InsideHero />
        <InsideStats />
        <InsideRegionGrid />

        {/* The deep heatmap. Wrapped in Suspense because useSearchParams
            bails static prerendering otherwise; the rest of the page
            renders without waiting. */}
        <Suspense fallback={null}>
          <InsideHeatBoard />
        </Suspense>

        <div className="inside-two-up">
          <InsideHoldings />
          <InsideMethodology />
        </div>
      </div>

      <style jsx>{`
        .inside-stack {
          display: flex;
          flex-direction: column;
          gap: 22px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 14px 40px;
        }
        .inside-two-up {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 1024px) {
          .inside-stack {
            gap: 32px;
            padding: 32px 26px 56px;
          }
          .inside-two-up {
            grid-template-columns: 7fr 5fr;
            gap: 18px;
          }
        }
      `}</style>
    </main>
  );
}
