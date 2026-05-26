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
 * RegionLedger — newspaper-style "Four sleeves, one fund." section.
 *
 * Layout:
 *   ┌────────────────────────────── 1px ink rule ───────────────────────┐
 *   │ TODAY'S MOVE CAME FROM                          (sub-caption)     │
 *   │ Four sleeves, one fund. (italic on "one fund.")                   │
 *   ├───────────────────────────────────────────────────────────────────┤
 *   │ [ IN A SENTENCE ]  United States carried today — +0.30 pp …      │
 *   ├──────────────────────────────────┬────────────────────────────────┤
 *   │                                  │  2  Canada      +0.41%   ╲╱   │
 *   │   LEADER · VUN · WEIGHT 45.6%    │     VCN · 28.4% +0.12 pp     │
 *   │                                  ├────────────────────────────────┤
 *   │   United States                  │  3  Developed   +0.18%   ╲╱   │
 *   │                                  │     VIU · 16.9% +0.03 pp     │
 *   │   +0.66%   CONTRIB +0.30 pp      ├────────────────────────────────┤
 *   │            in today's move       │  4  Emerging    −0.48%   ╱╲   │
 *   │   ╱╲╲   ╱╲╱╲╱╲ ╱╲                │     VEE ·  9.1% −0.03 pp     │
 *   │   30 trading days                │                                │
 *   └──────────────────────────────────┴────────────────────────────────┘
 *
 * Mobile collapses to a single column with the leader first.
 *
 * Every card links through to /inside-veqt#TICKER.
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

  // Fund-level change is the weighted sum of sleeve contributions in pp.
  const fundChangePct = useMemo(
    () => sorted.reduce((sum, r) => sum + (r.contribution ?? 0), 0),
    [sorted]
  );

  const rankBadge = sortBy === "weight" ? "Largest sleeve" : "Leader";

  // Skeleton state — show placeholders while loading.
  if (regions.length === 0) {
    return (
      <section className="ledger">
        <div className="rule-hair ledger__top-rule" />
        <header className="ledger__head">
          <div className="ledger__eyebrow">
            <span className="ed-stamp">Today&apos;s move came from</span>
          </div>
          <div className="ledger__headline-row">
            <h2 className="ed-display ledger__h2">
              Four sleeves,{" "}
              <em
                className="ed-display-italic"
                style={{ fontStyle: "italic", fontWeight: 500 }}
              >
                one fund.
              </em>
            </h2>
            <p className="ed-caption ledger__deck">
              A weighted average of four regional Vanguard ETFs.
            </p>
          </div>
        </header>
        <div className="ledger__grid">
          <div
            className="skeleton ledger__leader-skel"
            style={{ borderRadius: 22 }}
          />
          <div className="ledger__followers">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 110, borderRadius: 16 }}
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
      <div className="rule-hair ledger__top-rule" />
      <header className="ledger__head">
        <div className="ledger__eyebrow">
          <span className="ed-stamp">Today&apos;s move came from</span>
        </div>
        <div className="ledger__headline-row">
          <h2 className="ed-display ledger__h2">
            Four sleeves,{" "}
            <em
              className="ed-display-italic"
              style={{ fontStyle: "italic", fontWeight: 500 }}
            >
              one fund.
            </em>
          </h2>
          <p className="ed-caption ledger__deck">
            A weighted average of four regional Vanguard ETFs.
          </p>
        </div>
      </header>

      {leader && (
        <InSentenceHeadline
          leader={leader}
          others={others}
          fundChangePct={fundChangePct}
        />
      )}

      <div className="ledger__grid">
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
        gap: 18px;
      }
      .ledger__top-rule {
        margin-bottom: 4px;
      }
      .ledger__head {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ledger__eyebrow {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ledger__headline-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        align-items: end;
      }
      .ledger__h2 {
        font-size: clamp(2.2rem, 4vw, 2.9rem);
        line-height: 1.02;
        letter-spacing: -0.024em;
        margin: 0;
        color: var(--ink);
      }
      .ledger__deck {
        margin: 0;
        font-family: var(--font-serif);
        font-style: italic;
        font-size: clamp(13px, 1.15vw, 15px);
        line-height: 1.45;
        color: var(--ink-mute);
        max-width: 32ch;
      }
      .ledger__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        align-items: stretch;
      }
      .ledger__leader-wrap {
        display: flex;
      }
      .ledger__leader-skel {
        min-height: 360px;
      }
      .ledger__followers {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        align-content: stretch;
      }

      @media (min-width: 760px) {
        .ledger__headline-row {
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
        }
        .ledger__deck {
          text-align: right;
          max-width: 28ch;
          justify-self: end;
        }
      }

      @media (min-width: 960px) {
        .ledger__grid {
          /* Leader card ~62%, followers column ~38%. Tweak via fr units. */
          grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
          gap: 18px;
        }
        .ledger__followers {
          gap: 12px;
          /* Stretch each follower to fill the leader card's intrinsic height
             — the leader's tall sparkline tends to drive the column. */
          grid-template-rows: 1fr 1fr 1fr;
        }
      }
    `}</style>
  );
}
