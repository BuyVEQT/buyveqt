"use client";

import { useMemo } from "react";
import type { Region } from "@/lib/useRegions";
import LeaderSleeveCard from "./LeaderSleeveCard";
import FollowerSleeveRow from "./FollowerSleeveRow";

interface RegionGridProps {
  regions: Region[];
  leaderIndex: number;
  sortBy?: "weight" | "contribution";
}

/**
 * RegionLedger — leader card full-width on top, three follower cards
 * in a horizontal row below (desktop). Mobile stacks everything.
 *
 * Header is intentionally brief: eyebrow + headline only. The deck caption
 * and editorial in-sentence summary were removed to reduce visual noise so
 * the sleeves themselves carry the story.
 *
 * Every card links through to the corresponding `/inside-veqt#TICKER`
 * anchor so the home page sleeves act as click-through tiles.
 */
export default function RegionGrid({
  regions,
  leaderIndex: _leaderIndex,
  sortBy = "contribution",
}: RegionGridProps) {
  // Sort by |contribution| (default) or weight, descending.
  const sorted = useMemo(() => {
    if (regions.length === 0) return [];
    const arr = [...regions].filter(
      (r) =>
        r.changePercent !== null &&
        r.contribution !== null &&
        Number.isFinite(r.changePercent) &&
        Number.isFinite(r.contribution)
    );
    if (sortBy === "weight") {
      arr.sort((a, b) => b.weight - a.weight);
    } else {
      arr.sort(
        (a, b) =>
          Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0)
      );
    }
    return arr;
  }, [regions, sortBy]);

  const leader = sorted[0] ?? null;
  const others = sorted.slice(1);

  const rankBadge = sortBy === "weight" ? "Largest sleeve" : "Leader";

  // Skeleton state — show placeholders while loading.
  if (regions.length === 0) {
    return (
      <section className="ledger">
        <div className="ledger__head">
          <div className="ed-stamp">Today&apos;s move came from</div>
          <h2 className="ed-display ledger__h2">
            Four sleeves,{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>one fund.</em>
          </h2>
        </div>
        <div className="rule-thick" />
        <div className="ledger__leader-wrap">
          <div className="skeleton" style={{ height: 280, borderRadius: 18 }} />
        </div>
        <div className="ledger__followers">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 140, borderRadius: 12 }}
            />
          ))}
        </div>
        <LedgerStyles />
      </section>
    );
  }

  return (
    <section className="ledger">
      <div className="ledger__head">
        <div className="ed-stamp">Today&apos;s move came from</div>
        <h2 className="ed-display ledger__h2">
          Four sleeves,{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>one fund.</em>
        </h2>
      </div>

      <div className="rule-thick" />

      {leader && (
        <div className="ledger__leader-wrap">
          <LeaderSleeveCard region={leader} rankBadge={rankBadge} />
        </div>
      )}

      <div className="ledger__followers">
        {others.map((r, i) => (
          <FollowerSleeveRow key={r.ticker} region={r} rank={i + 2} />
        ))}
      </div>

      <LedgerStyles />
    </section>
  );
}

function LedgerStyles() {
  return (
    <style jsx global>{`
      .ledger {
        padding: 26px 0 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .ledger__head {
        margin: 0;
      }
      .ledger__h2 {
        font-size: clamp(2rem, 3.4vw, 2.5rem);
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin: 6px 0 0;
      }
      .ledger__leader-wrap {
        margin-top: 4px;
      }
      .ledger__followers {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      @media (min-width: 720px) {
        .ledger__followers {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
      }
    `}</style>
  );
}
