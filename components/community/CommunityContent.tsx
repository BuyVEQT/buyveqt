"use client";

import { useEffect, useMemo, useState } from "react";
import type { RedditPost } from "@/lib/data/reddit";
import PulseCell from "./PulseCell";
import { moodSplit } from "./pulse-format";

type TabId = "trending" | "top";

const TABS: { id: TabId; label: string }[] = [
  { id: "trending", label: "This week" },
  { id: "top", label: "All time" },
];

interface CommunityContentProps {
  hotPosts: RedditPost[];
  topPosts: RedditPost[];
}

/**
 * CommunityContent — the two Instrument modules that carry the feed.
 *
 *   THE MOOD   3px rule · kicker · display · an ink/red ratio bar with
 *              micro-label ends. Always reads THIS WEEK's threads, so it
 *              stays a fixed reading rather than a number that jumps when
 *              you change tabs below it.
 *   THE PULSE  3px rule · kicker · display · Instrument tabs (active =
 *              ink fill) · a grid of bordered quote cards.
 *
 * Data wiring is unchanged: server props first, with a one-shot client
 * fetch of the Edge route `/api/reddit` only when the server render came
 * back with nothing at all. Scores are never chased — the live tier is RSS
 * and has none, which suits a recipe that bans engagement counts anyway.
 */
export default function CommunityContent({
  hotPosts: serverHot,
  topPosts: serverTop,
}: CommunityContentProps) {
  const serverEmpty = serverHot.length === 0 && serverTop.length === 0;

  const [activeTab, setActiveTab] = useState<TabId>("trending");
  const [clientFeeds, setClientFeeds] = useState<Record<TabId, RedditPost[]>>({
    trending: serverHot,
    top: serverTop,
  });
  // Seeded, not set inside the effect: when the server render came back
  // empty the skeleton is the correct first paint, and the effect below only
  // ever clears it. Avoids a cascading render and a flash of the empty state.
  const [loading, setLoading] = useState(serverEmpty);

  useEffect(() => {
    if (!serverEmpty) return;

    let cancelled = false;

    fetch("/api/reddit")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const hasPosts =
          (data?.posts?.trending?.length ?? 0) > 0 ||
          (data?.posts?.top?.length ?? 0) > 0;
        if (hasPosts) {
          setClientFeeds({
            trending: data.posts.trending || [],
            top: data.posts.top || [],
          });
        }
        // Always clear: a non-ok response yields `data === null`, and
        // returning early there used to strand the skeleton forever.
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serverEmpty]);

  const posts = clientFeeds[activeTab];

  // The mood reads the week, not the active tab — an all-time listing
  // spanning four years would answer a question nobody asked.
  const mood = useMemo(
    () => moodSplit(clientFeeds.trending),
    [clientFeeds.trending]
  );

  return (
    <>
      {/* ══ THE MOOD ══════════════════════════════════════════ */}
      {mood && (
        <section className="cmm" aria-labelledby="cmm-display">
          <header className="cmm__head">
            <div>
              <div className="cmm__kicker">The mood</div>
              <h2 id="cmm-display" className="cmm__display">
                How worried is the room?
              </h2>
            </div>
            <div className="cmm__note">
              This week&rsquo;s threads · Titles only
            </div>
          </header>

          {/* The bar is decoration; the two end labels below carry the
              numbers as real text, so nothing is colour-only. */}
          <div className="cmm__bar" aria-hidden="true">
            <span className="cmm__bar-ink" style={{ width: `${mood.restPct}%` }} />
            <span
              className="cmm__bar-red"
              style={{ width: `${mood.doubtPct}%` }}
            />
          </div>

          <div className="cmm__ends">
            <span className="cmm__end">
              Everything else · <b>{mood.rest}</b> · {mood.restPct}%
            </span>
            <span className="cmm__end cmm__end--red">
              Dips, drops &amp; doubts · <b>{mood.doubt}</b> · {mood.doubtPct}%
            </span>
          </div>

          <p className="cmm__caption">
            Keyword split of {mood.total} thread titles — not a sentiment
            model. A title counts as a doubt only when it says so.
          </p>
        </section>
      )}

      {/* ══ THE PULSE ═════════════════════════════════════════ */}
      <section className="cmc" aria-labelledby="cmc-display">
        <header className="cmc__head">
          <div>
            <div className="cmc__kicker">The pulse</div>
            <h2 id="cmc-display" className="cmc__display">
              In their own words.
            </h2>
          </div>
          <div className="cmc__tabs">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={active}
                  className={`cmc__tab${active ? " is-active" : ""}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {loading ? (
          <div className="cmc__grid" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="cmc__skel" aria-hidden="true">
                <span className="cmc__skl" style={{ width: "92%" }} />
                <span className="cmc__skl" style={{ width: "78%" }} />
                <span className="cmc__skl" style={{ width: "54%" }} />
                <span className="cmc__skl cmc__skl--foot" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="cmc__grid">
            {posts.map((post) => (
              <PulseCell key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="cmc__empty">
            <div className="cmc__empty-label">The wire is down</div>
            <p className="cmc__empty-body">
              Reddit isn&rsquo;t answering right now. The threads are still
              there — the shortcut just isn&rsquo;t.
            </p>
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
              className="cmc__empty-link"
            >
              Go to r/JustBuyVEQT <span aria-hidden>→</span>
            </a>
          </div>
        )}
      </section>

      <style jsx>{`
        /* ── shared section grammar ── */
        .cmm,
        .cmc {
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 12px;
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .cmm__head,
        .cmc__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
        }
        .cmm__kicker,
        .cmc__kicker {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .cmm__display,
        .cmc__display {
          margin: 6px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .cmm__note {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          text-align: right;
        }

        /* ── the ratio bar ── */
        .cmm__bar {
          display: flex;
          height: 14px;
          margin-top: 22px;
          background: var(--ins-track);
        }
        .cmm__bar-ink {
          background: var(--ins-ink);
        }
        .cmm__bar-red {
          background: var(--ins-signal);
        }
        .cmm__ends {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 9px;
        }
        .cmm__end {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .cmm__end b {
          color: var(--ins-ink);
          font-weight: 800;
        }
        .cmm__end--red {
          text-align: right;
        }
        .cmm__end--red b {
          color: var(--ins-signal);
        }
        .cmm__caption {
          margin: 14px 0 0;
          max-width: 62ch;
          font-size: 12.5px;
          font-weight: 500;
          line-height: 1.5;
          color: var(--ins-gray-600);
        }

        /* ── tabs ── */
        .cmc__tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cmc__tab {
          appearance: none;
          border: 1px solid var(--ins-hair);
          border-radius: 0;
          background: none;
          padding: 9px 16px;
          font-family: var(--ins-font);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          cursor: pointer;
          transition: color 0.18s ease, border-color 0.18s ease;
        }
        .cmc__tab:hover {
          color: var(--ins-ink);
          border-color: var(--ins-ink);
        }
        .cmc__tab.is-active {
          background: var(--ins-ink);
          border-color: var(--ins-ink);
          color: var(--ins-paper);
        }

        /* ── the cell grid ── */
        .cmc__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 14px;
          margin-top: 20px;
        }
        .cmc__skel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 150px;
          padding: 16px 18px 14px;
          border: 1px solid var(--ins-hair);
        }
        .cmc__skl {
          display: block;
          height: 10px;
          background: var(--ins-track-soft);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }
        .cmc__skl--foot {
          width: 40%;
          height: 8px;
          margin-top: auto;
        }

        /* ── empty state ── */
        .cmc__empty {
          margin-top: 20px;
          border: 1px solid var(--ins-hair);
          padding: 28px 22px;
        }
        .cmc__empty-label {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .cmc__empty-body {
          margin: 10px 0 0;
          max-width: 46ch;
          font-size: 14.5px;
          font-weight: 500;
          line-height: 1.5;
        }
        .cmc__empty-link {
          display: inline-block;
          margin-top: 16px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-ink);
          text-decoration: none;
          border-bottom: 2px solid var(--ins-ink);
          padding-bottom: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cmc__tab {
            transition: none;
          }
        }

        /* ── mobile 390 ── */
        @media (max-width: 640px) {
          .cmm__head,
          .cmc__head {
            gap: 14px;
          }
          .cmm__kicker,
          .cmc__kicker {
            font-size: 8.5px;
            letter-spacing: 0.2em;
          }
          .cmm__display,
          .cmc__display {
            margin-top: 4px;
            font-size: 20px;
          }
          .cmm__note {
            font-size: 8.5px;
            letter-spacing: 0.14em;
            text-align: left;
          }
          .cmm__bar {
            height: 12px;
            margin-top: 16px;
          }
          .cmm__ends {
            gap: 12px;
          }
          .cmm__end {
            font-size: 8.5px;
            letter-spacing: 0.1em;
          }
          .cmm__caption {
            margin-top: 12px;
            font-size: 11.5px;
          }
          .cmc__head {
            align-items: flex-start;
            flex-direction: column;
          }
          .cmc__tab {
            /* ≥44px touch target on phones */
            min-height: 44px;
            padding: 0 16px;
            font-size: 9.5px;
          }
          .cmc__grid {
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 16px;
          }
          .cmc__skel {
            min-height: 110px;
          }
          .cmc__empty {
            padding: 22px 16px;
          }
          .cmc__empty-body {
            font-size: 13.5px;
          }
        }
      `}</style>
    </>
  );
}
