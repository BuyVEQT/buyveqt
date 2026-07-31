"use client";

import { useEffect, useState } from "react";
import type { SubredditStats } from "@/lib/data/reddit";
import { formatAgo } from "./pulse-format";

interface CommunityHeroProps {
  stats: SubredditStats | null;
  /** Distinct threads the page is holding across both feeds. */
  threadCount: number;
  /** ISO timestamp of the newest thread on file, if any. */
  latestIso: string | null;
}

/**
 * CommunityHero — the Instrument hero for /community.
 *
 * Kicker · display · dek · a 1px-ink-ruled micro-fact row. No red: the
 * route spends its signal on the mood bar and the closer CTA.
 *
 * Server-rendered `stats` land first, then a client refetch of the Edge route
 * `/api/reddit` corrects them (Node SSR frequently can't reach the Reddit
 * proxy, Edge can) — but ONLY when the server render came back without a
 * real subscriber count, mirroring how CommunityContent gates its own
 * refetch on `serverEmpty`. When SSR already produced a number, the refetch
 * was pure waste: an Edge round-trip on every single page view that resolved
 * to the same value the markup already had.
 *
 * What we're willing to print is narrower than the payload: `topPostScore`
 * and `avgComments` are engagement counts, which the Instrument recipe bans,
 * so only the member count survives — and only when it is a real number.
 */
export default function CommunityHero({
  stats,
  threadCount,
  latestIso,
}: CommunityHeroProps) {
  // `getSubredditStats` returns `{ subscribers: 0 }` when every tier failed,
  // so a zero here means "SSR got nothing", not "the sub has no members".
  const serverStatsEmpty = !stats || stats.subscribers <= 0;

  const [liveStats, setLiveStats] = useState<SubredditStats | null>(stats);

  useEffect(() => {
    if (!serverStatsEmpty) return;

    let cancelled = false;
    fetch("/api/reddit")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.stats) return;
        setLiveStats(data.stats as SubredditStats);
      })
      .catch(() => {
        // Swallowed by design — the server stats stay in place. The Edge
        // route logs its own failures; no need to double-log here.
      });
    return () => {
      cancelled = true;
    };
  }, [serverStatsEmpty]);

  const members = liveStats?.subscribers ?? 0;

  return (
    <header className="cmh">
      <div className="cmh__kicker">
        The pulse · r/JustBuyVEQT · Updated every 30 minutes
      </div>

      <h1 className="cmh__display">What the holders are saying.</h1>

      <p className="cmh__dek">
        Real questions, real milestones, the occasional panic. Every thread
        below is pulled straight from the public subreddit — titles and links
        only, no accounts, no scoreboard.
      </p>

      <div className="cmh__facts">
        {/* Every fact is conditional on being a real number. A literal 0
            here reads as a bug; the empty state downstairs says the honest
            thing instead. */}
        {threadCount > 0 && (
          <span>
            Threads on file <b>{threadCount}</b>
          </span>
        )}
        {latestIso && (
          <span suppressHydrationWarning>
            Latest <b>{formatAgo(latestIso)}</b>
          </span>
        )}
        {members > 0 && (
          <span>
            Members <b>{members.toLocaleString("en-CA")}</b>
          </span>
        )}
        <a
          href="https://www.reddit.com/r/JustBuyVEQT/"
          target="_blank"
          rel="noopener noreferrer"
          className="cmh__facts-link"
        >
          Source <b>r/JustBuyVEQT</b>
        </a>
      </div>

      <style jsx>{`
        .cmh {
          padding-top: 34px;
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .cmh__kicker {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .cmh__display {
          margin: 16px 0 0;
          font-size: 64px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 0.98;
          max-width: 16ch;
        }
        .cmh__dek {
          margin: 20px 0 0;
          max-width: 58ch;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.55;
          color: var(--ins-gray-700);
        }
        .cmh__facts {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 28px;
          margin-top: 26px;
          padding-top: 14px;
          border-top: 1px solid var(--ins-ink);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          font-variant-numeric: tabular-nums;
        }
        .cmh__facts b {
          color: var(--ins-ink);
          font-weight: 700;
        }
        .cmh__facts-link {
          color: inherit;
          text-decoration: none;
        }
        .cmh__facts-link:hover b {
          border-bottom: 2px solid var(--ins-ink);
          padding-bottom: 1px;
        }

        @media (max-width: 960px) {
          .cmh__display {
            font-size: 48px;
          }
        }
        @media (max-width: 640px) {
          .cmh {
            padding-top: 22px;
          }
          .cmh__kicker {
            font-size: 8.5px;
            letter-spacing: 0.2em;
          }
          .cmh__display {
            margin-top: 12px;
            font-size: 34px;
            letter-spacing: -0.03em;
            line-height: 1.02;
            max-width: none;
          }
          .cmh__dek {
            margin-top: 14px;
            font-size: 13.5px;
            line-height: 1.5;
          }
          .cmh__facts {
            gap: 8px 18px;
            margin-top: 18px;
            padding-top: 12px;
            font-size: 8.5px;
            letter-spacing: 0.16em;
          }
        }
      `}</style>
    </header>
  );
}
