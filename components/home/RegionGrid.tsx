"use client";

import { useMemo } from "react";
import type { Region } from "@/lib/useRegions";
import LeaderSleeveCard from "./LeaderSleeveCard";
import FollowerSleeveRow from "./FollowerSleeveRow";
import InSentenceHeadline from "./InSentenceHeadline";

interface RegionGridProps {
  regions: Region[];
  leaderIndex: number;
  sortBy?: "weight" | "contribution";
}

/**
 * RegionLedger — leader (1.5fr) + followers column (1fr) on >= 880px.
 * Stacks on mobile with leader card on top, follower rows below.
 *
 * Replaces the old 4-up equal grid + mobile carousel split.
 * The mobile/desktop split is now handled internally via CSS.
 */
export default function RegionGrid({
  regions,
  leaderIndex: _leaderIndex,
  sortBy = "contribution",
}: RegionGridProps) {
  // Sort by |contribution| or weight descending
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

  // Fund-level change ≈ sum of contributions
  const fundChangePct = useMemo(
    () => sorted.reduce((s, r) => s + (r.contribution ?? 0), 0),
    [sorted]
  );

  const rankBadge = sortBy === "weight" ? "Largest sleeve" : "Leader";

  // Skeleton state — show placeholder boxes while loading
  if (regions.length === 0) {
    return (
      <section className="ledger">
        <div className="ledger__head">
          <div>
            <div className="ed-stamp">Today&apos;s move came from</div>
            <h2 className="ed-display ledger__h2">
              Four sleeves,{" "}
              <em style={{ fontStyle: "italic", fontWeight: 500 }}>one fund.</em>
            </h2>
          </div>
          <div className="ed-caption ledger__deck">
            A weighted average of four regional Vanguard ETFs.
          </div>
        </div>
        <div className="rule-thick" />
        <div className="ledger__layout">
          <div
            className="skeleton"
            style={{ height: 320, borderRadius: 18 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 90, borderRadius: 12 }}
              />
            ))}
          </div>
        </div>
        <LedgerStyles />
      </section>
    );
  }

  return (
    <section className="ledger">
      <div className="ledger__head">
        <div>
          <div className="ed-stamp">Today&apos;s move came from</div>
          <h2 className="ed-display ledger__h2">
            Four sleeves,{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>one fund.</em>
          </h2>
        </div>
        <div className="ed-caption ledger__deck">
          A weighted average of four regional Vanguard ETFs.
        </div>
      </div>

      <div className="rule-thick" />

      {leader && (
        <InSentenceHeadline
          leader={leader}
          others={others}
          fundChangePct={fundChangePct}
        />
      )}

      <div className="ledger__layout">
        <div className="ledger__leader-col">
          {leader && (
            <LeaderSleeveCard region={leader} rankBadge={rankBadge} />
          )}
        </div>
        <div className="ledger__followers-col">
          {others.map((r, i) => (
            <FollowerSleeveRow key={r.ticker} region={r} rank={i + 2} />
          ))}
        </div>
      </div>

      <LedgerStyles />
    </section>
  );
}

function LedgerStyles() {
  return (
    <style jsx>{`
      .ledger {
        padding: 30px 0 20px;
      }
      .ledger__head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }
      .ledger__h2 {
        font-size: clamp(2rem, 3.4vw, 2.5rem);
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin: 6px 0 0;
      }
      .ledger__deck {
        flex: 0 1 320px;
        max-width: 320px;
        font-size: 13px;
      }
      .ledger__layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--gap, 22px);
      }
      @media (min-width: 880px) {
        .ledger__layout {
          grid-template-columns: 1.5fr 1fr;
          align-items: stretch;
        }
      }
      .ledger__followers-col {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    `}</style>
  );
}
