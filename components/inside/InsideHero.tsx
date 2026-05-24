"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import Lede from "@/components/ui/Lede";
import TiltBar, { type TiltWeights } from "@/components/charts/TiltBar";
import { useRegions } from "@/lib/useRegions";

const REGION_TO_KEY: Record<string, keyof TiltWeights> = {
  VUN: "us",
  VCN: "ca",
  VIU: "dev",
  VEE: "em",
};

/** Fallback tilt — VEQT factsheet weights (April 30, 2026), used when the
 *  live feed is silent. */
const FALLBACK_TILT: TiltWeights = {
  us: 0.445,
  ca: 0.306,
  dev: 0.177,
  em: 0.072,
};

/**
 * Two-column page hero for /inside-veqt.
 *
 *   ┌──────────────────────────┐  ┌──────────────────┐
 *   │ THE FUND                 │  │ THE GEOGRAPHY    │
 *   │ What you own when you    │  │ TiltBar with     │
 *   │ own VEQT.                │  │ showLabels       │
 *   │ Lede with drop cap …     │  └──────────────────┘
 *   └──────────────────────────┘
 *
 * Stacks on mobile, two-column on lg.
 */
export default function InsideHero() {
  const { payload } = useRegions();

  const tilt = useMemo<TiltWeights>(() => {
    const regions = payload?.regions ?? [];
    if (regions.length === 0) return FALLBACK_TILT;
    const next: TiltWeights = { us: 0, ca: 0, dev: 0, em: 0 };
    let total = 0;
    for (const r of regions) {
      const key = REGION_TO_KEY[r.ticker];
      if (!key) continue;
      next[key] += r.weight;
      total += r.weight;
    }
    if (total === 0) return FALLBACK_TILT;
    return {
      us: next.us / total,
      ca: next.ca / total,
      dev: next.dev / total,
      em: next.em / total,
    };
  }, [payload]);

  return (
    <section className="inside-hero">
      <div className="inside-hero__left">
        <SectionLabel>The fund</SectionLabel>
        <h1 className="ed-display-italic inside-hero__h1">
          What you own when you own VEQT.
        </h1>
        <Lede>
          Thirteen thousand seven hundred companies in a single ticker, sorted
          into four index ETFs by region and rebalanced by Vanguard. Every
          quarter the weights drift; every quarter the fund snaps them back.
          Your only job is to keep buying.
        </Lede>
      </div>

      <Card>
        <SectionLabel>The geography</SectionLabel>
        <div
          className="ed-display-italic"
          style={{
            fontSize: 22,
            lineHeight: 1.05,
            color: "var(--ink)",
            marginTop: 6,
            marginBottom: 18,
          }}
        >
          Where your dollars sit.
        </div>
        <TiltBar weights={tilt} height={44} showLabels />
      </Card>

      <style jsx>{`
        .inside-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
          align-items: end;
        }
        .inside-hero__h1 {
          font-size: 36px;
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 8px 0 14px;
          color: var(--ink);
        }
        @media (min-width: 1024px) {
          .inside-hero {
            grid-template-columns: 7fr 5fr;
            gap: 40px;
          }
          .inside-hero__h1 {
            font-size: 56px;
            line-height: 1;
            letter-spacing: -0.025em;
            margin: 12px 0 22px;
            max-width: 14ch;
          }
        }
      `}</style>
    </section>
  );
}
